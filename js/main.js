var appClass = function(){

	var MAXIMUM_PLAYERS_NUMBER = 3000;


	var init = function(){
		document.addEventListener("DOMContentLoaded", onPageLoaded, false);
	}

	var onPageLoaded = function(){
		console.log("Page is loaded");
		var downloadBtn = document.querySelector("#download-results");
		downloadBtn.addEventListener("click", handleDownloadResults , false);
	}

	var handleDownloadResults = function(ev){
		ev.preventDefault();
		var scrollsGuide = new scrollsGuidClass("http://a.scrollsguide.com/", saveResults);
		scrollsGuide.getAllResults();

	}

	var saveResults = function(results){
		console.log("inside final results callback");
		var finalResults = [];

		/*merge all results into one array.*/
		for(var i=0; i< results.length; i++){
			finalResults = finalResults.concat(results[i]);
		}

		var resultObject = {"players": finalResults};

		/* format the string of json object properly. */
		var data = JSON.stringify(resultObject,null,'\t');

		/* let the user download the file of results.json. */
		download( data, "results.json", "application/json");
	}

	/* This is a special class to communicate with scrolls guid api.*/
	var scrollsGuidClass = function(apiURL, callback){
		var url = apiURL;
		/* According to the documentation of the API, the maximum limit of ranking request
		is 500 rows.*/
		var MAXIMUM_ROWS_NUMBER = 500;

		/* An array that will have 3000/500 = 6 indeces each one holding 500 rows.*/
		var results = [];

		/* Since Ajax calls are configured to be asynchronous, make sure that
		there the ajax callback has been invoked 3000/500 = 6 times*/
		var counter = 0;

		/* callback function that will be executed after each batch request. */
		var resultCallback = callback;

		var getAllResults = function(){
			for(var i=0; i< MAXIMUM_PLAYERS_NUMBER; i+=MAXIMUM_ROWS_NUMBER){
				getNextBatch(i);
			}
		}

		var getNextBatch = function(startIndex){
			var ajaxObj = new AjaxConnectionClass();
			/* Make sure to change the start index for each batch request. */
			var requestURL = url +
							 "ranking?start="+
							 startIndex +
							 "&limit="+MAXIMUM_ROWS_NUMBER+"&fields=name,rating,rank,rankedwon";
			console.log(requestURL);
			ajaxObj.sendRequest(requestURL,updateResult,null);
		}

		var updateResult = function(xhr){
			var json = JSON.parse(xhr.responseText);
			/* use regular expression to relate the response with the start index that
			has been used in each request. */
            var startIndex = xhr.responseURL.match(/start=(\d+)/)[1];
            console.log("request status for start index"+ startIndex+" is:"+ json.msg);

            /* There is 3000 player retrieved on times where each time we got 500 player.*/
            var resultIndex = startIndex/MAXIMUM_ROWS_NUMBER;
            results[resultIndex] = json.data;
            console.log("resultIndex is:"+ resultIndex);

            counter++;
            if(counter == 6 && resultCallback){
            	resultCallback(results);
            }
		}

		return{
			init: init,
			getAllResults: getAllResults
		}
	}

    var AjaxConnectionClass = function(){
        var req;

        var createAJAXObj = function () {
            try {
                console.log("chrome/ios ajax request");
                return new XMLHttpRequest();
            } catch (er1) {
                try {
                    return new ActiveXObject("Msxml3.XMLHTTP");
                } catch (er2) {
                    try {
                        return new ActiveXObject("Msxml2.XMLHTTP.6.0");
                    } catch (er3) {
                        try {
                            return new ActiveXObject("Msxml2.XMLHTTP.3.0");
                        } catch (er4) {
                            try {
                                return new ActiveXObject("Msxml2.XMLHTTP");
                            } catch (er5) {
                                try {
                                    return new ActiveXObject("Microsoft.XMLHTTP");
                                } catch (er6) {
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        }

        var sendRequest = function (url, callback, postData) {
            req = createAJAXObj(), method = (postData) ? "POST" : "GET";
            if (!req) {
                return;
            }

            /* Make sure to use asynchronous ajax call by setting last paramerter to true.
            Synchronous ajax call may be done but it will lead to bad timing response to
            the user. */
            req.open(method, url, true);
            if (postData) {
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }

            req.onreadystatechange = function () {
            	/*Make sure that the request has been processed succesffully by server
            	before calling callback function. */
                if (req.readyState !== 4) {
                    return;
                }
                if (req.status !== 200 && req.status !== 304) {
                    return;
                }
                if(callback){
                	callback(req);
                }
            }

            req.send(postData);
        }

        return{
        	sendRequest: sendRequest
        }
    }

	return {
				init: init
	}
};

var app = new appClass();
app.init();
