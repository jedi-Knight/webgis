function geocoder()
	{
        addr = document.getElementById('search').value;
		nominatimURL =  "http://nominatim.openstreetmap.org/search";
		nominatimURL += "?q=" + addr + ",bagmati,nepal" + "&format=xml&polygon=1&addressdetails=1";
		//alert(nominatimURL);
				
		/////Sazal
		var xmlhttp;
		if (window.XMLHttpRequest)
		{// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		}
		else
		{// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange=function()
		{
			if(xmlhttp.readyState==3||xmlhttp.readyState==2||xmlhttp.readyState==1||xmlhttp.readyState==0)
			{
				document.getElementById('relocater').style.display='block';
				//document.getElementById('instructionline').innerHTML="Relocating....";
			}
			if (xmlhttp.readyState==4 && xmlhttp.status==200)
			{
				//alert("Database Updated!");
				var xmlDoc;
								
				//////////////////////////////////////////////////////////////
				try //Internet Explorer
				{
					//alert("trying ie");
					xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
					xmlDoc.async=false;
					//xmlDoc.load("myXML.xml");
					xmlDoc=xmlhttp.responseXML;
				}
				catch(e)
				{
					try //Firefox, Mozilla, Opera, etc.
					{
						//alert("trying firefox");
						xmlDoc=document.implementation.createDocument("","",null);
						xmlDoc.async=false;
						//xmlDoc.load("myXML.xml");
						//alert("firefox worked?");
						xmlDoc=xmlhttp.responseXML;
						
					}
					catch(e) 
					{
						
						try //Google Chrome
						{
							//var xmlhttp2 = new window.XMLHttpRequest();
							//alert("trying Google Chrome");
							xmlhttp2 = new window.XMLHttpRequest();
							//alert("trying Google Chrome2");
							xmlhttp2.open("GET",nominatimURL, false);
							//alert("trying Google Chrome3");
							xmlhttp2.send(null);
							//alert("trying Google Chrome4");
							xmlDoc = xmlhttp2.responseXML;
						}
						catch(e)
						{
							alert(error=e.message);
						}
					}
				}
				try
				{
					//xmlDoc.async=false;
					//xmlDoc.load("myXML.xml");
					//return(xmlDoc);
				}
				catch(e) {alert(e.message)}
				
				
				///////////sazal1////////////
				var markerNodes = xmlDoc.documentElement.getElementsByTagName("place");
				
				//engaging
				if(markerNodes.length==0)
				{
					document.getElementById('noSuchPlaceFound').style.display="block";
					setTimeout(function(){document.getElementById('noSuchPlaceFound').style.display="none";},2000);
					
					//document.getElementById('instructionline').innerHMTL="No such place found!";
					//setTimeout(function(){document.getElementById('instructionline').innerHTML="Click on the building";},2000);	
				}	
				//disengaging		
				for (var i = 0; i < markerNodes.length; i++) 
				{
					var lat = markerNodes[i].getAttribute("lat");
					var lon = markerNodes[i].getAttribute("lon");
										
					numLat = parseFloat(lat);
					numLon = parseFloat(lon);
					
					//alert(numLat + "," + numLon);
										
					map.setCenter(new OpenLayers.LonLat(numLon, numLat).transform(proj4326,proj900913),zoom);
					map.setBaseLayer(osm);
				}
				///////////sazal1/////////////
				document.getElementById('relocater').style.display='none';
				//document.getElementById('instructionline').innerHMTL="Click on the building";
			}
		}
		var queryString = "?t="+Math.random();
		xmlhttp.open("GET", nominatimURL + "&t=" +Math.random(), true);
		xmlhttp.send();
		//sazal
		
	}



function geolocate(){
		navigator.geolocation.getCurrentPosition(function(position) {       
            document.getElementById('search').innerHTML="Latitude: " + position.coords.latitude + "   Longitude: " +
            position.coords.longitude + "<p>";
            var lonLat = new OpenLayers.LonLat(position.coords.longitude,
                                    position.coords.latitude)
                      .transform(
                                  new OpenLayers.Projection("EPSG:4326"), //transform from WGS 1984
                                              map.getProjectionObject() //to Spherical Mercator Projection
                                            );   
                                            markers.addMarker(new OpenLayers.Marker(lonLat));       
            map.setCenter(lonLat,zoom);
            alert("your position is located");
           
        });
    }