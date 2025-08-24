<?php
	require "DriversRestService.php";
	require "CarDetailsRestService.php";
    require "ClaimsRestService.php";

$requestUrl = $_SERVER['REQUEST_URI'];

if (strpos($requestUrl, '/DRIVER') === 0) {
    $service = new DriversRestService();
    $service->handleRawRequest();
} 
elseif (strpos($requestUrl, '/CAR_DETAILS') === 0) {
    $service = new CarDetailsRestService();
    $service->handleRawRequest();
} 
elseif (strpos($requestUrl, '/CLAIMS') === 0) {
    $service = new ClaimRestService();
    $service->handleRawRequest();
} else {
    // Handle other endpoints or return a 404 response
    http_response_code(404);
    echo "Not Found";
}
?>
