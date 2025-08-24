<?php
class CAR_DETAILS
{
    public $carid;
    public $driverid;
    public $Cartype;
    public $Redcar;
    public $Carage;

    public function __construct($carid, $driverid, $Cartype, $Redcar, $Carage)
    {
        $this->carid = $carid;
        $this->driverid = $driverid;
        $this->Cartype = $Cartype;
        $this->Redcar = $Redcar;
        $this->Carage = $Carage;
    }

    public function getId()
    {
        return $this->carid;
    }
    public function getdriverid()
    {
        return $this->driverid;
    }

    public function getCartype()
    {
        return $this->Cartype;
    }

    public function getRedcar()
    {
        return $this->Redcar;
    }

    public function getCarage()
    {
        return $this->Carage;
    }
}
?>
