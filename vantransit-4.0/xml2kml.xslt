<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="yes"/> 

<!-- Note: source xml files need enclosing <doc>...</doc> to work -->

<xsl:template match="/">
  <kml xmlns="http://earth.google.com/kml/2.1">
    <xsl:apply-templates select="doc" />
  </kml>
</xsl:template>

<xsl:template match="//doc">
  <Folder>
  <name>Vancouver Rapid Transit</name>
  <description>Vancouver's rail, ferry and rapid bus network, operated by
  TransLink. Includes a future/potential route (Evergreen). Regular buses not shown.
  </description>
  <xsl:apply-templates select="route" />
  </Folder>
</xsl:template>

<xsl:template match="//route">
  <Folder>
    <name><xsl:value-of select="@label"/></name>
    <!--<description><xsl:value-of select="@type"/></description>-->
    <open>0</open>
    <Style id="{concat(substring(@label,1,2),'RouteColour')}">
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
      <styleUrl><xsl:value-of select="concat('#',substring(@label,1,2),'RouteColour')"/></styleUrl>
      <LineString>
        <name>Route</name>
        <tessellate>1</tessellate>
        <coordinates>
        <xsl:variable name="vertextype" select="line" />
        <xsl:apply-templates select="vertex"/>
        </coordinates>
      </LineString>
    </Placemark>
    <Style id="StopIcon">
      <IconStyle>
        <Icon>
          <!-- TODO: forced to pad to 32x32 icon for kmz, not for kml -->
          <href>stop.png</href>
        </Icon>
        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction" />
      </IconStyle>
    </Style>
    <xsl:for-each select="vertex">
      <xsl:if test="string-length(@label)>0">
        <Placemark>
          <MetaData>
            <Author>David Pritchard</Author>
            <Description>Data was eyeballed from map; not accurate in any sense</Description>
          </MetaData>
          <styleUrl>#StopIcon</styleUrl>
          <name><xsl:value-of select="@label"/></name>
          <address><xsl:value-of select="@address"/></address>
          <!-- TODO: buses, notes, url -->
          <Snippet><xsl:value-of select="@address"/></Snippet>
          <description>
            <xsl:value-of select="@address"/> <![CDATA[ <br/> ]]> 
            <xsl:if test="@bikelockers=1">
              <![CDATA[ <img src="bikelockers.png"/> ]]> 
            </xsl:if>
            <xsl:if test="@parkandride=1">
              <![CDATA[ <img src="parkandride.png"/> ]]> 
            </xsl:if>
          </description>
          <Point>
          <coordinates>
            <xsl:value-of select="@long"/>,<xsl:value-of select="@lat"/>, 2400
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
