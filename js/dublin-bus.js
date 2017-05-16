
$(window).on('load', function () {
    // ......................Retrieving list of all the stops....................

    $.getJSON('https://data.dublinked.ie/cgi-bin/rtpi/busstopinformation?&format=json',function (jsonData) {

        var listOfStops=[];
        for (i=0;i<jsonData['numberofresults'];i++){

            listOfStops.push(jsonData['results'][i]['stopid']+"  , " +jsonData['results'][i]['fullname']);
        }

        $("#user-stop-no").autocomplete({
            source:[listOfStops]

        });

    });

    // .....................Retrieving list of all routes ...................

    $.getJSON('https://data.dublinked.ie/cgi-bin/rtpi/routelistinformation?operator=bac&format=json',function (jsonData) {

        var listOfRoutes=[];
        for (i=0;i<jsonData['results'].length;i++){

            // Only push those routes to the list which are  starting with a digit
            if(/^\d/.test(jsonData['results'][i]['route'])){

                listOfRoutes.push(jsonData['results'][i]['route']);
            }


        }

        $("#user-route-no").autocomplete({
            source:[listOfRoutes]

        });

    });

})







function getBusTime(stopNo,createTableCallback){


    var url='https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid='+stopNo+'&maxresults=8'+'&format=json';
    $.getJSON(url,function (jsonData) {


        createTableCallback(jsonData);

    });

}


function getRouteInfo(routeNo, dispplayRouteDirectionsCallback){

    var url='https://data.dublinked.ie/cgi-bin/rtpi/routeinformation?routeid='+routeNo+'&operator=bac'+'&format=json';
    $.getJSON(url,function(jsonData){

        dispplayRouteDirectionsCallback(jsonData);

    });
}


// ................. Start of createTable Function.............

function createTable(jsonData) {


    clearExistingData();

    if  (!jsonData['errormessage']&& jsonData['numberofresults']!==0){



        $('.modal-body').append("<table class='table' id='time-info-table'>" +
            "<thead>" +
            "<tr><th>Bus</th><th>Destination</th><th>Time (mins) </th></tr>" +
            "</thead>" +
            "<tbody>" +
            "</tbody>" +
            "</table>");

        for(i=0;i<jsonData['numberofresults'];i++){

            $('#time-info-table tbody').append("<tr><td>"+jsonData['results'][i]['route']+"</td>" +
                "<td>"+jsonData['results'][i]['destination']+"</td>" +
                "<td >"+jsonData['results'][i]['duetime']+"</td>" +
                "</tr>")

        }
    }
    else{

        $('.modal-body').append("<p>Sorry! your search did not match any bus stops, please try again...</p>");
    }




}
// ................End of createTable  Function ...........................


// .................. Start of dispalyRouteDirections Function..................


function dispalyRouteDirections (jsonData) {



    if(!jsonData['errormessage'] && jsonData['numberofresults']!==0){
        $('.modal-body').addClass('list-group');
        var directionOne=$("<a href='' data-dismiss='modal' id='direction-one' class='list-group-item'> From "+jsonData['results'][0]['origin']+" To " + jsonData['results'][0]['destination']+"</a>")
            .on('click',jsonData, displayAllStops);
        var directionTwo=$("<a href='' data-dismiss='modal' id='direction-two' class='list-group-item'> From "+jsonData['results'][1]['origin']+" To " + jsonData['results'][1]['destination']+"</a>")
            .on('click',jsonData, displayAllStops);


        $('#user-selection-modal .modal-body').append(directionOne);
        $('#user-selection-modal .modal-body').append(directionTwo);

    }
    else{

        $('.modal-body').append("<p>Sorry! your search did not match any route, please try again...</p>");
    }



}

// ................... End of dispalyRouteDirections Function...........................

// ...............Start of createStopsTable function....................

function createStopsTable(jsonData,direction){
    clearStopsTable();



    for(i=0;i<jsonData['results'][direction]['stops'].length;i++){

        $('#stops-table tbody').append("<tr><td>"+jsonData['results'][direction]['stops'][i]['stopid']+"</td>" +
            "<td>"+jsonData['results'][direction]['stops'][i]['fullname']+"</td>" +
            "<td >"+ "<button id='"+jsonData['results'][direction]['stops'][i]['stopid']+"' class='btn  btn-sm btn-outline-default' data-toggle='modal'  data-target='#busModal' type='button' onclick='getInfo(this)' >get info</button>"+"</td>" +
            "</tr>")

    }




}

function getInfo(event){




    var stopNo=event.id;
    $('#user-stop-no').val(stopNo);
    getBusTime(stopNo,createTable);






}

function displayAllStops(event){

    $('#bus-route-sec').removeClass('d-none');
    $('html, body').animate({
        scrollTop: $('#bus-route-sec').offset().top
    }, 1000);

    if(event.target.id==='direction-one') {
        $('#stops-table caption').text(event.target.text);
        createStopsTable(event.data, 0);
    }
    else {
        createStopsTable(event.data, 1);
    }




}

// .........clearExistingData Function....................

function clearExistingData(){

    $('.modal-body').empty();

}
function clearStopsTable() {

    $('#stops-table tbody').empty();
}



// ................End of clearExistingData Function............

$(document).ready(function () {

    $('.get-info-btn').click(function () {
        var stopNo=$('#user-stop-no').val().split(",")[0].trim();
        if(stopNo===""){

            $('#err-label-for-stopid-input').removeClass('d-none');
            $('#user-stop-no').attr('placeholder','');
            $('#stop-search-btn').attr({'data-toggle':'','data-target':''});

        }
        else{
            $('#stop-search-btn').attr({'data-toggle':'modal','data-target':'#busModal'});
            getBusTime(stopNo,createTable);
        }



    });


    $("#route-search-btn").click(function () {
        var routeNo= $('#user-route-no').val();
        if(routeNo===""){

            $('#err-label-for-route-input').removeClass('d-none');
            $('#user-route-no').attr('placeholder','');
            $('#route-search-btn').attr({'data-toggle':'','data-target':''});

        }
        else{
            $('#route-search-btn').attr({'data-toggle':'modal','data-target':'#user-selection-modal'});
            clearExistingData();
            getRouteInfo(routeNo,dispalyRouteDirections);
        }




    });



    $('#user-stop-no,#user-route-no').focus(function(){
        $('#err-label-for-stopid-input,#err-label-for-route-input').addClass('d-none');

    });

    $('#user-stop-no,#user-route-no').blur(function(){
        $('#user-stop-no').attr('placeholder','Search by bus stop number or by address');
        $('#user-route-no').attr('placeholder','Search by route');
    });




// .......On Clicking the modal close button bring the bus section into view and clear the input values.......

    $('.modal-footer button').on('click',function(){

        $('html, body').animate({
            scrollTop: $('#dublin-bus').offset().top
        }, 1000);
        $('#bus-route-sec').addClass('d-none');
        $('#user-route-no,#user-stop-no').val('');


    });

    $('#cover-bus-btn').click(function () {
        $('html, body').animate({
            scrollTop: $('#dublin-bus').offset().top
        }, 1000);
    });
    $('#cover-train-btn').click(function () {
        $('html, body').animate({
            scrollTop: $('#irish-rail').offset().top
        }, 1000);
    });



});

