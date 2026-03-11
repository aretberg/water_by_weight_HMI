<?php
    if (isset($_POST['json_data_str']))
    {
        $file = "input_values.json";

        file_put_contents($file, $_POST['json_data_str']);
    }
?>