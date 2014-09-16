function Mlp() {
	console.log("MyLittlePlayer init.");
	this.count = 0;
	this.players = [];
	T = this;
	//Create new player from selector
	this.Select = function(selector, parrent) {
		var parrent = parrent || document;
		if(selector[0] == ".") {
			var element = parrent.getElementsByClassName(selector.slice(1));
		} else if( selector[0] == "#") {
			var element = parrent.getElementById(selector.slice(1));
		} else {
			var element = parrent.getElementsByTagName(selector);
		}

		return element || false;
	}

	this.CreateAll = function(online) {
		var obj = [];
		var aud = this.Select("audio");
		for(i in aud) {
			if(typeof aud[i] != "object")
				continue;

			obj[i] = this.Create(aud[i]);
			
			this.LoadCss(obj[i]);
			this.AddEvents(obj[i]);
			
			if(online)
				obj[i].isOnline = true;
		}
		return obj;
	}

	this.Create = function(selector) {
		if(typeof selector == "string")
			var elem = this.Select(selector);
		else 
			var elem = selector;

		if(elem == false || elem.length != undefined)
			return false
		var tmp = document.createElement('div');
		tmp.setAttribute("class", "mlp-player");
		tmp.setAttribute("id", "mlp-"+(++this.count).toString());
		tmp.appendChild(elem.cloneNode(true));
		tmp.innerHTML += this.markup;
		elem.outerHTML = tmp.outerHTML;
		elem = this.Select("#mlp-"+this.count.toString());
		//need to remove this shit or meybe not
		var control = elem.getElementsByClassName("control")[0],
			play = control.getElementsByClassName("play")[0],
			stop = control.getElementsByClassName("stop")[0],
			progress = elem.getElementsByClassName("progress")[0],
			loaded = elem.getElementsByClassName("loaded")[0],
			time = elem.getElementsByClassName("time")[0],
			volume_ctrl = elem.getElementsByClassName("volume-ctrl")[0],
			ico_muted = volume_ctrl.getElementsByClassName("muted")[0],
			ico_unmuted = volume_ctrl.getElementsByClassName("unmuted")[0],
			vol_scrub = volume_ctrl.getElementsByClassName("scrubber")[0],
			vol_scroller = vol_scrub.getElementsByClassName("scroller")[0],
			message = elem.getElementsByClassName("message")[0],
			player = elem.getElementsByTagName("audio")[0];

		var ret = {
			"control": [play, stop], //control, maybe need it 
			"progress": progress,
			"loaded": loaded,
			"time": time,
			"volume_ctrl": volume_ctrl,
			"vol_ico": [ico_unmuted, ico_muted],
			"vol_scrub": [vol_scrub, vol_scroller],
			"message": message,
			"root": elem,
			"player": player,
			"isOnline": false
		}	
		this.players[this.count] = ret;
		elem.mlp = ret;

		return ret;
	}

	//test
	this.AddEvents = function(obj) {
		//Play & Pause logic
		obj.control[0].addEventListener("click", this.PlayPause);
		obj.control[1].addEventListener("click", this.PlayPause);

		//Muted & unmuted logic
		obj.vol_ico[0].addEventListener("click", this.MuteUnmute);
		obj.vol_ico[1].addEventListener("click", this.MuteUnmute);
	}

	this.LoadCss = function(obj) {
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

	this.PlayPause = function(e) {
		var root = T.Root(e.target).mlp;
		//If click class is play - start playing
		var isPlay = (e.target.className == "play") ? false : true;
		if(root.isOnline) {
			var src = root.player.src;
			var date = new Date();
			if(src.indexOf("cache") == -1) {
				root.player.src = src+"?cache="+date.getTime();
			} else {
				src = src.slice(0, src.indexOf("?cache"));
				root.player.src = src+"?cache="+date.getTime();
			}
		}

		if(isPlay) {
			hideShow(root.control, true);
			root.player.pause();
		} else {
			hideShow(root.control);
			root.player.play();
		}
	}

	this.Root = function(el) {
		return(el.className != "mlp-player" && el.className != "") ? this.Root(el.parentElement) : el;
	}

	this.MuteUnmute = function(e) {
		var root = T.Root(e.target).mlp;
		var isMuted = (e.target.className == "muted") ? false : true;
		if(isMuted) {
			root.player.volume = 0;
			hideShow(root.vol_ico);
		}
		else {
			root.player.volume = 1;
			hideShow(root.vol_ico, true);
		}
	}

	this.markup = '\
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
}

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