(function() {

    var x2js = new X2JS();

    var timeInfo = {};
    var isDay = true;
    timeInfo.debug = true;

    $(function() {

        geoip2.insights(onSuccess, onError);

        // calls the json to refresh the page data. Every 5 seconds
        //setInterval(getLocation,5000);
        if (!timeInfo.debug) {
            $('#mainForm').hide();
        } else {
            $('#mainForm').show();
        }
        //setRadioValues();
        loadBlog();
       // loadRedditRSS();
        loadReddit();
        

    });
    var onSuccess = function(data) {

        var Geo = {};
        Geo.lat = data.location.latitude;
        Geo.lon = data.location.longitude;
        getWeather(Geo);

        getTimeOfDay(Geo);


    }
    var onError = function(error) {
        log(error.description);
    }

    function loadBlog() {
        var settings = {
            url: '../hello.php',
            dataType: 'json',
            success: function(data) {
               
                var jsonObj = x2js.xml_str2json(data.htblog);
             
                displayBlog(jsonObj);
            },
            error:function(error) {
                console.log(error);
            }
        }


        loadData(settings);


    }

    function loadReddit(){
        var settings = {
            url:'https://www.reddit.com/r/headertag/.json',
            dataType:'json',
            success: function(data) {
                getRedditPost(data);
            },
            error: function(error){
                console.log(error);
            }
        };

        $.ajax(settings);
    }
   
   
    function loadData(settings) {
         $.ajax(settings);
    }


    function getRedditPost(data) {
        var newestPost = 0;
        var rdtUrlToImg = "";
       
        var rdtImg = $('.reddit');
        var rdtPostUrl = $('#rdt--posturl');
        var rdtPostDate = $('#rdt--postdate');
        var rdtPostTitle = $('#rdt--title')

        if (data == null || data == undefined) {
            console.log("Error processing data");
        } else {


            var postArray = data.data.children;

            //console.log(postArray);
            var post = postArray[newestPost].data;

            var date = "Posted on " + toSimpleDate(fromEpochToDate(post.created_utc)); 

            var urlToComments = "https://redd.it/" + post.id;
            rdtPostDate.text(date);

            rdtPostTitle.text(post.title);  

            rdtPostUrl.attr('href', urlToComments);
            //console.log(post.media_embed.hasOwnProperty('content'));
            var firstImg = 0;
            //uploaded with Preview
            if(post.hasOwnProperty('preview'))
            {
               // console.log("post has images");
                var imageArray = post.preview.images;
                rdtUrlToImg = imageArray[firstImg].source.url;
                rdtImg.css('background-image', 'url(' + rdtUrlToImg + ')')
                rdtImg.addClass('cover');

            } else { 
               // console.log("Post doesn't have any images");
                rdtImg.css('background-image', 'url(../rdt-headertag.png)');
                rdtImg.removeClass('cover');
            }    
          }
    }


    function displayBlog(data) {
        var entry_id = 0;

        var urlToImg = "";
     
        var htImg = $('.wiki');
        var htPostUrl = $('#ht--posturl');
        var htPostDate = $('#ht--postdate');
        var htPostTitle = $('#ht--title')

        if (data === null || data === undefined) {
            console.log("Error processing data");

        } else {
            var entry = data.rss.channel.item[entry_id];

            var wpimg = entry.thumbnail._url;
            if (stringContains(wpimg, '?') === false) {
                urlToImg = wpimg;
            } else {
                urlToImg = removeCharacters(wpimg);
            }

           

            var date = "Posted on " + toSimpleDate(entry.pubDate);
            htPostDate.text(date);
            htPostUrl.attr('href', entry.link);

            htPostTitle.text(entry.title);

            htImg.css('background-image', 'url(' + urlToImg + '?h=950)');
        }


    }

   

    

    function getTimeOfDay(geo) {

        var postfix = false;


        var currentDate = new Date();



        //timeInfo.currentTimeEpoch = epochTime(currentDate.getTime());
        var times = SunCalc2.getDayInfo(currentDate, geo.lat, geo.lon, true);


        timeInfo.morningStart = times.morningTwilight.astronomical.start.getHours();

        timeInfo.morningStartEpoch = epochTime(times.morningTwilight.astronomical.start.getTime())
        timeInfo.morningEnd = times.morningTwilight.astronomical.end.getHours();
        timeInfo.morningEndEpoch = epochTime(times.morningTwilight.astronomical.end.getTime());
        timeInfo.noonEpoch = epochTime(times.transit.getTime());
        timeInfo.noon = times.transit.getHours();
        timeInfo.sunsetEpoch = epochTime(times.sunset.end.getTime());
        timeInfo.sunset = times.sunset.end.getHours();
        timeInfo.duskEpoch = epochTime(times.dusk.getTime());
        timeInfo.dusk = times.dusk.getHours();
        timeInfo.midnightEpoch = epochTime(times.nightTwilight.astronomical.end.getTime()) + 6100;
        timeInfo.midnight = times.nightTwilight.astronomical.end.getHours() + 2;


//        setRadioValues();
       // console.log(timeInfo);
       timeInfo.midnightHour = 0;
        if (timeInfo.debug) {


            $('.radio').change(function() {



                var val = $('.radio:checked').val();
                console.log(val);
                timeInfo.currentTimeEpoch = parseInt(val);

                displayEpoch(timeInfo)



            });

        } else {
            timeInfo.currentTimeEpoch = epochTime(currentDate.getTime());
            displayEpoch(timeInfo);
        }

    }

    // function setRadioValues() {
    //     document.getElementById('earlyMorning').value = timeInfo.midnightEpoch;
    //     document.getElementById('morning').value = timeInfo.morningStartEpoch;
    //     document.getElementById('noon').value = timeInfo.noonEpoch;
    //     document.getElementById('night').value = timeInfo.midnightEpoch;
    // }

    /**
     * Display the correct images based on time of day using the getHours of each Time property.
     * @param  Object timeInfo  Javascript Object containing time information of the current day based on location of user.
     * @return none.
     */
     function display(timeInfo) {


      
        var body = $('#test_body');
        var cloudDiv = $('#cloudDiv_test');


      
        if ( timeInfo.midnightHour <= timeInfo.currentTime && timeInfo.currentTime <= timeInfo.morningStart) {
            body.css('background-image', 'url(bg10-night.png)');
            
            
            cloudDiv.removeClass('clouds-day');
            cloudDiv.addClass('clouds-night');
            isDay = false;

        }

        if (timeInfo.currentTime > timeInfo.morningStart && timeInfo.currentTime <= timeInfo.noon ) {
            body.css('background-image', 'url(bg10.png)');
            cloudDiv.removeClass('clouds-night');
            cloudDiv.addClass('clouds-day');
            isDay = true;
            

        }
        

        if ( timeInfo.dusk <= timeInfo.currentTime && timeInfo.currentTime <= timeInfo.midnight) {
            body.css('background-image', 'url(bg10-night.png)');
            cloudDiv.removeClass('clouds-day');
            cloudDiv.addClass('clouds-night');
            isDay = false;



        }
    }

     /**
     * Display the correct css and images based on time of day. This function is based on Epoch values of the current time.
     * @param  Object timeInfo  Javascript Object containing time information of the current day based on location of user.
     * @return none
     */
    function displayEpoch(timeInfo) {

      
        var body = $('#test_body');
        var cloudDiv = $('#cloudDiv_test');

        //console.log(timeInfo.currentTime);


        if (timeInfo.midnightEpoch > timeInfo.currentTimeEpoch && timeInfo.currentTimeEpoch < timeInfo.morningEndEpoch) {
            body.css('background-image', 'url(../bg10-night.png)');

            cloudDiv.removeClass('clouds-day');
            cloudDiv.addClass('clouds-night');
            isDay = false;
            console.log('its early morning');
            console.log('Current Epoch time is: ', timeInfo.currentTimeEpoch);
        }

        if (timeInfo.currentTimeEpoch > timeInfo.morningEndEpoch && timeInfo.currentTimeEpoch <= timeInfo.noonEpoch) {
            body.css('background-image', 'url(../bg10.png)');
            cloudDiv.removeClass('clouds-night');
            cloudDiv.addClass('clouds-day');
            isDay = true;
            console.log('its day time');
            console.log('Current Epoch time is: ', timeInfo.currentTimeEpoch);
        }

        if (timeInfo.currentTimeEpoch >= timeInfo.sunsetEpoch || timeInfo.currentTimeEpoch >= timeInfo.midnightEpoch) {
            body.css('background-image', 'url(../bg10-night.png)');
            cloudDiv.removeClass('clouds-day');
            cloudDiv.addClass('clouds-night');
            isDay = false;

            console.log('its night time');
            console.log('Current Epoch time is: ', timeInfo.currentTimeEpoch);
        }
    }

    function getWeather(geo) {
        //console.log(geo.lat + " " + geo.lon);
        var apiKey = '2a3f331056f37d87';

        var urlToWU =
            "http://api.wunderground.com/api/" + apiKey + "/conditions/forecast/q/" + geo.lat + "," + geo.lon + ".json";

        var currWeatherImg = document.getElementById("currWeatherImg");
        var currWeatherLoc = document.getElementById("currWeatherLoc");
        var currTemp = document.getElementById("currTemp");
        var currDesc = document.getElementById("currDesc");
        var currWeatherImg = document.getElementById("currWeatherImg");
        $.ajax({
            url: urlToWU,
            dataType: "jsonp",
            success: function(parsed_json) {


                var temp_c = parsed_json.current_observation.temp_c;
                var temp_f = parsed_json.current_observation.temp_f;
                temp_c = parseInt(temp_c);
                temp_f = parseInt(temp_f);  
                var iconset = 'k';
                var countryCode = parsed_json.current_observation.display_location.country;
                countryCode = countryCode.toUpperCase();
                //var icon = "nt_clear";
                var icon = parsed_json.current_observation.icon;
                var currCity = parsed_json.current_observation.display_location.full;
                var feelslike = parsed_json.current_observation.feelslike_string;
                var desc = parsed_json.current_observation.weather;

                var icon_url = "http://icons.wxug.com/i/c/" + iconset + "/" + icon + ".gif";
                var icon_url2 = "icons/" +icon+".png";
                if (countryCode === 'US') {
                    currTemp.innerHTML = temp_f + "  &deg;F";
                } else {
                    currTemp.innerHTML = temp_c + "  &deg;C";
                }
                currWeatherImg.src = icon_url2;
                //currWeatherImg.src = icon_url ;
                //currDesc.innerHTML = desc;
                checkWeatherConditions(desc);


                //currWeatherLoc.innerHTML = currCity;

            }
        });

    }



    function checkWeatherConditions(condition) {
        var cloudDiv = $('#cloudDiv_test');

        if (isDay) {
            if (condition === "Clear") {
                cloudDiv.removeClass('clouds-day');
                cloudDiv.removeClass('clouds');
            } else {
                cloudDiv.addClass('clouds-day');
                cloudDiv.addClass('clouds');
            }
        } else {
            if (condition === "Clear") {
                cloudDiv.removeClass('clouds-night');
                cloudDiv.removeClass('clouds');
            } else {
                cloudDiv.addClass('clouds-night');
                cloudDiv.addClass('clouds');
            }
        }

    }



    /*Utilty functions*/
    function epochTime(time) {
        return Math.floor(time / 1000);
    }

    function fromEpochToDate(epoch){
        return moment.unix(epoch)._d;
    }

    function formatTime(date, postfix) {
        if (isNaN(date)) {
            return '&nbsp;&nbsp;n/a&nbsp;&nbsp;';
        }

        var hours = date.getHours(),
            minutes = date.getMinutes(),
            ap;

        if (postfix) {
            ap = (hours < 12 ? 'am' : 'pm');
            if (hours === 0) {
                hours = 12;
            }
            if (hours > 12) {
                hours -= 12;
            }
        } else {
            hours = (hours < 10 ? '0' + hours : '' + hours);
        }

        minutes = (minutes < 10 ? '0' + minutes : '' + minutes);

        return hours + ':' + minutes + (postfix ? ' ' + ap : '');
    }

     function toSimpleDate(date) {
        return moment(new Date(date)).format("MMMM Do. YYYY");
    }

    function removeCharacters(string) {
        return string.substring(0, string.indexOf('?'));
    }

    function stringContains(str, ch) {
        //if string doesnt have the char, it returns -1
        if (str.lastIndexOf(ch) == -1) {
            return false;
        } else {
            //string contains the character
            return true;
        }
    }

})();
