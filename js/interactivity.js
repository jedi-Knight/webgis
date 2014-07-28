                                  

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
        
        $("#floatPanelsContainer").css("width", $(document).outerWidth()-160);
        $("#floatPanelsContainer").css("height", $(document).outerHeight());
        
        $("#fetchDataTrigger, #exportDataTrigger, .editTool, .trigger.delete, .tool.delete").addClass("disabled");
        
        
        
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
	var triggerLabel;
	$("#expandPanel").click(function(){
                if($(this).hasClass("disabled")) return;
                //$("div.button-group.top-right a.top-docked-trigger").addClass("minified");
                $(this).siblings().addClass("minified");
                $(this).parent().removeClass("init-state");
                $(this).parent().addClass("contains-minified-triggers");
                $(".panel.right-docked").show("fast");
		$(this).addClass("disabled");
                triggerLabel = this.title;
                this.title="";
	});
	$("#collapsePanel").click(function(){
                $(".panel.right-docked").hide("fast");
		$("#expandPanel").removeClass("disabled")[0].title=triggerLabel;
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
           if($(this).hasClass("disabled") || ($(this).hasClass("confirm") && !confirm(function(element){
               //console.log(element);
               if($(element).hasClass("delete")) return "This will clear the boundary polygon";
               else return "This will clear any existing boundary polygon and enable drawing of a new one.";
           }(this))))return;
           $(this).parent().children().add("#fetchDataTrigger").removeClass("confirm");
           $("#fetchDataTrigger").addClass("disabled");
           $(this).siblings(".editTool, .delete").addClass("disabled");
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
            
            
            
            if($(".splashContainerBase").toggleClass("passive active").hasClass("active")){     //class switch for active/passive state actions and css
                $("#tagsSelector").parent(".container").css({
                "min-width" : function(){
                                console.log($("#tagsSelector>div").length);
                                 return ($("#tagsSelector>div").length-1) ? 650 : 327;
                             }
                  });
            }    
            $(this).toggleClass("passive active"); //class switch for active/passive state actions and css 
            return;
        });
        
        $("#splashContainer").find("a.download.trigger").click(function(){
            if($(this).hasClass("disabled")) return;
            miti = Date();
            customExportToType($("#splashContainer").find("div.checkbox>input:checked")[0].value);
            $("#splashContainer").parent(".splashContainerBase").toggleClass("active passive");
        });
        
        /*enable save-to-disk button only if at least one item is selected*/
        $("#splashContainer").click(function(e){
            
            if(!$(e.target).is("input:checkbox")) return;
            
            console.log($(e.target));
            
            if($(e.target).is(".select-group")){
                $(e.target).parent().siblings("form").find("input:checkbox").prop("checked",$(e.target)[0].checked);
                $(e.target).removeClass("checkbox-half-state");
                $(e.target).prop("title", function(){
                   return $(this)[0].checked 
                                            ?$(this)[0].title.replace("Select", "De-select") 
                                            :$(this)[0].title.replace("De-select", "Select");
                
                });
                
            }else if($(e.target).closest("form").length){
                $(e.target).closest("form").siblings("h3").children("input:checkbox")
                        .toggleClass("checkbox-half-state", function(){
                            return Boolean($(e.target).closest("form").find("input:checkbox:checked").length) && Boolean($(e.target).closest("form").find("input:checkbox:not(:checked)").length);
                        }())
                        .prop("checked", $(e.target).closest("form").find("input:checkbox:checked").length);
                
            }
            
            
            
            
            $(this).find(".chooser .trigger")
                    .toggleClass("disabled", !$(this).find(".container").find("input:checked").length);
        });
        /**/ 
        
        /*select/deselect all items checkbox*/
        
        /**/
        
        /****/
        
        /**Clear all data layers**/
        $("#deleteAllLayersTrigger").click(function(){
            if($(this).hasClass("disabled") || !confirm("This will delete all data not saved to disk")) return;
            $(this).add("#exportDataTrigger").addClass("disabled");
            purgeData();
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
                    },
                response: function(event, ui){
                            console.log(ui.content);
                            arr=ui;
                            if(ui.content.length){
                                $(this).on("autocompleteclose",function(){
                                    this.value="";
                                });
                            }else{
                                this.select();
                                $(this).on("autocompleteclose",function(){
                                    this.select();
                                });
                            }
                        }
//                ,change: function(event, ui){
//                    console.log(ui.item.length+";");
//                            if(ui.item.length){
//                                this.value="";
//                            }
//                        }
//                ,close: function(event, ui) {
//                    //console.log(ui.item);
//                            //this.value=""; //dont do this if form still in focus;
//                            this.value="";
//                        }
            });
          });
          
        $("#selectFrom").click(function(){
           //this.value="";
           $(this).autocomplete("search");
           $(this).autocomplete("enable"); 
        });
        $("#selectFrom").keypress(function(){
            setTimeout(function(){$(this).click();},3000);
        });
        $("#selectFrom").blur(function(){
            this.value="";
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
            if($("#exportDataTrigger").hasClass("active")) $("#exportDataTrigger").click();
            polygonControlModifier.deactivate();
            var selected = new Array();
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
        
        
        
        
        
        
        /**^1 needed if both about and tour triggers are to be maxified on hover on any one;
        //hoverTimer=0;  //TODO:find alternatives to using global hoverTimer;
        
        $.fn.delayHandler = function(delay){
            var obj = this;
            var timer = setTimeout(function(){
                $(obj).parent().children(".top-docked-trigger").addClass("minified");
            },delay);
            return timer;
        };
        *^1*/
        
        
        $("div.button-group.top-right a.top-docked-trigger").hover(function(e){
            if(!$(this).parent().hasClass("contains-minified-triggers")) return;
            
            if(e.type==="mouseenter"){
         /* *^1       clearTimeout(hoverTimer);  //TODO:find alternatives to using global hoverTimer;
          $(this).parent().children(".top-docked-trigger").removeClass("minified"); *^1*/

                $(this).parent().addClass("top-z");
                $("#glass").parent(".panel").addClass("transparent");
            }else{
                

    /**^1      hoverTimer = $(this).delayHandler(1500);*^1*/
                    $(this).parent().removeClass("top-z");
                    $("#glass").parent(".panel").removeClass("transparent");
               
            }
        });
});