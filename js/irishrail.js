
$(document).ready(function () {
 // ............Get the list of all stations.............

    $.get('https://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML_WithStationType?StationType=A',function (xml) {

        var stationsJson=$.xml2json(xml);
        var stations=[];
        for (i=0;i<stationsJson['objStation'].length; i++){
            stations.push(stationsJson['objStation'][i]['StationDesc']);
        }
         // Removing Dublicate values from the array of station names

        stations=stations.filter(function (station,index,inputArray) {
            return inputArray.indexOf(station) == index;


        });

         $("#user-station-name").autocomplete({
                source:[stations]

            });
     });

    $('#user-station-name').focus(function () {
        $('#err-label-for-station-input').addClass('d-none');

    });
    $('#rail-search-btn').on('click',displayTrainStatus);

    $('#user-station-name').blur(function(){
        $('#user-station-name').attr('placeholder','Search for live departure times for any station by name');

    });

});




function displayTrainStatus() {
   //.... if input field is empty....
    if ($('#user-station-name').val() === '') {
        $('#err-label-for-station-input').removeClass('d-none');

        $('#user-station-name').attr('placeholder','');
    }

    else {

        clearStatusTable();


        var api = 'https://api.irishrail.ie/realtime/realtime.asmx/getStationDataByNameXML?StationDesc=';
        var stationName = $('#user-station-name').val();
        var url = api + stationName;
        $.get(url, function (xml) {
            var statusJson = $.xml2json(xml);

          // .....if user input unlknowm station name i.e json object is undefined....

            if (statusJson['objStationData'] === undefined) {

                $('#err-label-for-station-input').removeClass('d-none');
                $('#user-station-name').val('');
            }
            else {
                $('#rail-timing-sec').removeClass('d-none');
                $('html, body').animate({
                    scrollTop: $('#rail-timing-sec').offset().top
                }, 1000);

                $('#train-status-table caption').text(stationName).append($('<button type="button" class="btn btn-success btn-sm pull-right"><i class="fa fa-close"></i> Close</button>')
                    .on('click', closeTrainStatus));

                // Checking if returned data(stationJson)is an object or array of objects
                if (Object.prototype.toString.call(statusJson['objStationData']) === '[object Array]') {

                    for (i = 0; i < statusJson['objStationData'].length; i++) {
                        // checking if user station name is same as origin of a train then schedule arrival will be replaced by schedule departure and ETA with originaltime

                        if ($('#user-station-name').val() === statusJson['objStationData'][i]['Origin']) {
                            $('#train-status-table tbody').append("<tr><td>" + statusJson['objStationData'][i]['Destination'] + "</td><td>" +
                                statusJson['objStationData'][i]['Origin'] + "</td><td>" +
                                statusJson['objStationData'][i]['Schdepart'] + "</td><td>" +
                                statusJson['objStationData'][i]['Origintime'] + "</td><td>" +
                                statusJson['objStationData'][i]['Duein'] + " min</td></tr>"
                            );
                        }
                        else {
                            $('#train-status-table tbody').append("<tr><td>" + statusJson['objStationData'][i]['Destination'] + "</td><td>" +
                                statusJson['objStationData'][i]['Origin'] + "</td><td>" +
                                statusJson['objStationData'][i]['Scharrival'] + "</td><td>" +
                                statusJson['objStationData'][i]['Exparrival'] + "</td><td>" +
                                statusJson['objStationData'][i]['Duein'] + " min</td></tr>"
                            );
                        }
                    }
                }
                else {
                    // checking if user station name is same as origin of a train then schedule arrival will be replaced by schedule departure and ETA with originaltime
                    if ($('#user-station-name').val() === statusJson['objStationData']['Origin']) {
                        $('#train-status-table tbody').append("<tr><td>" + statusJson['objStationData']['Destination'] + "</td><td>" +
                            statusJson['objStationData']['Origin'] + "</td><td>" +
                            statusJson['objStationData']['Schdepart'] + "</td><td>" +
                            statusJson['objStationData']['Origintime'] + "</td><td>" +
                            statusJson['objStationData']['Duein'] + " min</td></tr>"
                        );
                    }
                    else {
                        $('#train-status-table tbody').append("<tr><td>" + statusJson['objStationData']['Destination'] + "</td><td>" +
                            statusJson['objStationData']['Origin'] + "</td><td>" +
                            statusJson['objStationData']['Scharrival'] + "</td><td>" +
                            statusJson['objStationData']['Exarrival'] + "</td><td>" +
                            statusJson['objStationData']['Duein'] + " min</td></tr>"
                        );

                    }

                }
            }



        });

    }
}

function closeTrainStatus() {
    clearStatusTable();
    $('#rail-timing-sec').addClass('d-none');
    $('html, body').animate({
            scrollTop: $('#irish-rail').offset().top
        }, 1000);
    $('#user-station-name').val('');

}

function clearStatusTable(){

    $('#train-status-table tbody').empty();
}


