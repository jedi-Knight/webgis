/**obsolete**/
////global variables:
//var presets = {"school":{"amenity":["school"]}, "hospital":{"amenity":["hospital"]}, "household":{"building":["yes"],"owner":["*"]}, "government office":{"office":["government"]}};

//var selected = [];
//

//function initPresetSelectFromList(){
//	for(var key in presets){
//			$("#selectFrom").append("<option class='item'>"+key+"</option>");
//		}
//}
/****/




$(document).ready(function(){
        $("div.hiddenOnLoad").hide();
	init();
	//initPresetSelectFromList();  obsolete
        
        $("h3").css("max-width", $("#glass").outerWidth());
        
        $("#floatPanelsContainer").css("width", $(document).outerWidth());
        $("#floatPanelsContainer").css("height", $(document).outerHeight());
        
        $("#fetchDataTrigger, #exportDataTrigger, .editTool").addClass("disabled");
        
        
        
        /**TEMPORARY**/
//        $("#OpenLayers_Control_MaximizeDiv").css({
////            $(this).css({
//                right: $(document).outerWidth()-20,
//                top: $(document).outerHeight()-20,
//                transform: "rotate(180deg)"
////            });
//        });
        $("#OpenLayers_Control_LayerSwitcher_6").css({
//            $(this).css({
                right: $(document).outerWidth()-220,
                top: $(document).outerHeight()-138-80,
                transform: "rotate(180deg)",
                
                
                
//            });
        });
        $("#OpenLayers_Control_LayerSwitcher_6_layersDiv").css({
            transform: "rotate(180deg)",
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
                "margin-left": 202,
                "margin-bottom": -18,
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
                right: "2px",
                top: "2px"
                
//            });
        });
        
        $("#OpenLayers_Control_Zoom_2>a.olButton").css({
            "background-color":"#666666",
            opacity:1
        });
        
        
        /****/
        
		
	/**panel expand/collapse**/
//	$(".trigger.panelTrigger.right-docked").click(function(){
//		
//		return false;
//	});
	
	$("#expandPanel").click(function(){
                $(".panel.right-docked").toggle("fast");
		$(this).hide();
	});
	$("#collapsePanel").click(function(){
                $(".panel.right-docked").toggle("fast");
		$("#expandPanel").show();
	});
        /****/
        
        /**draw panel**//**draw panel**//**draw panel**//**draw panel**/
        
        /*draw circle*/
        $("#circleToggle").click(function(){
           if($(this).hasClass("disabled"))return;
           drawRegularPolygon(); 
        });
        /**/
        
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
               /*make drawControls panel draggable*/
                $(this).draggable({
                    handle:"div",
                    grid: [80,40],
                    snap: ".panel",
                    snapMode: "outer",
                    containment: "#floatPanelsContainer",
                    scroll: false
                });
               /**/
           });
           $(this).toggleClass("passive active"); 
        });
        /**/
        
        
        
        /*pen toggle*/
        $(".tool").click(function(){
           if($(this).hasClass("disabled"))return;
           $(this).toggleClass("passive active"); //class switch for active/passive state actions and css
           guiPanelShowPresetSelector();//show 'warning: clears boundary polygon layer,' and show presets panel if user proceeds
           toggleControl(this); //call pen active method
        });
        /**/
        
        /****//****//****//****//****/
        
        /**import polygon**/
        $("a.trigger.inputTrigger").click(function(){
           if($(this).hasClass("disabled"))return;
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
        
        /**switch off all tools on double-clicking on map**/
        $(document).dblclick(function(){
           $(".tool").removeClass("active");
           $(".tool").addClass("passive");
        });
        /****///TODO: need to add event listener on openlayers map/layer
        
        
		
	
	//$(".selectFrom>li>a").click(function(){
//		$(this).toggleClass("item","active");
//	});
	
        
        /**presect selector (#selectFrom) autocomplete**/
        var toDownload = [{"id":"schools","value":"school"}, {"id":"colleges","value":"college"}, {"id":"hospitals","value":"hospital"}, {"id":"government offices","value":"government office"}];
        $(function() {
            function log( message ) {
              $( "<div>" ).text( message ).prependTo( "#log" );
              $( "#log" ).scrollTop( 0 );
            }

            $( "#selectFrom" ).autocomplete({
                autoFocus:true,
              //source: "http://jqueryui.com/resources/demos/autocomplete/search.php",
                source: toDownload,
                minLength: 0,
                select: function( event, ui ) {
                            $("<li class='presetItem'>"+ui.item.value+"</li>")
                            .appendTo($(".presets #selectedPresets"))
                            .append($("<div class='delItem'><a title='Remove preset' href='#'><img src='img/minus.png'/></a></div>").click(function(){
                                        $(this).closest("li.presetItem").remove();
                                    }));
                            $("#panelContent").scrollTop(100000);
                            
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
            if($(this).hasClass("disabled"))return;
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
        
        
        
        
        
        
        
//	$("#add").click(function(){
//		$("#selectedPresets").append("<li class='presetItem'>"+$("#selectFrom .item:selected").text()+"</li>");
//		$("#selectFrom .item:selected").remove();
//	});
});