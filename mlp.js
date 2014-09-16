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
			vol_ico = volume_ctrl.getElementsByClassName("icon")[0],
			vol_scrub = volume_ctrl.getElementsByClassName("scrubber")[0],
			message = elem.getElementsByClassName("message")[0],
			player = elem.getElementsByTagName("audio")[0];

		var ret = {
			"control": [play, stop], //control, maybe need it 
			"progress": progress,
			"loaded": loaded,
			"time": time,
			"volume_ctrl": volume_ctrl,
			"vol_ico": vol_ico,
			"vol_scrub": vol_scrub,
			"message": message,
			"root": elem,
			"player": player,
			"isOnline": false
		}	
		this.players[this.count] = ret;
		return ret;
	}

	//test
	this.AddEvents = function(obj) {
		obj.control[0].addEventListener("click", this.PlayPause);
		obj.control[1].addEventListener("click", this.PlayPause);
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
		var id = e.target.offsetParent.offsetParent.getAttribute("id").replace("mlp-", "");
		//If click class is play - start playing
		var isPlay = (e.target.className == "play") ? false : true;
		if(isPlay) {
			T.players[id].control[1].style.display  = "none";
			T.players[id].control[0].style.display = "block";
			T.players[id].player.pause();
		} else {
			T.players[id].control[0].style.display  = "none";
			T.players[id].control[1].style.display = "block";

			if(T.players[id].isOnline) {
				var src = T.players[id].player.src;
				var date = new Date();
				if(src.indexOf("cache") == -1) {
					T.players[id].player.src = src+"?cache="+date.getTime();
				} else {
					src = src.slice(0, src.indexOf("?cache"));
					T.players[id].player.src = src+"?cache="+date.getTime();
				}
				T.players[id].player.load();
			}

			T.players[id].player.play();
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
			<div class="icon"></div>\
			<div class="scrubber"></div>\
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
