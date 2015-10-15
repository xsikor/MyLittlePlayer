var Mlp = (function(document, window) {
    var player = function(options) {
        this.control = createNativeAduio() || {};
        this.callback = {};
        this.options = options
    };
    
    player.prototype.play = function() {
        console.log("I'm start playing!");
        this.control.play();
        
        return this;
    };
    
    player.prototype.stop = function() {
        console.log("I'm stop playing!");
        this.control.stop();
        
        return this;
    };
    
    player.prototype.pause = function() {
        console.log("I'm pause playing!");
        this.control.pause();
        
        return this;
    };
    
    player.prototype.setStream = function(url) {
        var tmpPause = this.isPaused(); 
        this.stop();
        this.control.src = url;
        
        if(!tmpPause) {
            this.play();
        }
        
        return this;
    }
    
    //addEventListener proxy func
    player.prototype.addEventListener = function(event, func) {
        this.control.addEventListener(event, func);
        
        return this;
    }
    
    player.prototype.callEvent = function(event) {
        //Event object to string
        if(typeof event == "object") {
            event = event.type;
        }
        
        this.control.dispatchEvent(event);
    }
    
    player.prototype.isPaused = function() {
        return this.control.paused;
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
        
        audio.preload = "none";
        
        return audio;
    }
    
    
    return player;
})(document, window);