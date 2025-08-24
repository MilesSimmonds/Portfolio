<?php
class Driver
{
    public $driverid;
    public $Kidsdriv;
    public $Age;
    public $Income;
    public $Mstatus;
    public $Gender;
    public $Education;
    public $Occupation;

    public function __construct($driverid, $Kidsdriv, $Age, $Income, $Mstatus, $Gender, $Education, $Occupation)
    {
        $this->driverid = $driverid;
        $this->Kidsdriv = $Kidsdriv;
        $this->Age = $Age;
        $this->Income = $Income;
        $this->Mstatus = $Mstatus;
        $this->Gender = $Gender;
        $this->Education = $Education;
        $this->Occupation = $Occupation;
    }

    public function getId()
    {
        return $this->driverid;
    }

    public function getKidsdriv()
    {
        return $this->Kidsdriv;
    }

    public function getAge()
    {
        return $this->Age;
    }

    public function getIncome()
    {
        return $this->Income;
    }

    public function getMstatus()
    {
        return $this->Mstatus;
    }

    public function getGender()
    {
        return $this->Gender;
    }

    public function getEducation()
    {
        return $this->Education;
    }
    public function getOccupation()
    {
        return $this->Occupation;
    }
}
?>
