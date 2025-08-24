<?php
    require "dbinfo.php";
    require_once "RestService.php";
    require "Driver.php";

// Before running this demo, you need to create a database in MySQL called
// wsbooks and populate it using the script wsbooks_mysql.sql.  You also need
// to edit the fields in dbinfo.php to refer to the database you are using.
//
// There is limited error handling in this code in order to keep the code as simple as
// possible.
 
class DriversRestService extends RestService 
{
	private $DRIVER;
    
	public function __construct() 
	{
		// Passing in the string 'drivers' to the base constructor ensures that
		// all calls are matched to be sure they are in the form http://server/drivers/x/y/z 
		parent::__construct("DRIVER");
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
				$this->getAllDrivers();
				echo json_encode($this->DRIVER);
				break;

			case 2:
				$driverid = $parameters[1];
				$DRIVER = $this->getDriverById($driverid);
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

		$newDriver = $this->extractDriverFromJSON($requestBody);
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$sql = "insert into DRIVER (driverid, Kidsdriv, Age, Income, Mstatus, Gender, Education, Occupation) values (?, ?, ?, ?, ?, ?, ?, ?)";
			// We pull the fields of the driver into local variables since 
			// the parameters to bind_param are passed by reference.
			$statement = $connection->prepare($sql);
			$driverid = $newDriver->getId();
			$Kidsdriv = $newDriver->getKidsdriv();
			$Age = $newDriver->getAge();
			$Income = $newDriver->getIncome();
			$Mstatus = $newDriver->getMstatus();
			$Gender = $newDriver->getGender();
			$Education = $newDriver->getEducation();
			$Occupation = $newDriver->getOccupation();
			$statement->bind_param('iiiissss', $driverid, $Kidsdriv, $Age, $Income, $Mstatus, $Gender, $Education, $Occupation);
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

		$newDriver = $this->extractDriverFromJSON($requestBody);
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$sql = "update DRIVER set Kidsdriv = ?, Age = ?, Income = ?, Mstatus = ?, Gender = ?, Education = ?, Occupation = ? WHERE driverid = ?";
			// We pull the fields of the driver into local variables since 
			// the parameters to bind_param are passed by reference.
			$statement = $connection->prepare($sql);
			$driverid = $newDriver->getId();
			$Kidsdriv = $newDriver->getKidsdriv();
			$Age = $newDriver->getAge();
			$Income = $newDriver->getIncome();
			$Mstatus = $newDriver->getMstatus();
			$Gender = $newDriver->getGender();
			$Education = $newDriver->getEducation();
			$Occupation = $newDriver->getOccupation();
			$statement->bind_param('iiissssi', $Kidsdriv, $Age, $Income, $Mstatus, $Gender, $Education, $Occupation, $driverid);
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
				$sql = "delete from DRIVER where driverid = ?";
				$statement = $connection->prepare($sql);
				$statement->bind_param('i', $id);
				$result = $statement->execute();
				if ($result == FALSE)
				{
					$errorMessage = $statement->error + "Unable to Delete, ID may be linked to other records.";
					
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

    private function getAllDrivers()
    {
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
	
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$query = "SELECT driverid, Kidsdriv, Age, Income, Mstatus, Gender, Education, Occupation FROM DRIVER";
			if ($result = $connection->query($query))
			{
				while ($row = $result->fetch_assoc())
				{
					$this->DRIVER[] = new Driver($row["driverid"], $row["Kidsdriv"], $row["Age"], $row["Income"], $row["Mstatus"], $row["Gender"], $row["Education"], $row["Occupation"]);
				}
				$result->close();
			}
			$connection->close();
		}
	}	 

    private function getDriverById($driverid)
    {
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$query = "SELECT driverid, Kidsdriv, Age, Income, Mstatus, Gender, Education, Occupation FROM DRIVER WHERE driverid = ?";
			$statement = $connection->prepare($query);
			$statement->bind_param('i', $driverid);
			$statement->execute();
			$statement->store_result();
			$statement->bind_result($driverid, $Kidsdriv, $Age, $Income, $Mstats, $Gender, $Education, $Occupation);
			if ($statement->fetch())
			{
				return new Driver($driverid, $Kidsdriv, $Age, $Income, $Mstats, $Gender, $Education, $Occupation);
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
		$driverArray = json_decode($requestBody, true);
		$driver = new Driver(
			$driverArray['driverid'],
			$driverArray['Kidsdriv'],
			$driverArray['Age'],
			$driverArray['Income'],
			$driverArray['Mstatus'],
			$driverArray['Gender'],
			$driverArray['Education'],
			$driverArray['Occupation']
		);										
		unset($driverArray);
		return $driver;
	}
}
?>
