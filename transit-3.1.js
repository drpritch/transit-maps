/*
 * (c) 2006-2017 David Pritchard
 * All rights reserved.
 */

/*
 * Find the current physical location of the client, and pass as arg to
 * callback function. If cannot find, callback will receive null.
 */
function DDetectLocation(callback) {
    function handleNoGeoLocation() { callback(null); }
    // Try W3C Geolocation (preferred)
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback,
                                                 handleNoGeoLocation);
    } else if (google.gears) {
        var geo = google.gears.factory.create('beta.geolocation');
        geo.getCurrentPosition(callback, handleNoGeoLocation);
    } else {
        handleNoGeoLocation();
    }
}

function DTransitMarkerIcon(baseurl, name, size, iconAnchor)
{
    this.name = name;
    if(window.devicePixelRatio != undefined &&
       window.devicePixelRatio >= 1.5) {
        dpi = "2x/";
        scaledSize = size;
    } else {
        dpi = "1x/";
        scaledSize = null;
    }
    this.markerImage = new google.maps.MarkerImage(
        baseurl + dpi + name + ".png",
        size, new google.maps.Point(0,0),
        iconAnchor, scaledSize);
}

function DTransitVertex(xmlElement, baseurl, icons, defaultStop, operator)
{
    this.baseurl = baseurl;
    this.icons = icons;
    this.operator = operator;
    this.pos = new google.maps.LatLng(
                           parseFloat(xmlElement.getAttribute("lat")),
                           parseFloat(xmlElement.getAttribute("long")));
    this.label = xmlElement.getAttribute("label");
    this.markerKey = xmlElement.getAttribute("marker")
        ? xmlElement.getAttribute("marker") : defaultStop;
    this.markerZoomLevel = xmlElement.getAttribute("markerzoom")
        ? parseFloat(xmlElement.getAttribute("markerzoom")) : -1;
    if( this.markerZoomLevel == -1 ) {
        this.markerZoomLevel = 99;
    }
    this.labelZoomLevel = xmlElement.getAttribute("labelzoom")
        ? parseFloat(xmlElement.getAttribute("labelzoom")) : -1;
    if( this.labelZoomLevel == -1 ) {
        this.labelZoomLevel = 99;
    }
    this.labelSize =
        new google.maps.Size(parseFloat(xmlElement.getAttribute("labelwidth")),
                  parseFloat(xmlElement.getAttribute("labelheight")));
    this.labelLocation = xmlElement.getAttribute("labellocation")
        ? xmlElement.getAttribute("labellocation") : "l";
    this.url = xmlElement.getAttribute("url");
    this.address = xmlElement.getAttribute("address");
    this.flags = 0;
    var i;
    for( i = 0; i < icons.length; ++i )
    {
        if( xmlElement.getAttribute(icons[i][0]) &&
            parseFloat(xmlElement.getAttribute(icons[i][0])) > 0 )
        {
            this.flags |= 1<<i;
        }
    }
    this.fuse = xmlElement.getAttribute("fuse")
        ? xmlElement.getAttribute("fuse") : null;
    var elems = xmlElement.getElementsByTagName("bus");
    this.buses = "";
    var numBuses = 0;
    for( i = 0; i < elems.length; ++i )
    {
        var busElem = elems[i];
        if( busElem.getAttribute("label") )
        {
            if( numBuses > 0 )
            {
                this.buses += " ";
            }
            var type = busElem.getAttribute("type")
                ? busElem.getAttribute("type") : "bus";
            this.buses += "<span class=\"" + type + "\">" +
                busElem.getAttribute("label") + "</span>";
            ++numBuses;
        }
    }
    this.notes = xmlElement.getAttribute("notes");
    this.marker = null;
    this.labelIcon = null;
    this.labelMarker = null;

    if( this.label != null )
    {
        this.key = this.label;
        // Strip out non-alphanumeric
        this.key = this.key.toLowerCase();
        this.key = this.key.replace(/[^a-z0-9]/g, "");
    }
}

DTransitVertex.prototype.createMarker = function(map, baseurl, markerIcons)
{
    if( this.label != null && this.marker == null )
    {
        var markerImage = null;
        for( i = 0; i < markerIcons.length; ++i )
        {
            if( markerIcons[i].name == this.markerKey )
            {
                markerImage = markerIcons[i].markerImage;
                break;
            }
        }
        if( null == markerImage )
        {
            markerImage = markerIcons[0].markerImage;
        }
        if(window.devicePixelRatio != undefined &&
           window.devicePixelRatio >= 1.5) {
            optimized = false;
        } else {
            optimized = null;
        }
        this.marker = new google.maps.Marker(
            { position: this.pos,
              icon: markerImage,
              optimized: optimized } );
        this.createLabelMarker(baseurl);

        this.infowindow = new google.maps.InfoWindow({
            content: this.getInfoWindowHtml(null),
            position: this.pos,
            maxWidth: 250
        });
        var vertex = this;
        google.maps.event.addListener(this.marker, 'click', function() {
            vertex.infowindow.open(map);
            DDetectLocation(function(position) {
                vertex.infowindow.setContent(
                    vertex.getInfoWindowHtml(position)
                );
                vertex.infowindow.open(map);
            })
        });
        google.maps.event.addListener(this.labelMarker, 'click', function() {
            vertex.infowindow.open(map);
            DDetectLocation(function(position) {
                vertex.infowindow.setContent(
                    vertex.getInfoWindowHtml(position)
                );
                vertex.infowindow.open(map);
            })
        });
    }
}

DTransitVertex.prototype.createLabelMarker = function(baseurl)
{
    if( this.labelSize != null && this.labelMarker == null )
    {
        if(window.devicePixelRatio != undefined &&
           window.devicePixelRatio >= 1.5) {
            dpi = "2x/";
            // Scale down to low-res label size.
            unscaledSize = null;
            scaledSize = this.labelSize;
            // Force marker optimization to be turned off - to ensure we
            // get high DPI images throughout. See:
            // http://stackoverflow.com/questions/9208916/google-map-custom-markers-retina-resolution
            optimized = false;
        } else {
            dpi = "1x/";
            // No scaling - use raw image resolution.
            unscaledSize = this.labelSize;
            scaledSize = null;
            optimized = null;
        }
        labelMarkerImageUrl = baseurl + "labels/";
        if(this.operator != null) {
            labelMarkerImageUrl = labelMarkerImageUrl + this.operator + "/";
        }
        labelMarkerImageUrl = labelMarkerImageUrl + dpi + this.key + ".png";
        if( this.labelLocation == "t" )
        {
            labelMarkerAnchor =
                new google.maps.Point(this.labelSize.width/2, this.labelSize.height + 9);
        }
        else if( this.labelLocation == "b" )
        {
            labelMarkerAnchor =
                new google.maps.Point(this.labelSize.width/2, -9);
        }
        else if( this.labelLocation == "l" )
        {
            labelMarkerAnchor =
                new google.maps.Point(this.labelSize.width + 9, this.labelSize.height / 2);
        }
        else if( this.labelLocation == "r" )
        {
            labelMarkerAnchor =
                new google.maps.Point(-9, this.labelSize.height / 2);
        }
        else if( this.labelLocation == "tl" )
        {
            labelMarkerAnchor =
                new google.maps.Point(this.labelSize.width + 4, this.labelSize.height + 4);
        }
        else if( this.labelLocation == "tr" )
        {
            labelMarkerAnchor =
                new google.maps.Point(-4, this.labelSize.height + 4);
        }
        else if( this.labelLocation == "bl" )
        {
            labelMarkerAnchor =
                new google.maps.Point(this.labelSize.width + 4, -4);
        }
        else if( this.labelLocation == "br" )
        {
            labelMarkerAnchor =
                new google.maps.Point(-4, -4);
        }
        // For some reason, named params here breaks everything.
        this.labelMarkerImage = new google.maps.MarkerImage(
            labelMarkerImageUrl,
            unscaledSize,
            new google.maps.Point(0,0),
            labelMarkerAnchor,
            scaledSize);
        this.labelMarker = new google.maps.Marker(
            { position: this.pos,
              icon: this.labelMarkerImage,
              clickable: true,
              optimized: optimized } );
    }
}

DTransitVertex.prototype.getInfoWindowHtml = function(saddr)
{
    var html;
    if( this.url )
    {
        html = "<a href=\"" + this.url + "\" target=\"_blank\">" + this.label + "</a>";
    }
    else
    {
        html = "<b>" + this.label + "</b>"
    }
    html += "<br/>";
    if( this.address != null )
        html += "<small>" + this.address + "</small><br/>";
    html += this.buses;
    if( this.notes != null )
        html += "<div class=\"notes\">" + this.notes + "</div>";
    html += "<div class=\"directions\"> Directions <a href=\"http://maps.google.ca/maps?f=d&dirflg=r"
        + (saddr != null ? ("&saddr=" + saddr.coords.latitude + "," + saddr.coords.longitude) : "")
        + "&daddr=" + this.pos.lat()  + "," + this.pos.lng()
        + "\" target=\"blank\">to here</a></div>";
    if( this.flags > 0 )
    {
        for( i = 0; i < this.icons.length; ++i )
        {
            if( this.flags & (1<<i) )
            {
                html += "<img src=\"" + this.baseurl +
                    this.icons[i][0] + ".png\" alt=\"" +
                    this.icons[i][1] + "\" /> ";
            }
        }
    }
    if( this.operator != null )
    {
        html = "<table width=\"100%\"><tr><td valign=\"top\">" + html
            + "</td><td valign=\"top\" align=\"right\"> &nbsp; ";
        html += "<img src=\"" + this.baseurl + this.operator + ".png\" />";
        html += "</td></tr></table>";
    }
    return html;
}

DTransitVertex.prototype.showMarker = function()
{
    if( this.marker != null ) {
        this.marker.show();
    }
}

DTransitVertex.prototype.hideMarker = function()
{
    if( this.marker != null ) {
        this.marker.hide();
    }
}

DTransitVertex.prototype.addMarkerToManager = function(markermanager)
{
    if( this.marker != null )
    {
        markermanager.addMarker(this.marker, this.markerZoomLevel);
        markermanager.addMarker(this.labelMarker, this.labelZoomLevel);
    }
}

function DTransitRouteLoader()
{
    this.urls = [];
    this.callbacks = [];
    this.data = [];
    this.active = false;
}

var the_transitrouteloader = new DTransitRouteLoader();

DTransitRouteLoader.prototype.request = function(url, callback, data)
{
    this.urls.push(url);
    this.callbacks.push(callback);
    this.data.push(data);
    if( this.active == false )
    {
        this.open();
    }
}

DTransitRouteLoader.prototype.open = function()
{
    this.active = true;
    downloadUrl(this.urls[0], this.onreadystatechange);
}

DTransitRouteLoader.prototype.onreadystatechange = function(xmlDoc, xhStatus)
{
    var rl = the_transitrouteloader;
    var callback = rl.callbacks[0];
    var data = rl.data[0];
    // Save and remove the data for the completed url.
    rl.urls.shift();
    rl.callbacks.shift();
    rl.data.shift();

    // Call the callback
    callback(data, xmlDoc.documentElement);

    // Start the next one, or signal stop.
    if( rl.urls.length > 0 )
    {
        rl.open();
    }
    else
    {
        rl.active = false;
    }
}

function DTransitRoute(baseurl, markerIcons, icons)
{
    this.polylines = [];
    this.baseurl = baseurl;
    this.markerIcons = markerIcons;
    this.icons = icons;
    this.visible = true;
}

DTransitRoute.prototype.onLoad = function(map, xmlElement)
{
    var elems = xmlElement.getElementsByTagName("vertex");
    var vertices = [];
    var i;
    this.defaultStop = xmlElement.getAttribute("defaultstop");
    if( !this.defaultStop ) {
        this.defaultStop = "stop";
    }
    this.operator = xmlElement.getAttribute("operator");
    for( i = 0; i < elems.length; ++i )
    {
        vertices.push(new DTransitVertex(elems[i], this.baseurl, this.icons,
                                         this.defaultStop, this.operator));
    }
    this.colour = xmlElement.getAttribute("colour");
    this.width = xmlElement.getAttribute("width")
        ? parseFloat(xmlElement.getAttribute("width"))
        : 10;
    this.opacity = xmlElement.getAttribute("opacity")
        ? parseFloat(xmlElement.getAttribute("opacity"))
        : 0.75;

    if( xmlElement.getAttribute("sharedurl") )
    {
        this.sharedOffset = parseFloat(xmlElement.getAttribute("sharedoffset"));
        this.showSharedMarkers = 
            parseFloat(xmlElement.getAttribute("showsharedmarkers"));

        this.sharedMap = map;
        this.vertices = vertices;
        // Flag to indicate "we don't know!"
        this.numSharedVertices = -1;
        the_transitrouteloader.request(
            this.baseurl + xmlElement.getAttribute("sharedurl"),
            this.onSharedLoad, this);
    }
    else
    {
        this.numSharedVertices = 0;
        this.vertices = vertices;
        this.sharedOffset = 0;

        this.createMarkers(map);
        if( this.visible )
        {
            this.addMarkersToManager(map.markermanager);
            this.showPolylines(map);
        }
    }
}

DTransitRoute.prototype.onSharedLoad = function(cbthis, xmlElement)
{
    var map = cbthis.sharedMap;
    cbthis.sharedMap = null;
    var elems = xmlElement.getElementsByTagName("vertex");
    var sharedVertices = [];
    var i;
    for( i = 0; i < elems.length; ++i )
    {
        sharedVertices.push(new DTransitVertex(elems[i], cbthis.baseurl,
                                               cbthis.icons,
                                               cbthis.operator));
    }
    cbthis.numSharedVertices = sharedVertices.length;
    cbthis.vertices = sharedVertices.concat(cbthis.vertices);
    if( !cbthis.showSharedMarkers )
    {
        var i;
        for( i = 0; i < cbthis.numSharedVertices; ++i )
        {
            cbthis.vertices[i].markerZoomLevel = 99;
            cbthis.vertices[i].labelZoomLevel = 99;
        }
    }
    cbthis.showSharedMarkers = null;

    cbthis.createMarkers(map);
    if( cbthis.visible )
    {
        // Now that we have them all, create the route.
        cbthis.addMarkersToManager(map.markermanager);
        cbthis.showPolylines(map);
    }
}

DTransitRoute.prototype.createMarkers = function(map)
{
    var i;
    for( i = 0; i < this.vertices.length; i++ )
    {
        this.vertices[i].createMarker(map, this.baseurl, this.markerIcons);
    }
}

DTransitRoute.prototype.createPolylines = function(map, widthMult)
{
    var i;
    for( i = 0; i < this.polylines.length; i++ )
    {
        this.polylines[i].setMap(null);
    }
    this.polylines = [];
    var pointArray;

    pointArray = [];
    for( i = 0; i < this.vertices.length; i++ )
    {
        if( this.vertices[i].fuse != null )
        {
            // Create a line from the pre-fuse points.
            this.createPolyline(map, pointArray, widthMult);
            // Start a new line from the fuse point on.
            pointArray = [];
        }
        pointArray.push(this.vertices[i].pos);
    }
    this.createPolyline(map, pointArray, widthMult);
}

DTransitRoute.prototype.createPolyline = function(map, pointArray, widthMult)
{
    var width = this.width * widthMult;
    if( this.numSharedVertices > 0 )
    {
        // Geographic size
        var span = map.getBounds().toSpan();
        // Pixel size
        var div = map.getDiv();
        var pix2latlng = new google.maps.LatLng(
            width * this.sharedOffset * span.lat() / div.offsetHeight,
            width * this.sharedOffset * span.lng() / div.offsetWidth);
        this.offsetPoints(pointArray, 0, this.numSharedVertices, pix2latlng);
    }
    this.polylines.push(
        new google.maps.Polyline({
            path: pointArray,
            strokeColor: this.colour,
            strokeWeight: width,
            strokeOpacity: this.opacity
    }));
}

DTransitRoute.prototype.addMarkersToManager = function(markermanager)
{
    if( this.visible && this.vertices )
    {
        for( i = 0; i < this.vertices.length; i++ )
        {
            this.vertices[i].addMarkerToManager(markermanager);
        }
    }
}

DTransitRoute.prototype.showPolylines = function(map)
{
    if( this.polylines.length == 0 )
    {
        this.createPolylines(map, 1);
    }
    var i;
    for( i = 0; i < this.polylines.length; i++ )
    {
        this.polylines[i].setMap(map);
    }
}

DTransitRoute.prototype.hidePolylines = function(map)
{
    var i;
    for( i = 0; i < this.polylines.length; i++ )
    {
        this.polylines[i].setMap(null);
    }
}

// Offset points in the range [start,end) by dist, along the point
// normal. Dist is a 2D lat/lng structure.
DTransitRoute.prototype.offsetPoints = function(points, start, end, dist)
{
    var i;
    for(i = start; i < end - 1; i++ )
    {
        var dlat, dlng, len, nlat = 0, nlng = 0, count = 0;
        if( i > 0 )
        {
            dlat = points[i].lat() - points[i-1].lat();
            dlng = points[i].lng() - points[i-1].lng();
            len = Math.sqrt(dlat*dlat+dlng*dlng);
            nlat += dlng / len;
            nlng += -dlat / len;
            ++count;
        }
        if( i+1 < points.length ) 
        {
            dlat = points[i+1].lat() - points[i].lat();
            dlng = points[i+1].lng() - points[i].lng();
            len = Math.sqrt(dlat*dlat+dlng*dlng);
            nlat += dlng / len;
            nlng += -dlat / len;
            ++count;
        }
        if( count > 0 )
        {
            // Average two normals, and renormalize.
            len = Math.sqrt(nlat*nlat+nlng*nlng);
            nlat /= len;
            nlng /= len;
            points[i] = new google.maps.LatLng(
                                    points[i].lat() + nlat * dist.lat(),
                                    points[i].lng() + nlng * dist.lng());
        }
    }
}

DTransitRoute.prototype.onZoom = function(map, oldZoomLevel, newZoomLevel)
{
    if( this.vertices.length == 0 || this.numSharedVertices < 0 ||
        !this.visible)
        return;

    // Shrink lines at zoom level 9
    if( this.numSharedVertices > 0 ||
        (oldZoomLevel > 9 && newZoomLevel <= 9 ) ||
        (oldZoomLevel <= 9 && newZoomLevel > 9) )
    {
        this.hidePolylines(map);
        // Regenerate polylines for routes with shared vertices after zoom.
        // They may need to be reoffset.
        this.createPolylines(map, newZoomLevel <= 9 ? 0.5 : 1);
        this.showPolylines(map);
    }
}

DTransitRoute.prototype.hide = function(map)
{
    this.visible = false;
    if( this.vertices )
    {
        for( i = 0; i < this.vertices.length; ++i )
        {
            this.vertices[i].hideMarker();
        }
        this.hidePolylines(map);
    }
}

DTransitRoute.prototype.show = function(map)
{
    this.visible = true;
    if( this.vertices )
    {
        for( i = 0; i < this.vertices.length; ++i )
        {
            this.vertices[i].showMarker();
        }
        this.showPolylines(map);
    }
}

DTransitRouteSet = function(map, baseurl, routenames, markerIcons, icons)
{
    this.map = map;
    this.routenames = routenames;
    this.routes = [];
    this.baseurl = baseurl;
    var i;
    for( i = 0; i < this.routenames.length; ++i )
    {
        this.routes.push(new DTransitRoute(baseurl, markerIcons, icons));
    }
    this.numRoutesLoaded = 0;
    for( i = 0; i < this.routenames.length; ++i )
    {
        the_transitrouteloader.request(this.baseurl + this.routenames[i]+".xml",
                                       this.onLoad, this);
    }
}

DTransitRouteSet.prototype.onLoad = function(cbthis, xmlElement)
{
    // this pointer is invalid. cbthis is the real this pointer.
    cbthis.routes[cbthis.numRoutesLoaded].onLoad(cbthis.map, xmlElement);
    ++cbthis.numRoutesLoaded;
}

DTransitRouteSet.prototype.getRoute = function(routename)
{
    var i;
    for( i = 0; i < this.routenames.length; ++i )
    {
        if( this.routenames[i] == routename )
        {
            return this.routes[i];
        }
    }
    return null;
}

DTransitRouteSet.prototype.onZoom = function(oldZoomLevel, newZoomLevel)
{
    var i;
    for( i = 0; i < this.routes.length; ++i )
    {
        if( this.routes[i] != null )
        {
            this.routes[i].onZoom(this.map, oldZoomLevel, newZoomLevel);
        }
    }
}

loadScriptFinish();
