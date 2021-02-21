/**
* Returns an XMLHttp instance to use for asynchronous
* downloading. This method will never throw an exception, but will
* return NULL if the browser does not support XmlHttp for any reason.
* @return {XMLHttpRequest|Null}
*/
function createXmlHttpRequest() {
 try {
   if (typeof ActiveXObject != 'undefined') {
     return new ActiveXObject('Microsoft.XMLHTTP');
   } else if (window["XMLHttpRequest"]) {
     return new XMLHttpRequest();
   }
 } catch (e) {
   changeStatus(e);
 }
 return null;
};

/**
* This functions wraps XMLHttpRequest open/send function.
* It lets you specify a URL and will call the callback if
* it gets a status code of 200.
* @param {String} url The URL to retrieve
* @param {Function} callback The function to call once retrieved.
*/
function downloadUrl(url, callback) {
 var status = -1;
 var request = createXmlHttpRequest();
 if (!request) {
   return false;
 }

 request.onreadystatechange = function() {
   if (request.readyState == 4) {
     try {
       status = request.status;
     } catch (e) {
       // Usually indicates request timed out in FF.
     }
     if (status == 200) {
       callback(request.responseXML, request.status);
       request.onreadystatechange = function() {};
     }
   }
 }
 request.open('GET', url, true);
 try {
   request.send(null);
 } catch (e) {
   changeStatus(e);
 }
};

/*
 * Load a series of javascript files. Each file is required to conclude
 * with a call to loadScriptFinish() to ensure the next file gets loaded.
 * Do NOT rely on onreadystatechange etc. - doesn't work on Safari.
 */
var loadScriptFinish = null;

function loadScript(url) {
    var script = document.createElement("script")
    script.src = url;
    script.type = "text/javascript";
    var scripts = document.getElementsByTagName('script')[0];
    scripts.parentNode.insertBefore(script, scripts);
}

function loadScripts(urls, callback) {
    if(urls.length == 0) {
        loadScriptFinish = null;
        callback();
    } else {
        var url = urls.shift();
        loadScriptFinish = function() {
            loadScripts(urls, callback);
        }
        loadScript(url);
    }
}

