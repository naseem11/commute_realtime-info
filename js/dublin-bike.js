$(document).ready(function () {


    $.getJSON('https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey=2258e7a53edb76b86e16232987a81f8be6b7a54b',function (jsonData) {

        var listOfStations=[];
        for (i=0;i<jsonData.length;i++){

            listOfStations.push(jsonData[i]['number']+"  , " +jsonData[i]['name']);
        }


        $("#user-bike-station-name").autocomplete({
            source:[listOfStations]

        });

        $('#bike-search-btn').click(function(){

            var userInput=$('#user-bike-station-name').val();

            if(userInput===""){
                $('#err-label-for-bike-station-input').removeClass('d-none');
                $('#user-bike-station-name').attr('placeholder','');
                $('#bike-search-btn').attr({'data-toggle':'','data-target':''});

            }
            else{
                $('#bikes-status-modal .modal-title').text("Station No : "+userInput);
                userInput=userInput.split(",")[0].trim();
                $('#bike-search-btn').attr({'data-toggle':'modal','data-target':'#bikes-status-modal'});
                $.getJSON('https://api.jcdecaux.com/vls/v1/stations/'+userInput+'?contract=dublin&apiKey=2258e7a53edb76b86e16232987a81f8be6b7a54b',function (status) {


                    $('#bikes-status-modal .modal-body').empty();
                    $('#bikes-status-modal .modal-body').append("<table class='table' id='bikes-status-table'>" +
                        "<thead>" +
                        "<tr><th>Status</th><th>Avail. Bikes</th><th>Avail. Bike Stands</th><th>Total Stands</th></tr>" +
                        "</thead>" +
                        "<tbody> <tr><td>"+status['status']+"</td><td class='pl-5'>"+status['available_bikes']+"</td><td  class='pl-5'>"+status['available_bike_stands']+"</td><td  class='pl-5'>"+status['bike_stands']+"</td></tr>"+
                        "</tbody>" +
                        "</table>");


                }).fail(function(error){
                    $('#bikes-status-modal .modal-title').text('Please enter a valid station name or number...');
                    $('#bikes-status-modal .modal-body').empty();



                });


            }


        });







    });

    $('#user-bike-station-name').blur(function(){
        $('#user-bike-station-name').attr('placeholder','Search by station number or by address');

    });

    $('#user-bike-station-name').focus(function(){
        $('#err-label-for-bike-station-input').addClass('d-none');
        $('#user-bike-station-name').attr('placeholder', '');


    });

    $('#bikes-status-modal button').click(function(){
        $('html, body').animate({
            scrollTop: $('#dublin-bike').offset().top
        }, 1000);
        $('#user-bike-station-name').val('');



    });



});
