/////////////////////////////////////////////////////////
//
// Hello.js - Version 0.1
// The MIT License (MIT)
// http://hello-js.org  //  (C) 2016 Earth
//
// Permission is hereby granted, free of charge, to any
// person obtaining a copy of this software and
// associated documentation files (the "Software"), to
// deal in the Software without restriction, including
// without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom
// the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice
// shall be included in all copies or substantial
// portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
// ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
// LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
// EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
// AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
//
//

(function() {


    var urlToImg = "";
    var urlToArticle = "";
    var htImg = $('.wiki');
    var htPostUrl = $('#ht--posturl');
    var htPostDate = $('#ht--postdate');
    var htPostTitle = $('#ht--title')
    var x2js = new X2JS();

    var timeInfo = {};
    var isDay = true;


    $(function() {


        console.log('%c  <hello  ', 'background: #de396e; color: #fff');
        console.log("Hello.js v0.1 starting...");

        geoip2.insights(onSuccess, onError);

        // calls the json to refresh the page data. Every 5 seconds
        //setInterval(getLocation,5000);


        loadBlog("hello.php");
        loadReddit();

    });


    /**
     * This function retrieves the Wiki headertag blog and passes the data to the displayBlog function.
     * @param  String url    URL to the Json file
     * @return none
     */
    function loadBlog(url) {
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {

                var jsonObj = x2js.xml_str2json(data.htblog);
                displayBlog(jsonObj);



            }

        });
    }
    /**
     * This loads the headertag subreddit's json file
     * @author mortl
     * @date   2016-08-23
     * @return none
     */
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
   

    /**
     * Display's the blog on the page.
     * @param  Object   data Json data that is loaded in from loadBlog function, which is parsed and displays correctly in this function.
     * @return none
     */
    function displayBlog(data) {
        var entry_id = 0;

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

            urlToArticle = entry.link;

            var date = "Posted on " + toSimpleDate(entry.pubDate);
            htPostDate.text(date);
            htPostUrl.attr('href', entry.link);

            htPostTitle.text(entry.title);

            htImg.css('background-image', 'url(' + urlToImg + '?h=950)');
        }


    }
     /**
      * This function process the data from Reddit and displays it on the html page
      * @author mortl
      * @date   2016-08-23
      * @param   Object   data  Json object passed from loadReddit's ajax success call.
      * @return none
      */
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

           
            var post = postArray[newestPost].data;

            var date = "Posted on " + toSimpleDate(fromEpochToDate(post.created_utc)); 

            var urlToComments = "https://redd.it/" + post.id;
            rdtPostDate.text(date);

            rdtPostTitle.text(post.title);  

            rdtPostUrl.attr('href', urlToComments);

            var firstImg = 0;
            //uploaded with Preview
            if(post.hasOwnProperty('preview'))
            {
               
                var imageArray = post.preview.images;
                rdtUrlToImg = imageArray[firstImg].source.url;
                rdtImg.css('background-image', 'url(' + rdtUrlToImg + ')')
                rdtImg.addClass('cover');

            } else { 
                rdtImg.css('background-image', 'url(../rdt-headertag.png)');
                rdtImg.removeClass('cover');
            }    
          }
    }

    /**
     * Format Date based on MomentJS's method.
     * @param  Date    date   Javascript Date passed in to format.
     * @return String
     */
    function toSimpleDate(date) {
        return moment(new Date(date)).format("MMMM Do. YYYY");
    }

    /**
     * Parses string and strips any characters after the "?" symbol.
     * @param  String string    String to be parsed
     * @return String           Return parsed string.
     */
    function removeCharacters(string) {
        return string.substring(0, string.indexOf('?'));
    }

    /**
     * Check if a string contains a specific character.
     * @param  String  str    String to check 
     * @param  String  ch    Character to look for.
     * @return Boolean       If the string contains the character, function returns true. If the string doesn't contain the character, it returns false.
     */
    function stringContains(str, ch) {
        //if string doesnt have the char, it returns -1
        if (str.lastIndexOf(ch) == -1) {
            return false;
        } else {
            //string contains the character
            return true;
        }
    }


    /**
     * GeoIP OnSuccess method, parses the Data from GeoIP and passes it to the Geo Object.
     * @param  Object data   Json data that is passed from GeoIP to retrieve the users current location.
     * @return none
     */
    var onSuccess = function(data) {

            var Geo = {};
            Geo.lat = data.location.latitude;
            Geo.lon = data.location.longitude;
            getWeather(Geo);

            getTimeOfDay(Geo);


        }
        /**
         * onError function for GeoIP. 
         * @param  Object error   Json object for the error.
         * @return none.
         */
    var onError = function(error) {
        console.log(error.description);
    }

    /**
     * Determines the time of day by using Suncalc Library based on the users location in the world.
     * @param  Object geo  This object contains the geolocation information for the user.
     * @return none
     */
    function getTimeOfDay(geo) {

        var postfix = false;


        var currentDate = new Date();



        var times = SunCalc2.getDayInfo(currentDate, geo.lat, geo.lon, true);
        //console.log(times);
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
        timeInfo.midnightEpoch = epochTime(times.nightTwilight.astronomical.end.getTime());
        timeInfo.midnightHour = 0;
        timeInfo.currentTimeEpoch = epochTime(currentDate.getTime());
        timeInfo.currentTime = currentDate.getHours();


        displayEpoch(timeInfo);
       

    }


    /**
     * Display the correct images based on time of day using the getHours of each Time property.
     * @param  Object timeInfo  Javascript Object containing time information of the current day based on location of user.
     * @return none.
     */
    function display(timeInfo) {


        var body = $('#body');
        var cloudDiv = $('#cloudDiv');



        if (timeInfo.midnightHour <= timeInfo.currentTime && timeInfo.currentTime <= timeInfo.morningStart) {
            body.css('background-image', 'url(bg10-night.png)');


            cloudDiv.removeClass('clouds-day');
            cloudDiv.addClass('clouds-night');
            isDay = false;

        }

        if (timeInfo.currentTime > timeInfo.morningStart && timeInfo.currentTime <= timeInfo.noon) {
            body.css('background-image', 'url(bg10.png)');
            cloudDiv.removeClass('clouds-night');
            cloudDiv.addClass('clouds-day');
            isDay = true;


        }


        if (timeInfo.dusk <= timeInfo.currentTime && timeInfo.currentTime <= timeInfo.midnight) {
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


        var body = $('#body');
        var cloudDiv = $('#cloudDiv');

        

        if (timeInfo.midnightEpoch > timeInfo.currentTimeEpoch && timeInfo.currentTimeEpoch < timeInfo.morningEndEpoch) {
            body.css('background-image', 'url(bg10-night.png)');
            
            cloudDiv.removeClass('clouds-day');
            cloudDiv.addClass('clouds-night');
            isDay = false;

        }





        if (timeInfo.currentTimeEpoch > timeInfo.morningEndEpoch && timeInfo.currentTimeEpoch <= timeInfo.noonEpoch) {
            body.css('background-image', 'url(bg10.png)');
            cloudDiv.removeClass('clouds-night');
            cloudDiv.addClass('clouds-day');
            isDay = true;

            
        }


        if (timeInfo.currentTimeEpoch >= timeInfo.sunsetEpoch || timeInfo.currentTimeEpoch >= timeInfo.midnightEpoch) {
            body.css('background-image', 'url(bg10-night.png)');
            cloudDiv.removeClass('clouds-day');
            cloudDiv.addClass('clouds-night');
            isDay = false;

            


        }
    }



    /**
     * This function retrieves the current weather and displays it in the weather module.
     * @param  Object   geo  This object contains the user's geolocation information.
     * @return none   
     */
    function getWeather(geo) {

        var apiKey = '2a3f331056f37d87';

        var urlToWU =
            "http://api.wunderground.com/api/" + apiKey + "/conditions/forecast/q/" + geo.lat + "," + geo.lon + ".json";

        var currWeatherImg = document.getElementById("currWeatherImg");
        var currWeatherLoc = document.getElementById("currWeatherLoc");
        var currTemp = document.getElementById("currTemp");
        var currDesc = document.getElementById("currDesc");

        $.ajax({
            url: urlToWU,
            dataType: "jsonp",
            success: function(parsed_json) {

                var temp_c = parsed_json.current_observation.temp_c;
                var temp_f = parsed_json.current_observation.temp_f;
                temp_c = parseInt(temp_c);
                temp_f = parseInt(temp_f);    
                var iconset = 'c';
                var countryCode = parsed_json.current_observation.display_location.country;
                countryCode = countryCode.toUpperCase();
                var icon = parsed_json.current_observation.icon;

               
                var condition = parsed_json.current_observation.weather;
               
                var icon_url = "wu-icons/" +icon+".png";
                if (countryCode === 'US') {
                    currTemp.innerHTML = temp_f + "  &deg;F";
                } else {
                    currTemp.innerHTML = temp_c + "  &deg;C";
                }
                currWeatherImg.src = icon_url;
               
                checkWeatherConditions(condition);


              

            }
        });

    }


    /**
     * This function checks if the weather is clear, then hides the clouds if it is. It also sets the clouds when its night time.
     * @param  String   condition  The current weather condition passed through Weather Underground API.
     * @return  none          
     */
    function checkWeatherConditions(condition) {
        var cloudDiv = $('#cloudDiv');

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



    /**
     * Convert to Epoch Time.
     * @param Number time  Date's getTime returns the time in Milliseconds.
     * @return Number      Return's the time formated in Unix EPOCH.
     */
    function epochTime(time) {
        return Math.floor(time / 1000);
    }

    /**
     * Converts Epoch to Date using moment's unix function.
     * @author mortl
     * @date   2016-08-23
     * @param  Number   epoch    Epoch to convert.
     * @return String            Returns the Date of the Epoch.
     */
    function fromEpochToDate(epoch){
        return moment.unix(epoch)._d;
    }
    /**
     * Format the time to display am/pm.
     * @param  Date  date     Javascript Date object passed to get the time of the current day.
     * @param  Boolean postfix  Boolean value to determine if postfix is selected.
     * @return  String  Returns the formatted string of the current Time. If Date is NaN, returns a N/A string.
     */
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



})();
