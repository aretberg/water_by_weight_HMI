<?php
    require_once "pdo.php";

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $form_message = "";
    $result_data = [];
    $result_time = [];

    if ( isset( $_POST['date'] ))
    {
        if ($_POST['graphItem'] === 'none')
        {
            $form_message = 'Please select an item to graph';
        } 
        else
        {
        //create a start date using the POST date data
        $start_date = new DateTime($_POST['date']);
        $start_date_str = "'".$start_date->format('Y-m-d H:i:s')."'";
        $date_graph_title = $start_date->format('F j, Y');
        
        //create an end date by adding 1 day to the start date
        $end_date = new DateTime($_POST['date']);
        $end_date->add(new DateInterval('P1D'));
        $end_date_str = "'".$end_date->format('Y-m-d H:i:s')."'";

        //create a variable for the item to graph
        $graph_item = $_POST['graphItem'];

        //get the requested data from the database
        $stmt = $pdo->prepare("SELECT time_stamp, $graph_item FROM weather_data WHERE time_stamp >= $start_date_str AND time_stamp < $end_date_str");
        $stmt->execute();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC))
        {
            $time = substr($row['time_stamp'], 11);
            array_push($result_time, $time);
            array_push($result_data, $row[$graph_item]);
        }

        //debug section - print out the results
        echo "<pre>";
        //print_r($result_data);
        //print_r($result_time);
        //print_r($results);
        echo "</pre>";
        }
    }
?>

<!--
    Use a script to pass php variables to javascript
-->
<script type="text/javascript">
    var result_len = "<?php echo count($result_data);?>";
    if ( result_len != 0)
    {
        //create an array of data to graph (y-axis)
        let temp_data = <?php echo json_encode($result_data);?>;
        var graph_data = temp_data.map(Number);

        //create an array of labels for the graph (x-axis)
        var graph_labels = <?php echo json_encode($result_time);?>;
        //var graph_labels = temp_data.map(Date);

        // var graph_labels = Array();
        // for (let i=0; i < graph_data.length; i++)
        // {
        //     graph_labels.push(i);
        // }
        console.log(graph_labels);
    }
    else
    {
        console.log("there is no data to graph");
        graph_data = Array(0);
    }
</script>

<?php
    include('includes/header.php');
?>
    <body>
        <?php
            include('includes/navbar.php');
        ?>
        <div class="container mt-3 p-5 border rounded" style="color:#135D66">
            <h1 id="main-heading" class="text-center" >3D Paws Weather Data Graph</h1>
            <div class="row mt-5">
               <div class="column">
                    <div class="card">
                        <div class="card-header text-white" style="background-color:#77B0AA""><h6>Graph Options</h6></div>
                        <div class="card-body">
                            <form method="post" class="row align-items-center">
                                <div class="col-auto">
                                    <label for="graphItem" class="form-label" hidden>Category</label>
                                    <select id="graphItem" name="graphItem" class="form-select">
                                    <option value="none" selected>Choose...</option>
                                    <option value="temp_f">Temperature</option>
                                    <option value="humidity">Humidity</option>
                                    <option value="pressure_inhg">Pressure</option>
                                    </select>
                                </div>
                                <div class="col-auto">
                                    <label for="date" class="form-label" hidden>Date</label>
                                    <input class="form-control" type="date" name="date" id="date">
                                </div>
                                <div class="col-auto">
                                    <button type="submit" class="btn text-white" style="background-color:#135D66" id="graph-btn" name="graph-btn">Graph</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
                <div>
                    <canvas id="myChart"></canvas>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

                <script>
                    console.log(graph_data);
                    const ctx = document.getElementById('myChart');

                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: graph_labels,
                            datasets: [{
                                label: "<?php echo $graph_item;?>",
                                data: graph_data,
                                borderWidth: 1
                            }]
                        },
                        options: {
                            plugins: {
                                title: {
                                    display: true,
                                    text: "Data for " + "<?php echo $date_graph_title;?>"
                                }
                            }
                        }
                        });
                </script>
        </div>
    </body>
</html>