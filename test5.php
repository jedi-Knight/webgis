<!DOCTYPE>
<html>
<head>
	<title>WebGIS</title>
	
	<link rel="stylesheet" href="http://www.openlayers.org/api/2.13.1/theme/default/style.css" type="text/css">
	
	<script src="http://openlayers.org/api/2.13.1/OpenLayers.js" type="text/javascript"></script>
	<!--<script src="http://localhost/osm/js/openlayers-master/lib/OpenLayers.js" type="text/javascript"></script>-->
    <!--script src="../../openlayers-2.12/lib/OpenLayers.js"></script-->
    <script src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.2&amp;mkt=en-us"></script> <!--This is required wrapper for the bing images-->
    <!--script src="http://www.openstreetmap.org/openlayers/OpenStreetMap.js"></script-->
    <script src="js/OSMMeta.js"></script>
    <script src="sessvars.js"></script>
    <!--<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>-->
	<!--<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>-->
    <script src="geocoder.js"></script>
    <script src="http://trac.osgeo.org/openlayers/export/12468/addins/loadingPanel/trunk/lib/OpenLayers/Control/LoadingPanel.js"></script>
	<!--<script src="filereader.js" type="text/javascript"></script>-->
	
<script type="text/javascript" src="js/actions.js">
		
	
	</script>
</head>

	<body onload="init()">
	<!-- Map Container -->
		<div id="map" style="height:200px"></div>
		Click on "Draw Polygon" to start drawing the polygon boundary. Then left-click on the map to start drawing. Double-click to end drawing.
		<ul id="controlToggle">
			<li>
                <input type="radio" name="type" value="none" id="noneToggle"
                       onclick="toggleControl(this);" checked="checked" />
                <label for="noneToggle">navigate</label>
            </li>
			<li>
				<input type="radio" name="type" value="polygon" id="polygonToggle" onclick="toggleControl(this);" />
                <label for="polygonToggle">Draw New Polygon</label>
			</li>
			<li>
				<input type="radio" name="type" value="importGeoJSON" id="importGeoJSONToggle" onclick="toggleControl(this);" />
                <label for="importGeoJSONToggle">Import Boundary Polygon (GeoJSON)</label> 
					<input type="file" id="file-input" name="file-input" disabled="disabled">
			</li>
			<li>
                <input type="checkbox" name="allow-pan" value="allow-pan" id="allowPanCheckbox" checked=true onclick="allowPan(this);" />
                <label for="allowPanCheckbox">Allow Pan while Drawing</label>
            </li>
		</ul>
		Select the features of interest within the polygon boundary and click on "Fetch Data". Use "Ctrl" key to select multiple features.<br>
		<!-- Facility Selector -->
			<div id="facilitySelector">
				<select id="facilityList" multiple="multiple">
					<option value="school">Schools</option>
					<option value="hospital">Hospitals</option>
					<option value="college">Colleges</option>
				</select>
			</div>
			<div id="fetchData" >
				<input type="button" id="btnFetchData" value="Fetch Data" onclick="fetchData()"></input>
			</div>
		<hr>
		<div id="tagsSelector">
			hello
		</div>
		<div id="customExport">
			<button id="exportToCSV" value="Export to CSV" onclick="customExportToCSV()"/>Custom Export to CSV</button>
			<button id="exportToGeoJSON" value="Export to GeoJSON" onclick="customExportToGeoJSON()"/>Custom Export to GeoJSON</button>
		</div>
		<hr>
		<div id="exportButtons">
			<button id="exportToCSV" value="Export to CSV" onclick="exportToCSV()"/>Export to CSV</button>
			<button id="exportToGeoJSON" value="Export to GeoJSON" onclick="exportToGeoJSON()"/>Export to GeoJSON</button>
		</div>
		<hr>
		<!--Division to hold exported layers-->
		<div id="exportStatus" ></div>
		<div id="aggregate" sytle="margin-right:0px">
			<label>Aggregate</label><br>
			School: <span id='schoolCount'></span><br>
			Hospital: <span id='hospitalCount'></span><br>
			College: <span id='collegeCount'></span><br>
		</div>
	</body>
</html>