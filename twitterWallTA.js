jQuery.noConflict();

//console.log(getCodeFromText("latvian"));

window.onload = function onLoadExec(){

    setActions();
    
    localStorageGetData(); // -> populateSettings(...) -> getNewTweets()
    
    getCurrentLocation();
    
    //parseTweets();
    
    //defaultSearch();
    
    //getCoordinates();

}

/* Set actions and default values */
function setActions(){
    var tweetCallback = "parseTweets";
    var tweetCountReq = 20; // max 100
    //var url = "https://api.twitter.com/1.1/search/tweets.json"; // {"errors":[{"code":32,"message":"Could not authenticate you."}]}
    //var url = "https://demo.suitepad.systems/1.1/search/tweets.json"; // This site can’t be reached ERR_CONNECTION_REFUSED; demo.suitepad.systems refused to connect.
    var url = "http://demo.suitepad.systems/1.1/search/tweets.json"; // gets JSON file!!!


    // get the coordinates from place name, when it is entered:
    jQuery("#placeInput").change(getCoordinates);
    jQuery("#radiusInput").change(updateRadius);
    jQuery("#inputForm").submit(function(){ return inputFormSubmit()});
    jQuery("#inputForm").attr("action", url);
    jQuery("#tweetCount").val(tweetCountReq);
    jQuery("#tweetCallback").val(tweetCallback);
    
    jQuery("#clearMenu").click(function(){ localStorage.clear();});
    
    // init all popovers:
    //makeWarnPopover();  // not active...
    //jQuerry("#seachInput").data("bs.popover");
    jQuery('[data-toggle="popover"]').popover();
}

function toggleSetName(elem){
    if(elem.innerHTML === "Show settings"){
        elem.innerHTML = "Hide settings";
    }
    else{
        elem.innerHTML = "Show settings";
    }
    
}
/* --- localStorage --- */
var timeKeysName = "timeID";
// Object {searchInput: "<text>", placeInput: "<place>", radiusInput: "<r>", geocodeInput: "<lat>,<long>,<r>", languageInput: "<lang>", ...}
/* */
function localStorageGetData(){
        //var myKeys = localStorage.getItem(dataKeysName);
        var timeKeys = localStorage.getItem(timeKeysName);
        
        //console.log(timeKeysName+": "+timeKeys);
        if (timeKeys){
            timeKeys = JSON.parse(timeKeys);
            for (var i in timeKeys){
                var timeID = timeKeys[i];
                var dataset = localStorage.getItem(timeID);
                //console.log("timeID: "+timeID+" data: "+dataset);
                var dataObj = JSON.parse(dataset);
                //console.log(dataKeysName+": "+ (typeof dataKeys)+" "+dataKeys);
                for (var key in dataObj) {
                    //read the stored values:
                    var value = dataObj[key];
                    // update the DOM element values:
                    jQuery("#"+key).val(value)
                    //console.log("Got: "+key+": "+ value );
                }
                jQuery("#timeInput").val(timeID);
                
                // Display current settings in the Menu:
                populateSettings(timeID, dataObj);
                //get the search results width current settings:
                getNewTweets();
            }
        }

}

function localStorageSaveData(){
    var dataKeys = ["searchInput", "placeInput", "radiusInput", "geocodeInput", "languageInput", "placeCurr", "geocodeCurr"];
    var timeKeys = JSON.parse(localStorage.getItem(timeKeysName));
    var timeID = jQuery("#timeInput").val(); // get current dataset timeID
    if (!timeKeys){
        timeKeys = [];
    }
    if ((timeKeys.indexOf(timeID) === -1) ){
        timeKeys.push(timeID);
    }
    localStorage.setItem(timeKeysName, JSON.stringify(timeKeys)); // 
    var dataObj = {};
    for (var id in dataKeys){
        var key = dataKeys[id];
        var value = jQuery("#"+key).val();
        dataObj[key] = value;
        //localStorage.setItem(key, value);
        //console.log(key+": "+ value );
    }
    
    localStorage.setItem(timeID, JSON.stringify(dataObj));
    
    // Display current settings in the Menu:
    populateSettings(timeID, dataObj);
    /*

    */
}


function populateSettings(timeID, dataObj){
    var settingDiv = document.getElementById("settingsCollapseDiv");
    var docFrag = document.createDocumentFragment();
    var parentDiv = document.createElement("div");
    jQuery(parentDiv).attr({"class": "panel-body form-inline settingSetDiv settingSetDiv"+timeID});
    //parentDiv.className = "panel-body form-inline settingSetDiv"+timeID;
    var labeled = ["Search", "Place", "Radius", "Language"];
    var hidden = ["timeInput", "geocodeInput", "geocodeCurr", "placeCurr"];
    
    for (var i in labeled){
        var Name = labeled[i];
        var name = Name.toLowerCase();
        var label = document.createElement("label");
        jQuery(label).attr({"class": "setLabel", 
        "for": name+"InputSet"+timeID}).text(Name+":");
        parentDiv.appendChild(label);
        var input = document.createElement("input");
        jQuery(input).attr({"type": "text", "class": "form-control setInput", "id": name+"InputSet"+timeID, "value": dataObj[name+"Input"], "disabled": true});
        parentDiv.appendChild(input);
    }
    for (var i in hidden){
        var input = document.createElement("input");
        jQuery(input).attr({ "type": "text", "class": "hidden", "id": name+"Set"+timeID, "value": dataObj[name] });
        parentDiv.appendChild(input);
    }
    
    var button = document.createElement("button");
        jQuery(button).attr({ "class": "btn btn-default btnMargin", "id":"removeSet"+timeID, "onclick":"removeThisSet(this)" }).html("Remove this set <span class='glyphicon glyphicon-remove' aria-hidden='true'></span>");
        parentDiv.appendChild(button);
    
    docFrag.appendChild(parentDiv);
    
    settingDiv.appendChild(docFrag);
    
}

function removeThisSet(elem){
    var id = elem.getAttribute("id");
    var time = id.split("removeSet")[1];
    var timeKeys = JSON.parse(localStorage.getItem(timeKeysName));
    var idx = timeKeys.indexOf(time);
    if ( (idx > -1) && (time != null) ){
        timeKeys.splice(idx,1);
        //console.log("new timeKeys:"+timeKeys);
        localStorage.setItem(timeKeysName, JSON.stringify(timeKeys)); // remove the key
        localStorage.removeItem(time);  // remove the data
    }
    // remove the setting entry displayed:
    var parent = elem.parentNode;
    parent.parentNode.removeChild(parent);
    
    // additionaly remove also tweet results displayed:
    jQuery(".timeID"+time).remove();
}

function inputFormSubmit(){
    var fName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
    console.log(fName+": "+jQuery("#inputForm").serialize());
    if (jQuery("#searchInput").val() !== ""){ // search field is required!
        jQuery("#searchInput").removeClass("has-error");
        var seconds = Math.round(new Date().getTime() / 1000);
        jQuery("#timeInput").val(""+seconds);
        localStorageSaveData(); //  -> populateSettings(..)
        getNewTweets(); // insted submitting issue axaj request... 
    }
    else{
        // don't submit - invalid input!
        jQuery("#searchInput").addClass("has-error");
    }
    return false; // if request is posted as FORM, then response is offered as file download not JSON data for parsing... cancel submit!
}


function updateRadius(){
    var radius = jQuery("#radiusInput").val();
    if (radius == "") {
        radius="1km";
    } // set default radius for valid geocode
    updateGeocodeRadius(radius, "geocodeCurr");
    updateGeocodeRadius(radius, "geocodeInput");
}

function updateGeocodeRadius(radius, geocodeId){
    var geocode = jQuery("#"+geocodeId).val();
    
    var geoArr = geocode.split(',');
    if(geoArr[0].length > 0){
        geoArr[2] = radius;
        geocode = geoArr.join(",");
        jQuery("#"+geocodeId).val(geocode);


        //console.log("updated "+ geocodeId+ ": "+ geocode);
    }
    if (jQuery("#geocodeInput").val()){
        jQuery("#radiusInput").val(radius);     // adding radius to input field
    }
}

/* Set current location got from IP address for form input */
function setCurrentLocation(){
    
    var geocode = jQuery("#geocodeCurr").val();
    var location = jQuery("#placeCurr").val();
    jQuery("#geocodeInput").val(geocode);
    jQuery("#placeInput").val(location);
    
    updateRadius(); // correct the radius
    }

/* set some default settings before anything is saved...
 * Geolocalization: The search operator “near” isn’t available in API, but there is a more precise way to restrict your query by a given location using the geocode parameter specified with the template “latitude,longitude,radius”, for example, “37.781157,-122.398720,1mi” "near:X within:Ykm" pair
 * https://twitter.com/search?q=Jumis%20near%3ARiga%20within%3A10km&src=typd
 
*/
function defaultSearch(){
    var text = "@twitterapi";
    var location = "Zurich";
    var latitude = "47.377938";
    var longitude = "8.5379958";
    var radius = "10km";
    var language = "en";
    
    jQuery("#searchInput").val(text);
    jQuery("#placeInput").val(location);
    jQuery("#geocodeInput").val(latitude+","+longitude+","+radius);

    jQuery("#radiusInput").val(radius);
    jQuery("#languageInput").val(language);
    

}

function validLanguage(elem){
    var input = elem.value;
    if (validateChoice(input)){
        //console.log("language: " + input + " Valid!");
        jQuery("#languageInputDiv").removeClass("has-error");
        jQuery("#languageFeedback").removeClass("glyphicon-remove");
        jQuery("#languageInputDiv").addClass("has-success");
        jQuery("#languageFeedback").addClass("glyphicon-ok");
    }
    else{
        jQuery("#languageInputDiv").removeClass("has-success");
        jQuery("#languageFeedback").removeClass("glyphicon-ok");
        if(input !== ""){
            console.log("language: " + input + " Invalid!!");
            jQuery("#languageInputDiv").addClass("has-error");
            jQuery("#languageFeedback").addClass("glyphicon-remove");
        }
    }
}


function updatePopover(){
    // update popover content:
    // $(".notes").data("bs.popover").options.content="Content1"; // faster because doesn't update the DOM
    // vs 
    // $(".notes").attr("data-content","Content1");
    var city = jQuery("#placeCurr").val();
    var content = "Enter location name<br>or<br>set location to: <a href='\#' id='popoverLink' onclick='setCurrentLocation()'><b> "+ city +"</b></a>";
    jQuery("#locInfoLink").attr({"data-content":content});

    var p = jQuery("#locInfoLink").data("bs.popover").options;
    p.placement = "bottom";
    p.html = true;    
    
}
function makeWarnPopover(){
    jQuery("#searchInput").popover({
        content: '<p class="alert-warning">Search keyword must be provided.</p>',
        placement: "bottom",
        //trigger: "focus",
        //"data-toggle": "popover",
        html:true
    });
}

function formatLinkURLs(text, urls){
    var rez = text;
    if(text && urls){
    
        for (var i = 0; i < urls.length; i++){
            var urlOld = urls[i].url;
            var urlNew = "<a href='https://" + urls[i].display_url + "'>" + urls[i].display_url + "</a>";
            rez = text.replace(urlOld, urlNew);
            //console.log("url: " + rez);
        }
    }
    return rez;
}

/*...*/
function getNewTweets(){
    // https://api.twitter.com/1.1/search/tweets.json?q=%40twitterapi
    // http://demo.suitepad.systems/1.1/search/tweets.json?q=%40twitterapi
    var fName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
    var url = "http://demo.suitepad.systems/1.1/search/tweets.json";
    url += "?" + jQuery("#inputForm").serialize();
    url = encodeURI(url);
    url = url.replace(/%252C/gi, ","); // need to decode "," to work correctly
    console.log(fName+" url : "+url);
    //Cross-Origin Request may get blocked for JSON reqs... use JSONP
    jQuery.ajax({url: url, dataType: "jsonp"});   
}

/*  */
function parseTweets(data){
  try{
    var tweetList = document.getElementById("tweetList");
    var docFrag = document.createDocumentFragment();

    var statuses = data.statuses;
    console.log("Got " + statuses.length + " of " + jQuery("#tweetCount").val() + "tweets!");
    for (var i = 0; i < statuses.length; i++){
        var tweet = statuses[i];
        var id_str = tweet.id_str;
        var text = tweet.text;
        var user = tweet.user;
        var fullName = user.name;
        var userName = user.screen_name;
        var profilePic = user.profile_image_url;
        var media = tweet.entities.media;
        var urls = tweet.entities.urls;
        var timeID = jQuery("#timeInput").val(); // get current dataset timeID, add class for selecting this set!
        
        if (document.getElementById("tweetList" + id_str) === null){
        
            var parent = document.createElement("li");
            var parentDiv = document.createElement("div");
            var blockquote = document.createElement("blockquote");
            var paragraph = document.createElement("p"); 
            // var img = document.createElement("img");
            var footer = document.createElement("footer");
            var cite = document.createElement("cite");
            var span = document.createElement("span");
            
            text = formatLinkURLs(text, urls);
            blockquote.appendChild(paragraph);
            
            jQuery(parent).attr({"class": "tweetList tweetListElem timeID" + timeID, id: "tweetList"+id_str});
            jQuery(parentDiv).attr({"class": "tweetDiv", id: "tweetDiv"+id_str});
            jQuery(blockquote).attr({"class": "tweetQuote", id: "tweetQuote"+id_str});
            jQuery(paragraph).attr({"class": "tweetP", id: "tweetP"+id_str});
            if (media){
                for (var k = 0; k < media.length; k++){
                    var imgLnk = document.createElement("a");
                    var img = document.createElement("img");
                    var img_lnk = media[k].media_url;
                    jQuery(imgLnk).attr({"class": "tweetImgLnk", id: "tweetImgLnk"+id_str, href: img_lnk, target: "_blank"});
                    jQuery(img).attr({"class": "tweetImg", id: "tweetImg"+id_str, src: img_lnk});
                    imgLnk.appendChild(img);
                    blockquote.appendChild(imgLnk);
                    text = text.replace(media[k].url, ""); // remove media url from text field
                }
            }
            jQuery(paragraph).html(text);
            
            jQuery(footer).attr({"class": "tweetFooter", id: "tweetFooter"+id_str});
            jQuery(cite).attr({"class": "tweetCite", id: "tweetCite"+id_str});
            jQuery(span).attr({"class": "tweetSpan", id: "tweetSpan"+id_str})
                .html("<strong>" + fullName + "</strong>" + " <a href='https://www.twitter.com/" + userName+ "'>@" + userName + "</a>");
            
            blockquote.appendChild(footer);
            footer.appendChild(cite);
            cite.appendChild(span);
            
            parentDiv.appendChild(blockquote);
            parent.appendChild(parentDiv);
            docFrag.appendChild(parent);    
        } //if element is not already present on DOM
    } // for i
    
    
    tweetList.insertBefore(docFrag, tweetList.childNodes[0]); // put new results in front!

  } // try
  catch(e){
    var parseTweetsError = e;
    console.log(e);
  }
}

/* Get current location from IP address: */
function getCurrentLocation(){
    var response = "parseLocation";
    //console.log("before: geoCurr:"+jQuery("#geocodeCurr").val());
    if (!jQuery("#geocodeCurr").val()){
        var url = "https://freegeoip.net/json/?callback="+response;
        
        //console.log("url: "+url);
        jQuery.ajax({url: url, dataType: "jsonp"});
        //console.log("request made!");
    }
    else{
        updatePopover();
    }
}

/* this parses the ajax request response: */
var parseLocation = function (jsonp){
        //console.log(jsonp);
        var city = "";
        var latitude = "";
        var longitude = "";
        //var radius = jQuery("#radiusInput").val();
        var geocode = "";
        var html = "";
            var keys = Object.keys(jsonp);
            //"+latitude+","+longitude+","+radius+"
            keys.forEach(function(key){
                if (key == "city"){
                    city = jsonp[key];
                    jQuery("#placeCurr").val(""+jsonp[key]);
                    //console.log("city: "+jsonp[key]);
                }
                else if(key == "latitude"){
                    latitude = jsonp[key];
                    //console.log("lat: "+jsonp[key]);
                }
                else if (key == "longitude"){
                    longitude = jsonp[key];
                    //console.log("long: " + jsonp[key]);
                }
            });
        geocode = ""+latitude+","+longitude+",";
        console.log("geoCurr: "+geocode);
        jQuery("#geocodeCurr").val(geocode);
        updateRadius(); // call this to add radius value to geocode, even if nothing specified
        
        // make popover:
        updatePopover();
    //jQuery("#popoverLink").click(setCurrentLocation);
}

/* Get coordinates from Place name provided in input: this is run in case of change in placeInput input field */
function getCoordinates(){
    var text = encodeURI( jQuery("#placeInput").val() );
    var radius = encodeURI( jQuery("#radiusInput").val() );
    var latitude = "";
    var longitude = "";
    if (text){
        var url = "https://nominatim.openstreetmap.org/search?format=json&q="+text;
        //console.log("url: "+url);
        jQuery.ajax({
            url: url, 
            dataType: "json", 
            success: function(data, status) {
                if( status == "success"){
                //console.log( "stat: " + status + " lat:", data[0].lat + " lon: " + data[0].lon );
                // grab only the first result:
                latitude = data[0].lat;
                longitude = data[0].lon;
                jQuery("#geocodeInput").val(""+latitude+","+longitude+","+radius);
                updateRadius();
                console.log("geoIn:"+jQuery("#geocodeInput").val());
                }
            }});
    }
    else {
        jQuery("#geocodeInput").val(""); // delete geocode information!
    }
    
}


