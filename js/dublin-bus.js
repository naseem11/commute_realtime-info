$(window).on('load', function() {



    // ......................Retrieving list of all the stops....................
    var yql_url = 'https://query.yahooapis.com/v1/public/yql';

    $.ajax({
        'url': yql_url,
        'data': {
            'q': 'SELECT * FROM json WHERE url="https://data.dublinked.ie/cgi-bin/rtpi/busstopinformation?operator=bac&format=json"',
            'format': 'json'

        },
        'dataType': 'json',
        'success': function(jsonData) {


            var listOfStops = [];

            for (i = 0; i < jsonData['query']['results']['json']['numberofresults']; i++) {



                listOfStops.push(jsonData['query']['results']['json']['results'][i]['stopid'] + "  , " + jsonData['query']['results']['json']['results'][i]['fullname']);
            }

            $("#user-stop-no").autocomplete({
                source: [listOfStops]

            });
        },

    });




    // .....................Retrieving list of all routes ...................



    $.ajax({
        'url': yql_url,
        'data': {
            'q': 'SELECT * FROM json WHERE url="https://data.dublinked.ie/cgi-bin/rtpi/routelistinformation?operator=bac&format=json"',
            'format': 'json'

        },
        'dataType': 'json',
        'success': function(jsonData) {


            var listOfRoutes = [];
            for (i = 0; i < jsonData['query']['results']['json']['numberofresults']; i++) {

                // Only push those routes to the list which are  starting with a digit
                if (/^\d/.test(jsonData['query']['results']['json']['results'][i]['route'])) {

                    listOfRoutes.push(jsonData['query']['results']['json']['results'][i]['route']);
                }


            }

            $("#user-route-no").autocomplete({
                source: [listOfRoutes]

            });



        },
    });


});


$(window).on('resize', function() {
    if ($(window).width() < 768) {
        $('#cover-bus-btn,#cover-bike-btn,#cover-train-btn').addClass('btn-block');

    } else {
        $('#cover-bus-btn,#cover-bike-btn,#cover-train-btn').removeClass('btn-block');
    }
});




function getBusTime(stopNo, createTableCallback) {

    $('#myModalLabel').text("Realtime Information For Stop " + stopNo);
    var yql_url = 'https://query.yahooapis.com/v1/public/yql';
    var url = 'https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid=' + stopNo + '&maxresults=8' + '&format=json';
    $.ajax({
        'url': yql_url,
        'data': {
            'q': 'SELECT * FROM json WHERE url="' + url + '"',
            'format': 'json'

        },
        'dataType': 'json',
        'success': function(jsonData) {

            createTableCallback(jsonData);




        },

    });

}


function getRouteInfo(routeNo, dispplayRouteDirectionsCallback) {



    var yql_url = 'https://query.yahooapis.com/v1/public/yql';
    var url = 'https://data.dublinked.ie/cgi-bin/rtpi/routeinformation?routeid=' + routeNo + '&operator=bac' + '&format=json';

    $.ajax({
        'url': yql_url,
        'data': {
            'q': 'SELECT * FROM json WHERE url="' + url + '"',
            'format': 'json'

        },

        'success': function(jsonData) {



            dispplayRouteDirectionsCallback(jsonData);




        },

    });


}


// ................. Start of createTable Function.............

function createTable(jsonData) {

    var jsonData = jsonData['query']['results']['json'];


    clearExistingData();

    if (!jsonData['errormessage'] && jsonData['numberofresults'] !== 0) {



        $('.modal-body').append("<table class='table' id='time-info-table'>" +
            "<thead>" +
            "<tr><th>Bus</th><th>Destination</th><th>Due in  </th></tr>" +
            "</thead>" +
            "<tbody>" +
            "</tbody>" +
            "</table>");

        for (i = 0; i < jsonData['numberofresults']; i++) {

            $('#time-info-table tbody').append("<tr><td>" + jsonData['results'][i]['route'] + "</td>" +
                "<td>" + jsonData['results'][i]['destination'] + "</td>" +
                "<td >" + jsonData['results'][i]['duetime'] + " (mins)</td>" +
                "</tr>")

        }
    } else {

        $('.modal-body').append("<p>Sorry! Realtime information is not available for this stop at the moment, Please try later...</p>");
    }




}
// ................End of createTable  Function ...........................


// .................. Start of dispalyRouteDirections Function..................


function dispalyRouteDirections(jsonData) {

    var jsonData = jsonData['query']['results']['json'];


    if (!jsonData['errormessage'] && jsonData['numberofresults'] !== 0) {
        $('.modal-body').addClass('list-group');
        var directionOne = $("<a href='' data-dismiss='modal' id='direction-one' class='list-group-item'> From " + jsonData['results'][0]['origin'] + " To " + jsonData['results'][0]['destination'] + "</a>")
            .on('click', jsonData, displayAllStops);
        var directionTwo = $("<a href='' data-dismiss='modal' id='direction-two' class='list-group-item'> From " + jsonData['results'][1]['origin'] + " To " + jsonData['results'][1]['destination'] + "</a>")
            .on('click', jsonData, displayAllStops);


        $('#user-selection-modal .modal-body').append(directionOne);
        $('#user-selection-modal .modal-body').append(directionTwo);

    } else {

        $('.modal-body').append("<p>Sorry! your search did not match any route, please try again...</p>");
    }



}

// ................... End of dispalyRouteDirections Function...........................


// ...............Start of createStopsTable function....................

function createStopsTable(jsonData, direction) {
    clearStopsTable();



    for (i = 0; i < jsonData['results'][direction]['stops'].length; i++) {

        $('#stops-table tbody').append("<tr><td>" + jsonData['results'][direction]['stops'][i]['stopid'] + "</td>" +
            "<td>" + jsonData['results'][direction]['stops'][i]['fullname'] + "</td>" +
            "<td >" + "<button id='" + jsonData['results'][direction]['stops'][i]['stopid'] + "' class='btn  btn-sm btn-outline-default' data-toggle='modal'  data-target='#busModal' type='button' onclick='getInfo(this)' >get info</button>" + "</td>" +
            "</tr>")

    }




}

function getInfo(event) {




    var stopNo = event.id;
    $('#user-stop-no').val(stopNo);
    getBusTime(stopNo, createTable);




}

function displayAllStops(event) {

    $('#bus-route-sec').removeClass('d-none');
    $('#user-route-no').val('');
    $('html, body').animate({
        scrollTop: $('#bus-route-sec').offset().top
    }, 1000);

    if (event.target.id === 'direction-one') {
        $('#stops-table caption').text(event.target.text);
        createStopsTable(event.data, 0);
    } else {
        createStopsTable(event.data, 1);
    }




}

// .........clearExistingData Function....................

function clearExistingData() {

    $('.modal-body').empty();

}

function clearStopsTable() {

    $('#stops-table tbody').empty();
}



// ................End of clearExistingData Function............

$(document).ready(function() {

    $('.get-info-btn').click(function() {
        var stopNo = $('#user-stop-no').val().split(",")[0].trim();
        if (stopNo === "") {

            $('#err-label-for-stopid-input').removeClass('d-none');
            $('#user-stop-no').attr('placeholder', '');
            $('#stop-search-btn').attr({
                'data-toggle': '',
                'data-target': ''
            });

        } else {
            $('#stop-search-btn').attr({
                'data-toggle': 'modal',
                'data-target': '#busModal'
            });

            getBusTime(stopNo, createTable);
        }



    });


    $("#route-search-btn").click(function() {
        var routeNo = $('#user-route-no').val();
        if (routeNo === "") {

            $('#err-label-for-route-input').removeClass('d-none');
            $('#user-route-no').attr('placeholder', '');
            $('#route-search-btn').attr({
                'data-toggle': '',
                'data-target': ''
            });

        } else {
            $('#route-search-btn').attr({
                'data-toggle': 'modal',
                'data-target': '#user-selection-modal'
            });
            clearExistingData();
            getRouteInfo(routeNo, dispalyRouteDirections);
        }




    });



    $('#user-stop-no,#user-route-no').focus(function() {
        $('#err-label-for-stopid-input,#err-label-for-route-input').addClass('d-none');
        if (event.target.id === 'user-stop-no')
            $('#user-stop-no').attr('placeholder', '');
        if (event.target.id === 'user-route-no')
            $('#user-route-no').attr('placeholder', '');


    });


    $('#user-stop-no,#user-route-no').blur(function() {
        $('#user-stop-no').attr('placeholder', 'Enter bus stop number or  address here...');
        $('#user-route-no').attr('placeholder', 'Enter route number here...');
    });




    // .......On Clicking the modal close button bring the bus section into view and clear the input values.......

    $('#busModal .modal-footer  button').on('click', function() {

        $('html, body').animate({
            scrollTop: $('#dublin-bus').offset().top
        }, 1000);
        $('#bus-route-sec').addClass('d-none');
        $('#user-route-no,#user-stop-no').val('');


    });

    $('#cover-bus-btn').click(function() {
        $('html, body').animate({
            scrollTop: $('#dublin-bus').offset().top
        }, 1000);
    });
    $('#cover-train-btn').click(function() {
        $('html, body').animate({
            scrollTop: $('#irish-rail').offset().top
        }, 1000);
    });
    $('#cover-bike-btn').click(function() {
        $('html, body').animate({
            scrollTop: $('#dublin-bike').offset().top
        }, 1000);
    });

    $('#user-stop-no').keyup(function(event) {
        if (event.keyCode == 13) {
            $('#stop-search-btn').click();
        }

    });
    $('#user-route-no').keyup(function(event) {
        if (event.keyCode == 13) {
            $('#route-search-btn').click();
        }

    });

});