#!/bin/sh

(grep xml bloor.xml; echo "<doc>";\
 grep -hv xml bloor.xml yonge.xml scarborough.xml sheppard.xml; \
 echo "</doc>") > ttc.xml

xsltproc xml2kml.xslt ttc.xml > doc.kml
rm ttc.kmz
zip ttc.kmz doc.kml stop.png interchange.png elevator.png washroom.png \
    cashparking.png metropassparking.png transfer.png ttc.png

(grep xml vivablue.xml; echo "<doc>"; \
 grep -hv xml vivablue.xml vivapurple.xml; \
 echo "</doc>") > viva.xml
xsltproc xml2kml_viva.xslt viva.xml > doc.kml
rm viva.kmz
zip viva.kmz doc.kml stop.png interchange.png viva.png

(grep xml lakeshoreeast.xml; echo "<doc>"; \
 grep -hv xml lakeshoreeast.xml lakeshorewest.xml barrie.xml \
 georgetown.xml milton.xml richmondhill.xml stoufville.xml; \
 echo "</doc>") > go.xml
xsltproc xml2kml_go.xslt go.xml > doc.kml
rm go.kmz
zip go.kmz doc.kml gostop.png interchange.png elevator.png washroom.png \
    cashparking.png metropassparking.png transfer.png gotransit.png

rm doc.kml
