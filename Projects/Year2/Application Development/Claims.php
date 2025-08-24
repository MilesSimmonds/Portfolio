<?php
class CLAIM
{
    public $claimid;
    public $driverid;
    public $Clm_amount;
    public $Clm_freq;
    public $Oldclam;
    public $Clmflg;

    public function __construct($claimid, $driverid, $Clm_amount, $Clm_freq, $Oldclam, $Clmflg)
    {
        $this->claimid = $claimid;
        $this->driverid = $driverid;
        $this->Clm_amount = $Clm_amount;
        $this->Clm_freq = $Clm_freq;
        $this->Oldclam = $Oldclam;
        $this->Clmflg = $Clmflg;
    }

    public function getId()
    {
        return $this->claimid;
    }
    public function getdriverid()
    {
        return $this->driverid;
    }

    public function getClm_amount()
    {
        return $this->Clm_amount;
    }

    public function getClm_freq()
    {
        return $this->Clm_freq;
    }
    public function getOldclam()
    {
        return $this->Oldclam;
    }
    public function getClmflg()
    {
        return $this->Clmflg;
    }
}
?>
