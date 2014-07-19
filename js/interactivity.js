

$(document).ready(function(){
    
    /**global error handler**/
    window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
        if(url.indexOf("OpenLayers")>-1){
            alert("Please upload a valid GeoJSON file.");  //in addition to origin-url of script error, try testing against .active/.passive state of #fileInput trigger
                                                            //or even better serve OpenLayers.js from the same domain as this web-app, then check for error source;
        }else{
            console.log('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
            + ' Column: ' + column + ' StackTrace: ' +  errorObj); //store it in an error-log rather than logging it on console
                                                                    //..like '<siteroot>/log/errorlog.txt'
        }
    };    
    /****/
    
    
    
        $("div.hiddenOnLoad").hide();
	init();
	//initPresetSelectFromList();  obsolete
        
//        $("#glass h3").css("max-width", $("#glass").outerWidth());
        
        $("#floatPanelsContainer").css("width", $(document).outerWidth()-130);
        $("#floatPanelsContainer").css("height", $(document).outerHeight());
        
        $("#fetchDataTrigger, #exportDataTrigger, .editTool").addClass("disabled");
        
        
        
        $("<a class='trigger closeButton' title='Close'><div class='icon'>X</div></a>")
            .appendTo("div.floatPanel")
            .click(function(){
                $("#"+
                    $(this).closest("[toggledBy]").attr("toggledBy")
                        ).click();
        });
                
        
        
        $("#OpenLayers_Control_MaximizeDiv").attr("title","Show Layer-switcher Panel");
        $("#OpenLayers_Control_MinimizeDiv").attr("title","Hide Layer-switcher Panel");
        $("a.olControlZoomIn").attr("title","Zoom In");
        $("a.olControlZoomOut").attr("title","Zoom Out");
        
        /**TEMPORARY**/
        /*  kept in comments: in case in-line css is required for these elements;
        
        $("#OpenLayers_Control_LayerSwitcher_6").css({
//            $(this).css({
//                right: $(document).outerWidth()-220,
//                top: $(document).outerHeight()-138-80,
                
                
                "float":"left",
                "left":"-3px",
                "top":"80px"
                
                
//            });
        });
        $("#OpenLayers_Control_LayerSwitcher_6_layersDiv").css({
            
            "padding-left":"20px",
            "padding-bottom":"20px",
            "background-color":"#666666",
            "border-top-right-radius":"10px",
            "border-bottom-right-radius":"10px",
            
            border: "#cccccc thin solid",
            "border-left":"none",
                "box-shadow": "3px 3px 6px rgba(50,50,50,0.6)",
                "font-family": "'Verdana', 'sans-serif'",
                "font-size":"10pt",
                "line-height":"10pt",
        });
        
        $("#OpenLayers_Control_MaximizeDiv").text("+").css({
//            $(this).css({
                position:"initial",
//                "margin-left": -220,
                transform: "rotate(180deg)",
                
                "font-size":"12pt",
                "text-align":"center",
                "background-color":"#666666",
                "border-top-left-radius":"10px",
                "border-bottom-left-radius":"10px"
//            });
        }).children("img").css({
            opacity:0
        });
        
        $("#OpenLayers_Control_MinimizeDiv").css({
//            $(this).css({
                //right: "2px",
                //bottom: "2px"
                position:"initial",
                "float":"right",
                "margin-right":"6px",
                "margin-top":"-24px",
                
//            });
        });
        
        $("#OpenLayers_Control_Zoom_2>a.olButton").css({
            "background-color":"#666666",
            opacity:1
        });
        */
        
        /****/
        
		
	/**panel expand/collapse**/
//	$(".trigger.panelTrigger.right-docked").click(function(){
//		
//		return false;
//	});
	
	$("#expandPanel").click(function(){
                $(".panel.right-docked").show("fast");
		$(this).hide();
	});
	$("#collapsePanel").click(function(){
                $(".panel.right-docked").hide("fast");
		$("#expandPanel").show();
	});
        /****/
        
        /**draw panel**//**draw panel**//**draw panel**//**draw panel**/
        
        /*modify vector*/
        $("#drawControls").find(".editTool").not(".pen, .circle").click(function(e){
            if($(this).hasClass("disabled"))return;
            if(!($(e.target).is($(this).find("div, div>*")))){
                console.log("a polgyon editor tool selected!!"+$(this)[0].id);
                //console.log($(".editTool input").click());
                $(this).siblings().removeClass("active");
                $(this).siblings().addClass("passive");
                //$(this).find("input").parent().toggle();
                $(this).toggleClass("active passive");
            }
           //console.log("calling callPolygonEditorHandles with tool: "+$($(this).filter(".active")));
           console.log($(this).filter(".active").callPolygonEditorHandles());
        });
        /**/
        
        
        
              
        /*draw panel toggle*/
        $("#drawControlsToggle").click(function(){
            
           if($(this).hasClass("disabled"))return;
           
           $("#drawControls").toggle(0,function(){
               /*make drawControls panel, if not already draggable, draggable*/
                try{
                    console.log($(this).draggable("option"));
                }catch(e){
                    $(this).draggable({
                        handle:"div",
                        /*grid: [80,40],*/
                        snap: ".panel",
                        snapMode: "outer",
                        containment: "#floatPanelsContainer",
                        scroll: false
                        /*,cursorAt: { top: 14, left: 120 }*/
                    });
                }
               /**/
            });
           $(this).toggleClass("passive active"); 
        });
        /**/
        
        
        
        /*pen toggle*/
        $("a.tool").click(function(){
           if($(this).hasClass("disabled") || ($(this).hasClass("confirm") && !confirm("This will clear any existing boundary polygon and enable drawing of a new one.")))return;
           $(this).add($(this).siblings()).add("#fetchDataTrigger").removeClass("confirm");
           $(this).siblings(".editTool").addClass("disabled");
           $(this).siblings().removeClass("active").addClass("passive");
           $(this).toggleClass("passive active"); //class switch for active/passive state actions and css
           toggleControl(this); //call pen active method
        });
        /**/
        
        /****//****//****//****//****/
        
        /**import polygon**/
        $("#importPolygonTrigger").click(function(e){
           if($(this).hasClass("disabled") || ($(this).hasClass("confirm") && !confirm("This will clear any existing boundary polygon and enable drawing of a new one.")))return;
           $("a.tool").removeClass("active").addClass("passive").add(this).removeClass("confirm");
           $(this).toggleClass("passive active");
           toggleControl(this);
        });
        /****/
        
        /**export data**/
        $("a.trigger.exportData").click(function(){
            if($(this).hasClass("disabled"))return;
            if(!$("#tagsSelector").children().length){
                console.log("no data to export");
                return;
            }
            $(".splashContainerBase").toggleClass("passive active");     //class switch for active/passive state actions and css
            $(this).toggleClass("passive active"); //class switch for active/passive state actions and css 
            return;
        });
        
        $("#splashContainer").find("a.download.trigger.active").click(function(){
            customExportToType($("#splashContainer").find("div.checkbox>input:checked")[0].value);
            $("#splashContainer").parent(".splashContainerBase").toggleClass("active passive");
        });
        /****/
        
        
		
	
	//$(".selectFrom>li>a").click(function(){
//		$(this).toggleClass("item","active");
//	});
	
        
        /**presect selector (#selectFrom) autocomplete**/
        var toDownload = [{"id":"schools","value":"school"}, {"id":"colleges","value":"college"}, {"id":"hospitals","value":"hospital"}];
        //a hard-coded json array "toDownload" used for the time being
        $(function() {
            $( "#selectFrom" ).autocomplete({
                autoFocus:true,
              //source: "http://jqueryui.com/resources/demos/autocomplete/search.php",
                source: toDownload,
                minLength: 0,
                select: function( event, ui ) {
                            $("<li class='presetItem' id='listItem_"+ui.item.id+"'>"+ui.item.value+"</li>")
                            .appendTo($("#selectedPresets"))
                            .append($("<div class='delItem'><a title='Remove preset' href='#'><img src='img/minus.png'/></a></div>").click(function(){
                                        var arj = {
                                            "id": $(this).closest("li.presetItem").attr("id").replace("listItem_",""),
                                            "value": $(this).closest("li.presetItem").text()
                                        };
                                        $("#selectFrom").autocomplete("option","source").push(arj);
                                        $(this).closest("li.presetItem").remove();
                                        if(!$("#selectedPresets").children("li").length) $("#fetchDataTrigger").addClass("disabled");
                                    }));
                            $("#panelContent").scrollTop(100000);
                            
                            if($("#"+polygonLayer.id).find("path").length) $("#fetchDataTrigger").removeClass("disabled");
                            
                            console.log(
                                        $(this).autocomplete("option","source")
                                        .splice(
                                            $(this).autocomplete("option","source").map(function(o){
                                                return o.value;
                                            }).indexOf(ui.item.value)
                                        ,1)
                                    );
                            
                    }
            });
          });
          
        $("#selectFrom").click(function(){
           $(this).val("");
           $(this).autocomplete("search");
           $(this).autocomplete("enable"); 
        });
        /****/
        
        /**fetch data from overpass**/
        $("#fetchDataTrigger").click(function(){
            if($(this).hasClass("disabled") || ($(this).hasClass("confirm") && !confirm("This will clear all data not saved to disk and download fetch new data for the new boundary.")))return;
            $(this).removeClass("confirm");
            //check if polyCoords is defined and is not empty
		if (polyCoords ==="" || !polyCoords){
			alert ("Please select the area first");
			return;
		}
		//check if the layers are selected
		else if ($("#selectedPresets li").length<=0){
			alert ("Please select at least one item in the Features List");
			return;
		}
            selected = new Array();
//		var ob = document.getElementById("selectedPresets");
//		for (var i = 0; i < ob.options.length; i++)
//			if (ob.options[i].selected){
//				selected.push(ob.options[i].value);
//		}
                $("#selectedPresets li").each(function(i){
                    selected.push($(this).text());
                });
                console.log(selected);
                fetchData(selected);
        });
        /****/
        

});