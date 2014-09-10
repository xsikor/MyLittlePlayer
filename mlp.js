function Mlp() {
	console.log("MLP START!");
	this.count = 0;
	//Create new player from selector
	this.Select = function(selector) {
		if(selector[0] == ".") {
			var element = document.getElementsByClassName(selector.slice(1));
		} else if( selector[0] == "#") {
			var element = document.getElementById(selector.slice(1));
		} else {
			var element = document.getElementsByTagName(selector)[0];
		}

		return element || false;
	}

	this.Create = function(selector) {
		var elem = this.Select(selector);
		var tmp = document.createElement('div');
		tmp.setAttribute("class", "mlp-player");
		tmp.setAttribute("id", "mlp-"+(this.count++).toString());
		tmp.appendChild(elem.cloneNode(true));
		tmp.innerHTML += this.markup;
		elem.outerHTML = tmp.outerHTML;
		return tmp;
	}

	//test
	this.AddEvents = function(elem) {
		var
			control = elem.getElementsByClassName("play-pause")[0],
			progress = elem.getElementsByClassName("progress")[0],
			loaded = elem.getElementsByClassName("loaded")[0],
			time = elem.getElementsByClassName("time")[0],
			volume_ctrl = elem.getElementsByClassName("volume-ctrl")[0],
			vol_ico = volume_ctrl.getElementsByClassName("icon")[0],
			vol_scrub = volume_ctrl.getElementsByClassName("scrubber")[0],
			message = elem.getElementsByClassName("message")[0];

		var children = {
			"control": control,
			"progress": progress,
			"loaded": loaded,
			"time": time,
			"volume_ctrl": volume_ctrl,
			"vol_ico": vol_ico,
			"vol_scrub": vol_scrub,
			"message": message
		}

		return children;
	}



	this.markup = '\
		<div class="play-pause"></div>\
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