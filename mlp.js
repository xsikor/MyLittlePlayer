(function() {
	var count = 0;
	var test = 0;
	Mlp = function (option) {
		this.option = option || false;
		this.players = [];
		this.elems = null;
		this.isOnline = option.isOnline || false;
		this.loadCss = (option.loadCss == true) ? true : false;
		this.preload = option.preload || "none"
	}
	//Select elements by CSS selectors
	Mlp.prototype.Select = function(selector, parrent) {
		var selector = selector || "audio";
		var parrent = parrent || document;
		if(selector[0] == ".") {
			var element = parrent.getElementsByClassName(selector.slice(1));
		} else if( selector[0] == "#") {
			var element = parrent.getElementById(selector.slice(1));
		} else {
			var element = parrent.getElementsByTagName(selector);
		}


		return element;
	}

	Mlp.prototype.Create = function(elems) {
		var elems = elems || "audio";

		if(typeof elems == "string") {
			elems = this.Select(elems);
		}

		if(elems.length == undefined) {
			this.createHelper(elems);
			return true;
		}

		var total = elems.length; //Hack for chrome

		for(i=0; i<total; i++) {
			if(typeof elems[i] != "object")
				continue;

			var tmp = new Mlp(this.option);
			tmp.Create(elems[i], i);
			this.players.push(tmp);
				
		}
	}

	Mlp.prototype.createHelper = function(elem) {
		if(elem == false || elem.length != undefined)
			return false
		elem.preload = this.preload;
		var tmp = document.createElement('div');
		tmp.setAttribute("class", "mlp-player");
		tmp.setAttribute("id", "mlp-"+(++count).toString());
		tmp.appendChild(elem.cloneNode(true));
		tmp.innerHTML += this.markup;
		elem.outerHTML = tmp.outerHTML;

		elem = document.getElementById("mlp-"+count.toString());
		elem.self = this;
		//need to remove this shit or meybe not
		var control = elem.getElementsByClassName("control")[0],
			play = control.getElementsByClassName("play")[0],
			stop = control.getElementsByClassName("stop")[0],
			
			progress = elem.getElementsByClassName("progress")[0],
			loaded = elem.getElementsByClassName("loaded")[0],

			volume_ctrl = elem.getElementsByClassName("volume-ctrl")[0],
			ico_muted = volume_ctrl.getElementsByClassName("muted")[0],
			ico_unmuted = volume_ctrl.getElementsByClassName("unmuted")[0],

			vol_scrub = volume_ctrl.getElementsByClassName("scrubber")[0],
			vol_scroller = vol_scrub.getElementsByClassName("scroller")[0],

			player = elem.getElementsByTagName("audio")[0],
			message = elem.getElementsByClassName("message")[0],
			time = elem.getElementsByClassName("time")[0];

		this.elems = {
			"control": [play, stop], //control, maybe need it 
			"progress": progress,
			"loaded": loaded,
			"time": time,
			"volume_ctrl": volume_ctrl,
			"vol_ico": [ico_unmuted, ico_muted],
			"vol_scrub": [vol_scrub, vol_scroller],
			"message": message,
			"player": player,
		}
		if(this.loadCss)
			this.LoadCss();
		this.AddEvents();	
	}

	Mlp.prototype.AddEvents = function() {
		//Play & Pause logic
		this.elems.control[0].addEventListener("click", this.PlayPause);
		this.elems.control[1].addEventListener("click", this.PlayPause);

		//Muted & unmuted logic
		this.elems.vol_ico[0].addEventListener("click", this.MuteUnmute);
		this.elems.vol_ico[1].addEventListener("click", this.MuteUnmute);
	}
	
	Mlp.prototype.LoadCss = function(obj) {
		var obj = obj || this.elems
		for(k in obj) {
			var el = obj[k];
			if(el.length != undefined) {
				this.LoadCss(el);
				continue;
			}
			var bg = getStyle(el, "backgroundImage") || false;
			if(!bg)
				continue;

			bg = bg.slice(bg.indexOf("http"), bg.indexOf('")'))
			if(bg.length > 5) {
				var img = new Image();
				img.src = bg;
				img.need = el;
				img.onload = function(e) {
					var t = e.target;
					t.need.style.width = t.width;
					t.need.style.height = t.height;
				}
			}
		}
	}

	Mlp.prototype.PlayPause = function(e) {
		//If click class is play - start playing
		var root = Root(e.target).self;
		var isPlay = (e.target.className == "play") ? false : true;
		if(root.isOnline) {
			var src = root.elems.player.src;
			var date = new Date();
			if(src.indexOf("cache") == -1) {
				root.elems.player.src = src+"?cache="+date.getTime();
			} else {
				src = src.slice(0, src.indexOf("?cache"));
				root.elems.player.src = src+"?cache="+date.getTime();
			}
		}

		if(isPlay) {
			hideShow(root.elems.control, true);
			root.elems.player.pause();
		} else {
			hideShow(root.elems.control);
			root.elems.player.play();
		}
	}

	//For more comfortable api
	Mlp.prototype.Play = function() {
		this.elems.player.play();
		hideShow(this.elems.control);
	}

	Mlp.prototype.MuteUnmute = function(e) {
		var root = Root(e.target).self.elems;
		var isMuted = (e.target.className == "muted") ? false : true;
		if(isMuted) {
			root.player.muted = true;
					hideShow(root.vol_ico);
		}
		else {
			root.player.muted = false;
			hideShow(root.vol_ico, true);
		}
	}

	Mlp.prototype.markup = '\
		<div class="control">\
			<div class="play"></div>\
			<div class="stop"></div>\
		</div>\
		<div class="body">\
			<div class="progress"></div>\
			<div class="loaded"></div>\
			<div class="time"></div>\
		</div>\
		<div class="volume-ctrl">\
			<div class="icon">\
				<div class="muted"></div>\
				<div class="unmuted"></div>\
			</div>\
			<div class="scrubber">\
				<div class="full_bar"></div>\
				<div class="scroller"></div>\
			</div>\
		</div>\
		<div class="message"></div>';


	//My function
	function getStyle(elem, option) {
		var option = option || false;
		if(typeof elem != "object")
			return false;
		ret = window.getComputedStyle(elem);
		if(option)
			return ret[option] || false;
		else
			return ret;
	}


	function hideShow(first, secReverse) {
		if(typeof first == "object" && secReverse == undefined) {
			secReverse = first[1];
			first = first[0];
		} else if(typeof first == "object" && secReverse === true) {
			secReverse = first[0];
			first = first[1];
		}

		first.style.display  = "none";
		secReverse.style.display = "block";
	}

	function Root(el) {
		return(el.className != "mlp-player" && el.className != "") ? Root(el.parentElement) : el;
	}

}).call(this);