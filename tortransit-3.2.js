/*
 * (c) 2006-2016 David Pritchard
 * All rights reserved.
 */

var searchAddress = null;
var init0flag=false;
function init0() {
    loadScript('https://maps.google.com/maps/api/js?v=weekly&key=***REMOVED***&callback=initialize');
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

var detectLocation = false, detectZoom = true;
var defaultZoom = 12;
var defaultLong = -79.397;
var defaultLat = 43.692;
var TRANSIT_MAPTYPEID = 'transit';
var defaultType = TRANSIT_MAPTYPEID;
var defaultOpacity = 0.7;
var oldZoom;

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
        else if( arg == 'opacity' )
        {
            defaultOpacity = parseFloat(val);
        }
    }
}
var tilesetBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(43.13563196, -80.0452457741),
    new google.maps.LatLng(44.1663150669, -78.5590729681));
var tilesMinZoom = 5;
var tilesMaxZoom = 15;
var baseurl = "http://davidpritchard.org/maps/tortransit-3.2/";
var storageurl = "https://storage.googleapis.com/davidpritchard-maps/tortransit-3.2/";
var baseurl_tiles = storageurl + "../toronto-2017/";

var isPhone = (screen.width <= 500);

geocoder = new google.maps.Geocoder();
// Setup map.
map = new google.maps.Map(document.getElementById("map_canvas"),
    { zoom: defaultZoom,
      center: new google.maps.LatLng(defaultLat, defaultLong),
      mapTypeId: defaultType,
      scaleControl: !isPhone,
      mapTypeControlOptions: {
          mapTypeIds: [
            TRANSIT_MAPTYPEID,
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.SATELLITE]
      }
 } );
oldZoom = defaultZoom;

/*
 TODO: Reimplement ImageMapType with a few special features:
 1) When zoom is above maxzoom, retrieve maxzoom images, blow them up, and
    offset into them using img.background-position CSS property.
 2) Allow opacity edits on the fly, and add slider to control it.

 TODO: Must do here (instead of after lazy load) to get it to show up in map type control. May be able to find a way out of this.
 */

if(window.devicePixelRatio != undefined &&
   window.devicePixelRatio >= 1.5) {
    // High-dpi display. Pretend the 256x256 tiles are actually 128x128.
    tileSize = 128;
    tilesMaxZoom = tilesMaxZoom - 1;
} else {
    tileSize = 256;
}
var myTilesOptions = {
    alt: "Greater Toronto Hamilton Area transit",
    getTileUrl: function(coord, zoom) {
        if ((zoom < tilesMinZoom) || (zoom > tilesMaxZoom)) {
            return "http://www.maptiler.org/img/none.png";
        } 
        var ymax = 1 << zoom;
        var y = ymax - coord.y -1;
        var tileBounds = new google.maps.LatLngBounds(
            map.getProjection().fromPointToLatLng(
                new google.maps.Point( (coord.x)*tileSize/ymax,
                                       (coord.y+1)*tileSize/ymax ) , zoom ),
            map.getProjection().fromPointToLatLng(
                new google.maps.Point( (coord.x+1)*tileSize/ymax,
                                       (coord.y)*tileSize/ymax ) , zoom )
        );
        if (tilesetBounds.intersects(tileBounds)) {
            if(tileSize == 128) {
                y = y+(1<<zoom);
                zoom = zoom + 1;
            }
            result = baseurl_tiles +
                zoom + "/" + coord.x + "/" + y + ".png";
            return result;
      } else {
          return "http://www.maptiler.org/img/none.png";
      }
    },
    minZoom: tilesMinZoom,
    maxZoom: tilesMaxZoom,
    name: "Transit",
    tileSize: new google.maps.Size(tileSize, tileSize),
    opacity: defaultOpacity
};

var transitMapType = new google.maps.ImageMapType(myTilesOptions);
map.mapTypes.set(TRANSIT_MAPTYPEID, transitMapType);

// When map type changes - add a translucent transit overlay for
// map/satellite views.
google.maps.event.addListener(map, 'maptypeid_changed', function(){
    if(map.getMapTypeId() == TRANSIT_MAPTYPEID) {
        if(map.overlayMapTypes.getAt(0) == transitMapType) {
            map.overlayMapTypes.removeAt(0);
        }
    } else if(map.overlayMapTypes.getAt(0) != transitMapType) {
        map.overlayMapTypes.insertAt(0, transitMapType);
    }
})

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
            if( tilesetBounds.contains(latlng)) {
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
        new DTransitMarkerIcon(baseurl, "interchange", new google.maps.Size(19,19),
                 new google.maps.Point(9.5,9.5)),
        new DTransitMarkerIcon(baseurl, "gostop", new google.maps.Size(9,9),
                 new google.maps.Point(4.5,4.5))
    ];

    google.maps.event.addListener(map.markermanager, 'loaded', function(){
        // Setup routes.
        var routes = new DTransitRouteSet(map, baseurl,
            ["yonge", "bloor", "scarborough", "sheppard",
            "vivablue", "vivapurple",
            "lakeshorewest", "lakeshorewest2", "lakeshoreeast", "milton",
            "kitchener", "barrie", "richmondhill", "stouffville" ],
            markerIcons,
            [["elevator", "Accessible/Elevator"],
             ["accessible", "Accessible/Elevator"],
             ["washroom", "Washroom"],
             ["cashparking", "Parking (cash)"],
             ["metropassparking", "Parking (Metropass)"],
             ["transfer", "Transfer required for surface routes"]]);

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
                + "&type=" + map.getMapTypeId()
                + "&opacity=" + defaultOpacity;
        location.href = newurl;
        return false;
    }

searchAddress = function() {
    var address = document.getElementById("address").value;
    var whenFound = function(result) {
        map.fitBounds(result.geometry.viewport);
    }
    // First, try adding the word station and seeing if a search
    // result with the type "transit_station" is returned.
    geocoder.geocode(
        { 'address': address + " station",
          'bounds': tilesetBounds },
        function(results, status) {
            var found = false;
            if (status == google.maps.GeocoderStatus.OK) {
                for(var i = 0; i < results[0].types.length; ++i ) {
                    if(results[0].types[i] == "transit_station") found = true;
                }
            }
            if(found) {
                whenFound(results[0]);
            } else {
                geocoder.geocode({ 'address': address,
                                   'bounds': tilesetBounds },
                function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        whenFound(results[0]);
                    }
                });
            }
        }
    );
}

}

