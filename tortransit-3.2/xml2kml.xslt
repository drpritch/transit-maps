<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="yes"/> 

<xsl:template match="/">
  <kml xmlns="http://www.opengis.net/kml/2.2">
    <xsl:apply-templates select="doc" />
  </kml>
</xsl:template>

<xsl:template match="//doc">
  <Document>
  <name>Toronto Subway Routes</name>
  <description>Toronto's subway and light rail network, operated by the
  Toronto Transit Commission. Buses, streetcars and commuter rail not shown.
  </description>
  <Style id="InterchangeIcon">
    <IconStyle>
      <Icon>
      <!-- TODO: can't get 40x40 icon -->
        <href>interchange.png</href>
      </Icon>
      <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction" />
    </IconStyle>
  </Style>
  <Style id="StopIcon">
    <IconStyle>
      <Icon>
        <!-- TODO: forced to pad to 32x32 icon for kmz, not for kml -->
        <href>stop.png</href>
      </Icon>
      <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction" />
    </IconStyle>
  </Style>
  <xsl:apply-templates select="route" />
  </Document>
</xsl:template>

<xsl:template match="//route">
  <Folder>
    <name><xsl:value-of select="@label"/></name>
    <!--<description><xsl:value-of select="@type"/></description>-->
    <open>0</open>
    <Style id="{concat(substring(@label,1,4),'RouteColour')}">
      <LineStyle>
        <!-- reorder to oobbggrr -->
        <color><xsl:value-of select="concat('ff',substring(@colour,6,2),substring(@colour,4,2),substring(@colour,2,2))"/></color>
        <width><xsl:value-of select="@width"/></width>
      </LineStyle>
      <PolyStyle>
        <color><xsl:value-of select="concat('ff',substring(@colour,6,2),substring(@colour,4,2),substring(@colour,2,2))"/></color>
      </PolyStyle>
    </Style>
    <Placemark id="route">
      <MetaData>
        <Author>David Pritchard</Author>
        <Description>Data was eyeballed from map; not accurate in any sense</Description>
      </MetaData>
      <styleUrl><xsl:value-of select="concat('#',substring(@label,1,4),'RouteColour')"/></styleUrl>
      <LineString>
        <name>Route</name>
        <tessellate>1</tessellate>
        <coordinates>
        <xsl:variable name="vertextype" select="line" />
        <xsl:apply-templates select="vertex"/>
        </coordinates>
      </LineString>
    </Placemark>
    <xsl:for-each select="vertex">
      <xsl:if test="string-length(@label)>0">
        <Placemark>
          <MetaData>
            <Author>David Pritchard</Author>
            <Description>Data was eyeballed from map; not accurate in any sense</Description>
          </MetaData>
          <xsl:choose>
            <xsl:when test="@marker='interchange'">
              <styleUrl>#InterchangeIcon</styleUrl>
            </xsl:when>
            <xsl:otherwise>
              <styleUrl>#StopIcon</styleUrl>
            </xsl:otherwise>
          </xsl:choose>
          <name><xsl:value-of select="@label"/></name>
          <address><xsl:value-of select="@address"/></address>
          <!-- TODO: buses, notes -->
          <snippet><xsl:value-of select="@address"/></snippet>
          <description>
            <![CDATA[ <table><tr valign="top"><td> ]]>
            <xsl:if test="string-length(@url)>0">
              <![CDATA[ <a href= ]]> "<xsl:value-of select="@url"/>"
              <![CDATA[ >Station webpage</a><br /> ]]>
            </xsl:if>
            <xsl:value-of select="@address"/> <![CDATA[ <br/> ]]> 
            <xsl:if test="string-length(@notes)>0">
                <xsl:value-of select="@notes"/> <![CDATA[ <br/> ]]> 
            </xsl:if>
            <xsl:if test="@accessible=1">
              <![CDATA[ <img src="elevator.png"/> ]]> 
            </xsl:if>
            <xsl:if test="@elevator=1">
              <![CDATA[ <img src="elevator.png"/> ]]> 
            </xsl:if>
            <xsl:if test="@washroom=1">
              <![CDATA[ <img src="washroom.png"/> ]]> 
            </xsl:if>
            <xsl:if test="@metropassparking=1">
              <![CDATA[ <img src="metropassparking.png"/> ]]> 
            </xsl:if>
            <xsl:if test="@cashparking=1">
              <![CDATA[ <img src="cashparking.png"/> ]]> 
            </xsl:if>
            <xsl:if test="@transfer=1">
              <![CDATA[ <img src="transfer.png"/> ]]> 
            </xsl:if>
            <![CDATA[ </td><td> ]]>
            <xsl:if test="string-length(../@operator)>0">
              <![CDATA[ <img src= ]]>"<xsl:value-of select="../@operator"/>.png"
              <![CDATA[ > ]]>
            </xsl:if>
            <![CDATA[ </td></tr></table> ]]>
          </description>
          <Point>
          <coordinates>
            <xsl:value-of select="@long"/>,<xsl:value-of select="@lat"/>,2400
          </coordinates>
          </Point>
        </Placemark>
      </xsl:if>
    </xsl:for-each>
  </Folder>
</xsl:template>

<xsl:template match="//vertex">
    <xsl:value-of select="@long"/>,<xsl:value-of select="@lat"/>,2357
</xsl:template>
</xsl:stylesheet>
