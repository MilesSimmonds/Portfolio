<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <title>Data Visualisation</title>
</head>
<body>

<?php 
  $con = new mysqli('localhost','root','AppDev@2021','insurance_database');
  $query = $con->query("
    SELECT
    CD.Cartype,
    COUNT(C.Claimid) AS ClaimFrequency
  FROM
    CAR_DETAILS CD
  JOIN
    CLAIMS C ON CD.driverid = C.driverid
  GROUP BY
    CD.Cartype
  ORDER BY
    ClaimFrequency DESC;
  ");

  foreach($query as $data)
  {
    $Cartype[] = $data['Cartype'];
    $ClaimFrequency[] = $data['ClaimFrequency'];
  }

?>


<div style="width: 500px;">
  <canvas id="myChart"></canvas>
</div>
 
<script>
  // === include 'setup' then 'config' above ===
  const labels = <?php echo json_encode($Cartype) ?>;
  const data = {
    labels: labels,
    datasets: [{
      label: 'Claim Frequency by Car Type',
      data: <?php echo json_encode($ClaimFrequency) ?>,
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
  };

  var myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
</script>

</body>
</html>