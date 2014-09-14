<!DOCTYPE html>
<html>
    <head>
        <title>WebGIS</title>

        <!--<link rel="stylesheet" href="style2.css" type="text/css">-->
        <!--<link rel="stylesheet" href="style.css" type="text/css">-->

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


        <!--geosjon-->
        <script src="tagChanger.js"></script>
        <script src="js/actions1.js"></script>


    </head>

    <body onload="init()">
        <div id="waitForMe" style="z-index:9000;margin:auto;width:100%;height:100%;position:fixed;background-color:black;opacity:0.8;vertical-align:middle" hidden="hidden">
            <img src="http://localhost/aggregator/current/img/loadingimage.gif" style="z-index:9000;position:absolute;margin-left:auto;margin-right:auto;opacity:1.0;display:block" />
        </div>
        <!-- Map Container -->
        <div id="map" style="height:400px"></div>
        Click on "Draw New Boundary Polygon" to start drawing the polygon boundary. Then left-click on the map to start drawing. Double-click to end drawing.
        <ul id="controlToggle">
            <li>
                <input type="radio" name="type" value="none" id="noneToggle" onclick="toggleControl(this);" checked="checked" />
                <label for="noneToggle">Navigate</label>
            </li>
            <li>
                <input type="radio" name="type" value="polygon" id="polygonToggle" onclick="toggleControl(this);" />
                <label for="polygonToggle">Draw New Polygon</label>
                <input type="button" id="cancelPolygon" onclick="removePolygon()" value="Remove Polygon" />
            </li>
            <ul>
               <li>
                    <input type="checkbox" name="allow-pan" value="allow-pan" id="allowPanCheckbox" checked=true onclick="allowPan(this);" />
                    <label for="allowPanCheckbox">Allow Pan while Drawing</label>
                </li>
            </ul>
            <li>
                    <input type="radio" name="type" value="drawRegular" id="drawRegular" onclick="drawRegularPolygon();" />
                    <label for="drawRegular">Draw Circle</label>
            </li>

            <li>
                <!--<input type="radio" name="type" value="modify" id="modifyToggle"
                       onclick="toggleControl(this);" />-->
                <label for="modifyToggle">Modify Boundary Polygon</label>
                <ul>
                    <input id="sides" type="text" size="2" maxlength="2" name="sides" value="5" onchange="update()" hidden="hidden" />
                    <li>
                        <input id="createVertices" type="radio" name="modifyType" onclick="update()" />
                        <label for="createVertices">Add vertices</label>
                    </li>
                    <li>
                        <input id="rotate" type="radio" name="modifyType" onclick="update()" />
                        <label for="rotate">Rotate</label>
                    </li>
                    <li>
                        <input id="resize" type="radio" name="modifyType" onclick="update()" />
                        <label for="resize">Resize</label>
                        (<input id="keepAspectRatio" type="checkbox" name="keepAspectRatio" onchange="update()" checked="checked" />
                        <label for="keepAspectRatio">Keep Aspect Ratio</label>)
                    </li>
                    <li>
                        <input id="drag" type="radio" name="modifyType" onclick="update()" />
                        <label for="drag">Move</label>
                    </li>
                </ul>
                <!-- <ul>
                    <input id="sides" type="text" size="2" maxlength="2" name="sides" value="5" onchange="update()" hidden="hidden" />
                    <li>
                        <input id="createVertices" type="checkbox" name="createVertices" onchange="update()" />
                        <label for="createVertices">Add vertices</label>
                    </li>
                    <li>
                        <input id="rotate" type="checkbox" name="rotate" onchange="update()" />
                        <label for="rotate">Rotate</label>
                    </li>
                    <li>
                        <input id="resize" type="checkbox" name="resize" onchange="update()" />
                        <label for="resize">Resize</label>
                        (<input id="keepAspectRatio" type="checkbox" name="keepAspectRatio" onchange="update()" checked="checked" />
                        <label for="keepAspectRatio">Keep Aspect Ratio</label>)
                    </li>
                    <li>
                        <input id="drag" type="checkbox" checked name="drag" onchange="update()" />
                        <label for="drag">Move</label>
                    </li>
                </ul> -->
            </li> 


            <li>
                <input type="radio" name="type" value="importGeoJSON" id="importGeoJSONToggle" onclick="toggleControl(this);" />
                <label for="importGeoJSONToggle">Import Boundary Polygon (GeoJSON)</label> 
                <input type="file" id="file-input" name="file-input" disabled="disabled">
            </li>

        </ul>

        <hr/>
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

        </div>
        Please make sure to select at least one tag from the above list.
        <div id="customExport">
            <button id="exportToCSV" value="Export to CSV" onclick="customExportToType(this)">Custom Export to CSV</button>
            <button id="exportToGeoJSON" value="Export to GeoJSON" onclick="customExportToType(this)">Custom Export to GeoJSON</button>
        </div>
        <hr>
        <div id="exportButtons" hidden="hidden">
            <button id="exportToCSV" value="Export to CSV" onclick="exportToCSV()">Export to CSV</button>
            <button id="exportToGeoJSON" value="Export to GeoJSON" onclick="exportToGeoJSON()">Export to GeoJSON</button>
        </div>
        <hr>
        <!--Division to hold exported layers-->
        <div id="exportStatus" ></div>
        <div id="aggregate" sytle="margin-right:0px">
            <label>Aggregate</label><br>
            School: <span id='schoolCount'></span><br>
            Hospital: <span id='hospitalCount'></span><br>
            College: <span id='collegeCount'></span><br>
            <div id="aggSchool" hidden="hidden">
                <h2>School</h2>
                Total Students&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <span id="schoolCountStudents"></span></br>
                No of Secondary Schools: <span id="schoolCountPrimary"></span></br>
            </div>
            <div id="aggHospital" hidden="hidden">Hospital</div>
        </div>
        
    </body>
</html>
