// jQuery functions to manipulate the main page and handle communication with
// the books web service via Ajax.
//
// Note that there is very little error handling in this file.  In particular, there
// is no validation in the handling of form data.  This is to avoid obscuring the 
// core concepts that the demo is supposed to show.


//                         ------------------------------------ DRIVERS API SCRIPTS ---------------------------------
function getAllDrivers()
{
    $.ajax({
        url: '/DRIVER',
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            createDriversTable(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

// Function to fetch details of a single driver based on driver ID
function getDriver() {
    var driverid = document.getElementById('searchBydriverIdInput').value;
    console.log("Driver ID:", driverid); // Log driver ID for debugging
    $.ajax({
        url: '/DRIVER/' + driverid, 
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function(data) {
            console.log("Data:", data); // Log data for debugging
            createDriversTable(data); // Call function to display driver details
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", jqXHR, textStatus, errorThrown); // Log AJAX error for debugging
            alert("Ensure the correct ID has been entered.");
        }
    });
}

function addDriver()
{
    
    var driver = {
		driverid: $('#driverid').val(),
        Kidsdriv: $('#Kidsdriv').val(),
        Age: $('#Age').val(),
        Income: $('#Income').val(),
        Mstatus: $('#Mstatus').val(),
        Gender: $('#Gender').val(),
        Education: $('#Education').val(),
        Occupation: $('#Occupation').val()
        
    };

    $.ajax({
        url: '/DRIVER',
        type: 'POST',
        data: JSON.stringify(driver),
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            getAllBooks();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
    $("#newdriverform").html("");
}

function cancelChangeDriver()
{
    $("#newdriverform").html("");
}

function editDriver(driverid)
{
    $.ajax({
        url: '/DRIVER/' + driverid,
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            createEditDriverForm(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

function editDriverValues(driverid)
{

    var driver = {
        driverid: driverid,
        Kidsdriv: $('#Kidsdriv').val(),
        Age: $('#Age').val(),
        Income: $('#Income').val(),
        Mstatus: $('#Mstatus').val(),
        Gender: $('#Gender').val(),
        Education: $('#Education').val(),
        Occupation: $('#Occupation').val()
    };

    $.ajax({
        url: '/DRIVER',
        type: 'PUT',
        data: JSON.stringify(driver),
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            getAllDrivers();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
    $("#newdriverform").html("");

}

function deleteDriver(driverid)
{
    $.ajax({
        url: '/DRIVER/' + driverid,
        type: 'DELETE',
        dataType: 'json',
        success: function (data) {
            getAllDrivers();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

// Function to display driver details
function displayDriverDetails(driver) {
    var strResult = '<div class="col-md-12">' +
        '<table class="table table-bordered table-hover">' +
        '<thead>' +
        '<tr>' +
        '<th>driverid</th>' +
        '<th>Kidsdriv</th>' +
        '<th>Age</th>' +
        '<th>Income</th>' +
        '<th>Mstatus</th>' +
        '<th>Gender</th>' +
        '<th>Education</th>' +
        '<th>Occupation</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';

    strResult += "<tr><td>" + driver.driverid + "</td><td> " + driver.Kidsdriv + "</td><td>" + driver.Age + "</td><td>" + driver.Income +
        "</td><td>" + driver.Mstatus + "</td><td>" + driver.Gender + "</td><td>" + driver.Education + "</td><td>" + driver.Occupation + "</td></tr>";
    strResult += '<td><input type="button" value="Edit Driver" class="btn btn-sm btn-primary" onclick="editDriver(' + driver.driverid + ');" /><td>';
    strResult += '<td><input type="button" value="Delete Driver" class="btn btn-sm btn-primary" onclick="deleteDriver(' + driver.driverid + ');" /><td>';
    strResult += "</td></tr>";

    strResult += "</tbody></table></div>";
    $("#driver-details").html(strResult);
}




function createDriversTable(drivers) {
    var strResult = '<div class="col-md-12">' + 
                    '<table class="table table-bordered table-hover">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>driverid</th>' +
                    '<th>Kidsdriv</th>' +
                    '<th>Age</th>' +
                    '<th>Income</th>' +
                    '<th>Mstatus</th>' +
                    '<th>Gender</th>' +
                    '<th>Education</th>' +
                    '<th>Occupation</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
    
    if (Array.isArray(drivers)) {
        $.each(drivers, function (index, driver) {                        
            strResult += "<tr><td>" + driver.driverid + "</td><td> " + driver.Kidsdriv + "</td><td>" + driver.Age + "</td><td>" + driver.Income + 
            "</td><td>" + driver.Mstatus + "</td><td>" + driver.Gender + "</td><td>"  + driver.Education + "</td><td>"  + driver.Occupation + "</td></tr>";
            strResult += '<td><input type="button" value="Edit Driver" class="btn btn-sm btn-primary" onclick="editDriver(' + driver.driverid + ');" /><td>';
            strResult += '</td><td>';
            strResult += '<td><input type="button" value="Delete Driver" class="btn btn-sm btn-primary" onclick="deleteDriver(' + driver.driverid + ');" /><td>';
            strResult += "</td></tr>";   
        });
    } else {
        // Handle single object input
        strResult += "<tr><td>" + drivers.driverid + "</td><td> " + drivers.Kidsdriv + "</td><td>" + drivers.Age + "</td><td>" + drivers.Income + 
        "</td><td>" + drivers.Mstatus + "</td><td>" + drivers.Gender + "</td><td>"  + drivers.Education + "</td><td>"  + drivers.Occupation + "</td></tr>";
        strResult += '<td><input type="button" value="Edit Driver" class="btn btn-sm btn-primary" onclick="editDriver(' + drivers.driverid + ');" /><td>';
        strResult += '</td><td>';
        strResult += '<td><input type="button" value="Delete Driver" class="btn btn-sm btn-primary" onclick="deleteDriver(' + drivers.driverid + ');" /><td>';
        strResult += "</td></tr>";   
    }

    strResult += "</tbody></table></div>";
    $("#alldrivers").html(strResult);
}

function createNewDriverForm() {
    var strResult = '<div class="col-md-12">';
    strResult += '<form id="newDriverForm" class="form-horizontal" role="form">';
    strResult += '<div class="form-group"><label for="driverid" class="col-md-3 control-label">driverid</label><div class="col-md-9"><input type="text" class="form-control" id="driverid" required></div></div>';
    strResult += '<div class="form-group"><label for="Kidsdriv" class="col-md-3 control-label">Kidsdriv</label><div class="col-md-9"><input type="text" class="form-control" id="Kidsdriv" required></div></div>';
    strResult += '<div class="form-group"><label for="Age" class="col-md-3 control-label">Age</label><div class="col-md-9"><input type="text" class="form-control" id="Age" required></div></div>';
    strResult += '<div class="form-group"><label for="Income" class="col-md-3 control-label">Income</label><div class="col-md-9"><input type="text" class="form-control" id="Income" required></div></div>';
    strResult += '<div class="form-group"><label for="Mstatus" class="col-md-3 control-label">Mstatus</label><div class="col-md-9"><input type="text" class="form-control" id="Mstatus" required></div></div>';
    strResult += '<div class="form-group"><label for="Gender" class="col-md-3 control-label">Gender</label><div class="col-md-9"><input type="text" class="form-control" id="Gender" required></div></div>';
    strResult += '<div class="form-group"><label for="Education" class="col-md-3 control-label">Education</label><div class="col-md-9"><input type="text" class="form-control" id="Education" required></div></div>';
    strResult += '<div class="form-group"><label for="Occupation" class="col-md-3 control-label">Occupation</label><div class="col-md-9"><input type="text" class="form-control" id="Occupation" required></div></div>';
    strResult += '<div class="form-group"><div class="col-md-offset-3 col-md-9"><input type="button" value="Add Driver" class="btn btn-sm btn-primary" onclick="validateAndAddDriver();" />&nbsp;&nbsp;<input type="button" value="Cancel" class="btn btn-sm btn-primary" onclick="cancelChangeDriver();" /></div></div>';
    strResult += '</form></div>';
    $("#newdriverform").html(strResult);
}

function validateAndAddDriver() {
    var form = document.getElementById("newDriverForm");
    // Use HTML5 built-in validation
    if (form.checkValidity()) {
        addDriver();
    } else {
        form.reportValidity();
    }
}


function createEditDriverForm(driver)
{
    var strResult = '<div class="col-md-12">';
    strResult += '<form class="form-horizontal" role="form">';
    strResult += '<div class="form-group"><label for="Kidsdriv" class="col-md-3 control-label">Kidsdriv</label><div class="col-md-9"><input type="text" class="form-control" id="Kidsdriv" value="' + driver.Kidsdriv + '"></div></div>';
    strResult += '<div class="form-group"><label for="Age" class="col-md-3 control-label">Age</label><div class="col-md-9"><input type="text" class="form-control" id="Age" value="' + driver.Age + '"></div></div>';
    strResult += '<div class="form-group"><label for="Income" class="col-md-3 control-label">Income</label><div class="col-md-9"><input type="text" class="form-control" id="Income" value="' + driver.Income + '"></div></div>';
    strResult += '<div class="form-group"><label for="Mstatus" class="col-md-3 control-label">Mstatus</label><div class="col-md-9"><input type="text" class="form-control" id="Mstatus" value="' + driver.Mstatus + '"></div></div>';
    strResult += '<div class="form-group"><label for="Gender" class="col-md-3 control-label">Gender</label><div class="col-md-9"><input type="text" class="form-control" id="Gender" value="' + driver.Gender + '"></div></div>';
    strResult += '<div class="form-group"><label for="Education" class="col-md-3 control-label">Education</label><div class="col-md-9"><input type="text" class="form-control" id="Education" value="' + driver.Education + '"></div></div>';
    strResult += '<div class="form-group"><label for="Occupation" class="col-md-3 control-label">Occupation</label><div class="col-md-9"><input type="text" class="form-control" id="Occupation" value="' + driver.Occupation + '"></div></div>';
    strResult += '<div class="form-group"><div class="col-md-offset-3 col-md-9"><input type="button" value="Edit Driver" class="btn btn-sm btn-primary" onclick="editDriverValues(' + driver.driverid + ');" />&nbsp;&nbsp;<input type="button" value="Cancel" class="btn btn-sm btn-primary" onclick="cancelChangeDriver();" /></div></div>';
    strResult += '</form></div>';
    $("#newdriverform").html(strResult);
}
//                         ------------------------------------ CAR_DETAILS API SCRIPTS ---------------------------------
function getAllCarDetails()
{
    $.ajax({
        url: '/CAR_DETAILS',
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            createCarDetailsTable(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

// Function to fetch details of a single driver based on driver ID
function getCar() {
    var carid = document.getElementById('searchBycarIdInput').value;
    console.log("Car ID:", carid); // Log driver ID for debugging
    $.ajax({
        url: '/CAR_DETAILS/' + carid, 
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function(data) {
            console.log("Data:", data); // Log data for debugging
            createCarDetailsTable(data); // Call function to display driver details
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", jqXHR, textStatus, errorThrown); // Log AJAX error for debugging
            alert("Ensure the correct ID has been entered.");
        }
    });
}
function addCarDetails()
{
    
    var car = {
		carid: $('#carid').val(),
        driverid: $('#driverid').val(),
        Cartype: $('#Cartype').val(),
        Redcar: $('#Redcar').val(),
        Carage: $('#Carage').val()
    };

    $.ajax({
        url: '/CAR_DETAILS',
        type: 'POST',
        data: JSON.stringify(car),
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            getAllCarDetails();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
    $("#newcarform").html("");
}

function cancelChangeCarDetails()
{
    $("#newcarform").html("");
}


function editCarDetails(carid)
{
    $.ajax({
        url: '/CAR_DETAILS/' + carid,
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            createEditCarDetailsForm(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}

function editCarDetailsValues(carid)
{
    var car = {
        carid: carid,
        driverid: $('#driverid').val(),
        Cartype: $('#Cartype').val(),
        Redcar: $('#Redcar').val(),
        Carage: $('#Carage').val()
    };

    $.ajax({
        url: '/CAR_DETAILS',
        type: 'PUT',
        data: JSON.stringify(car),
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            getAllCarDetails();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
    $("#newcarform").html("");

}

function deleteCarDetails(carid)
{
    $.ajax({
        url: '/CAR_DETAILS/' + carid,
        type: 'DELETE',
        dataType: 'json',
        success: function (data) {
            getAllCarDetails();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + '\n' + textStatus + '\n' + errorThrown);
        }
    });
}
function createCarDetailsTable(CAR_DETAILS) {
    var strResult = '<div class="col-md-12">' + 
                    '<table class="table table-bordered table-hover">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>carid</th>' +
                    '<th>driverid</th>' +
                    '<th>Cartype</th>' +
                    '<th>Redcar</th>' +
                    '<th>Carage</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
    
    if (Array.isArray(CAR_DETAILS)) {
        $.each(CAR_DETAILS, function (index, car) {                        
            strResult += "<tr><td>" + car.carid + "</td><td> " + car.driverid + "</td><td>" + car.Cartype + "</td><td>" + car.Redcar + 
            "</td><td>" + car.Carage + "</td><td>";
            strResult += '<input type="button" value="Edit Car Details" class="btn btn-sm btn-primary" onclick="editCarDetails(' + car.carid + ');" />';
            strResult += '<input type="button" value="Delete Car Details" class="btn btn-sm btn-primary" onclick="deleteCarDetails(' + car.carid + ');" />';
            strResult += "</td></tr>";
        });
    } else {
        // Handle single object input
        strResult += "<tr><td>" + CAR_DETAILS.carid + "</td><td> " + CAR_DETAILS.driverid + "</td><td>" + CAR_DETAILS.Cartype + "</td><td>" + CAR_DETAILS.Redcar + 
        "</td><td>" + CAR_DETAILS.Carage + "</td><td>";
        strResult += '<input type="button" value="Edit Car Details" class="btn btn-sm btn-primary" onclick="editCarDetails(' + CAR_DETAILS.carid + ');" />';
        strResult += '<input type="button" value="Delete Car Details" class="btn btn-sm btn-primary" onclick="deleteCarDetails(' + CAR_DETAILS.carid + ');" />';
        strResult += "</td></tr>";
    }

    strResult += "</tbody></table></div>";
    $("#allcars").html(strResult);
}

function createNewCarDetailsForm()
{
    var strResult = '<div class="col-md-12">';
    strResult += '<form id="newcarForm" class="form-horizontal" role="form">';
    strResult += '<div class="form-group"><label for="carid" class="col-md-3 control-label">carid</label><div class="col-md-9"><input type="text" class="form-control" id="carid" required></div></div>';
    strResult += '<div class="form-group"><label for="driverid" class="col-md-3 control-label">driverid</label><div class="col-md-9"><input type="text" class="form-control" id="driverid" required></div></div>';
    strResult += '<div class="form-group"><label for="Cartype" class="col-md-3 control-label">Cartype</label><div class="col-md-9"><input type="text" class="form-control" id="Cartype" required></div></div>';
    strResult += '<div class="form-group"><label for="Redcar" class="col-md-3 control-label">Redcar</label><div class="col-md-9"><input type="text" class="form-control" id="Redcar" required></div></div>';
    strResult += '<div class="form-group"><label for="Carage" class="col-md-3 control-label">Carage</label><div class="col-md-9"><input type="text" class="form-control" id="Carage" required></div></div>';
    strResult += '<div class="form-group"><div class="col-md-offset-3 col-md-9"><input type="button" value="Add Car Details" class="btn btn-sm btn-primary" onclick="validateAndAddCarDetails();" />&nbsp;&nbsp;<input type="button" value="Cancel" class="btn btn-sm btn-primary" onclick="cancelChangeCarDetails();" /></div></div>';
    strResult += '</form></div>';
    $("#newcarform").html(strResult);
}

function validateAndAddCarDetails() {
    var form = document.getElementById("newcarForm");
    // Use HTML5 built-in validation
    if (form.checkValidity()) {
        addCarDetails();
    } else {
        form.reportValidity();
    }
}

function createEditCarDetailsForm(car)
 {
    var strResult = '<div class="col-md-12">';
    strResult += '<form class="form-horizontal" role="form">';
    strResult += '<div class="form-group"><label for="carid" class="col-md-3 control-label">carid</label><div class="col-md-9"><input type="text" class="form-control" id="carid" value="' + car.carid + '"></div></div>';
    strResult += '<div class="form-group"><label for="driverid" class="col-md-3 control-label">driverid</label><div class="col-md-9"><input type="text" class="form-control" id="driverid" value="' + car.driverid + '"></div></div>';
    strResult += '<div class="form-group"><label for="Cartype" class="col-md-3 control-label">Cartype</label><div class="col-md-9"><input type="text" class="form-control" id="Cartype" value="' + car.Cartype + '"></div></div>';
    strResult += '<div class="form-group"><label for="Redcar" class="col-md-3 control-label">Redcar</label><div class="col-md-9"><input type="text" class="form-control" id="Redcar" value="' + car.Redcar + '"></div></div>';
    strResult += '<div class="form-group"><label for="Carage" class="col-md-3 control-label">Carage</label><div class="col-md-9"><input type="text" class="form-control" id="Carage" value="' + car.Carage + '"></div></div>';
    strResult += '<div class="form-group"><div class="col-md-offset-3 col-md-9"><input type="button" value="Edit Car Details" class="btn btn-sm btn-primary" onclick="editCarDetailsValues(' + car.carid + ');" />&nbsp;&nbsp;<input type="button" value="Cancel" class="btn btn-sm btn-primary" onclick="cancelChangeCarDetails();" /></div></div>';
    strResult += '</form></div>';
    $("#newcarform").html(strResult);
}
//                         ------------------------------------ CLAIMS API SCRIPTS ---------------------------------
function getAllClaimDetails() {
    $.ajax({
        url: '/CLAIMS',
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            createClaimsTable(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error: ' + errorThrown);
        }
    });
}

// Function to fetch details of a single driver based on driver ID
function getClaim() {
    var claimid = document.getElementById('searchByclaimIdInput').value;
    console.log("Claim ID:", claimid); // Log driver ID for debugging
    $.ajax({
        url: '/CLAIMS/' + claimid, 
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function(data) {
            console.log("Data:", data); // Log data for debugging
            createClaimsTable(data); // Call function to display driver details
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("AJAX Error:", jqXHR, textStatus, errorThrown); // Log AJAX error for debugging
            alert("Ensure the correct ID has been entered.");
        }
    });
}
function addClaimDetails() {
    var claim = {
        claimid: $('#claimid').val(),
        driverid: $('#driverid').val(),
        Clm_amount: $('#Clm_amount').val(),
        Clm_freq: $('#Clm_freq').val(),
        Oldclam: $('#Oldclam').val(),
        Clmflg: $('#Clmflg').val()
    };

    $.ajax({
        url: '/CLAIMS',
        type: 'POST',
        data: JSON.stringify(claim),
        contentType: "application/json;charset=utf-8",
        success: function () {
            getAllClaimDetails();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error: ' + errorThrown);
        }
    });
    $("#newclaimform").html("");
}

function cancelChangeClaimDetails()
{
    $("#newclaimform").html("");
}

function editClaimDetails(claimid) {
    $.ajax({
        url: '/CLAIMS/' + claimid,
        type: 'GET',
        cache: false,
        dataType: 'json',
        success: function (data) {
            createEditClaimDetailsForm(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error: ' + errorThrown);
        }
    });
}

function editClaimDetailsValues(claimid) 
{
    var claim = {
        claimid: claimid,
        driverid: $('#driverid').val(),
        Clm_amount: $('#Clm_amount').val(),
        Clm_freq: $('#Clm_freq').val(),
        Oldclam: $('#Oldclam').val(),
        Clmflg: $('#Clmflg').val()
    };

    $.ajax({
        url: '/CLAIMS',
        type: 'PUT',
        data: JSON.stringify(claim),
        contentType: "application/json;charset=utf-8",
        success: function () {
            getAllClaimDetails();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error: ' + errorThrown);
        }
    });
    $("#newclaimform").html("");
}

function deleteClaimDetails(claimid) {
    $.ajax({
        url: '/CLAIMS/' + claimid,
        type: 'DELETE',
        dataType: 'json',
        success: function () {
            getAllClaimDetails();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error: ' + errorThrown);
        }
    });
}

function createClaimsTable(CLAIMS) {
    var strResult = '<div class="col-md-12">' + 
                    '<table class="table table-bordered table-hover">' +
                    '<thead>' +
                    '<tr>' +
                    '<th>claimid</th>' +
                    '<th>driverid</th>' +
                    '<th>Clm_amount</th>' +
                    '<th>Clm_freq</th>' +
                    '<th>Oldclam</th>' +
                    '<th>Clmflg</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';
    
    if (Array.isArray(CLAIMS)) {
        $.each(CLAIMS, function (index, claim) {                        
            strResult += "<tr><td>" + claim.claimid + "</td><td> " + claim.driverid + "</td><td>" + claim.Clm_amount + "</td><td>" + claim.Clm_freq + 
            "</td><td>" + claim.Oldclam + "</td><td>" + claim.Clmflg + "</td><td>";
            strResult += '<input type="button" value="Edit Claim Details" class="btn btn-sm btn-primary" onclick="editClaimDetails(' + claim.claimid + ');" />';
            strResult += '<input type="button" value="Delete Claim Details" class="btn btn-sm btn-primary" onclick="deleteClaimDetails(' + claim.claimid + ');" />';
            strResult += "</td></tr>";
        });
    } else {
        // Handle single object input
        strResult += "<tr><td>" + CLAIMS.claimid + "</td><td> " + CLAIMS.driverid + "</td><td>" + CLAIMS.Clm_amount + "</td><td>" + CLAIMS.Clm_freq + 
        "</td><td>" + CLAIMS.Oldclam + "</td><td>" + CLAIMS.Clmflg + "</td><td>";
        strResult += '<input type="button" value="Edit Claim Details" class="btn btn-sm btn-primary" onclick="editClaimDetails(' + CLAIMS.claimid + ');" />';
        strResult += '<input type="button" value="Delete Claim Details" class="btn btn-sm btn-primary" onclick="deleteClaimDetails(' + CLAIMS.claimid + ');" />';
        strResult += "</td></tr>";
    }

    strResult += "</tbody></table></div>";
    $("#allclaims").html(strResult);
}

function createNewClaimDetailsForm() {
    var strResult = `<div class="col-md-12">
                        <form id="newclaimForm" class="form-horizontal" role="form">
                            <div class="form-group">
                                <label for="claimid" class="col-md-3 control-label">claimid</label>
                                <div class="col-md-9"><input type="text" class="form-control" id="claimid" required></div>
                            </div>
                            <div class="form-group">
                                <label for="driverid" class="col-md-3 control-label">driverid</label>
                                <div class="col-md-9"><input type="text" class="form-control" id="driverid" required></div>
                            </div>
                            <div class="form-group">
                                <label for="Clm_amount" class="col-md-3 control-label">Clm_amount</label>
                                <div class="col-md-9"><input type="text" class="form-control" id="Clm_amount" required></div>
                            </div>
                            <div class="form-group">
                                <label for="Clm_freq" class="col-md-3 control-label">Clm_freq</label>
                                <div class="col-md-9"><input type="text" class="form-control" id="Clm_freq" required></div>
                            </div>
                            <div class="form-group">
                                <label for="Oldclam" class="col-md-3 control-label">Oldclam</label>
                                <div class="col-md-9"><input type="text" class="form-control" id="Oldclam" required></div>
                            </div>
                            <div class="form-group">
                                <label for="Clmflg" class="col-md-3 control-label">Clmflg</label>
                                <div class="col-md-9"><input type="text" class="form-control" id="Clmflg" required></div>
                            </div>
                            <div class="form-group">
                                <div class="col-md-offset-3 col-md-9">
                                    <input type="button" value="Add Claim Details" class="btn btn-sm btn-primary" onclick="validateAndAddClaimDetails();" />&nbsp;&nbsp;
                                    <input type="button" value="Cancel" class="btn btn-sm btn-primary" onclick="cancelChangeClaimDetails();" />
                                </div>
                            </div>
                        </form>
                    </div>`;
    $("#newclaimform").html(strResult);
}

function validateAndAddClaimDetails() {
    var form = document.getElementById("newclaimForm");
    // Use HTML5 built-in validation
    if (form.checkValidity()) {
        addClaimDetails();
    } else {
        form.reportValidity();
    }
}

function createEditClaimDetailsForm(claim)
 {
    var strResult = '<div class="col-md-12">';
    strResult += '<form class="form-horizontal" role="form">';
    strResult += '<div class="form-group"><label for="claimid" class="col-md-3 control-label">claimid</label><div class="col-md-9"><input type="text" class="form-control" id="claimid" value="' + claim.claimid + '"></div></div>';
    strResult += '<div class="form-group"><label for="driverid" class="col-md-3 control-label">driverid</label><div class="col-md-9"><input type="text" class="form-control" id="driverid" value="' + claim.driverid + '"></div></div>';
    strResult += '<div class="form-group"><label for="Clm_amount" class="col-md-3 control-label">Clm_amount</label><div class="col-md-9"><input type="text" class="form-control" id="Clm_amount" value="' + claim.Clm_amount + '"></div></div>';
    strResult += '<div class="form-group"><label for="Clm_freq" class="col-md-3 control-label">Clm_freq</label><div class="col-md-9"><input type="text" class="form-control" id="Clm_freq" value="' + claim.Clm_freq + '"></div></div>';
    strResult += '<div class="form-group"><label for="Oldclam" class="col-md-3 control-label">Oldclam</label><div class="col-md-9"><input type="text" class="form-control" id="Oldclam" value="' + claim.Oldclam + '"></div></div>';
    strResult += '<div class="form-group"><label for="Clmflg" class="col-md-3 control-label">Clmflg</label><div class="col-md-9"><input type="text" class="form-control" id="Clmflg" value="' + claim.Clmflg + '"></div></div>';
    strResult += '<div class="form-group"><div class="col-md-offset-3 col-md-9"><input type="button" value="Edit Car Details" class="btn btn-sm btn-primary" onclick="editClaimDetailsValues(' + claim.claimid + ');" />&nbsp;&nbsp;<input type="button" value="Cancel" class="btn btn-sm btn-primary" onclick="cancelChangeClaimDetails();" /></div></div>';
    strResult += '</form></div>';
    $("#newclaimform").html(strResult);
}
