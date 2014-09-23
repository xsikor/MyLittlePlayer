package ua.tavrmedia{
	import flash.media.SoundChannel;
	import flash.media.Sound;
	import flash.media.SoundTransform;
	import flash.net.URLRequest;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.events.AsyncErrorEvent;

	public class Player {
		public var stream_url:String;
		public var stream:Sound = 	new Sound();
		public var sound:SoundChannel = new SoundChannel();
		public var trans:SoundTransform = 	new SoundTransform();
		public var is_playing:Boolean = false;
		public var channel:URLRequest;
		public var position:int = 0;
		
		public var flv:Boolean;
		public var flv_stream:NetConnection = new NetConnection(); 
		public var flv_sound:NetStream ;

		public function Player(url = "") {
			if(url != "") {
				this.setStream(url);
			}
			this.flv_stream.connect(null);
		}
		
		public function setStream(st:String):void {
			stream_url = st;
			if(st.indexOf(".flv") != -1) {
				this.flv = true;
			} else {
				this.channel = new URLRequest(st);
			}
			this.position = 0;
		}
		
		public function Play():void {
			is_playing = true;
			trace("Playing", this.stream_url);
			if(this.flv == true) {
				if(this.position == 0) {
					this.flv_sound = new NetStream(this.flv_stream);
					this.flv_sound.bufferTime = 5;
					this.flv_sound.addEventListener(AsyncErrorEvent.ASYNC_ERROR, this.pass);
					this.flv_sound.play(this.stream_url);
				} else {
					this.flv_sound.play();
				}
			} else {
				this.stream = new Sound();
				this.stream.load(this.channel);
				if(this.position == 0)
					this.sound = this.stream.play();
				else
					this.sound = this.stream.play(this.position);
			}
		}
		
		public function Stop():void {
			is_playing = false;
			if(this.flv == true) {
				this.flv_sound.close();
			} else {
				this.sound.stop();
			}
		}
		
		public function Pause():void {
			is_playing = false;
			if(this.flv == true) {
				this.position = 1;
				this.flv_sound.pause();
			} else {
				this.position = this.sound.position;
				this.sound.stop();
			}
		}
		
		public function setVolume(x:Number):void {
			this.trans.volume = x/100;
			if(this.trans.volume < 0)
				this.trans.volume = 0;
			if(this.flv == true && this.flv_sound != null) 
				this.flv_sound.soundTransform = this.trans;
			else
				this.sound.soundTransform = this.trans;
		}
				
		private function pass(e):void {}
	
	}
}
