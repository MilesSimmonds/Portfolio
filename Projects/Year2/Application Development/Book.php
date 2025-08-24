<?php
class Book
{
    public $BookId;
    public $Title;
    public $Author;
    public $Genre;
    public $PublishDate;
    public $Description;
    public $Price;

    public function __construct($id, $title, $author, $genre, $publishDate, $description, $price)
    {
        $this->BookId = $id;
        $this->Title = $title;
        $this->Author = $author;
        $this->Genre = $genre;
        $this->PublishDate = $publishDate;
        $this->Description = $description;
        $this->Price = $price;
    }

    public function getId()
    {
        return $this->BookId;
    }

    public function getTitle()
    {
        return $this->Title;
    }

    public function getAuthor()
    {
        return $this->Author;
    }

    public function getGenre()
    {
        return $this->Genre;
    }

    public function getPublishDate()
    {
        return $this->PublishDate;
    }

    public function getDescription()
    {
        return $this->Description;
    }

    public function getPrice()
    {
        return $this->Price;
    }
}
?>
