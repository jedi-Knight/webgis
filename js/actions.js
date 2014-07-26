//OpenLayers.ProxyHost= "/cgi-bin/proxy.cgi?url=";	
//global variables
var map,
        selector1,
        selector2,
        highlightor,
        selectedfeature,
        facility,
        building,
        building_url,
        facility_url,
        data_url,
        boxes,
        format,
        popup,
        styles,
        field,
        text,
        geom,
        anim, miti;  //jedi-code
//var markers = new OpenLayers.Layer.Markers( "Markers",{displayInLayerSwitcher:false} );

var centerX = 85.33141;//491213.721224323//-123.1684986291807;//9497800;
var centerY = 27.72223;//5456645.24607268//49.245339757767844;//3212000;
var center = new OpenLayers.LonLat(centerX, centerY);
if (sessvars.center)
{
    center = new OpenLayers.LonLat(sessvars.center.lon, sessvars.center.lat);
}
var ranger = 0.015;//10000000//.5;//10000;
var map_bound = [centerX - ranger, centerY - ranger, centerX + ranger, centerY + ranger];
var extent = new OpenLayers.Bounds(map_bound[0], map_bound[1], map_bound[2], map_bound[3]);
var zoom = 17;
var zoom_data_limit = 18; // vector data will load only in this level or above

//other options
var proj4326 = new OpenLayers.Projection("EPSG:4326");
var proj900913 = new OpenLayers.Projection("EPSG:900913");
var popup;
var attr = ["name", "amenity", "building"];

var layers = new Array();		//contains all current layers on the map
var csvs = new Array();		//contains a csv text body for each layer in 'layers' array above
var geoJSONs = new Array();	//contains a geoJSON text body for each layer in 'layers' array above
var clonedLayers = new Array();

//var selectLists = new Array();
//var selectedTagsInLayers = new Array();

//for polygon layer
var polygonLayer,
        polygonControl,
        polyCoords,
        selectControlClicks;

//for regular Polygon (circle)
var polygonControlRegular;

//var mapProjectionObject;
var fileInputControl;

function loadendOfData(queryQueue){
    if(queryQueue) return;
    showLoadingAnim(false);
    guiPanelShowAggregate();
    $("#deleteAllLayersTrigger").addClass("confirm").removeClass("disabled");
    $("iframe").remove();
}




function purgeData(){ /**add code to clear aggregates section and show presets selector**/
    //clear the tagsSelector section
    var myTagsSelector = document.getElementById('tagsSelector');
    while (myTagsSelector.firstChild)
        myTagsSelector.removeChild(myTagsSelector.firstChild);

    //clear all current layers before fetching new ones
    for (i = 0; i < layers.length; i++)
    {
        document.getElementById(layers[i].name + 'Count').innerHTML = "";
        map.removeLayer(layers[i]);
        //Clear the aggregator section as well
    }

    //empty global arrays
    layers.length = 0;
    csvs.length = 0;
    geoJSONs.length = 0;
    
    //*obsolete: return myTagsSelector; *//handle to populate tagsSelector if purgeData() called from within fetchData();
   
    return;
}




function init() {
    //map configuration
    map = new OpenLayers.Map('map', {
        //allOverlays:true,
        maxExtent: extent,
        controls: [new OpenLayers.Control.Zoom(),
            /*new OpenLayers.Control.MousePosition({
             suffix:'',
             emptyString:'',
             displayProjection:new OpenLayers.Projection("EPSG:4015")
             }),*/
            new OpenLayers.Control.ScaleLine(),
            new OpenLayers.Control.Scale(),
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.LayerSwitcher(),
            new OpenLayers.Control.Attribution()
        ],
        projection: proj4326
                //displayProjection:proj900913
    });

//    map.addControl(new OpenLayers.Control.LoadingPanel());
    bing = new OpenLayers.Layer.Bing({name: "Bing Aerial Layer", type: "Aerial", key: "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf", });
    osm = new OpenLayers.Layer.OSM("OSM", null, {sphericalMercator: false, attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors (ODbL)"});
//    wmsLayer = new OpenLayers.Layer.WMS("OpenLayers WMS", "http://vmap0.tiles.osgeo.org/wms/vmap0?", {layers: 'basic'});

    OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2';

    // allow testing of specific renderers via "?renderer=Canvas", etc
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

    polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer", {
        renderers: renderer,
        projection: "EPSG:4326",
        strategies: [new OpenLayers.Strategy.Refresh({force: true})]
                //strategies: [new OpenLayers.Strategy.Fixed()]
    });

    map.addLayer(osm);
//    map.addLayer(wmsLayer);
    map.addLayer(bing);
    //map.addLayer(markers);
    map.addLayer(polygonLayer);
    map.setCenter(center.transform(proj4326, proj900913), zoom);

    polygonControl = new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.Polygon);
    map.addControl(polygonControl);

    //for regular Polygon (circle)
    polyOptions = {sides: 30};
    polygonControlRegular = new OpenLayers.Control.DrawFeature(polygonLayer,
            OpenLayers.Handler.RegularPolygon,
            {handlerOptions: polyOptions});
    map.addControl(polygonControlRegular);

    //to modify polygons using polygonControl
    polygonControlModifier = new OpenLayers.Control.ModifyFeature(polygonLayer);
    map.addControl(polygonControlModifier);

    if (console && console.log) {
        function report(event) {
            console.log(event.type, event.feature ? event.feature.id : event.components);
        }
        polygonLayer.events.on({
            /*"beforefeaturemodified": report,
             "featuremodified": report,
             "afterfeaturemodified": report,
             "vertexmodified": report,
             "sketchmodified": report,
             "sketchstarted": report,
             "sketchcomplete": report,*/
            "featureunselected": report
        });
    }

    //map.setCenter(new OpenLayers.LonLat(0,0),3);
    //document.getElementById('noneToggle').checked=true;

    { //Not needed for now
        //facility_url = "http://overpass-api.de/api/interpreter?data=(way['amenity'~'kindergarten|school|college|hospital|clinic|nursing_home|dentist|health$|health_post'](bbox);node(w);node['amenity'~'kindergarten|school|college|hospital|clinic|nursing_home|dentist|health_post'](bbox););out meta qt;";
        //building_url = "http://overpass-api.de/api/interpreter?data=(  (    node(bbox)['name'~'kindergarten$|school$|college$|hospital$|clinic$|health'];  );  (    node(bbox)['building'~'kindergarten|school|college|government|hospital|clinic|health$'];  );  (    node(bbox)['amenity'~'kindergarten|school|college|public_building|hospital|clinic|health'];  );  (    node(bbox)['office'~'government'];  );  (    way(bbox)['name'~'kindergarten$|school$|college$|hospital$|clinic$|health$'][building];    node(w);  );    (    way(bbox)['building'~'kindergarten|school|college|government|hospital|clinic|health_post|dentist'];    node(w);  );  (    way(bbox)['amenity'~'school|college|public_building|hospital|clinic|health_post'];    node(w);  );  ) ->.a;(way(around .a : 1)[building];node(w);); out meta qt;";

        //controls		
        /*Not needed now 
         selector1 = new OpenLayers.Control.SelectFeature(building,{
         onSelect: onFeatureSelect,
         onUnselect: onFeatureUnselect
         });
         map.addControl(selector1);
         highlightor =new OpenLayers.Control.SelectFeature(building,{
         hover:true,
         highlightOnly:true,
         autoActivate:true
         
         
         }); 
         map.addControl(highlightor);
         selector2 = new OpenLayers.Control.SelectFeature(facility,{
         onSelect: onFacilitySelect,
         onUnselect: onFacilityUnselect
         //hover:true
         });
         map.addControl(selector2);
         selector2.activate();
         
         map.events.on({"moveend":function(){
         //alert("map paneed or moved");
         sessvars.center = map.getExtent().getCenterLonLat().transform(proj900913,proj4326);
         //alert("Moved To: "+sessvars.center.lon +" " + sessvars.center.lat);
         }});
         */
    }

    //get the polygon vertices when the polygon is complete
    polygonControl.events.register("featureadded", polygonControl, function(obj) {
        //alert("inside polygonControl.events.featureadded()");
        if (!polygonLayer)
            alert("No polygonLayer found");
        //deactivate polygon drawing control
        if (polygonControl.active)
            polygonControl.deactivate();
        arrVerticesInPoints = new Array();
        arrVerticesInLonLat = new Array();
        //polygonLayerIn4326
        var polygonLayerIn4326 = new OpenLayers.Layer.Vector("Polygon Layer In 4326", {
            renderers: renderer,
            projection: "EPSG:4326",
            strategies: [new OpenLayers.Strategy.Refresh({force: true})]
                    //strategies: [new OpenLayers.Strategy.Fixed()]
        });
        polygonLayerIn4326 = polygonLayer.clone();
        //debugger;
        arrVerticesInPoints = polygonLayerIn4326.features[0].geometry.getVertices();
        //alert(arrVerticesInPoints);

        //for geoJSON output
        /*var boundaryGeoJSON = new OpenLayers.Format.GeoJSON();
         boundaryGeoJSON = boundaryGeoJSON.write(polygonLayer.features, true);
         //boundaryGeoJSON = encodeURIComponent(boundaryGeoJSON);
         //boundaryGeoJSON.push(geoJSON);
         console.log(boundaryGeoJSON);*/
        //transform all vertices to EPSG:4326 Projection System			

        for (key in arrVerticesInPoints)
            arrVerticesInLonLat[key] = arrVerticesInPoints[key].transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));
        //arrVerticesInLonLat[key] = arrVerticesInPoints[key];

        //build dynamic query for poly
        //Change arrVerticesInLonLat to String
        strVerticesInLonLat = arrVerticesInLonLat.toString();
        //Remove unnecessary characters from strVerticesInLonLat
        strVerticesInLonLat = strVerticesInLonLat.replace(/POINT/g, "");
        strVerticesInLonLat = strVerticesInLonLat.replace(/\(/g, "");
        strVerticesInLonLat = strVerticesInLonLat.replace(/\)/g, "");
        strVerticesInLonLat = strVerticesInLonLat.replace(/,/g, " ");
        //Explode strVerticesInLonLat to Array so that it can be reversed to form arrVerticesInLatLon
        arrTemp = strVerticesInLonLat.split(" ");
        arrTemp.reverse();
        strVerticesInLatLon = arrTemp.join(" ");
        //alert("strVerticesInLatLon: " + strVerticesInLatLon);
        //assign strVerticesInLatLon to global variable polyCoords, which is used in facility_url
        polyCoords = strVerticesInLatLon;
        //alert(polyCoords);

        /**jedi-code**/
        $("a.editTool, a.tool.delete").removeClass("disabled");
        if ($("#selectedPresets").children("li").length)
            $("#fetchDataTrigger").removeClass("disabled");
        $("a.tool, #importPolygonTrigger").removeClass("active").addClass("passive confirm");
        $("#expandPanel").click();
//        if (layers.length)
//            $("#fetchDataTrigger").addClass("confirm");
        guiPanelShowPresetSelector();//show presets panel
        /****/

    });

    polygonLayer.events.register("afterfeaturemodified", polygonControlModifier, function(obj) {
        //alert("feature Modified by polygonControlModifier!!");
        if (polygonControlModifier.active)
            polygonControlModifier.deactivate();
        //alert("after feature modified");
        if (layers.length)
            $("#fetchDataTrigger").addClass("confirm");
        polygonControl.events.triggerEvent('featureadded');
    });

    polygonLayer.events.register("featureadded", polygonControlRegular, function(obj) {
        if (polygonControlRegular.active)
            polygonControlRegular.deactivate();
        //alert("after feature modified");
        polygonControl.events.triggerEvent('featureadded');
    });




    /**geojson boundary input**/
    fileInputControl = document.getElementById('file-input');
    fileInputControl.addEventListener("change", function(event) {
        // When the control has changed, there are new files
//            var i = 0,
//                    files = fileInputControl.files,
//                    len = files.length;                  
//            for (; i < len; i++) {
//                console.log("Filename: " + files[i].name);
//                console.log("Type: " + files[i].type);
//                console.log("Size: " + files[i].size + " bytes");
//            }
        /*jedi-code*/
//            if(fileInputControl.files[0].type !== "application/json"){
//                alert("Please upload a valid GeoJSON file.");
//                return;
//            }
        /**/

        if (fileInputControl.files.length != 0) {
            //alert(fileInputControl.files.length);
            fx(fileInputControl);
        }
        /*jediKnight: what does this code do??
         document.getElementById('importGeoJSONToggle').checked=false;
         document.getElementById('file-input').disabled="false";
         */
    }, false);
    fileInputControl.addEventListener("close", function(event) {
        //alert("aborted");
        polyCoords = "";
    }, false);
    /****/


}

function fetchData(selected) {
    //check if polygon.features[0] is still selected
    if (polygonControlModifier.feature !== null) {
        alert("Finish modifying the polygon first. Click outside the polygon to finish modification.");
        return;
    }
    //check if polyCoords is defined and is not empty
//    if (polyCoords === "" || !polyCoords) {
//        alert("Please select the area first");
//        return;
//    }
//    //check if the layers are selected
//    if (document.getElementById('facilityList').options.selectedIndex < 0) {
//        alert("Please select at least one item in the Features List");
//        return;
//    }
    //Call update()
    //sazal update();
    //Trigger afterfeaturemodified event of PolygonLayer
    //if(polygonControlModifier.active)
    //polygonLayer.events.triggerEvent("afterfeaturemodified");

    purgeData();  //jedi-code: moved data purge script to function purgeData();

//    selected = new Array();
//    var ob = document.getElementById('facilityList');
//    for (var i = 0; i < ob.options.length; i++)
//        if (ob.options[i].selected) {
//            selected.push(ob.options[i].value);
//        }

    //create new select boxes for each item in 'selected' array inside 'tagsSelector' div
    /*
     * for (key in selected) {
        //create and append Amenity Name
        var title = document.createElement("h3");
        title.innerHTML = selected[key];
        title.style.display = "inline";
        myTagsSelector.appendChild(title);
        //Create and append select list
        var selectList = document.createElement("select");
        selectList.id = "tagsIn" + selected[key];
        selectList.multiple = "multiple";
        myTagsSelector.appendChild(selectList);
    }*
     */

    for (sel in selected) {
        var numberOfRequests = selected.length;
        //debugger;
        switch (selected[sel]) {
            case 'school':
                //show loadingimage.gif
                showLoadingAnim(true); //jedi-code
                //document.getElementById('waitForMe').style.display="block";
                //facility_url = "http://overpass-api.de/api/interpreter?data=(way['amenity'~'kindergarten|school|college|hospital|clinic|nursing_home|dentist|health$|health_post'](bbox);node(w);node['amenity'~'kindergarten|school|college|hospital|clinic|nursing_home|dentist|health_post'](bbox););out meta qt;";

                facility_url = "http://overpass-api.de/api/interpreter";
                school = new OpenLayers.Layer.Vector("school", {
                    setName: 'school',
                    //strategies: [new OpenLayers.Strategy.BBOX({ratio:1.0}),new OpenLayers.Strategy.Refresh()],
                    strategies: [new OpenLayers.Strategy.Fixed()],
                    protocol: new OpenLayers.Protocol.HTTP({
                        url: facility_url, //<-- relative or absolute URL to your .osm file
                        params: {
                            "data": "(way['amenity'~'kindergarten|school'](poly: '" + polyCoords + "');node(w);node['amenity'~'kindergarten|school'](poly: '" + polyCoords + "'););out meta qt;"
                        },
                        format: new OpenLayers.Format.OSMMeta(),
                        readWithPOST: true
                    }),
                    projection: new OpenLayers.Projection("EPSG:4326")
                       // styleMap: new OpenLayers.StyleMap({'default':new OpenLayers.Style({'strokeWidth': 1,fillColor:"green"})})
                    /*jedi-code*/
                    ,eventListeners: {
                        "loadstart": function () {
                            console.log("overpass query started for: "+selected[sel]);
                        },
                        "loadend":function(){
                            console.log("loadend: school");
                            //hide loadingimage.gif
                            loadendOfData(--numberOfRequests); //jedi-code/**/
                        }
                    }
                    //jedi-code/**/
                
                });
                map.addLayers([school]);
                layers.push(school);
                school.events.on({"featuresadded": function(features) {
                        document.getElementById(school.name + 'Count').innerHTML = "schools: " + school.features.length;
                        //populate selectTagsInLayers
                        /*jedi-code*/
                        try{
                            if(!school.features.length)return;
                        }catch(e){
                            console.log('Error: ' + e);
                            return;
                        }
                        
                        populateTagsSelector(school);
                        
                        
                        //jedi-code/**/
                        //hide loadingimage.gif
                         //showLoadingAnim(false); moved to 'loadend' handler //jedi-code/**/
                        
                        //document.getElementById('waitForMe').style.display="none";

                        //Test for 'aggregate'
                        element = document.getElementById('aggSchool');
                        element.style.display = "block";
                        //Count total number students
                        var strTotal = "";
                        var intTotal = 0;
                        var intIgnored = 0;
                        for (var i = 0; i < school.features.length; ++i)
                        {
                            if (school.features[i].attributes['student:count'])
                            {
                                strTotal = school.features[i].attributes['student:count'];
                                intTotal += parseInt(strTotal);
                            }
                            else
                                intIgnored++;
                        }
                        document.getElementById('schoolCountStudents').innerHTML = "<b>" + intTotal + "</b> with <b> " + intIgnored + "</b> schools without required data.";

                        //Count total number primary schools
                        strTotal = "";
                        intTotal = 0;
                        intIgnored = 0;
                        for (var i = 0; i < school.features.length; ++i)
                        {
                            if (school.features[i].attributes['isced:level'])
                            {
                                if (school.features[i].attributes['isced:level'] == "secondary")
                                {
                                    intTotal++;
                                }
                            }
                            else
                                intIgnored++;
                        }
                        document.getElementById('schoolCountPrimary').innerHTML = "<b>" + intTotal + "</b> with <b> " + intIgnored + "</b> schools with unknown level.";
                    }});
                break;

            case 'hospital':
                //show loadingimage.gif
                showLoadingAnim(true); //jedi-code
                //document.getElementById('waitForMe').style.display="block";
                //facility_url = "http://overpass-api.de/api/interpreter?data=(way['amenity'~'hospital|clinic|nursing_home|dentist|health$|health_post'](poly: '" +polyCoords+ "');node(w);node['amenity'~'hospital|clinic|nursing_home|dentist|health_post'](poly: '" +polyCoords+ "'););out meta qt;";

                facility_url = "http://overpass-api.de/api/interpreter";
                hospital = new OpenLayers.Layer.Vector("hospital", {
                    strategies: [new OpenLayers.Strategy.BBOX({ratio: 1.0}), new OpenLayers.Strategy.Refresh()],
                    protocol: new OpenLayers.Protocol.HTTP({
                        url: facility_url, //<-- relative or absolute URL to your .osm file
                        params: {
                            "data": "(way['amenity'~'hospital|clinic|nursing_home|dentist|health$|health_post'](poly: '" + polyCoords + "');node(w);node['amenity'~'hospital|clinic|nursing_home|dentist|health_post'](poly: '" + polyCoords + "'););out meta qt;"
                        },
                        format: new OpenLayers.Format.OSMMeta(),
                        readWithPOST: true
                    }),
                    projection: new OpenLayers.Projection("EPSG:4326")
                            //styleMap: new OpenLayers.StyleMap({'default':new OpenLayers.Style({'strokeWidth': 1,fillColor:"red"})})
                    /*jedi-code*/
                    ,eventListeners: {
                        "loadstart": function () {
                            console.log("overpass query started for: "+selected[sel]);
                        },
                        "loadend":function(){
                            console.log("loadend: hospital");
                            //hide loadingimage.gif
                            loadendOfData(--numberOfRequests); //jedi-code/**/
                        }
                    }
                    //jedi-code/**/
                
                });
                map.addLayers([hospital]);
                layers.push(hospital);
                hospital.events.on({"featuresadded": function(features) {
                        document.getElementById(hospital.name + 'Count').innerHTML = "hospitals: " + hospital.features.length;
                        /*jedi-code*/
                        try{
                            if(!hospital.features.length)return;
                        }catch(e){
                            console.log('Error: ' + e);
                            return;
                        }
                        //jedi-code/**/
                        populateTagsSelector(hospital);
                        /*jedi-code*/
                        //$("#fetchDataTrigger").addClass("confirm");
                        //guiPanelShowAggregate();
                         //hide loadingimage.gif
                         //showLoadingAnim(false); moved to 'loadend' handler //jedi-code/**/
                        //document.getElementById('waitForMe').style.display="none";

                    }});
                break;

            case 'college':
                //show loadingimage.gif
                showLoadingAnim(true); //jedi-code
                //document.getElementById('waitForMe').style.display="block";
                //facility_url = "http://overpass-api.de/api/interpreter?data=(way['amenity'~'college'](poly: '" +polyCoords+ "');node(w);node['amenity'~'college'](poly: '" +polyCoords+ "'););out meta qt;";

                facility_url = "http://overpass-api.de/api/interpreter";
                college = new OpenLayers.Layer.Vector("college", {
                    strategies: [new OpenLayers.Strategy.BBOX({ratio: 1.0}), new OpenLayers.Strategy.Refresh()],
                    protocol: new OpenLayers.Protocol.HTTP({
                        url: facility_url, //<-- relative or absolute URL to your .osm file
                        params: {
                            "data": "(way['amenity'~'college'](poly: '" + polyCoords + "');node(w);node['amenity'~'college'](poly: '" + polyCoords + "'););out meta qt;"
                        },
                        format: new OpenLayers.Format.OSMMeta(),
                        readWithPOST: true
                    }),
                    projection: new OpenLayers.Projection("EPSG:4326")
                            //styleMap: new OpenLayers.StyleMap({'default':new OpenLayers.Style({'strokeWidth': 1,fillColor:"green"})})
                
                    /*jedi-code*/
                    ,eventListeners: {
                        "loadstart": function () {
                            console.log("overpass query started for: "+selected[sel]);
                        },
                        "loadend":function(){
                            console.log("loadend: college");
                            //hide loadingimage.gif
                            loadendOfData(--numberOfRequests); //jedi-code/**/
                        }
                    }
                    //jedi-code/**/
                });
                map.addLayers([college]);
                layers.push(college);
                college.events.on({"featuresadded": function(features) {
                        document.getElementById(college.name + 'Count').innerHTML = "colleges: " + college.features.length;
                        
                        /*jedi-code*/
                        try{
                            if(!college.features.length)return;
                        }catch(e){
                            console.log('Error: ' + e);
                            return;
                        }
                        
                        populateTagsSelector(college);
                        
                        //$("#fetchDataTrigger").addClass("confirm");
                        //guiPanelShowAggregate(); 
                        //hide loadingimage.gif
                        //showLoadingAnim(false); moved to 'loadend' handler //jedi-code
                        //document.getElementById('waitForMe').style.display="none";
                    }});
                break;
        }
    }
}

//for polygon
function toggleControl(element) {
    //deselect all options from modifyType
    /*var modes=document.getElementsByName('modifyType');
     for (key in modes){
     modes[key].checked=false;
     }*/
    /*jedi-code*/
    polygonControl.deactivate();
    polygonControlRegular.deactivate();
    if (!$(element).hasClass("active"))
        return;
    /**/

    var control = polygonControl;
    //console.log("logogogogogogo");
    if ($(element).hasClass("pen")) {  //jedi-code
        polygonLayer.removeAllFeatures();	//remove all features from the polygonLayer
        polyCoords = "";	//remove old coordinates from polyCoords array
        //document.getElementById('file-input').disabled = true;
        control.activate();
    }
    /*jedi-code*/
    else if ($(element).hasClass("circle")) {
        drawRegularPolygon();
    }
    /**/
    else if ($(element).hasClass("importPolygon")) {
        //console.log("hellooooo");
        //activate the file-input
        //document.getElementById('file-input').disabled = false;

        /**jedi-code**/
        fileInputControl.click();
        /****/
    }
    else if($(element).hasClass("delete")){
        polygonLayer.removeAllFeatures();
        polygonLayer.destroyFeatures();
        polyCoords = "";
        $(element).removeClass("active").addClass("passive disabled");
    }
}

//for drawRegularPolygon
function drawRegularPolygon() {

    polygonLayer.removeAllFeatures();
    polygonLayer.destroyFeatures();
    //polygonLayer.addFeatures([]);
    polyCoords = "";
    if (polygonControlModifier.feature)
        polygonControlModifier.feature = null;
    polygonControlRegular.activate();

}

//for polygon
function allowPan(element) {
    var stop = !element.checked;
    polygonControl.handler.stopDown = stop;
    polygonControl.handler.stopUp = stop;
}

function removePolygon() {
    polygonLayer.removeAllFeatures();	//remove all features from the polygonLayer
    polyCoords = "";	//remove old coordinates from polyCoords array
}

function exportToCSV() {
    csvs.length = 0;				//empty the 'csvs' array
    for (i = 0; i < layers.length; ++i)
    {
        headers = new Array();			//get all keys from the key=value pairs
        csv_filename = layers[i].name; 	//name of CSV file. One CSV will be created per entry in the global 'layer' array
        csv_text = "";					//csv string. this is the final content of the csv file
        for (j = 0; j < layers[i].features.length; ++j)
        {
            for (key in layers[i].features[j].attributes)
            {
                //check if each attribute is unique
                //if it is unique, append it to 'headers' array
                //else don't add it and move on to check the next attribute

                //set flag for unique. unique = 0. duplicate = 1
                flagUnique = 0;
                for (entry in headers)
                {
                    if (headers[entry] == key)
                        flagUnique = 1; //means it is NOT unique. don't add it to 'headers' array
                }
                if (flagUnique == 0)
                    //append this 'unique' key to 'headers' array
                    headers.push(key)
            }
        }
        //add these only if there are other keys, i.e. add these only if the current layer is NOT empty
        if (headers.length > 0)
        {
            headers.push("lon"); //to hold x coordinate of the centroid
            headers.push("lat"); //to hold y coordinate of the centroid
            headers.push("geometry");	//to hold POLYGON(()) data
        }

        //write the csv headers to csv_text here
        csv_text = headers.toString();
        csv_text += "\n";

        //check if a key or key-value exists for each of the feature
        for (j = 0; j < layers[i].features.length; ++j) //for each feature in the current layer...
        {
            {
                //check if each key enlisted in 'headers' array has a corresponding value for this (current) feature
                //if the value exists, write down this value
                //if the value does not exist, write down a NULL (or nothing) in its place
                //at the end of every feature, add a carriage return
            }

            //for this feature
            var thisfeature = "";

            //get centroid of this (current) feature and transform it onto EPSG:4326
            var centroid = layers[i].features[j].geometry.getCentroid();
            clonedCentroid = centroid.clone();
            clonedCentroid = clonedCentroid.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));

            //get geometry of this (current) feature and transform it onto EPSG:4326
            var geometry = layers[i].features[j].geometry;
            clonedGeometry = geometry.clone();
            clonedGeometry.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));

            for (keyHeaders in headers)
            {
                if (layers[i].features[j].attributes[headers[keyHeaders]])
                {
                    //means the value exists in the current Feature. So this value has to be added to the csv file
                    csv_text += '\"' + layers[i].features[j].attributes[headers[keyHeaders]] + '\"' + ",";
                    //csv_text += layers[i].features[j].attributes[headers[keyHeaders]] +",";
                    thisfeature += '\"' + layers[i].features[j].attributes[headers[keyHeaders]] + '\"' + ",";
                    //thisfeature += layers[i].features[j].attributes[headers[keyHeaders]] +",";
                }
                else if (headers[keyHeaders] == 'lon')
                {
                    /*boundsLon = bounds.getCenterLonLat()['lon'];
                     csv_text += boundsLon + ",";*/
                    csv_text += '\"' + clonedCentroid.x + '\"' + ",";
                    //csv_text += clonedCentroid.x +",";
                    thisfeature += '\"' + clonedCentroid.x + '\"' + ",";
                    //thisfeature += clonedCentroid.x +",";
                }
                else if (headers[keyHeaders] == 'lat')
                {
                    /*boundsLat = bounds.getCenterLonLat()['lat'];
                     csv_text += boundsLat + ",";*/
                    csv_text += '\"' + clonedCentroid.y + '\"' + ",";
                    //csv_text += clonedCentroid.y +",";
                    thisfeature += '\"' + clonedCentroid.y + '\"' + ",";
                    //thisfeature += clonedCentroid.y +",";
                }
                else if (headers[keyHeaders] == 'geometry')
                {
                    //var geometry = layers[i].features[j].geometry.toString();
                    csv_text += '\"' + clonedGeometry.toString() + '\"';
                    //csv_text += '\"' + clonedGeometry.toString() + '\"';
                    //thisfeature += '\"' + clonedGeometry.toString() + '\"';
                    thisfeature += '\"' + clonedGeometry.toString() + '\"';
                }
                else //means the value does not exist in the current Feature. So add a 'nothing' value to the csv file
                {	//csv_text += ",";
                    csv_text += ",";
                    thisfeature += ",";
                }
            }
            csv_text += "\n"; //add a carriage return at the end of each Feature
            thisfeature += "\n";
            //alert(csv_text);
            //alert(thisfeature);
        }
        //alert (csv_text);
        //console.log(csv_text);
        //Replace all & with &&
        //csv_text = csv_text.replace(/&/g, "and");
        csv_text = encodeURIComponent(csv_text);
        //console.log(csv_text);
        //add to 'csvs' layers
        csvs.push(csv_text);
    }
    //Engaging AJAX
    //call AJAXCSV only if data exists
    if (csvs.length > 0)
        callAJAXCSV(0);
    else
        alert("No data to export!");
    //Disengaging MANAUL AJAX 

}

//////////////***********Possible Spoiler***************/////////////////
// I changed all clonedLayers to tempLayers inside this function :D//
function exportToGeoJSON() {
    geoJSONs.length = 0;				//empty the 'geoJSONs' array
    tempLayers = new Array();			//to hold clones of each layer from 'Layers' array
    for (i = 0; i < layers.length; ++i) 	//for each layer
    {
        tempLayers[i] = layers[i].clone();
        if (layers[i].features.length > 0) //for each layer with at least one feature in it
        {
            for (j = 0; j < layers[i].features.length; ++j) //for each feature in the current layer...
            {
                //get geometry of this (current) feature and transform it onto EPSG:4326
                var clonedGeometry = tempLayers[i].features[j].geometry;
                clonedGeometry = clonedGeometry.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));

                //////////
                {
                    centroidX = tempLayers[i].features[j].geometry.getCentroid().x;
                    tempLayers[i].features[j].attributes.lon = centroidX;
                }
                {
                    centroidY = tempLayers[i].features[j].geometry.getCentroid().y;
                    tempLayers[i].features[j].attributes.lat = centroidY;
                }
                //////////
            }
            var geoJSON = new OpenLayers.Format.GeoJSON();
            geoJSON = geoJSON.write(tempLayers[i].features, true);
            geoJSON = encodeURIComponent(geoJSON);
            geoJSONs.push(geoJSON);
            console.log(geoJSON);
            //return;
        }
        else
            geoJSONs.push("\n");
    }
    //Engaging AJAX
    if (geoJSONs.length > 0)
        callAJAXGeoJSON(0);
    else
        alert("No data to export!");
    //Disengaging MANAUL AJAX 

}

function callAJAXCSV(index) {
    //alert(index + "," + layers[index].name + "," + csvs[index]);
    if (index == layers.length) {
        //hide loadingimage.gif
        showLoadingAnim(false); //jedi-code
        //document.getElementById('waitForMe').style.display="none";
        return;//do nothing. we are done here.
    }
    //if (csvs[index]==="\n")//this worked before URIEncode was used.
    if ($(document.getElementById('tagsIn' + layers[index].name)).find("input:checked").length == 0)
        callAJAXCSV(index + 1);	//do not make a csv file if it <del>does not have any data</del> <em>has no tags selected in the corresponding selectBox</em>. move on to the next item in 'csvs' array.
    else
    {
        var xmlhttp;
        if (window.XMLHttpRequest)
        {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        }
        else
        {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function(myFile)
        {
            if (xmlhttp.readyState == 3 || xmlhttp.readyState == 2 || xmlhttp.readyState == 1 || xmlhttp.readyState == 0)
            {
                //show loadingimage.gif
                showLoadingAnim(true); //jedi-code
                //document.getElementById('waitForMe').style.display="block";

            }
            if (xmlhttp.readyState == 4)
            {
                /*jedi-code*/
                console.log("callAJAXCSV(): ..now opening saveas dialogue box for: " + xmlhttp.response);
                //window.location = xmlhttp.response;
                $("body").append("<iframe src='"+xmlhttp.response+"'/>");
                /**/

                //window.open(xmlhttp.response);
//                myButton = document.createElement("input");
//                myButton.type = "button";
//                myButton.value = xmlhttp.response;
//                myButton.onclick = function() {
//                    window.open(xmlhttp.response)
//                };
//                placeHolder = document.getElementById("exportStatus");
//                placeHolder.appendChild(myButton);
                callAJAXCSV(index + 1);
            }
        }
        var query = "CSVwriter.php";
        xmlhttp.open("POST", query, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send("name=" + layers[index].name + "&payload=" + csvs[index]+"&date="+miti);
        //alert(layers[i].name + " AJAX sent.\n Current xmlhttp index is: "+i +"\n");
    }
}

function callAJAXGeoJSON(index) {
    if (index == layers.length) {
        //hide loadingimage.gif
        showLoadingAnim(false); //jedi-code
        //document.getElementById('waitForMe').style.display="none";
        return;//do nothing. we are done here.
    }
    if ($(document.getElementById('tagsIn' + layers[index].name)).find("input:checked").length == 0)
        callAJAXGeoJSON(index + 1);	//do not make a csv file if does not have any data. move on to the next item in 'csvs' array.
    else
    {
        var xmlhttp;
        if (window.XMLHttpRequest)
        {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        }
        else
        {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function(myFile)
        {
            if (xmlhttp.readyState == 3 || xmlhttp.readyState == 2 || xmlhttp.readyState == 1 || xmlhttp.readyState == 0)
            {
                showLoadingAnim(true); //jedi-code
            }
            if (xmlhttp.readyState == 4)
            {
                /*jedi-code*/
                console.log("callAJAXGeoJSON(): ..now opening saveas dialogue box for: " + xmlhttp.response);
                //window.location = "GeoJSONDownloader.php?file=" + xmlhttp.response;
                $("body").append("<iframe src='GeoJSONDownloader.php?file=" + xmlhttp.response+"'/>");
                /**/
                //window.open(xmlhttp.response);
//                myButton = document.createElement("input");
//                myButton.type = "button";
//                myButton.value = xmlhttp.response;
//                myButton.onclick = function() {
//                    window.open(xmlhttp.response)
//                };
//                placeHolder = document.getElementById("exportStatus");
//                placeHolder.appendChild(myButton);
                callAJAXGeoJSON(index + 1);
            }
        }
        var query = "GeoJSONwriter.php";
        var params = "name=" + layers[index].name + "&payload=" + geoJSONs[index] +"&date="+miti;
        xmlhttp.open("POST", query, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //xmlhttp.setRequestHeader("Content-length",params.length);
        //xmlhttp.setRequestHeader("Connection","close");
        xmlhttp.send(params);
        //alert(layers[i].name + " AJAX sent.\n Current xmlhttp index is: "+i +"\n");
    }
}

function fx(fileInputControl) {
    //alert("inside fx()");
    // create a form with a couple of values
    var form = new FormData();
    form.append("name", "GeoJSON File");
    form.append("currFile", fileInputControl.files[0]);
    // send via XHR
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        console.log("Upload complete.");

        var reader = new FileReader();
        reader.onload = function(event) {
            var contents = event.target.result;
            //console.log("File contents: " + contents);
            geoJSONString = contents;

            var boundaryGeoJSON = new OpenLayers.Format.GeoJSON({'externalProjection': proj4326, 'internalProjection': proj900913});
            //var boundaryGeoJSON = new OpenLayers.Format.GeoJSON();
            polygonLayer.removeAllFeatures();
            polygonLayer.destroyFeatures();
            //polygonLayer.addFeatures([]);

            polygonLayer.addFeatures(boundaryGeoJSON.read(geoJSONString));

            /*yaha bata ho*/
            // Use this if you have to draw a polygon out of linear ring
            var geo = polygonLayer.features[0].geometry;
            //var geo2 = geo.transform(proj4326, proj900913);
            var sitePoints = polygonLayer.features[0].geometry.getVertices();
            var linearRing = new OpenLayers.Geometry.LinearRing(sitePoints);
            var geometry = new OpenLayers.Geometry.Polygon([linearRing]);
            var boundaryFeature = new OpenLayers.Feature.Vector(geometry);

            polygonLayer.removeAllFeatures();
            polygonLayer.destroyFeatures();
            //polygonLayer.addFeatures([]);
            //debugger;
            //polygonLayer.addFeatures(boundaryGeoJSON.read(geoJSONString));
            polygonLayer.addFeatures([boundaryFeature]);
            /*yaha samma ho*/

            polygonControl.events.triggerEvent('featureadded');

            //empty fileInputControl.files when done
            fileInputControl.files.length = 0;
            //alert(fileInputControl.files.length+ "from la la land");

        };
        reader.onerror = function(event) {
            console.error("File could not be read! Code " + event.target.error.code);
        };
        reader.readAsText(fileInputControl.files[0]);
    };
    xhr.open("post", "/entrypoint", true);
    xhr.send(form);

}

/*
function populateTagsSelector(amenity) {
    var myDiv = document.getElementById("tagsSelector");
    var heads = new Array();

    for (j = 0; j < amenity.features.length; ++j)
    {
        for (key in amenity.features[j].attributes)
        {
            //check if each attribute is unique
            //if it is unique, append it to 'heads' array
            //else don't add it and move on to check the next attribute

            //set flag for unique. unique = 0. duplicate = 1
            var flagUnique = 0;
            for (entry in heads)
            {
                if (heads[entry] == key)
                    flagUnique = 1; //means it is NOT unique. don't add it to 'heads' array
            }
            if (flagUnique == 0)
                //append this 'unique' key to 'heads' array
                heads.push(key)
        }
    }
    //add these only if there are other keys, i.e. add these only if the current layer is NOT empty
    if (heads.length > 0)
    {
        heads.push("lon"); //to hold x coordinate of the centroid
        heads.push("lat"); //to hold y coordinate of the centroid
        heads.push("geometry");	//to hold POLYGON(()) data
    }
    /////

    //Create and append the options

    /*	{
     var text = xmlhttp_tagChanger.responseText;
     text = text.replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g,'');
     text = text.replace(/\t/g,'');
     text = text.replace(/\n/g,'');
     var jsonObj = JSON.parse(text.replace(/\\/g,''));
     //debugger;\/

    var selectList = document.getElementById("tagsIn" + amenity.name);

    if (!jsonObj[amenity.name]) {
        for (var i = 0; i < heads.length; i++) {
            var option = document.createElement("option");
            option.value = heads[i];
            option.text = heads[i];
            var selectList = document.getElementById("tagsIn" + amenity.name);
            selectList.appendChild(option);
        }
    }
    else {
        for (var i = 0; i < heads.length; i++) {
            var option = document.createElement("option");
            option.value = heads[i];
            option.text = jsonObj[amenity.name][option.value] ? jsonObj[amenity.name][option.value] : option.value;
            selectList.appendChild(option);
        }
    }
    //	}			



    //////////Use these if tags don't need to be changed///////		
    /*for (var i = 0; i < heads.length; i++) {
     var option = document.createElement("option");
     option.value = heads[i];
     //original => option.text = heads[i];
     option.text
     var selectList = document.getElementById("tagsIn"+amenity.name);
     selectList.appendChild(option);
     }\/
    /////Use upto here/////////

}*/
                
function populateTagsSelector(amenity) {
    
    var myTagsSelector = document.getElementById('tagsSelector');    
    var title = document.createElement("h3");
    title.innerHTML = amenity.name;
    title.style.display = "inline";
    //myTagsSelector.appendChild(title);
    //Create and append select list
    var tagsSelectorGroup = document.createElement("div");
    tagsSelectorGroup.class="form group";
    tagsSelectorGroup.appendChild(title);
    var selectList = document.createElement("form");
    selectList.id = "tagsIn" + amenity.name;
    //selectList.multiple = "multiple";
    tagsSelectorGroup.appendChild(selectList);
    myTagsSelector.appendChild(tagsSelectorGroup);
    
    
    
    
    var myDiv = document.getElementById("tagsSelector");
    var heads = new Array();

    for (j = 0; j < amenity.features.length; ++j)
    {
        for (key in amenity.features[j].attributes)
        {
            //check if each attribute is unique
            //if it is unique, append it to 'heads' array
            //else don't add it and move on to check the next attribute

            //set flag for unique. unique = 0. duplicate = 1
            var flagUnique = 0;
            for (entry in heads)
            {
                if (heads[entry] == key)
                    flagUnique = 1; //means it is NOT unique. don't add it to 'heads' array
            }
            if (flagUnique == 0)
                //append this 'unique' key to 'heads' array
                heads.push(key)
        }
    }
    //add these only if there are other keys, i.e. add these only if the current layer is NOT empty
    if (heads.length > 0)
    {
        heads.push("lon"); //to hold x coordinate of the centroid
        heads.push("lat"); //to hold y coordinate of the centroid
        heads.push("geometry");	//to hold POLYGON(()) data
    }
    /////

    //Create and append the options

    /*	{
     var text = xmlhttp_tagChanger.responseText;
     text = text.replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g,'');
     text = text.replace(/\t/g,'');
     text = text.replace(/\n/g,'');
     var jsonObj = JSON.parse(text.replace(/\\/g,''));
     //debugger;*/

    //var selectList = document.getElementById("tagsIn" + amenity.name);

    if (!jsonObj[amenity.name]) {
        for (var i = 0; i < heads.length; i++) {
            
            var option = document.createElement("input");
            option.type="checkbox";
            option.value = heads[i];
            option.checked=true;
            //option.text = heads[i];
            
            var optionText = heads[i];
            
            
            var selectList = document.getElementById("tagsIn" + amenity.name);
            $("<div class='checklist option container'></div>")
                    .append(option)
                    .append("<div class='label'>"+optionText+"</div>")
                    .appendTo(selectList);
            //selectList.appendChild(option);
        }
    }
    else {
        for (var i = 0; i < heads.length; i++) {
            var option = document.createElement("input");
            option.type="checkbox";
            option.value = heads[i];
            option.checked=true;
            //option.text = jsonObj[amenity.name][option.value] ? jsonObj[amenity.name][option.value] : option.value;
            
            var optionText = jsonObj[amenity.name][option.value] ? jsonObj[amenity.name][option.value] : option.value;
            
            $("<div class='checklist option container'></div>")
                    .append(option)
                    .append("<div class='label'>"+optionText+"</div>")
                    .appendTo(selectList);
            
//            selectList.appendChild(option);
//            selectList.appendChild($("<div class='label'>"+optionText+"</div>")[0]);
        }
    }
    //	}			



    //////////Use these if tags don't need to be changed///////		
    /*for (var i = 0; i < heads.length; i++) {
     var option = document.createElement("option");
     option.value = heads[i];
     //original => option.text = heads[i];
     option.text
     var selectList = document.getElementById("tagsIn"+amenity.name);
     selectList.appendChild(option);
     }*/
    /////Use upto here/////////
    
    /**jedi-code**/
    $(selectList).find("div.label:contains(':')").text(function(ind, text){
        return text.replace(/:/g, " ");
    });
    /****/

}



function customExportToType(type) {
    //for every 'tagsInAmenity' inside div 'tagsSelector'
    //get selected 'tags' items
    //remove unselected 'tags' items from this cloned layer in clonedLayers
    //call ExportToCSV() on clonedLayers
    console.log("customExportToType: type = " + type);
    var selectedHeads = new Array();
    for (key in layers)
        clonedLayers[key] = layers[key].clone();
    var selectBoxes = document.getElementById('tagsSelector').getElementsByTagName('form');
    for (i = 0; i < selectBoxes.length; ++i)	//for each 'select' element
    {
        var currAmenityName = selectBoxes[i].id.replace("tagsIn", "");
        var currKey;
        for (key in clonedLayers)
        {
            if (clonedLayers[key].name == currAmenityName)
            {
                currKey = key;
                break;
            }
        }

        selectedHeads = new Array();
        var ob = selectBoxes[i];

        for (var j = 0; j < $(ob).find("input").length; j++)	//for each 'heads' in this (current) 'select' box
        {
            if ($(ob).find("input")[j].checked)
            {
                selectedHeads.push($(ob).find("input")[j].value);
            }
        }

        //for each feature in the current (this) amenity in clonedLayers
        for (var j = 0; j < clonedLayers[currKey].features.length; ++j) {
            //for each attribute in the current (this) feature in (this) amenity in clonedLayers
            for (attrKey in clonedLayers[currKey].features[j].attributes) {
                //delete the key-value pair that is NOT in selectedHeads array
                if (selectedHeads.indexOf(attrKey) < 0)
                    delete clonedLayers[currKey].features[j].attributes[attrKey];
            }
        }
        //alert(selectedHeads);
    }

    //call exportToCSV to work on clonedLayers
    //exportToCSV2();

    //determine export type and call appropriate exportTo... function
    /**jedicode**/
    switch (type)
    {
        case "exportToCSV":
            exportToCSV2(selectedHeads);
            break;
        case "exportToGeoJSON":
            exportToGeoJSON2(selectedHeads);
            break;
    }
}




/*
*function customExportToType(type) {
    //for every 'tagsInAmenity' inside div 'tagsSelector'
    //get selected 'tags' items
    //remove unselected 'tags' items from this cloned layer in clonedLayers
    //call ExportToCSV() on clonedLayers
    console.log("customExportToType: type = " + type);
    var selectedHeads = new Array();
    for (key in layers)
        clonedLayers[key] = layers[key].clone();
    var selectBoxes = document.getElementById('tagsSelector').getElementsByTagName('select');
    for (i = 0; i < selectBoxes.length; ++i)	//for each 'select' element
    {
        var currAmenityName = selectBoxes[i].id.replace("tagsIn", "");
        var currKey;
        for (key in clonedLayers)
        {
            if (clonedLayers[key].name == currAmenityName)
            {
                currKey = key;
                break;
            }
        }

        selectedHeads = new Array();
        var ob = selectBoxes[i];

        for (var j = 0; j < ob.options.length; j++)	//for each 'heads' in this (current) 'select' box
        {
            if (ob.options[j].selected)
            {
                selectedHeads.push(ob.options[j].value);
            }
        }

        //for each feature in the current (this) amenity in clonedLayers
        for (var j = 0; j < clonedLayers[currKey].features.length; ++j) {
            //for each attribute in the current (this) feature in (this) amenity in clonedLayers
            for (attrKey in clonedLayers[currKey].features[j].attributes) {
                //delete the key-value pair that is NOT in selectedHeads array
                if (selectedHeads.indexOf(attrKey) < 0)
                    delete clonedLayers[currKey].features[j].attributes[attrKey];
            }
        }
        //alert(selectedHeads);
    }

    //call exportToCSV to work on clonedLayers
    //exportToCSV2();

    //determine export type and call appropriate exportTo... function
    /**jedicode\\/
    switch (type)
    {
        case "exportToCSV":
            exportToCSV2(selectedHeads);
            break;
        case "exportToGeoJSON":
            exportToGeoJSON2(selectedHeads);
            break;
    }
}*
*/

/*
*function exportToCSV2(selectedHeads) {
    csvs.length = 0;				//empty the 'csvs' array
    for (i = 0; i < clonedLayers.length; ++i)
    {
        headers = new Array();			//get all keys from the key=value pairs
        csv_filename = clonedLayers[i].name; 	//name of CSV file. One CSV will be created per entry in the global 'layer' array
        csv_text = "";					//csv string. this is the final content of the csv file
        for (j = 0; j < clonedLayers[i].features.length; ++j)
        {
            for (key in clonedLayers[i].features[j].attributes)
            {
                //check if each attribute is unique
                //if it is unique, append it to 'headers' array
                //else don't add it and move on to check the next attribute

                //set flag for unique. unique = 0. duplicate = 1
                flagUnique = 0;
                for (entry in headers)
                {
                    if (headers[entry] == key)
                        flagUnique = 1; //means it is NOT unique. don't add it to 'headers' array
                }
                if (flagUnique == 0)
                    //append this 'unique' key to 'headers' array
                    headers.push(key)
            }
        }
        //add these only if there are other keys, i.e. add these only if the current layer is NOT empty
        //if (selectedHeads.length > 0)
        //////checking with selectedHeads like this does NOT work because selectedHeads only retains the selected items of the last box in the selection boxes region. if that last box is empty, then it won't add 'lat', 'lon', and 'geometry' in previous amenities as well /////////
        if (document.getElementById('tagsIn' + clonedLayers[i].name).selectedOptions.length > 0)
        {
            headers.push("lon"); //to hold x coordinate of the centroid
            headers.push("lat"); //to hold y coordinate of the centroid
            headers.push("geometry");	//to hold POLYGON(()) data
        }

        //write the csv headers to csv_text here
        csv_text = headers.toString();
        csv_text += "\n";

        //check if a key or key-value exists for each of the feature
        for (j = 0; j < clonedLayers[i].features.length; ++j) //for each feature in the current layer...
        {
            {
                //check if each key enlisted in 'headers' array has a corresponding value for this (current) feature
                //if the value exists, write down this value
                //if the value does not exist, write down a NULL (or nothing) in its place
                //at the end of every feature, add a carriage return
            }

            //for this feature
            var thisfeature = "";

            //get centroid of this (current) feature and transform it onto EPSG:4326
            var centroid = clonedLayers[i].features[j].geometry.getCentroid();
            clonedCentroid = centroid.clone();
            clonedCentroid = clonedCentroid.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));

            //get geometry of this (current) feature and transform it onto EPSG:4326
            var geometry = clonedLayers[i].features[j].geometry;
            clonedGeometry = geometry.clone();
            clonedGeometry.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));

            for (keyHeaders in headers)
            {
                if (clonedLayers[i].features[j].attributes[headers[keyHeaders]])
                {
                    //means the value exists in the current Feature. So this value has to be added to the csv file
                    csv_text += '\"' + clonedLayers[i].features[j].attributes[headers[keyHeaders]] + '\"' + ",";
                    //csv_text += clonedLayers[i].features[j].attributes[headers[keyHeaders]] +",";
                    thisfeature += '\"' + clonedLayers[i].features[j].attributes[headers[keyHeaders]] + '\"' + ",";
                    //thisfeature += clonedLayers[i].features[j].attributes[headers[keyHeaders]] +",";
                }
                else if (headers[keyHeaders] == 'lon')
                {
                    /*boundsLon = bounds.getCenterLonLat()['lon'];
                     csv_text += boundsLon + ",";\/
                    csv_text += '\"' + clonedCentroid.x + '\"' + ",";
                    //csv_text += clonedCentroid.x +",";
                    thisfeature += '\"' + clonedCentroid.x + '\"' + ",";
                    //thisfeature += clonedCentroid.x +",";
                }
                else if (headers[keyHeaders] == 'lat')
                {
                    /*boundsLat = bounds.getCenterLonLat()['lat'];
                     csv_text += boundsLat + ",";\/
                    csv_text += '\"' + clonedCentroid.y + '\"' + ",";
                    //csv_text += clonedCentroid.y +",";
                    thisfeature += '\"' + clonedCentroid.y + '\"' + ",";
                    //thisfeature += clonedCentroid.y +",";
                }
                else if (headers[keyHeaders] == 'geometry')
                {
                    //var geometry = clonedLayers[i].features[j].geometry.toString();
                    csv_text += '\"' + clonedGeometry.toString() + '\"';
                    //csv_text += '\"' + clonedGeometry.toString() + '\"';
                    //thisfeature += '\"' + clonedGeometry.toString() + '\"';
                    thisfeature += '\"' + clonedGeometry.toString() + '\"';
                }
                else //means the value does not exist in the current Feature. So add a 'nothing' value to the csv file
                {	//csv_text += ",";
                    csv_text += ",";
                    thisfeature += ",";
                }
            }
            csv_text += "\n"; //add a carriage return at the end of each Feature
            thisfeature += "\n";
            //alert(csv_text);
            //alert(thisfeature);
        }
        //alert (csv_text);
        //console.log(csv_text);
        //Replace all & with &&
        //csv_text = csv_text.replace(/&/g, "and");
        csv_text = encodeURIComponent(csv_text);
        //console.log(csv_text);
        //add to 'csvs' clonedLayers
        csvs.push(csv_text);
    }
    //Engaging AJAX
    //call AJAXCSV only if data exists
    if (csvs.length > 0)
        callAJAXCSV(0);
    else
        alert("No data to export!");
    //Disengaging MANAUL AJAX 

}*
*/

function customExportToGeoJSON() {
    //for every 'tagsInAmenity' inside div 'tagsSelector'
    //get selected 'tags' items
    //remove unselected 'tags' items from this cloned layer in clonedLayers
    //call ExportToCSV() on clonedLayers
    for (key in layers)
        clonedLayers[key] = layers[key].clone();
    var selectBoxes = document.getElementById('tagsSelector').getElementsByTagName('select');
    for (i = 0; i < selectBoxes.length; ++i)	//for each 'select' element
    {
        var currAmenityName = selectBoxes[i].id.replace("tagsIn", "");
        var currKey;
        for (key in clonedLayers)
        {
            if (clonedLayers[key].name == currAmenityName)
            {
                currKey = key;
                break;
            }
        }

        var selectedHeads = new Array();
        var ob = selectBoxes[i];

        for (var j = 0; j < ob.options.length; j++)	//for each 'heads' in this (current) 'select' box
        {
            if (ob.options[j].selected)
            {
                selectedHeads.push(ob.options[j].value);
            }
        }

        //for each feature in the current (this) amenity in clonedLayers
        for (var j = 0; j < clonedLayers[currKey].features.length; ++j) {
            //for each attribute in the current (this) feature in (this) amenity in clonedLayers
            for (attrKey in clonedLayers[currKey].features[j].attributes) {
                //delete the key-value pair that is NOT in selectedHeads array
                if (selectedHeads.indexOf(attrKey) < 0)
                    delete clonedLayers[currKey].features[j].attributes[attrKey];
            }
        }

    }
    //call exportToCSV to work on clonedLayers
    exportToGeoJSON2();
}

function exportToGeoJSON2(selectedHeads) {
    /*if(selectedHeads.length==0){
     alert("No tags selected! Please select at least one tag.");
     return;
     }*/

    geoJSONs.length = 0;				//empty the 'geoJSONs' array
    tempLayers = new Array();			//to hold clones of each layer from 'Layers' array
    for (i = 0; i < clonedLayers.length; ++i) 	//for each layer
    {
        tempLayers[i] = clonedLayers[i].clone();
        if (clonedLayers[i].features.length > 0) //for each layer with at least one feature in it
        {
            for (j = 0; j < clonedLayers[i].features.length; ++j) //for each feature in the current layer...
            {
                //get geometry of this (current) feature and transform it onto EPSG:4326
                var clonedGeometry = tempLayers[i].features[j].geometry;
                clonedGeometry = clonedGeometry.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));

                //////////
                if (selectedHeads.indexOf("lon") >= 0) {
                    centroidX = tempLayers[i].features[j].geometry.getCentroid().x;
                    tempLayers[i].features[j].attributes.lon = centroidX;
                }
                if (selectedHeads.indexOf("lat") >= 0) {
                    centroidY = tempLayers[i].features[j].geometry.getCentroid().y;
                    tempLayers[i].features[j].attributes.lat = centroidY;
                }
                //////////
            }
            var geoJSON = new OpenLayers.Format.GeoJSON();
            geoJSON = geoJSON.write(tempLayers[i].features, true);
            geoJSON = encodeURIComponent(geoJSON);
            
            geoJSONs.push(geoJSON);
        }
        else
            geoJSONs.push("\n");
    }
    //Engaging AJAX
    if (geoJSONs.length > 0)
        callAJAXGeoJSON(0);
    else
        alert("No data to export!");
    //Disengaging MANAUL AJAX 


}

//function update() {
//    if (polyCoords == "" || polyCoords == null || !polyCoords){
//        alert("No polygon to edit. Please draw a polygon first.");
//        /*var modes=document.getElementsByName('modifyType');
//        for (key in modes){
//            modes[key].checked=false;
//        }*/
//    }
//    else {
//        //alert("before triggering pL.e.afm");
//        //polygonLayer.events.triggerEvent('afterfeaturemodified');
//        
//        if (polygonControlModifier.active) {
//            polygonControlModifier.deactivate();
//        }
//
//        
//        // reset modification mode
//        polygonControlModifier.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
//        var rotate = document.getElementById("rotate").checked;
//        if (rotate) {
//            polygonControlModifier.mode |= OpenLayers.Control.ModifyFeature.ROTATE;//|
//        }
//        var resize = document.getElementById("resize").checked;
//        if (resize) {
//            polygonControlModifier.mode |= OpenLayers.Control.ModifyFeature.RESIZE;//|
//            var keepAspectRatio = document.getElementById("keepAspectRatio").checked;
//            if (keepAspectRatio) {
//                polygonControlModifier.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
//            }
//        }
//        var drag = document.getElementById("drag").checked;
//        if (drag) {
//            polygonControlModifier.mode |= OpenLayers.Control.ModifyFeature.DRAG;//|
//        }
//        if (rotate || drag) {
//            polygonControlModifier.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
//        }
//        polygonControlModifier.createVertices = document.getElementById("createVertices").checked;
//        //var sides = parseInt(document.getElementById("sides").value);
//        //sides = Math.max(3, isNaN(sides) ? 0 : sides);
//        //controls.regular.handler.sides = sides;
//        //var irregular =  document.getElementById("irregular").checked;
//        //controls.regular.handler.irregular = irregular;
//        //Those two !buggers are here now
//        polygonControlModifier.activate();
//        polygonControlModifier.selectFeature(polygonLayer.features[0]);
//        
//        /*var modes=document.getElementsByName('type');
//        for (key in modes){
//            modes[key].checked=false;
//        }*/
//
//
//        /* //Backup
//         // reset modification mode
//         polygonControlModifier.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
//         var rotate = document.getElementById("rotate").checked;
//         if (rotate) {
//         polygonControlModifier.mode |= OpenLayers.Control.ModifyFeature.ROTATE;
//         }
//         var resize = document.getElementById("resize").checked;
//         if (resize) {
//         polygonControlModifier.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
//         var keepAspectRatio = document.getElementById("keepAspectRatio").checked;
//         if (keepAspectRatio) {
//         polygonControlModifier.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
//         }
//         }
//         var drag = document.getElementById("drag").checked;
//         if (drag) {
//         polygonControlModifier.mode |= OpenLayers.Control.ModifyFeature.DRAG;
//         }
//         if (rotate || drag) {
//         polygonControlModifier.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
//         }
//         polygonControlModifier.createVertices = document.getElementById("createVertices").checked;
//         //var sides = parseInt(document.getElementById("sides").value);
//         //sides = Math.max(3, isNaN(sides) ? 0 : sides);
//         //controls.regular.handler.sides = sides;
//         //var irregular =  document.getElementById("irregular").checked;
//         //controls.regular.handler.irregular = irregular;
//         //Those two !buggers are here now
//         polygonControlModifier.activate();
//         polygonControlModifier.selectFeature(polygonLayer.features[0]);
//         //End of Backup */
//    }
//}








function exportToCSV2(selectedHeads) {
    csvs.length = 0;				//empty the 'csvs' array
    for (i = 0; i < clonedLayers.length; ++i)
    {
        headers = new Array();			//get all keys from the key=value pairs
        csv_filename = clonedLayers[i].name; 	//name of CSV file. One CSV will be created per entry in the global 'layer' array
        csv_text = "";					//csv string. this is the final content of the csv file
        for (j = 0; j < clonedLayers[i].features.length; ++j)
        {
            for (key in clonedLayers[i].features[j].attributes)
            {
                //check if each attribute is unique
                //if it is unique, append it to 'headers' array
                //else don't add it and move on to check the next attribute

                //set flag for unique. unique = 0. duplicate = 1
                flagUnique = 0;
                for (entry in headers)
                {
                    if (headers[entry] == key)
                        flagUnique = 1; //means it is NOT unique. don't add it to 'headers' array
                }
                if (flagUnique == 0)
                    //append this 'unique' key to 'headers' array
                    headers.push(key)
            }
        }
        //add these only if there are other keys, i.e. add these only if the current layer is NOT empty
        //if (selectedHeads.length > 0)
        //////checking with selectedHeads like this does NOT work because selectedHeads only retains the selected items of the last box in the selection boxes region. if that last box is empty, then it won't add 'lat', 'lon', and 'geometry' in previous amenities as well /////////
        if ($(document.getElementById('tagsIn' + clonedLayers[i].name)).find("input:checked").length > 0)
        {
            headers.push("lon"); //to hold x coordinate of the centroid
            headers.push("lat"); //to hold y coordinate of the centroid
            headers.push("geometry");	//to hold POLYGON(()) data
        }

        //write the csv headers to csv_text here
        csv_text = headers.toString();
        csv_text += "\n";

        //check if a key or key-value exists for each of the feature
        for (j = 0; j < clonedLayers[i].features.length; ++j) //for each feature in the current layer...
        {
            {
                //check if each key enlisted in 'headers' array has a corresponding value for this (current) feature
                //if the value exists, write down this value
                //if the value does not exist, write down a NULL (or nothing) in its place
                //at the end of every feature, add a carriage return
            }

            //for this feature
            var thisfeature = "";

            //get centroid of this (current) feature and transform it onto EPSG:4326
            var centroid = clonedLayers[i].features[j].geometry.getCentroid();
            clonedCentroid = centroid.clone();
            clonedCentroid = clonedCentroid.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));

            //get geometry of this (current) feature and transform it onto EPSG:4326
            var geometry = clonedLayers[i].features[j].geometry;
            clonedGeometry = geometry.clone();
            clonedGeometry.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));

            for (keyHeaders in headers)
            {
                if (clonedLayers[i].features[j].attributes[headers[keyHeaders]])
                {
                    //means the value exists in the current Feature. So this value has to be added to the csv file
                    csv_text += '\"' + clonedLayers[i].features[j].attributes[headers[keyHeaders]] + '\"' + ",";
                    //csv_text += clonedLayers[i].features[j].attributes[headers[keyHeaders]] +",";
                    thisfeature += '\"' + clonedLayers[i].features[j].attributes[headers[keyHeaders]] + '\"' + ",";
                    //thisfeature += clonedLayers[i].features[j].attributes[headers[keyHeaders]] +",";
                }
                else if (headers[keyHeaders] == 'lon')
                {
                    /*boundsLon = bounds.getCenterLonLat()['lon'];
                     csv_text += boundsLon + ",";*/
                    csv_text += '\"' + clonedCentroid.x + '\"' + ",";
                    //csv_text += clonedCentroid.x +",";
                    thisfeature += '\"' + clonedCentroid.x + '\"' + ",";
                    //thisfeature += clonedCentroid.x +",";
                }
                else if (headers[keyHeaders] == 'lat')
                {
                    /*boundsLat = bounds.getCenterLonLat()['lat'];
                     csv_text += boundsLat + ",";*/
                    csv_text += '\"' + clonedCentroid.y + '\"' + ",";
                    //csv_text += clonedCentroid.y +",";
                    thisfeature += '\"' + clonedCentroid.y + '\"' + ",";
                    //thisfeature += clonedCentroid.y +",";
                }
                else if (headers[keyHeaders] == 'geometry')
                {
                    //var geometry = clonedLayers[i].features[j].geometry.toString();
                    csv_text += '\"' + clonedGeometry.toString() + '\"';
                    //csv_text += '\"' + clonedGeometry.toString() + '\"';
                    //thisfeature += '\"' + clonedGeometry.toString() + '\"';
                    thisfeature += '\"' + clonedGeometry.toString() + '\"';
                }
                else //means the value does not exist in the current Feature. So add a 'nothing' value to the csv file
                {	//csv_text += ",";
                    csv_text += ",";
                    thisfeature += ",";
                }
            }
            csv_text += "\n"; //add a carriage return at the end of each Feature
            thisfeature += "\n";
            //alert(csv_text);
            //alert(thisfeature);
        }
        //alert (csv_text);
        //console.log(csv_text);
        //Replace all & with &&
        //csv_text = csv_text.replace(/&/g, "and");
        csv_text = encodeURIComponent(csv_text);
        //console.log(csv_text);
        //add to 'csvs' clonedLayers
        csvs.push(csv_text);
    }
    //Engaging AJAX
    //call AJAXCSV only if data exists
    if (csvs.length > 0)
        callAJAXCSV(0);
    else
        alert("No data to export!");
    //Disengaging MANAUL AJAX 

}