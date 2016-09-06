jQuery.noConflict();


//console.log(getAllNames());
//console.log(getName("Eu"));
//console.log(getCodeFromText("LV"));
//console.log(getCodeFromText("Lv"));
//console.log(getCodeFromText("latvian"));

window.onload = function onLoadExec(){
    getCurrentLocation();
    
    //defaultSearch();
    
    setActions();
    
    //getCoordinates();
    localStorageGetData();
}

/* hide popover when clicked on document and it is visible */
jQuery(document).click(function(){ 
    
    if(jQuery('#popoverLink').is(':visible')) {
        popoverHide();
    }
    
});

function setActions(){
    // get the coordinates from place name, when it is entered:
    jQuery("#placeInput").change(getCoordinates);
    jQuery("#radiusInput").change(updateRadius);
    jQuery("#inputForm").submit(function(){ return inputFormSubmit()});
    
    jQuery("#clearMenu").click(function(){ localStorage.clear();});
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
//var dataKeysName = "myKeys";
var timeKeysName = "timeID";
function localStorageGetData(){
        //var myKeys = localStorage.getItem(dataKeysName);
        var timeKeys = localStorage.getItem(timeKeysName);
        
        //console.log(dataKeysName+": "+myKeys);
        console.log(timeKeysName+": "+timeKeys);
        if (timeKeys){
            timeKeys = JSON.parse(timeKeys);
            for (var i in timeKeys){
                var timeID = timeKeys[i];
                var dataset = localStorage.getItem(timeID);
                console.log("timeID: "+timeID+" data: "+dataset);
                var dataObj = JSON.parse(dataset);
                //console.log(dataKeysName+": "+ (typeof dataKeys)+" "+dataKeys);
                for (var key in dataObj) {
                    //read the stored values:
                    var value = dataObj[key];
                    // update the DOM element values:
                    jQuery("#"+key).val(value)
                    //console.log("Got: "+key+": "+ value );
                }
                populateSettings(timeID, dataObj);
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
    //localStorage.setItem(dataKeysName, JSON.stringify(dataKeys)); // store these with know name stored in global var dataKeysName
    var dataObj = {};
    for (var id in dataKeys){
        var key = dataKeys[id];
        var value = jQuery("#"+key).val();
        dataObj[key] = value;
        //localStorage.setItem(key, value);
        console.log(key+": "+ value );
    }
    
    localStorage.setItem(timeID, JSON.stringify(dataObj));
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
        console.log("new timeKeys:"+timeKeys);
        localStorage.setItem(timeKeysName, JSON.stringify(timeKeys)); // remove the key
        localStorage.removeItem(time);  // remove the data
    }
    // remove the setting entry displayed:
    var parent = elem.parentNode;
    parent.parentNode.removeChild(parent);
}

function inputFormSubmit(){
    var fName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
    console.log(fName+": "+jQuery("#inputForm").serialize());
    var seconds = Math.round(new Date().getTime() / 1000);
    jQuery("#timeInput").val(""+seconds);
    localStorageSaveData();
    return true;
}

// hide the popover:
function popoverHide(){
    jQuery('#locInfoLink').popover("hide");
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
    //var radius = jQuery("#radiusInput").val();
    var geocode = jQuery("#"+geocodeId).val();
    
    var geoArr = geocode.split(',');
    if(geoArr[0].length > 0){
        geoArr[2] = radius;
        geocode = geoArr.join(",");
        jQuery("#"+geocodeId).val(geocode);


        console.log("updated "+ geocodeId+ ": "+ geocode);
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
    
    //jQuery("#latInput").val(jQuery("#latCurr").val());
    //jQuery("#longInput").val(jQuery("#longCurr").val());
    //jQuery("#radiusInput").val(radius);
}

/* set some default settings before anything is saved...*/
function defaultSearch(){
    var response = "parseQuote";
    var text = "@twitterapi";
    var location = "Zurich";
    var latitude = "47.377938";
    var longitude = "8.5379958";
    var radius = "10km";
    var language = "en";
    
    //document.getElementById("searchInput").value = text;
    jQuery("#searchInput").val(text);
    jQuery("#placeInput").val(location);
    jQuery("#geocodeInput").val(latitude+","+longitude+","+radius);
    //jQuery("#logInput").val(longitude);
    jQuery("#radiusInput").val(radius);
    jQuery("#languageInput").val(language);
    

}

function validLanguage(elem){
    var input = elem.value;
    if (validateChoice(input)){
        console.log("language: " + input + " Valid!");
        jQuery("#languageInputDiv").removeClass("has-error");
        jQuery("#languageFeedback").removeClass("glyphicon-remove");
        jQuery("#languageInputDiv").addClass("has-success");
        jQuery("#languageFeedback").addClass("glyphicon-ok");
    }
    else{
        console.log("language: " + input + " Invalid!!");
        jQuery("#languageInputDiv").removeClass("has-success");
        jQuery("#languageFeedback").removeClass("glyphicon-ok");
        if(input !== ""){
            jQuery("#languageInputDiv").addClass("has-error");
            jQuery("#languageFeedback").addClass("glyphicon-remove");
        }
    }
}


function getNewQuote(){
    var rand = Math.floor(Math.random()*65536);
    var response = "parseQuote";
    var text = "@twitterapi"
    var latitude = "47.377938";
    var longitude = "8.5379958";
    var radius = "10km";
    var language = "en";
    var url = "https://api.twitter.com/1.1/search/tweets.json?q="+text+"&geocode="+latitude+","+longitude+","+radius+"&lang="+language+"callback="+response;
    // https://api.twitter.com/1.1/search/tweets.json?q=%40twitterapi
    // https://demo.suitepad.systems/1.1/search/tweets.json?q=%40twitterapi
    //Cross-Origin Request Blocked for JSON reqs
    //var url = "http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1";
     // http://labs.bible.org/api/?passage=random
    console.log("rand: "+rand);
    console.log("url: "+url);
    jQuery.ajax({url: url, dataType: "jsonp"});
    /*
    jQuery.getJSON(url, function(jsonp){
        jQuery("#jsonResponse").html(JSON.stringify(jsonp, null, 2));
        var html = "";
        jsonp.forEach(function(val){
            var keys = Object.keys(val);
            keys.forEach(function(key){
                html += "key: "+ key + "val: "+ val[key];
            });
            
        });
    });
    setShareLink();
    */
    
}

/* Get current location from IP address: */
function getCurrentLocation(){
    var response = "parseLocation";
    console.log("geoCurr:"+jQuery("#geocodeCurr").val());
    if (!jQuery("#geocodeCurr").val()){
        var url = "https://freegeoip.net/json/?callback="+response;
        
        console.log("url: "+url);
        jQuery.ajax({url: url, dataType: "jsonp"});
        console.log("request made!");
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
                    console.log("city: "+jsonp[key]);
                }
                else if(key == "latitude"){
                    latitude = jsonp[key];
                    console.log("lat: "+jsonp[key]);
                }
                else if (key == "longitude"){
                    longitude = jsonp[key];
                    console.log("long: " + jsonp[key]);
                }
            });
        geocode = ""+latitude+","+longitude+",";
        console.log("geoCurr: "+geocode);
        jQuery("#geocodeCurr").val(geocode);
        updateRadius(); // call this to add radius value to geocode, even if nothing specified
        
        // make popover:
        jQuery("#locInfoLink").popover({
        content: "Enter location name<br>or<br>set location to: <a href='\#' id='popoverLink' onclick='setCurrentLocation()'><b> "+ city +"</b></a>",
        placement: "bottom",
        triger: "focus",
        delay: 100,
        html:true
    });
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
        // https://api.twitter.com/1.1/search/tweets.json?q=%40twitterapi
        // https://demo.suitepad.systems/1.1/search/tweets.json?q=%40twitterapi

        console.log("url: "+url);
        jQuery.ajax({
            url: url, 
            dataType: "json", 
            success: function(data, status) {
                if( status == "success"){
                console.log( "stat: " + status + " lat:", data[0].lat + " lon: " + data[0].lon );
                // grab only the first result:
                latitude = data[0].lat;
                longitude = data[0].lon;
                //jQuery("#latInput").val(data[0].lat);
                //jQuery("#longInput").val(data[0].lon);
                jQuery("#geocodeInput").val(""+latitude+","+longitude+","+radius);
                updateRadius();
                console.log("geoIn:"+jQuery("#geocodeInput").val());
                }
            }});
    }
    else {
        jQuery("#geocodeInput").val(""); // delete geocode information!
    }

    /*
    jQuery.getJSON(url, function(jsonp){
        jQuery("#jsonResponse").html(JSON.stringify(jsonp, null, 2));
        var html = "";
        jsonp.forEach(function(val){
            var keys = Object.keys(val);
            keys.forEach(function(key){
                html += "key: "+ key + "val: "+ val[key];
            });
            
        });
    });
    setShareLink();
    */
    
}
