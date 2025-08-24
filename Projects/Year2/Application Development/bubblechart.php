<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <title>Data Visualization - Bubble Chart</title>
</head>
<body>

<?php 
  $con = new mysqli('localhost','root','AppDev@2021','insurance_database');
  $query = $con->query("
    SELECT
      CD.Cartype,
      COUNT(C.Claimid) AS ClaimFrequency,
      AVG(C.Clm_amount) AS AvgClaimAmount,
      AVG(CD.Carage) AS AvgCarAge
    FROM
      CAR_DETAILS CD
    JOIN
      CLAIMS C ON CD.driverid = C.driverid
    GROUP BY
      CD.Cartype
    ORDER BY
      ClaimFrequency DESC;
  ");

  $Cartype = [];
  $ClaimFrequency = [];
  $AvgClaimAmount = [];
  $AvgCarAge = [];

  foreach($query as $data)
  {
    $Cartype[] = $data['Cartype'];
    $ClaimFrequency[] = $data['ClaimFrequency'];
    $AvgClaimAmount[] = $data['AvgClaimAmount'];
    $AvgCarAge[] = $data['AvgCarAge'];
  }

?>


<div style="width: 800px; height: 400px;">
  <canvas id="myBubbleChart"></canvas>
</div>
 
<script>
  const labels = <?php echo json_encode($Cartype) ?>;
  const data = {
    labels: labels,
    datasets: [{
      label: 'Claim Frequency and Average Claim Amount by Car Type',
      data: <?php echo json_encode(array_map(function($index) use ($ClaimFrequency, $AvgClaimAmount, $AvgCarAge) {
          return [
              'x' => $ClaimFrequency[$index],
              'y' => $AvgClaimAmount[$index],
              'r' => $AvgCarAge[$index]
          ];
      }, array_keys($Cartype))); ?>,
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  const config = {
    type: 'bubble',
    data: data,
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Claim Frequency'
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Average Claim Amount'
          }
        }
      }
    },
  };

  var myBubbleChart = new Chart(
    document.getElementById('myBubbleChart'),
    config
  );
</script>

</body>
</html>
