<?php
    require "dbinfo.php";
    require_once "RestService.php";
    require "CarDetails.php";

// Before running this demo, you need to create a database in MySQL called
// wsbooks and populate it using the script wsbooks_mysql.sql.  You also need
// to edit the fields in dbinfo.php to refer to the database you are using.
//
// There is limited error handling in this code in order to keep the code as simple as
// possible.
 
class CarDetailsRestService extends RestService 
{
	private $CAR_DETAILS;
    
	public function __construct() 
	{
		// Passing in the string 'drivers' to the base constructor ensures that
		// all calls are matched to be sure they are in the form http://server/drivers/x/y/z 
		parent::__construct("CAR_DETAILS");
	}

	public function performGet($url, $parameters, $requestBody, $accept) 
	{
		switch (count($parameters))
		{
			case 1:
				// Note that we need to specify that we are sending JSON back or
				// the default will be used (which is text/html).
				header('Content-Type: application/json; charset=utf-8');
				// This header is needed to stop IE cacheing the results of the GET	
				header('no-cache,no-store');
				$this->getAllCarDetails();
				echo json_encode($this->CAR_DETAILS);
				break;

			case 2:
				$carid = $parameters[1];
				$DRIVER = $this->getCarDetailsById($carid);
				if ($DRIVER != null)
				{
					header('Content-Type: application/json; charset=utf-8');
					header('no-cache,no-store');
					echo json_encode($DRIVER);
				}
				else
				{
					$this->notFoundResponse();
				}
				break;

			default:	
				$this->methodNotAllowedResponse();
		}
	}

	public function performPost($url, $parameters, $requestBody, $accept) 
	{
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;

		$newCar = $this->extractDriverFromJSON($requestBody);
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$sql = "insert into CAR_DETAILS (carid, driverid, Cartype, Redcar, Carage) values (?, ?, ?, ?, ?)";
			// We pull the fields of the driver into local variables since 
			// the parameters to bind_param are passed by reference.
			$statement = $connection->prepare($sql);
			
            $carid = $newCar->getId();
            $driverid = $newCar->getdriverid();
            $Cartype = $newCar->getCartype();
            $Redcar = $newCar->getRedcar();
            $Carage = $newCar->getCarage();

			$statement->bind_param('iissi', $carid, $driverid, $Cartype, $Redcar, $Carage);
			$result = $statement->execute();
			if ($result == FALSE)
			{
				$errorMessage = $statement->error;
			}
			$statement->close();
			$connection->close();
			if ($result == TRUE)
			{
				// We need to return the status as 204 (no content) rather than 200 (OK) since
				// we are not returning any data
				$this->noContentResponse();
			}
			else
			{
				$this->errorResponse($errorMessage);
			}
		}
	}

	public function performPut($url, $parameters, $requestBody, $accept) 
	{
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;

		$newCar = $this->extractDriverFromJSON($requestBody);
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$sql = "update CAR_DETAILS set driverid = ?, Cartype = ?, Redcar = ?, Carage = ? WHERE carid = ?";
			// We pull the fields of the driver into local variables since 
			// the parameters to bind_param are passed by reference.
			$statement = $connection->prepare($sql);
			
            $carid = $newCar->getId();
            $driverid = $newCar->getdriverid();
            $Cartype = $newCar->getCartype();
            $Redcar = $newCar->getRedcar();
            $Carage = $newCar->getCarage();

			$statement->bind_param('issii', $driverid, $Cartype, $Redcar, $Carage, $carid);
			$result = $statement->execute();
			if ($result == FALSE)
			{
				$errorMessage = $statement->error;
			}
			$statement->close();
			$connection->close();
			if ($result == TRUE)
			{
				// We need to return the status as 204 (no content) rather than 200 (OK) since
				// we are not returning any data
				$this->noContentResponse();
			}
			else
			{
				$this->errorResponse($errorMessage);
			}
		}
	}

    public function performDelete($url, $parameters, $requestBody, $accept) 
    {
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		if (count($parameters) == 2)
		{
			$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
			if (!$connection->connect_error)
			{
				$id = $parameters[1];
				$sql = "delete from CAR_DETAILS where carid = ?";
				$statement = $connection->prepare($sql);
				$statement->bind_param('i', $id);
				$result = $statement->execute();
				if ($result == FALSE)
				{
					$errorMessage = $statement->error;
				}
				$statement->close();
				$connection->close();
				if ($result == TRUE)
				{
					// We need to return the status as 204 (no content) rather than 200 (OK) since
					// we are not returning any data
					$this->noContentResponse();
				}
				else
				{
					$this->errorResponse($errorMessage);
				}
			}
		}
    }

    private function getAllCarDetails()
    {
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
	
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$query = "SELECT carid, driverid, Cartype, Redcar, Carage FROM CAR_DETAILS";
			if ($result = $connection->query($query))
			{
				while ($row = $result->fetch_assoc())
				{
					$this->CAR_DETAILS[] = new CAR_DETAILS($row["carid"], $row["driverid"], $row["Cartype"], $row["Redcar"], $row["Carage"]);
				}
				$result->close();
			}
			$connection->close();
		}
	}	 

    private function getCarDetailsById($carid)
    {
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$query = "SELECT carid, driverid, Cartype, Redcar, Carage FROM CAR_DETAILS WHERE carid = ?";
			$statement = $connection->prepare($query);
			$statement->bind_param('i', $carid);
			$statement->execute();
			$statement->store_result();
			$statement->bind_result($carid, $driverid, $Cartype, $Redcar, $Carage);
			if ($statement->fetch())
			{
				return new CAR_DETAILS($carid, $driverid, $Cartype, $Redcar, $Carage);
			}
			else
			{
				return null;
			}
			$statement->close();
			$connection->close();
		}
	}	

    private function extractDriverFromJSON($requestBody)
    {
		// This function is needed because of the perculiar way json_decode works. 
		// By default, it will decode an object into a object of type stdClass.  There is no
		// way in PHP of casting a stdClass object to another object type.  So we use the
		// approach of decoding the JSON into an associative array (that's what the second
		// parameter set to true means in the call to json_decode). Then we create a new
		// Book object using the elements of the associative array.  Note that we are not
		// doing any error checking here to ensure that all of the items needed to create a new
		// book object are provided in the JSON - we really should be.
		$carArray = json_decode($requestBody, true);
		$car = new CAR_DETAILS(
			$carArray['carid'],
			$carArray['driverid'],
			$carArray['Cartype'],
			$carArray['Redcar'],
			$carArray['Carage'],
		);										
		unset($carArray);
		return $car;
	}
}
?>
