(function() {
	var count = 0;
	var cssLoaded = false;
	var players = new Array();

	loadImages();
	Mlp = function (option) {
		console.log("MyLittlePlayer init", count);
		this.option = option || false;
		this.players = [];
		this.player = null;
		this.flashPlayer = null;
		this.elems = null;
		this.isOnline = option.isOnline || false;
		this.preload = option.preload || "none"
		this.loadCount = 0;
		this.isReady = false;
		this.isDragable = false;
	}
	//Select elements by CSS selectors
	Mlp.prototype.Select = function(selector, parrent) {
		var selector = selector;
		var parrent = parrent || document;
		var element = parrent.querySelectorAll(selector);
		if(selector[0] == "#")
			element = element[0];

		return element;
	}

	Mlp.prototype.Create = function(elems) {
		var elems = elems || "audio";

		if(typeof elems == "string") {
			var elems = this.Select(elems);
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
			tmp.Create(elems[i]);

			this.players.push(tmp);
				
		}
	}

	Mlp.prototype.createHelper = function(elem) {
		if(elem == false || elem.length != undefined)
			return false
		elem.preload = this.preload;
		var tmp = document.createElement('div');
		tmp.setAttribute("class", "mlp-player "+elem.className);
		tmp.setAttribute("id", "mlp-"+(++count).toString());
		tmp.appendChild(elem.cloneNode(true));
		tmp.innerHTML += this.markup;
		elem.outerHTML = tmp.outerHTML;

		elem = document.getElementById("mlp-"+count.toString());
		elem.self = this;
		
		var
			control = elem.getElementsByClassName("control")[0],
			play = control.getElementsByClassName("play")[0],
			stop = control.getElementsByClassName("stop")[0],
			

			body = elem.getElementsByClassName("body")[0],
			timeline = elem.getElementsByClassName("timeline")[0],
			progress = timeline.getElementsByClassName("progress")[0],
			loaded = timeline.getElementsByClassName("loaded")[0],
			time_scroller = timeline.getElementsByClassName("time_scroller")[0],

			volume_ctrl = elem.getElementsByClassName("volume-ctrl")[0],
			ico_muted = volume_ctrl.getElementsByClassName("muted")[0],
			ico_unmuted = volume_ctrl.getElementsByClassName("unmuted")[0],

			vol_scrub = volume_ctrl.getElementsByClassName("scrubber")[0],
			vol_scroller = vol_scrub.getElementsByClassName("scroller")[0],
			vol_fulbar = vol_scrub.getElementsByClassName("full_bar")[0],

			time = elem.getElementsByClassName("time")[0];
			cur_time = time.getElementsByClassName("cur_time")[0];
			duration = time.getElementsByClassName("duration")[0];

			message = elem.getElementsByClassName("message")[0],

		this.player = elem.getElementsByTagName("audio")[0];
		this.player.volume = (this.option.volume !== undefined) ? this.option.volume : 1;
		this.player.type = this.player.getAttribute("type") || "audio/mpeg";
		this.player.addEventListener("ended", this.PlayEnd);

		this.elems = {
			"control": [play, stop], //control, maybe need it 
			"body": body,
			"timeline": timeline,
			"time_scrub": [progress, time_scroller, loaded],
			"time": time,
			"cur_time": cur_time,
			"duration": duration,
			"volume_ctrl": volume_ctrl,
			"vol_ico": [ico_unmuted, ico_muted],
			"vol_scrub": [vol_scrub, vol_scroller, vol_fulbar],
			"message": message,
			"root": elem,
		}
		if(this.option.loadCss)
			this.LoadCss();

		this.AddEvents();

		if(this.player.canPlayType(this.player.type) == "")
			this.initFlash();
		players.push(this);
	}

	Mlp.prototype.AddEvents = function() {
		//Play & Pause logic
		this.elems.control[0].addEventListener("click", this.PlayPause);
		this.elems.control[1].addEventListener("click", this.PlayPause);

		//Muted & unmuted logic
		this.elems.vol_ico[0].addEventListener("click", this.MuteUnmute);
		this.elems.vol_ico[1].addEventListener("click", this.MuteUnmute);

		//Volume logic
		this.elems.vol_scrub[1].addEventListener("mousedown", this.ScrubberEvents)
		this.elems.vol_scrub[1].addEventListener("mouseup", this.ScrubberEvents)
		this.elems.vol_scrub[0].addEventListener("click", this.ScrubberClick)

		//Timeline logic
		this.elems.timeline.addEventListener("click", this.TimelineClick);
		this.elems.time_scrub[1].addEventListener("mousedown", this.StartDragTimeScrubber);

		//Player event's
		this.player.addEventListener("volumechange", this.render);
		this.player.addEventListener("timeupdate", this.render);
	}
	
	Mlp.prototype.LoadCss = function(obj) {
		var obj = obj || this.elems

		if(cssLoaded == false) {
			tmp = document.createElement("link");
			tmp.href = Path("mlp.js")+"mlp.css";
			tmp.rel = "stylesheet";
			tmp.type = "text/css";
			document.getElementsByTagName("head")[0].appendChild(tmp);
		}

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
				img.root = this;

				el.ondragstart = function () {return false;}

				this.loadCount++;

				img.onload = function(e) {
					var t = e.target;
					
					t.need.style.width = t.width+"px";
					t.need.style.height = t.height+"px";

					if(--t.root.loadCount == 0)
						t.root.ready();
				}

			}
		}
	}

	Mlp.prototype.ready = function() {
		this.isReady = true;
		if(this.option.autoPlay && this.flashPlayer == null)
			this.Play();
		this.elems.root.style.display = "block";

		this.render();

	}

	Mlp.prototype.PlayPause = function(e) {
		//If click class is play - start playing
		var root = Root(e.target).self;
		var isPlay = (e.target.className == "play") ? false : true;

		if(isPlay)
			root.Stop();
		else
			root.Play();
	}

	//For more comfortable api
	Mlp.prototype.Play = function() {
		if(this.option.autoStop == true ) {
			StopAll(this);
		}

		if(this.flashPlayer && this.flashPlayer != null)
			this.flashPlayer.play();
		else {
			if(this.isOnline) {
				var src = this.player.src;
				var date = new Date();
				if(src.indexOf("cache") == -1) {
					this.player.src = src+"?cache="+date.getTime();
				} else {
					src = src.slice(0, src.indexOf("?cache"));
					this.player.src = src+"?cache="+date.getTime();
				}
			}
			this.player.play();
		}
		hideShow(this.elems.control);
	}

	Mlp.prototype.Stop = function() {
		if(this.flashPlayer)
			(this.isOnline) ? this.flashPlayer.stop() : this.flashPlayer.pause();
		else
			this.player.pause();
		hideShow(this.elems.control, true);	
	}

	Mlp.prototype.MuteUnmute = function(e) {
		var root = Root(e.target).self;
		var isMuted = (e.target.className == "muted") ? false : true;
		if(isMuted)
			root.Mute();
		else
			root.Unmute();
	}

	Mlp.prototype.Mute = function() {
		this.player.tmp_vol = this.player.volume;
		if(this.flashPlayer)
			this.flashPlayer.mute(true);
		this.player.volume = 0;
		hideShow(this.elems.vol_ico);
	}

	Mlp.prototype.Unmute = function() {
		this.player.volume = this.player.tmp_vol || this.player.volume;
		if(this.flashPlayer)
			this.flashPlayer.mute(false);
		hideShow(this.elems.vol_ico, true);
	}

	Mlp.prototype.ScrubberEvents = function(e) {
		var root = Root(e.target).self;
		var scrub = root.elems.vol_scrub[1];
		var bg = root.elems.vol_scrub[0];

		root.elems.volume_ctrl.addEventListener("mousemove", root.ScrubberMove, false);
		root.elems.volume_ctrl.addEventListener("mouseup", root.ScrubberMove, false);
		document.addEventListener("mouseup", root.ScrubberMove, false);
		document.currMlp = root;

		return false;
	};


	Mlp.prototype.ScrubberMove = function(e) {
		var root = Root(this).self || document.currMlp;
		var scrub = root.elems.vol_scrub[1];
		var bg = root.elems.vol_scrub[0];
		var bg_pos = bg.getBoundingClientRect();
		//Holy shit
		if(e.type == "mouseup" || e.type == "mouseleave") {
			root.elems.volume_ctrl.removeEventListener("mousemove", root.ScrubberMove, false);
			root.elems.volume_ctrl.removeEventListener("mouseup", root.ScrubberMove, false);
			document.removeEventListener("mouseup", root.ScrubberMove, false);
		} else {
			var move = (scrub.getBoundingClientRect().left - e.clientX);
			var left = parseInt((scrub.style.left != "") ? scrub.style.left : getStyle(scrub, "left"));
			var point = left - move;
			if(point > (bg_pos.width) || point <= 0) {
				root.elems.volume_ctrl.removeEventListener("mousemove", root.ScrubberMove, false);
				root.elems.volume_ctrl.removeEventListener("mouseup", root.ScrubberMove, false);
			}

			if(point > bg_pos.width)
				point = (bg_pos.width);


			var volume = (point / bg_pos.width);

			if(volume > 1)
				volume = 1;
			if(volume < 0)
				volume = 0;

			if(volume > 0)
				root.Unmute();
			else
				root.Mute();

			root.player.volume = volume;

			if(root.flashPlayer)
				root.flashPlayer.volume(volume);


			root.render();

		}

		return false;
	}

	Mlp.prototype.ScrubberClick = function(e) {
		var root = Root(this).self;

		if(e.target == root.elems.vol_scrub[1])
			return false;

		//Hack for old browser
		e.layerX = e.layerX || e.offsetX;

		var volume = (e.layerX / this.offsetWidth);
		if(volume > 1)
			volume = 1;
		if(volume < 0)
			volume = 0;

		if(volume > 0)
			root.Unmute();
		else
			root.Mute();

		root.player.volume = volume;
		if(root.flashPlayer)
			root.flashPlayer.volume(volume);

		return false;
	}

	Mlp.prototype.TimelineClick = function(e) {
		var root = Root(this).self;

		if(e.target == root.elems.time_scrub[1])
			return false;

		//Hack for old browser
		e.layerX = e.layerX || e.offsetX;
		var toTime = (e.layerX / this.offsetWidth) * root.player.duration;

		if(root.flashPlayer !== null && root.totalBuffer() <= toTime) 
			return false;
		else if(root.flashPlayer && root.player.duration * root.totalBuffer() <= toTime)
			return false;
		
		root.player.currentTime = toTime;
		if(root.flashPlayer)
			root.flashPlayer.position(toTime);
	}

	Mlp.prototype.StartDragTimeScrubber = function(e) {
		var root = Root(this).self;
		root.isDragable = true;

		root.elems.body.addEventListener("mousemove", root.MoveTimeScrubber);
		root.elems.body.addEventListener("mouseleave", root.StopDragTimeScrubber);
		root.elems.time_scrub[1].addEventListener("mouseup", root.StopDragTimeScrubber);

		return false;
	}

	Mlp.prototype.MoveTimeScrubber = function(e) {
		var
			root = Root(this).self,
			scrub = root.elems.time_scrub[1],
			move = scrub.getBoundingClientRect().left - e.clientX,
			left = parseInt((scrub.style.left != "") ? scrub.style.left : getStyle(scrub, "left")),
			point = (left - move) - scrub.offsetWidth/3;
		
		if(point >= root.elems.timeline.offsetWidth - scrub.offsetWidth) {
			point = root.elems.timeline.offsetWidth - scrub.offsetWidth
			root.StopDragTimeScrubber();
		} else if(point <= 0)
			point = 0;

		scrub.style.left = point + "px";
		
		return false;
	}

	Mlp.prototype.StopDragTimeScrubber = function(e) {
		var 
			root = Root(this).self,
			scrub = root.elems.time_scrub[1],
			timeLine = root.elems.timeline,
			toTime = (scrub.offsetLeft / timeLine.offsetWidth) * root.player.duration;

		root.elems.body.removeEventListener("mousemove", root.MoveTimeScrubber);
		root.elems.body.removeEventListener("mouseleave", root.StopDragTimeScrubber);
		root.elems.time_scrub[1].removeEventListener("mouseup", root.StopDragTimeScrubber);

		if(!isNaN(toTime)) {
			root.player.currentTime = toTime;

			if(root.flashPlayer)
				root.flashPlayer.position(toTime);
		}

		root.isDragable = false;
		root.render();
		return false;
	}


	Mlp.prototype.render = function(e) {
		var root = this;
		if(root.elems == undefined) {
			root = e.target.parentElement.self;
		}
		
		//Volume
		var vol_bg = root.elems.vol_scrub[0].getBoundingClientRect();
		var position = (root.player.volume * vol_bg.width) - root.elems.vol_scrub[1].offsetWidth/2;

		root.elems.vol_scrub[2].style.width = (root.player.volume * 100) + "%";	
		root.elems.vol_scrub[1].style.left = position+"px";

		//Timeline
		var time_proc = root.elems.timeline.offsetWidth;
		var time_width = "0";
		var buffer_width = "0";
		if(time_proc > 0 && root.player.duration > 0 && root.totalBuffer() != 0) {
			var cur_proc = root.player.currentTime / root.player.duration;
			var time_width = (time_proc * cur_proc) - (parseInt(getStyle(root.elems.time_scrub[0], "left"))*2);
			var bufer_proc = (this.flashPlayer) ? root.totalBuffer() : root.totalBuffer() / root.player.duration;
			var buffer_width = (time_proc * bufer_proc) - (parseInt(getStyle(root.elems.time_scrub[2], "left"))*2);


		}
		if(time_width < 0)
			time_width = 0;
		root.elems.time_scrub[0].style.width = time_width+"px";
		root.elems.time_scrub[2].style.width = buffer_width+"px";
		if(root.isDragable === false)
			root.elems.time_scrub[1].style.left = root.elems.time_scrub[0].offsetWidth+"px";

		var t = toMin(root.player.currentTime);
		var d = toMin(root.player.duration);

		root.elems.cur_time.innerHTML = t.m + ":" + t.s;
		root.elems.duration.innerHTML = d.m + ":" + d.s;
	}

	Mlp.prototype.totalBuffer = function() {
		var buff = 0;
		if(this.flashPlayer) {
			buff = this.flashPlayer.totalLoaded();
		} else if(this.player.buffered.length != 0) {
			buff = this.player.buffered.end(0) || 0;
		}
		return buff;
	}

	Mlp.prototype.addElement = function(option) {
		if(option == undefined)
			return false;
		
		var className = option.className
		var parent = option.parent || this.elems.root;
		var tagName = option.tagName || "div"

		var tmp = document.createElement(tagName);
		tmp.setAttribute("class", className);
		this.elems[className] = tmp;
		parent.appendChild(tmp);

		if(this.option.loadCss)
			this.LoadCss();

		return tmp;
	}


	Mlp.prototype.PlayEnd = function(e) {
		var root = Root(e.target).self;
		root.Stop();
		this.currentTime = 0;
		root.render();
	}

	Mlp.prototype.initFlash = function() {

		if(this.flashPlayer)
			return false;

		var flashPlayer = this.addElement({
			className: "flObj",
			tagName: "embed"
		});

		flashPlayer.width = 0;
		flashPlayer.height = 0;
		flashPlayer.setAttribute("AllowScriptAccess", "always");
		flashPlayer.src = Path("mlp.js")+"mlp.swf?id=mlp_flash_"+count;
		flashPlayer.id = "mlp_flash_"+count;
		flashPlayer.tmp_durration = 0;

		flashPlayer.ready = function() {
			var root = Root(this).self;
			this.init(root.player.src);
			console.log(this.id, "init");
			vol = (root.option.volume !== undefined) ? root.option.volume : 1;
			this.volume(vol);
			root.player = {};
			if(root.option.autoPlay)
				root.Play();
		}

		flashPlayer.timeupdate = function() {
			var
				root = Root(this).self,
				duration = (this.durration() > this.tmp_durration) ? this.durration() : this.tmp_durration;

			this.tmp_durration = duration;
			root.player.currentTime = this.position();
			root.player.volume = this.volume();
			root.player.duration = this.tmp_durration;
			root.player.muted = (this.volume() > 0) ? false : true;
			root.render();
		}

		this.flashPlayer = flashPlayer;
	}


	Mlp.prototype.markup = '\
		<div class="control">\
			<div class="play"></div>\
			<div class="stop"></div>\
		</div>\
		<div class="body">\
			<div class="time">\
				<div class="cur_time"></div>\
				<div class="duration"></div>\
			</div>\
			<div class="timeline">\
				<div class="progress"></div>\
				<div class="loaded"></div>\
				<div class="time_scroller"></div>\
			</div>\
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
		return(el.className != undefined && el.className.indexOf("mlp-player") == -1 && el.parentElement != null) ? Root(el.parentElement) : el;
	}

	function toMin(seconds) {
		if(isNaN(seconds))
			seconds = 0;

		var s = Math.floor(seconds);
		var m = Math.floor(s/60)
		if(s >= 60)
			s -= m*60;
		if(s < 10) 
			s = "0"+s.toString()
		return {"m": m, "s": s};
	}

	function Path(str) {
		var elems = document.getElementsByTagName("script");
		for(var i =0; i<elems.length; i++) {
			var path = elems[i].src;
			if(path.indexOf("/"+str) != -1)
				break;
		}
		return path.replace(str, "");
	}

	//Some shit for load all images together
	function loadImages() {
		var styles = document.styleSheets;
		for(var i=0; i<styles.length; i++) {
			try {
				var rules = styles[i].cssRules;
			} catch(e) {
				continue;
			}
			
			for(var j in rules) {
				var rule = rules[j], selector = rule.selectorText;

				if(rule.style == undefined || selector == undefined || rule.style.background == "" || selector.indexOf("mlp-player") == -1)
					continue;
				var 
					url = rule.style.background,
					start = url.indexOf("url(\"")+5,
					stop = url.indexOf("\")", start),
					url = url.slice(start, stop),
					href = (url[0] == "/") ? "http://"+window.location.host : window.location.href,
					img = new Image();

				if(url.indexOf("http://") != -1)
					img.src = url;
				else
					img.src = href+url;
			}
		}
	}


	function StopAll(current) {
		var total = players.length;
		for(var i=0; i<total; i++) {
			if(players[i].player.currentTime > 0 && players[i].player != current.player)
				players[i].player.currentTime = 0;
			players[i].Stop();
		}
	}

}).call(this);