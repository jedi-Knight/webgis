function guiPanelShowAggregate(notFirstRun){
    
    if(!notFirstRun) $("#tagsSelector").find("option").attr("selected",true);
    
    $("#presetSelector:visible").add($("#glass>h3").filter(function(){return $("#presetSelector:visible:not(:animated)").length;})).fadeOut({
        duration: 200,
        queue: false,
        done: function(){
            $($("#aggregate:hidden").add($("#glass>h3").text("Aggregate"))).fadeIn({
                duration: 500,
                queue: false,
                done: function(){
                    return;
                }
            });
            return;
        }
        
    });
   return;
}

function guiPanelShowPresetSelector(){
    $("#aggregate:visible").add($("#glass>h3").filter(function(){return $("#aggregate:visible:not(:animated)").length;})).fadeOut({
        duration: 200,
        queue: false,
        done: function(){
            $($("#presetSelector:hidden").add($("#glass>h3").text("Presets"))).fadeIn({
                duration: 500,
                queue: false,
                done: function(){
                    return;
                }
            });
            return;
        }
        
    });
   return;
}

function showLoadingAnim(bool){
    var deg=0;
    if(anim) clearInterval(anim);
    if(bool){
        anim = setInterval(function(){
            //$("#waitForMe>img").css("transform","rotate("+deg+"deg)");
            $("#waitForMe>div").css("margin-left",Math.abs(50+Math.sin(deg)*30)+"%");
            deg+=0.05;
            //console.log(deg);
        },30);
        $("#waitForMe").css("display","block");
    }else{
        $("#waitForMe").css("display","none");
        clearInterval(anim);
        anim = 0;
        //$("#waitForMe>img").css("transform","rotate(0deg)");
    }
}


$.fn.callPolygonEditorHandles = function(f){
    if(typeof f == "function") console.log(f() + " :passed from from callback");
    if (polyCoords == "" || polyCoords == null || !polyCoords){
        console.log("No polygon to edit. Please draw a polygon first.");
        return;
    }
    //if transform handles are active, deactivate them
    if (polygonControlModifier.active) {
        polygonControlModifier.deactivate();
    }
    
    if(!this.length) return this; //return if no active tool passed
    
    // reset modification mode
    polygonControlModifier.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
    
    //add transformation modes to transform handles
    this.each(function(){
        console.log("transfomation handle: adding mode: "+$(this).attr("id"));
        switch($(this).attr("id")){
            
            case "rotateToggle":
                polygonControlModifier.mode |= OpenLayers.Control.ModifyFeature.ROTATE;//|
                polygonControlModifier.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                break;
                
            case "resizeToggle":
                polygonControlModifier.mode |= OpenLayers.Control.ModifyFeature.RESIZE;//|
                
                if ($(this).find("input:checkbox:checked").length) {
                    console.log("maintain aspect ratio");
                    polygonControlModifier.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                }
                
                break;
                
            case "dragToggle":
                polygonControlModifier.mode |= OpenLayers.Control.ModifyFeature.DRAG;//|
                polygonControlModifier.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                break;
            
        };
        
        polygonControlModifier.createVertices = $(this).hasClass("addVertex");
            
    });
    //activate transform handles
    polygonControlModifier.activate();
    polygonControlModifier.selectFeature(polygonLayer.features[0]);
            
    return this;
    
}
