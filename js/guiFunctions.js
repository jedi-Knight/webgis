function guiPanelShowAggregate(){
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

