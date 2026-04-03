const client_id = String(Math.floor(Math.random() * 10e16));                            // (2)

// publish topics
const topic_water_pump_state = "lettuce-hmi/water-pump";
const topic_auto_cycle_status = "lettuce-hmi/auto-cycle";
const topic_water_on_time_ms = "lettuce-hmi/water-on-time-ms";
const topic_soak_time_min = "lettuce-hmi/soak-time-min"

// subscribe topics
const sub_topic = "weigh-station-esp32/#";
const sub_topic_root = "weigh-station-esp32";
const topic_device_state = "lettuce-esp32/device-state";    // "Idle", "WaterOn", or "WaterOff"
const topic_water_cycle_status = "lettuce-esp32/water-cycle-status";    // "auto" or "manual"


//create constants for the elements to be used in the script
const messages_txtbx = document.getElementById("messages");
const host_txtbx = document.getElementById("mqtt-host");
const port_txtbx = document.getElementById("mqtt-port");
const connect_btn = document.getElementById("connect-btn");
const water_pump_on_btn = document.getElementById("water-pump-on-btn");
const water_pump_off_btn = document.getElementById("water-pump-off-btn");
const auto_cycle_on_btn = document.getElementById("auto-cycle-on-btn");
const auto_cycle_off_btn = document.getElementById("auto-cycle-off-btn");
const device_state_txt = document.getElementById("device-state");
const load_cell_mv_txt = document.getElementById("load-cell-mv");
const water_on_time_ms_txt = document.getElementById("water-pump-on-time-ms");
const soak_time_min_txt = document.getElementById("soak-time-min");

const date_time_txt = document.getElementById("date-time-current");

// Global variables
var isConnected = false;
var client = null;
var messages = [];
var current_date_time_update_ms = 5000;



//newMessage("Most recent data was logged to database at: " + most_recent_data_timestamp.toLocaleDateString() + " T" + most_recent_data_timestamp.toLocaleTimeString());

// Event handler for connect button click
connect_btn.addEventListener("click", function(){
    if (!(isConnected))
    {
        if ((host_txtbx.value === "") || (port_txtbx.value === ""))
            {
                alert("Enter values for host and port.");    
            }
            else
            {
                client = new Paho.Client(host_txtbx.value, Number(port_txtbx.value), client_id);
        
                // connect the callback functions to the client
                client.onConnectionLost = onConnectionLost;
                client.onMessageArrived = onMessageArrived;
        
                // try connecting to the broker
                client.connect({
                    onSuccess: onConnectionSuccess,
                    onFailure: onConnectionFailure
                }); 

                //update the connection settings for next visit
                updateInputValuesFile();
            };
    }
    else
    {
        client.disconnect();
    };

});

// Event handler for water pump ON button
// Publishes a message "on" to the "lettuce-hmi/water-pump-state" topic
water_pump_on_btn.addEventListener("click", function(){
    if (isConnected)
    {
        newMessage("Publishing message ON to topic " + topic_water_pump_state);
        var pub_message = new Paho.Message("on");
        pub_message.destinationName = topic_water_pump_state;
        pub_message.qos = 0;
        client.send(pub_message);
    }
    else
    {
        alert("Connect to MQTT broker");
    };
});

// Event handler for water pump OFF button
// Publishes a message "off" to the "lettuce-hmi/water-pump-state" topic
water_pump_off_btn.addEventListener("click", function(){
    if (isConnected)
    {
        newMessage("Publishing message OFF to topic " + topic_water_pump_state);
        var pub_message = new Paho.Message("off");
        pub_message.destinationName = topic_water_pump_state;
        pub_message.qos = 0;
        client.send(pub_message);
    }
    else
    {
        alert("Connect to MQTT broker");
    };
});

// Event handler for auto-cycle ON button
// Publishes a message "on" to the "lettuce/cycle-status" topic
auto_cycle_on_btn.addEventListener("click", function(){
    if (isConnected)
    {
        newMessage("Publishing message ON to topic " + topic_auto_cycle_status);

        //send a message with the water pump 'on' time input field value
        var pub_message = new Paho.Message(water_on_time_ms_txt.value);
        pub_message.destinationName = topic_water_on_time_ms;
        pub_message.qos = 0;
        client.send(pub_message);

        //send a message with the water pump 'off' time input field value
        pub_message = new Paho.Message(soak_time_min_txt.value);
        pub_message.destinationName = topic_soak_time_min;
        pub_message.qos = 0;
        client.send(pub_message);
        
        //send a message 'on' to the auto cycle status topic
        pub_message = new Paho.Message("on");
        pub_message.destinationName = topic_auto_cycle_status;
        pub_message.qos = 0;
        client.send(pub_message);

        //update the connection settings for next visit
        updateInputValuesFile();
    }
    else
    {
        alert("Connect to MQTT broker");
    };
});

// Event handler for auto-cycle OFF button
// Publishes a message "off" to the "lettuce/cycle-status" topic
auto_cycle_off_btn.addEventListener("click", function(){
    if (isConnected)
    {
        newMessage("Publishing message ON to topic " + topic_auto_cycle_status);
        var pub_message = new Paho.Message("off");
        pub_message.destinationName = topic_auto_cycle_status;
        pub_message.qos = 0;
        client.send(pub_message);
    }
    else
    {
        alert("Connect to MQTT broker");
    };
});

/**********************************************
 * Paho MQTT client callback functions---------
 *********************************************/

onConnectionSuccess = function(data){
    newMessage("Successful connection to broker " + host_txtbx.value);
    isConnected = true;
    updateConnectButton();

    // subscribe to the all messages on data topic lettuce-esp32
    newMessage("Subscribing to topic: " + sub_topic);
    client.subscribe(sub_topic);

};

onConnectionFailure = function(data){
    isConnected = false;
    newMessage(data.errorMessage);
};

onConnectionLost = function(data){
    newMessage("Connection lost - " + data.errorMessage);
    isConnected = false;
    updateConnectButton();
};

onMessageArrived = function(message){
    //console.log(message.payloadString);
    //newMessage("New message received...");
    //newMessage("Topic: " + message.destinationName + " --> Message: " + message.payloadString);

    processMessage(message.payloadString, message.destinationName);
};

/**********************************************
 * Paho MQTT client callback functions end---------
 *********************************************/

/**
 * Function to update the connect button after it is clicked.
 * If connected to the MQTT broker -
 * change to 'Disconnect' and disable the host and port fields
 * 
 * If not connected the the MQTT broker - 
 * change to 'Connect' and enable the host and port fields
 */

function updateConnectButton()
{
    if (isConnected)
    {
        // update the button appearance
        //connect_btn.classList.remove("btn-success");
        //connect_btn.classList.add("btn-danger");
        connect_btn.style.backgroundColor = "#FF0000";
        connect_btn.innerText = "Disconnect";

        //make the text boxes read-only
        host_txtbx.disabled = true;
        port_txtbx.disabled = true;
    }
    else
    {
        // update the button appearance
        //connect_btn.classList.remove("btn-danger");
        //connect_btn.classList.add("btn-success");
        connect_btn.style.backgroundColor = "#135D66";
        connect_btn.innerText = "Connect";

        //make the text boxes read-only
        host_txtbx.disabled = false;
        port_txtbx.disabled = false;
    }
}

function postJsonDataString(url, json_data)
{
    let form_data = new FormData();
    let key = "json_data_str";

    form_data.append(key, json_data);
    
    let request = new Request(url, 
        {
            method: "Post",
            body: form_data
        }
    );

    fetch(request)
        .then((response) => {
            if (response.status === 200) {
                console.log('Data sent');
            }
            else {
                console.log("Error sending data");
            }
        });
}

function newMessage(message)
{
    //get the current time
    let curr_date_time = new Date();
    let time_string = curr_date_time.toLocaleDateString() + " T" + curr_date_time.toLocaleTimeString();
    //console.log(curr_date_time.toLocaleString());

    //combine the current time with the message and add a carriage return
    // timestamp - message&#13
    message = time_string + " - " + message + "&NewLine;";
    console.log(message);

    //add the message to the messages array using unshift
    if (messages.length === 0)
    {
        messages[0] = message;
    }
    else
    {
        messages.unshift(message);
    }

    //get a string that contains all messages seperated with new line
    //create a new function that accepts the messages array and returns the string
    let message_string = getMessageString();
    

    //insert the message string into the innerhtml of the messages_txtbx
    messages_txtbx.innerHTML = message_string;
}

function getMessageString()
{
    let message_string = "";
    messages.forEach(getMessageStringHelper);
    function getMessageStringHelper(value, index)
    {
        if (index == 0)
        {
            message_string = value;
        }
        else
        {
            message_string += value;
        }
    }
    return message_string;
}

/*****************************************************
 * Function for timer interval 
 * Updates the current date+time text on website
 ****************************************************/

function updateDateTime()
{
    let curr_date_time =  new Date();
    let options = {
        hour12: true
    };

    let curr_date_str = curr_date_time.toDateString();
    let curr_time_str = curr_date_time.toLocaleTimeString('en-US', options);

    let curr_date_time_str = curr_date_str + ", " + curr_time_str;
    //console.log(curr_date_time_str);
    date_time_txt.innerText = curr_date_time_str;
}

setInterval(updateDateTime, current_date_time_update_ms);

function processMessage(message, topic)
{
    console.log("processing message: " + message + " ; on topic: " + topic)
    if (topic === sub_topic_root + "/device-state")
    {
        device_state_txt.innerText = message;
    }
    else if (topic === sub_topic_root + "/load-cell-mv")
    {
        load_cell_mv_txt.innerText = message;
    }
}

function makeInputValuesJSONString()
{
    json_str = '{"' + host_txtbx.id + '":"' + host_txtbx.value +
                '","' + port_txtbx.id + '":"' + port_txtbx.value +
                '","' + water_on_time_ms_txt.id + '":' + water_on_time_ms_txt.value +
                ',"' + water_off_time_hr_txt.id + '":' + water_off_time_hr_txt.value +
                '}';

    return json_str;

}

function updateInputValuesFile()
{
    input_vals_str = makeInputValuesJSONString();
    post_url = "update_input_values.php";

    postJsonDataString(post_url, input_vals_str);

}