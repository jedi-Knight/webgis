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
        
		
	/**panel expand/collapse**/
	$(".trigger.panelTrigger").click(function(){
		$(".panel").toggle("fast");
		return false;
	});
	
	$("#expandPanel").click(function(){
		$(this).hide();
	});
	$("#collapsePanel").click(function(){
		$("#expandPanel").show();
	});
        /****/
        
        /**pen toggle**/
        $(".tool").click(function(){
           $(this).toggleClass("passive active"); //class switch for active/passive state actions and css
           guiPanelShowPresetSelector();//show 'warning: clears boundary polygon layer,' and show presets panel if user proceeds
           toggleControl(this); //call pen active method
        });
        /****/
        
        /**import polygon**/
        $("a.trigger.inputTrigger").click(function(){
           toggleControl(this);
        });
        /****/
        
        /**export data**/
        $("a.trigger.exportData").click(function(){
            $(this).toggleClass("passive active"); //class switch for active/passive state actions and css 
            $(".splashContainerBase").toggleClass("passive active"); //class switch for active/passive state actions and css
        });
        
        $(".splashContainer.export a.download.trigger.active").click(function(){
            customExportToType($(".splashContainer.export .checkbox>input:checked")[0]);
            $(".splashContainerBase").toggleClass("active passive");
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
                    $("<li class='presetItem'>"+ui.item.value+"<div class='delItem'><a title='Remove preset' href='#'><img src='img/minus.png'/></a></div></li>")
                            .appendTo($(".presets #selectedPresets"))
                            .click(function(){
                                $(this).closest("li.presetItem").remove();
                            });
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