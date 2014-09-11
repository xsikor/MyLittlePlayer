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
			var element = parrent.getElementsByTagName(selector)[0];
		}

		return element || false;
	}

	this.Create = function(selector) {
		var elem = this.Select(selector);
		if(elem == false)
			return elem
		var tmp = document.createElement('div');
		tmp.setAttribute("class", "mlp-player");
		tmp.setAttribute("id", "mlp-"+(++this.count).toString());
		tmp.appendChild(elem.cloneNode(true));
		tmp.innerHTML += this.markup;
		elem.outerHTML = tmp.outerHTML;
		elem = this.Select("#mlp-"+this.count.toString());
		//need to remove this shit or meybe not
		var control = elem.getElementsByClassName("control")[0],
			progress = elem.getElementsByClassName("progress")[0],
			loaded = elem.getElementsByClassName("loaded")[0],
			time = elem.getElementsByClassName("time")[0],
			volume_ctrl = elem.getElementsByClassName("volume-ctrl")[0],
			vol_ico = volume_ctrl.getElementsByClassName("icon")[0],
			vol_scrub = volume_ctrl.getElementsByClassName("scrubber")[0],
			message = elem.getElementsByClassName("message")[0],
			player = elem.getElementsByTagName("audio")[0];

		var ret = {
			"control": control,
			"progress": progress,
			"loaded": loaded,
			"time": time,
			"volume_ctrl": volume_ctrl,
			"vol_ico": vol_ico,
			"vol_scrub": vol_scrub,
			"message": message,
			"root": elem,
			"player": player
		}	
		this.players[this.count] = ret;
		return ret;
	}

	//test
	this.AddEvents = function(obj) {
		obj.control.addEventListener("click", this.PlayPause);
	}

	this.LoadCss = function(obj) {
		for(k in obj) {
			var el = obj[k];
			var bg = getStyle(el, "backgroundImage") || false;
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
		var id = e.target.offsetParent.getAttribute("id").replace("mlp-", "");
		var isPlay = (e.target.className.indexOf("pause") != -1) ? false : true;
		if(isPlay) {
			e.target.className = "control-pause";
			T.players[id].player.play();
		} else {
			e.target.className = "control-play";
			T.players[id].player.pause();
		}
	}



	this.markup = '\
		<div class="control"></div>\
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
	ret = window.getComputedStyle(elem);
	if(option)
		return ret[option] || false;
	else
		return ret;
}
