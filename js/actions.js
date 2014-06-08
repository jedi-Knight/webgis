//$(document).ready(function() {
////OpenLayers.ProxyHost= "/cgi-bin/proxy.cgi?url=";	
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
            geom;
    var markers = new OpenLayers.Layer.Markers("Markers", {displayInLayerSwitcher: false});

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
            drawControls,
            polyCoords;

    //var mapProjectionObject;
    var fileInputControl;

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

//        map.addControl(new OpenLayers.Control.LoadingPanel());
        bing = new OpenLayers.Layer.Bing({name: "Bing Aerial Layer", type: "Aerial", key: "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf", });
        osm = new OpenLayers.Layer.OSM("OSM", null, {sphericalMercator: false, attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors (ODbL)"});
        wmsLayer = new OpenLayers.Layer.WMS("OpenLayers WMS", "http://vmap0.tiles.osgeo.org/wms/vmap0?", {layers: 'basic'});

        polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer", {
            projection: "EPSG:4326",
            strategies: [new OpenLayers.Strategy.Refresh({force: true})]
        });

        map.addLayer(osm);
        map.addLayer(wmsLayer);
        map.addLayer(bing);
        map.addLayer(markers);
        map.addLayer(polygonLayer);
        map.setCenter(center.transform(proj4326, proj900913), zoom);



        polygonControl = new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.Polygon);
        map.addControl(polygonControl);

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
            if (!polygonLayer)
                alert("No polygonLayer found");
            //deactivate polygon drawing control
            polygonControl.deactivate();
            arrVerticesInPoints = new Array();
            arrVerticesInLonLat = new Array();
            //get all vertices from the polygon
            arrVerticesInPoints = polygonLayer.features[0].geometry.getVertices();
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
        });






    }

    function fetchData(selected) {
        //check if polyCoords is defined and is not empty
//        if (polyCoords === "" || !polyCoords) {
//            alert("Please select the area first");
//            //polyCoords="27.659753076788895 85.32642645564943 27.667507040814073 85.33372206416978 27.675564498945647 85.34432215419675 27.678908929687523 85.34955782619387 27.68476143708768 85.34942908016117 27.695325558898006 85.3550295325846 27.698764377992212 85.35507244792822 27.703209983526893 85.35204691615972 27.705736678599447 85.35176796642163 27.706306601731157 85.35067362514364 27.705850663463945 85.34629626003179 27.70727546422261 85.34430069652493 27.70786437643433 85.34303469386973 27.71895812852004 85.34715456691619 27.724884465095315 85.34492296901571 27.72974685963202 85.34595293727823 27.73810359343915 85.34080309596926 27.741749967349016 85.33410830226788 27.735672609701027 85.3186587783419 27.735824547773834 85.30526919094004 27.727315689475553 85.30475420680922 27.724732511771773 85.2973727675998 27.7185022431338 85.28363985744348 27.69342561238167 85.28192324367473 27.689321615053014 85.28518480983679 27.687649571911795 85.29084963527566 27.685521479973392 85.2944545241922 27.68415339896989 85.30217928615521 27.6750324209783 85.30235094753154 27.666822889645175 85.30835909572488 27.665150502091006 85.31402392116463 27.658156604150122 85.3234652968973";
//            return;
//        }
//        //check if the layers are selected
//        //else
//        if (document.getElementById('facilityList').options.selectedIndex < 0) {
//            alert("Please select at least one item in the Features List");
//            return;
//        }
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

//        selected = new Array();
//        var ob = document.getElementById('facilityList');
//        for (var i = 0; i < ob.options.length; i++)
//            if (ob.options[i].selected) {
//                selected.push(ob.options[i].value);
//            }

        for (sel in selected) {
            //debugger;
            switch (selected[sel]) {
                case 'school':
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
                                //styleMap: new OpenLayers.StyleMap({'default':new OpenLayers.Style({'strokeWidth': 1,fillColor:"blue"})})
                    });
                    map.addLayers([school]);
                    layers.push(school);
                    school.events.on({"featuresadded": function(features) {
                            document.getElementById(school.name + 'Count').innerHTML = school.features.length;
                            //populate selectTagsInLayers
                            populateTagsSelector(school);
                        }});
                    break;

                case 'hospital':
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
                    });
                    map.addLayers([hospital]);
                    layers.push(hospital);
                    hospital.events.on({"featuresadded": function(features) {
                            document.getElementById(hospital.name + 'Count').innerHTML = hospital.features.length;
                            populateTagsSelector(hospital);
                        }});
                    break;

                case 'college':
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
                    });
                    map.addLayers([college]);
                    layers.push(college);
                    college.events.on({"featuresadded": function(features) {
                            document.getElementById(college.name + 'Count').innerHTML = college.features.length;
                            populateTagsSelector(college);
                        }});
                    break;
            }
        }
    }

    //for polygon
    function toggleControl(element) {
        var control = polygonControl;
			if($(element).hasClass("active") && $(element).hasClass("pen")){
            polygonLayer.removeAllFeatures();	//remove all features from the polygonLayer
            polyCoords = "";	//remove old coordinates from polyCoords array
            //document.getElementById('file-input').disabled = true;
            control.activate();
        }
        else if (element.value = 'importGeoJSON' && element.checked) {
            //activate the file-input
            document.getElementById('file-input').disabled = false;
            fileInputControl = document.getElementById('file-input');
            fileInputControl.addEventListener("change", function(event) {
                // When the control has changed, there are new files
                var i = 0,
                        files = fileInputControl.files,
                        len = files.length;
                for (; i < len; i++) {
                    //console.log("Filename: " + files[i].name);
                    //console.log("Type: " + files[i].type);
                    //console.log("Size: " + files[i].size + " bytes");
                }
                if (fileInputControl.files.length != 0) {
                    fx(fileInputControl);
                }
            }, false);
            fileInputControl.addEventListener("close", function(event) {
                alert("aborted");
                polyCoords = "";
            }, false);
        }
    }

    //for polygon
    function allowPan(element) {
        var stop = !element.checked;
        polygonControl.handler.stopDown = stop;
        polygonControl.handler.stopUp = stop;
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
                        //csv_text += '\"'+layers[i].features[j].attributes[headers[keyHeaders]]+'\"' +",";
                        csv_text += layers[i].features[j].attributes[headers[keyHeaders]] + ",";
                        //thisfeature += '\"'+layers[i].features[j].attributes[headers[keyHeaders]]+'\"' +",";
                        thisfeature += layers[i].features[j].attributes[headers[keyHeaders]] + ",";
                    }
                    else if (headers[keyHeaders] == 'lon')
                    {
                        /*boundsLon = bounds.getCenterLonLat()['lon'];
                         csv_text += boundsLon + ",";*/
                        //csv_text += '\"'+clonedCentroid.x+'\"'  +",";
                        csv_text += clonedCentroid.x + ",";
                        //thisfeature += '\"'+clonedCentroid.x+'\"'  +",";
                        thisfeature += clonedCentroid.x + ",";
                    }
                    else if (headers[keyHeaders] == 'lat')
                    {
                        /*boundsLat = bounds.getCenterLonLat()['lat'];
                         csv_text += boundsLat + ",";*/
                        //csv_text += '\"'+clonedCentroid.y+'\"'  +",";
                        csv_text += clonedCentroid.y + ",";
                        //thisfeature += '\"'+clonedCentroid.y+'\"'  +",";
                        thisfeature += clonedCentroid.y + ",";
                    }
                    else if (headers[keyHeaders] == 'geometry')
                    {
                        //var geometry = layers[i].features[j].geometry.toString();
                        //csv_text += '\"' + clonedGeometry.toString() + '\"';
                        csv_text += '\"' + clonedGeometry.toString() + '\"';
                        thisfeature += '\"' + clonedGeometry.toString() + '\"';
                        //thisfeature += '\"' + clonedGeometry.toString() + '\"';
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

    function callAJAXCSV(index) {
        //alert(index + "," + layers[index].name + "," + csvs[index]);
        if (index == layers.length)
            return;//do nothing. we are done here.
        if (csvs[index] === "\n")
            callAJAXCSV(index + 1);	//do not make a csv file if does not have any data. move on to the next item in 'csvs' array.
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

                }
                if (xmlhttp.readyState == 4)
                {
                    //window.open(xmlhttp.response);
                    myButton = document.createElement("input");
                    myButton.type = "button";
                    myButton.value = xmlhttp.response;
                    myButton.onclick = function() {
                        window.open(xmlhttp.response)
                    };
                    placeHolder = document.getElementById("exportStatus");
                    placeHolder.appendChild(myButton);
                    callAJAXCSV(index + 1);
                }
            }
            var query = "CSVwriter.php";
            xmlhttp.open("POST", query, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send("name=" + layers[index].name + "&payload=" + csvs[index]);
            //alert(layers[i].name + " AJAX sent.\n Current xmlhttp index is: "+i +"\n");
        }
    }

    function callAJAXGeoJSON(index) {
        if (index == layers.length) {
            return; //do nothing. we are done here.
        }
        if (geoJSONs[index] === "\n")
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

                }
                if (xmlhttp.readyState == 4)
                {
                    //window.open(xmlhttp.response);
                    myButton = document.createElement("input");
                    myButton.type = "button";
                    myButton.value = xmlhttp.response;
                    myButton.onclick = function() {
                        window.open(xmlhttp.response)
                    };
                    placeHolder = document.getElementById("exportStatus");
                    placeHolder.appendChild(myButton);
                    callAJAXGeoJSON(index + 1);
                }
            }
            var query = "GeoJSONwriter.php";
            xmlhttp.open("POST", query, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send("name=" + layers[index].name + "&payload=" + geoJSONs[index]);
            //alert(layers[i].name + " AJAX sent.\n Current xmlhttp index is: "+i +"\n");
        }
    }

    function fx(fileInputControl) {
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
                polygonLayer.addFeatures([]);

                polygonLayer.addFeatures(boundaryGeoJSON.read(geoJSONString));

                /*
                 // Use this if you have to draw a polygon out of linear ring
                 var geo = polygonLayer.features[0].geometry;
                 var geo2 = geo.transform(proj4326, proj900913);
                 var sitePoints = polygonLayer.features[0].geometry.getVertices();
                 var linearRing = new OpenLayers.Geometry.LinearRing(sitePoints);
                 var geometry = new OpenLayers.Geometry.Polygon([linearRing]);
                 var boundaryFeature = new OpenLayers.Feature.Vector(geometry);
                 
                 polygonLayer.removeAllFeatures();
                 polygonLayer.destroyFeatures();
                 polygonLayer.addFeatures([]);
                 //polygonLayer.addFeatures(boundaryGeoJSON.read(geoJSONString));
                 polygonLayer.addFeatures([boundaryFeature]);*/

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

    function populateTagsSelector(amenity) {
        //var clonedAmenity = amenity.clone();
        //clonedLayers.push(clonedAmenity);
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

        //create and append Amenity Name
        var title = document.createElement("h3");
        title.innerHTML = amenity.name;
        title.style.display = "inline";
        myDiv.appendChild(title);

        //Create and append select list
        var selectList = document.createElement("select");
        selectList.id = "tagsIn" + amenity.name;
        selectList.multiple = "multiple"
        myDiv.appendChild(selectList);

        //Create and append the options
        for (var i = 0; i < heads.length; i++) {
            var option = document.createElement("option");
            option.value = heads[i];
            option.text = heads[i];
            selectList.appendChild(option);
        }


    }

    function customExportToCSV() {
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
        exportToCSV2();
    }

    function exportToCSV2() {
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
                        //csv_text += '\"'+clonedLayers[i].features[j].attributes[headers[keyHeaders]]+'\"' +",";
                        csv_text += clonedLayers[i].features[j].attributes[headers[keyHeaders]] + ",";
                        //thisfeature += '\"'+clonedLayers[i].features[j].attributes[headers[keyHeaders]]+'\"' +",";
                        thisfeature += clonedLayers[i].features[j].attributes[headers[keyHeaders]] + ",";
                    }
                    else if (headers[keyHeaders] == 'lon')
                    {
                        /*boundsLon = bounds.getCenterLonLat()['lon'];
                         csv_text += boundsLon + ",";*/
                        //csv_text += '\"'+clonedCentroid.x+'\"'  +",";
                        csv_text += clonedCentroid.x + ",";
                        //thisfeature += '\"'+clonedCentroid.x+'\"'  +",";
                        thisfeature += clonedCentroid.x + ",";
                    }
                    else if (headers[keyHeaders] == 'lat')
                    {
                        /*boundsLat = bounds.getCenterLonLat()['lat'];
                         csv_text += boundsLat + ",";*/
                        //csv_text += '\"'+clonedCentroid.y+'\"'  +",";
                        csv_text += clonedCentroid.y + ",";
                        //thisfeature += '\"'+clonedCentroid.y+'\"'  +",";
                        thisfeature += clonedCentroid.y + ",";
                    }
                    else if (headers[keyHeaders] == 'geometry')
                    {
                        //var geometry = clonedLayers[i].features[j].geometry.toString();
                        //csv_text += '\"' + clonedGeometry.toString() + '\"';
                        csv_text += '\"' + clonedGeometry.toString() + '\"';
                        thisfeature += '\"' + clonedGeometry.toString() + '\"';
                        //thisfeature += '\"' + clonedGeometry.toString() + '\"';
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

    function exportToGeoJSON2() {
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
//});