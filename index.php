
<?php
    include('includes/header.php');

    // get the values for the input boxes that were saved to the input_values.json file
    $input_values_str = file_get_contents("input_values.json");
    $input_values = json_decode($input_values_str, true);
?>
    <body>
        <?php
            include('includes/navbar.php');
        ?>
        <script src="./paho-mqtt.js"></script>
        <div class="container-md mt-3 p-5 border rounded" style="color:#135D66">
            <h1 id="main-heading" class="text-center" >IoT Dashboard</h1>
            <h4 id="date-time-current" class="text-center"></h4>

            <!-- Water Pump, Auto Cycle, Device State, and Auto Cycle Status cards -->
            <div class="row mt-5">
                <div class="col">
                    <div class="card h-100 text-center">
                        <div class="card-header text-white" style="background-color:#77B0AA">
                            <h4>Water Pump</h4>
                        </div>
                        <div class="card-body">
                            <button class="btn text-white" style="background-color:#135D66" type="button" id="water-pump-on-btn">ON</button>
                            <button class="btn text-white" style="background-color:#FF0000" type="button" id="water-pump-off-btn">OFF</button>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 text-center">
                        <div class="card-header text-white" style="background-color:#77B0AA"">
                            <h4>Auto Cycle</h4>
                        </div>
                        <div class="card-body">
                            <button class="btn text-white" style="background-color:#135D66" type="button" id="auto-cycle-on-btn">ON</button>
                            <button class="btn text-white" style="background-color:#FF0000" type="button" id="auto-cycle-off-btn">OFF</button>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 text-center">
                        <div class="card-header text-white" style="background-color:#77B0AA"">
                            <h4>Device State</h4>
                        </div>
                        <div class="card-body">
                            <h4 id="device-state" class="card-text">NA</h4>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 text-center">
                        <div class="card-header text-white" style="background-color:#77B0AA"">
                            <h4>Load Cell (mV)</h4>
                        </div>
                        <div class="card-body">
                            <h4 id="load-cell-mv" class="card-text">NA</h4>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MQTT Connection and Auto Cycle Settings Cards -->
            <div class="row mt-5">
                <div class="col">
                    <div class="card h-100">
                        <div class="card-header text-white" style="background-color:#77B0AA"">
                        <h4>MQTT Connection</h4>
                        </div>
                        <div class="card-body">
                            <ul class="list-group">
                                <li class="list-group-item border-0">
                                    <div class="input-group">
                                        <span class="input-group-text">Host</span>
                                        <input class="form-control" type="text" id="mqtt-host" value=<?=$input_values["mqtt-host"]?>>
                                    </div>                                    
                                </li>
                                <li class="list-group-item border-0">
                                    <div class="input-group">
                                        <span class="input-group-text">Port</span>
                                        <input class="form-control" type="text" id="mqtt-port" value=<?=$input_values["mqtt-port"]?>>
                                    </div>                                    
                                </li>
                                <li class="list-group-item border-0">
                                    <div class="input-group">
                                        <button class="btn text-white" style="background-color:#135D66" type="button" id="connect-btn">Connect</button>
                                    </div>                                    
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div class="card h-100">
                        <div class="card-header text-white" style="background-color:#77B0AA"">
                        <h4>Auto Cycle Settings</h4>
                        </div>
                        <div class="card-body">
                            <ul class="list-group">
                                <li class="list-group-item border-0">
                                    <div class="input-group">
                                        <span class="input-group-text">Water Pump ON Time</span>
                                        <input class="form-control" type="text" id="water-pump-on-time-ms" value=<?=$input_values["water-pump-on-time-ms"]?>>
                                        <span class="input-group-text">milliseconds</span>
                                    </div>                                    
                                </li>
                                <li class="list-group-item border-0">
                                    <div class="input-group">
                                        <span class="input-group-text">Soak Time</span>
                                        <input class="form-control" type="text" id="soak-time-min" value=<?=$input_values["soak-time-min"]?>>
                                        <span class="input-group-text">hours</span>
                                    </div>                                    
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
            
           <!-- 'Messages' Section -->
            <div class="row mt-5">
                <div class="column">
                    <div class="card">
                        <div class="card-header text-white" style="background-color:#77B0AA""><h6>Messages</h6></div>
                        <div class="card-body">
                            <textarea class="form-control" id="messages" rows="5" style="resize: none;overflow-y: scroll;" readonly></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script src="./script.js"></script>    
    </body>
</html>