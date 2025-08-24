<?php
    require "dbinfo.php";
    require_once "RestService.php";
    require "Claims.php";

// Before running this demo, you need to create a database in MySQL called
// wsbooks and populate it using the script wsbooks_mysql.sql.  You also need
// to edit the fields in dbinfo.php to refer to the database you are using.
//
// There is limited error handling in this code in order to keep the code as simple as
// possible.
 
class ClaimRestService extends RestService 
{
	private $CLAIMS;
    
	public function __construct() 
	{
		// Passing in the string 'claim' to the base constructor ensures that
		// all calls are matched to be sure they are in the form http://server/drivers/x/y/z 
		parent::__construct("CLAIMS");
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
				$this->getAllClaims();
				echo json_encode($this->CLAIMS);
				break;

			case 2:
				$claimid = $parameters[1];
				$CLAIMS = $this->getClaimById($claimid);
				if ($CLAIMS != null)
				{
					header('Content-Type: application/json; charset=utf-8');
					header('no-cache,no-store');
					echo json_encode($CLAIMS);
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

		$newClaim = $this->extractDriverFromJSON($requestBody);
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$sql = "insert into CLAIMS (claimid, driverid, Clm_amount, Clm_freq, Oldclam, Clmflg) values (?, ?, ?, ?, ?, ?)";
			// We pull the fields of the driver into local variables since 
			// the parameters to bind_param are passed by reference.
			$statement = $connection->prepare($sql);
			$claimid = $newClaim->getId();
			$driverid = $newClaim->getdriverid();
			$Clm_amount = $newClaim->getClm_amount();
			$Clm_freq = $newClaim->getClm_freq();
            $Oldclam = $newClaim->getOldclam();
			$Clmflg = $newClaim->getClmflg();
			$statement->bind_param('iididi', $claimid, $driverid, $Clm_amount, $Clm_freq, $Oldclam, $Clmflg);
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

		$newClaim = $this->extractDriverFromJSON($requestBody);
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$sql = "update CLAIMS set driverid = ?, Clm_amount = ?, Clm_freq = ?, Oldclam = ?, Clmflg = ? WHERE claimid = ?";
			// We pull the fields of the driver into local variables since 
			// the parameters to bind_param are passed by reference.
			$statement = $connection->prepare($sql);
			
			$claimid = $newClaim->getId();
			$driverid = $newClaim->getdriverid();
			$Clm_amount = $newClaim->getClm_amount();
			$Clm_freq = $newClaim->getClm_freq();
            $Oldclam = $newClaim->getOldclam();
			$Clmflg = $newClaim->getClmflg();

			$statement->bind_param('ididii', $driverid, $Clm_amount, $Clm_freq, $Oldclam, $Clmflg, $claimid);
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
				$sql = "delete from CLAIMS where claimid = ?";
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

    private function getAllClaims()
    {
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
	
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$query = "SELECT claimid, driverid, Clm_amount, Clm_freq, Oldclam, Clmflg FROM CLAIMS";
			if ($result = $connection->query($query))
			{
				while ($row = $result->fetch_assoc())
				{
					$this->CLAIMS[] = new CLAIM($row["claimid"], $row["driverid"], $row["Clm_amount"], $row["Clm_freq"], $row["Oldclam"], $row["Clmflg"]);
				}
				$result->close();
			}
			$connection->close();
		}
	}	 

    private function getClaimById($claimid)
    {
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$query = "SELECT driverid, Clm_amount, Clm_freq, Oldclam, Clmflg FROM CLAIMS WHERE claimid = ?";
			$statement = $connection->prepare($query);
			$statement->bind_param('i', $claimid);
			$statement->execute();
			$statement->store_result();
			$statement->bind_result($driverid, $Clm_amount, $Clm_freq, $Oldclam, $Clmflg);
			if ($statement->fetch())
			{
				return new CLAIM($claimid, $driverid, $Clm_amount, $Clm_freq, $Oldclam, $Clmflg);
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
		$claimArray = json_decode($requestBody, true);
		$claim = new CLAIM(
			$claimArray['claimid'],
			$claimArray['driverid'],
			$claimArray['Clm_amount'],
			$claimArray['Clm_freq'],
			$claimArray['Oldclam'],
			$claimArray['Clmflg'],

		);										
		unset($claimArray);
		return $claim;
	}
}
?>
