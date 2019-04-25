
$(document).ready(function () {
    // ............Get the list of all stations.............

    
    var url ='https://cors-anywhere.herokuapp.com/' + 'https://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML_WithStationType?StationType=A';

    $.ajax({
        'url': url,
       
        'dataType': 'xml',
        'success': function(response) {

            var stationsJson=$.xml2json(response);
            var stations=[];
            console.log(stationsJson);
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


        },
    });





    $('#user-station-name').focus(function () {
        $('#err-label-for-station-input').addClass('d-none');
         $('#user-station-name').attr('placeholder','')

    });
    $('#rail-search-btn').on('click',displayTrainStatus);

    $('#user-station-name').blur(function(){
        $('#user-station-name').attr('placeholder','Enter station name here..');

    });

    $('#user-station-name').keyup(function (event) {
        if(event.keyCode==13){
            $('#rail-search-btn').click();
        }

    });
    $('#status-modal button').on('click',closeTrainStatus);


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
        var tableCaption=stationName;
        var tempArr=stationName.split(" ");
        stationName='';

        for (i=0; i<tempArr.length;i++){
            stationName=stationName+tempArr[i]+"%20";
        }

        var url = 'https://cors-anywhere.herokuapp.com/'+api + stationName;


        $.ajax({
            'url': url,
           
            'dataType': 'xml',
            'success': function(response) {
                var statusJson = $.xml2json(response);
                // .....if user input unlknowm station name i.e json object is undefined....
                console.log(statusJson);
                if (statusJson['objStationData'] === undefined) {


                    $('#status-modal').modal('show');
                    $('#user-station-name').val('');
                }
                else {
                    $('#rail-timing-sec').removeClass('d-none');
                    $('html, body').animate({
                        scrollTop: $('#rail-timing-sec').offset().top
                    }, 1000);

                    $('#train-status-table caption').text(tableCaption ).append($('<button type="button" class="btn btn-default btn-sm pull-right"><i class="fa fa-close"></i> Close</button>')
                        .on('click', closeTrainStatus));

                    // Checking if returned data(stationJson)is an object or array of objects
                    if (Object.prototype.toString.call(statusJson['objStationData']) === '[object Array]') {

                        // ......Sorting status data according to due time....
                        statusJson=statusJson['objStationData'].sort(compare);




                        for (i = 0; i < statusJson.length; i++) {
                            // checking if user station name is same as origin of a train then schedule arrival will be replaced by schedule departure and ETA with originaltime

                            if ($('#user-station-name').val() === statusJson[i]['Origin']) {
                                $('#train-status-table tbody').append("<tr><td>" + statusJson[i]['Destination'] + "</td><td class='hidden-sm-down'>" +
                                    statusJson[i]['Origin'] + "</td><td>" +
                                    statusJson[i]['Schdepart'] + "</td><td>" +
                                    statusJson[i]['Origintime'] + "</td><td>" +
                                    statusJson[i]['Duein'] + " min</td></tr>"
                                );
                            }
                            else {
                                $('#train-status-table tbody').append("<tr><td>" + statusJson[i]['Destination'] + "</td><td class='hidden-sm-down'>" +
                                    statusJson[i]['Origin'] + "</td><td>" +
                                    statusJson[i]['Scharrival'] + "</td><td>" +
                                    statusJson[i]['Exparrival'] + "</td><td>" +
                                    statusJson[i]['Duein'] + " min</td></tr>"
                                );
                            }
                        }
                    }
                    else {


                        statusJson=statusJson['objStationData'];

                        // checking if user station name is same as origin of a train then schedule arrival will be replaced by schedule departure and ETA with originaltime
                        if ($('#user-station-name').val() === statusJson['Origin']) {
                            $('#train-status-table tbody').append("<tr><td>" + statusJson['Destination'] + "</td><td class='hidden-sm-down'>" +
                                statusJson['Origin'] + "</td><td>" +
                                statusJson['Schdepart'] + "</td><td>" +
                                statusJson['Origintime'] + "</td><td>" +
                                statusJson['Duein'] + " min</td></tr>"
                            );
                        }
                        else {

                            $('#train-status-table tbody').append("<tr><td>" + statusJson['Destination'] + "</td><td class='hidden-sm-down'>" +
                                statusJson['Origin'] + "</td><td>" +
                                statusJson['Scharrival'] + "</td><td>" +
                                statusJson['Exparrival'] + "</td><td>" +
                                statusJson['Duein'] + " min</td></tr>"
                            );

                        }

                    }
                }








            },
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


function compare(a,b) {

    return a['Duein']-b['Duein'];

}