var Mlp = (function(document, window) {
    var player = function(options) {
        this.control = createNativeAduio() || {};
        this.callback = {};
        this.options = options
    };
    
    player.prototype.play = function() {
        this.callEvent("play");
        
        console.log("I'm start playing!");
        this.control.play();
        
        return this;
    };
    
    player.prototype.stop = function() {
        this.callEvent("stop");
        
        console.log("I'm stop playing!");
        this.control.stop();
        
        return this;
    };
    
    player.prototype.pause = function() {
        this.callEvent("pause");
        
        console.log("I'm pause playing!");
        this.control.pause();
        
        return this;
    };
    
    player.prototype.setStream = function(url) {
        this.control.src = url;
        
        return this;
    }
    
    player.prototype.addEvent = function(event, func) {
        //А нужно ли нам несколько эвентов?
        if(typeof this.callback[event] == "undefined") {
            this.callback[event] = [];
        }
        
        if(event != "" || typeof func == "function") {
            this.callback[event].push(func);
        }
        
        return this;
    }
    
    player.prototype.callEvent = function(event) {
        //Event object to string
        if(typeof event == "object") {
            event = event.type;
        }
        //Check if we have event listeners
        if(typeof this.callback[event] == "undefined") {
            return false;
        }
        
        //Call it all!
        var total = this.callback[event].length || 0;
        for(var i = 0; i < total; i++) {
            var res = this.callback[event][i]();
            if(res == false) {
                break;
            }
        }
        
        return res;
    }
    
    function createNativeAduio() {
        var audio = new Audio() || false;
        if(audio === false) {
            return false;
        }
        
        audio.stop = function() {
            this.pause();
            this.currentTime = 0;
        }
        
        audio.preload = "metadata";
        
        return audio;
    }
    
    
    return player;
})(document, window);