<?php
    require "dbinfo.php";
    require "RestService.php";
    require "Book.php";

// Before running this demo, you need to create a database in MySQL called
// wsbooks and populate it using the script wsbooks_mysql.sql.  You also need
// to edit the fields in dbinfo.php to refer to the database you are using.
//
// There is limited error handling in this code in order to keep the code as simple as
// possible.
 
class BooksRestService extends RestService 
{
	private $books;
    
	public function __construct() 
	{
		// Passing in the string 'books' to the base constructor ensures that
		// all calls are matched to be sure they are in the form http://server/books/x/y/z 
		parent::__construct("books");
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
				$this->getAllBooks();
				echo json_encode($this->books);
				break;

			case 2:
				$id = $parameters[1];
				$book = $this->getBookById($id);
				if ($book != null)
				{
					header('Content-Type: application/json; charset=utf-8');
					header('no-cache,no-store');
					echo json_encode($book);
				}
				else
				{
					$this->notFoundResponse();
				}
				break;

			case 4:
				$year = $parameters[1];
				$month = $parameters[2];
				$day = $parameters[3];
				header('Content-Type: application/json; charset=utf-8');
				header('no-cache,no-store');
				$this->getBooksByDate($year, $month, $day);
				echo json_encode($this->books);
				break;
				
			default:	
				$this->methodNotAllowedResponse();
		}
	}

	public function performPost($url, $parameters, $requestBody, $accept) 
	{
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;

		$newBook = $this->extractBookFromJSON($requestBody);
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$sql = "insert into books (title, author, genre, publishdate, description, price) values (?, ?, ?, ?, ?, ?)";
			// We pull the fields of the book into local variables since 
			// the parameters to bind_param are passed by reference.
			$statement = $connection->prepare($sql);
			$title = $newBook->getTitle();
			$author = $newBook->getAuthor();
			$genre = $newBook->getGenre();
			$publishDate = $newBook->getPublishDate();
			$description = $newBook->getDescription();
			$price = $newBook->getPrice();
			$statement->bind_param('sssssd', $title, $author, $genre, $publishDate, $description, $price);
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

		$newBook = $this->extractBookFromJSON($requestBody);
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$sql = "update books set title = ?, author = ?, genre = ?, publishdate = ?, description = ?, price = ? where id = ?";
			// We pull the fields of the book into local variables since 
			// the parameters to bind_param are passed by reference.
			$statement = $connection->prepare($sql);
			$bookId = $newBook->getId();
			$title = $newBook->getTitle();
			$author = $newBook->getAuthor();
			$genre = $newBook->getGenre();
			$publishDate = $newBook->getPublishDate();
			$description = $newBook->getDescription();
			$price = $newBook->getPrice();
			$statement->bind_param('sssssdi', $title, $author, $genre, $publishDate, $description, $price, $bookId);
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
				$sql = "delete from books where id = ?";
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

    private function getAllBooks()
    {
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
	
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$query = "select id, title, author, genre, publishdate, description, price from books";
			if ($result = $connection->query($query))
			{
				while ($row = $result->fetch_assoc())
				{
					$this->books[] = new Book($row["id"], $row["title"], $row["author"], $row["genre"], $row["publishdate"], $row["description"], $row["price"]);
				}
				$result->close();
			}
			$connection->close();
		}
	}	 

    private function getBookById($id)
    {
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
		
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$query = "select title, author, genre, publishdate, description, price from books where id = ?";
			$statement = $connection->prepare($query);
			$statement->bind_param('i', $id);
			$statement->execute();
			$statement->store_result();
			$statement->bind_result($title, $author, $genre, $publishdate, $description, $price);
			if ($statement->fetch())
			{
				return new Book($id, $title, $author, $genre, $publishdate, $description, $price);
			}
			else
			{
				return null;
			}
			$statement->close();
			$connection->close();
		}
	}	

    private function getBooksByDate($year, $month, $day)
    {
		global $dbserver, $dbusername, $dbpassword, $dbdatabase;
	
		$connection = new mysqli($dbserver, $dbusername, $dbpassword, $dbdatabase);
		if (!$connection->connect_error)
		{
			$date = $year."-".$month."-".$day;
			$query = "select id, title, author, genre, publishdate, description, price from books where publishdate >= ?";
			$statement = $connection->prepare($query);
			$statement->bind_param('s', $date);
			$statement->execute();
			$statement->store_result();
			$statement->bind_result($id, $title, $author, $genre, $publishdate, $description, $price);
			while ($statement->fetch())
			{
				$this->books[] = new Book($id, $title, $author, $genre, $publishdate, $description, $price);
			}
			$statement->close();
			$connection->close();
		}
	}	 

    private function extractBookFromJSON($requestBody)
    {
		// This function is needed because of the perculiar way json_decode works. 
		// By default, it will decode an object into a object of type stdClass.  There is no
		// way in PHP of casting a stdClass object to another object type.  So we use the
		// approach of decoding the JSON into an associative array (that's what the second
		// parameter set to true means in the call to json_decode). Then we create a new
		// Book object using the elements of the associative array.  Note that we are not
		// doing any error checking here to ensure that all of the items needed to create a new
		// book object are provided in the JSON - we really should be.
		$bookArray = json_decode($requestBody, true);
		$book = new Book($bookArray['BookId'],
						 $bookArray['Title'],
						 $bookArray['Author'],
						 $bookArray['Genre'],
						 $bookArray['PublishDate'],
						 $bookArray['Description'],
						 $bookArray['Price']);
		unset($bookArray);
		return $book;
	}
}
?>
