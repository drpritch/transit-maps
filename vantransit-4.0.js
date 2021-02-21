/*
 * (c) 2006-2017 David Pritchard
 * All rights reserved.
 */

var searchAddress = null;
var init0flag=false;
function init0() {
    loadScript('https://maps.google.com/maps/api/js?v=weekly&key=***REMOVED***&libraries=places&callback=initialize');
}
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function() {
        init0flag=true; init0()
    }, false)
} else if (document.all && !window.opera) {
    // Internet Explorer path
    document.write('<script type="text/javascript" id="contentloadtag" defer="defer" src="javascript:void(0)"><\/script>')
    var contentloadtag=document.getElementById("contentloadtag")
    contentloadtag.onreadystatechange=function() {
        if (this.readyState=="complete") {
            init0flag=true;
            init0();
        }
    }
}

window.onload=function() {
  setTimeout("if (!init0flag) init0()", 0)
}

function initialize() {

var detectLocation = true, detectZoom = true;
var today = true;
var defaultZoom = 12;
var defaultLong = -123.0798;
var defaultLat = 49.2485;
var defaultType = google.maps.MapTypeId.ROADMAP;
var oldZoom;
var vanBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(49.0, -123.3),
    new google.maps.LatLng(49.35, -122.0));

if( location.search.length > 0 )
{
    var i;
    var args = location.search.slice(1).split('&');
    for( i = 0; i < args.length; ++i )
    {
        var arg, val;
        arg = args[i].split('=');
        if( arg.length != 2 )
            continue;
        val = arg[1];
        arg = arg[0];
        if( arg == 'long' )
        {
            defaultLong = parseFloat(val);
            detectLocation = false;
        }
        else if( arg == 'lat' )
        {
            defaultLat = parseFloat(val);
            detectLocation = false;
        }
        else if( arg == 'zoom' )
        {
            defaultZoom = parseFloat(val);
            detectZoom = false;
        }
        else if( arg == 'type' )
        {
            defaultType = val;
        }
        else if( arg == 'routes' )
        {
            today = (parseInt(val) == 0);
        }
    }
}

var baseurl = "http://davidpritchard.org/maps/vantransit-4.0/";
//var baseurl = "https://storage.googleapis.com/davidpritchard-maps/vantransit-4.0/";

var isPhone = (screen.width <= 500);

// Setup map.
map = new google.maps.Map(document.getElementById("map_canvas"),
    { zoom: defaultZoom,
      center: new google.maps.LatLng(defaultLat, defaultLong),
      mapTypeId: defaultType,
      scaleControl: !isPhone    // Only show scale on a larger screen.
 } );
var places_service = new google.maps.places.PlacesService(map);
oldZoom = defaultZoom;

// Load three more javascript files, then continue with nested function...
// "Lazy" loading is intended to speed up overall site startup time.
loadScripts(['markermanager.js', 'transit-3.1.js'], function() {
    map.markermanager = new MarkerManager(map);

    // Detect and use current location, unless:
    // a) URL args forced a location
    // b) location is outside bounds of tileset
    if(detectLocation) {
        DDetectLocation(function(position) {
            if(position == null ) return;
            var latlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude);
            if( vanBounds.contains(latlng)) {
                defaultLat = position.coords.latitude;
                defaultLong = position.coords.longitude;
                map.setCenter(new google.maps.LatLng(defaultLat, defaultLong));
                if(detectZoom) { map.setZoom(14); }
            }
        });
    }
    // Extra 0.5,0.5 is for high-dpi displays.
    // Original image is 11x11 with centre on "a" pixel.
    // 2x version is 22x22, but centre is mid-way between pixels as a
    // result.
    var markerIcons = [
        new DTransitMarkerIcon(baseurl, "stop", new google.maps.Size(11,11),
                 new google.maps.Point(5.5,5.5)),
    ];

    google.maps.event.addListener(map.markermanager, 'loaded', function(){
        // Setup routes.
        var routes = new DTransitRouteSet(map, baseurl,
            ["expo", "expo2", "millenium", "millenium2", "canada",
             "bline95", "bline96", "bline99",
             "seabus", "wce"],
            markerIcons,
            [["bikelockers", "Bicycle Lockers"],
             ["parkandride", "Park and Ride"]]);

        google.maps.event.addListener(map, "zoom_changed", function() {
            routes.onZoom(oldZoom, map.getZoom());
            oldZoom = map.getZoom();
        });
    });

    });


    // Setup Link to this page.
    document.getElementById('linktopage').onclick = function()
    {
        var newurl = location.href;
        // Cut off existing query string
        if( newurl.indexOf('?') >= 0 )
            newurl = newurl.slice(0, newurl.indexOf('?'));
        var center = map.getCenter();
        newurl += "?lat=" + center.lat().toFixed(5)
                + "&long=" + center.lng().toFixed(5)
                + "&zoom=" + map.getZoom()
                + "&type=" + map.getMapTypeId();
        location.href = newurl;
        return false;
    }

searchAddress = function() {
    var address = document.getElementById("address").value;
    var whenFound = function(result) {
        map.setCenter(result.geometry.location);
        map.setZoom(15);
    }

    search_extra = function(extra_key, next_search) {
        var request = {
            bounds: vanBounds,
            query: address + " " + extra_key,
            types: ['transit_station','train_station']
        }
        places_service.textSearch(request, function(results, status) {
            var found = false;
            if ( status == google.maps.places.PlacesServiceStatus.OK ) {
                for(i=0; i < results.length; ++i) {
                    if(results[i].types.indexOf('transit_station') >= 0 ||
                       results[i].types.indexOf('train_station') >= 0) {
                        whenFound(results[i]);
                        found = true;
                        break;
                    }
                }
            }
            if(!found) {
                next_search();
            }
        });
    }
    search_final = function(next_search) {
        var request = {
            bounds: vanBounds,
            query: address,
        }
        places_service.textSearch(request, function(results, status) {
            if ( status == google.maps.places.PlacesServiceStatus.OK ) {
                whenFound(results[0]);
            }
        });
    }
    // First, try adding the word "skytrain" and seeing if a search
    // result with the type "transit_station" is returned.
    // Try again, with the word "station" afterwards.
    // There's no way to win here:
    // - skytrain-then-station: fails with port coquitlam and other
    //    west-coast-express stations
    // - station-then-skytrain: fails with rupert, patterson and other
    //    skytrain stations.
    // SkyTrain first at least probably aligns with users' frequency of
    // requesting.
    search_extra("skytrain", function() {
        search_extra("station",
            search_final);
    });
}

}

