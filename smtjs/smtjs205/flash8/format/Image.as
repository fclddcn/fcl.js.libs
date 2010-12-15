class Image {
	var type:String;
	var src:String;
	var geo:Array;
	var Movie:MovieClip;
	//---------------------------------
	function Image(src1:String, width:Number, height:Number) {
		geo = new Array();
		type = "Image";
		geo[0] = width;
		geo[1] = height;
		geo[2] = height;
		src = src1;
		Movie = new MovieClip();
	}
	//---------------------------------
	function show(mc:MovieClip, x0:Number, y0:Number, scale:Number):Void {
		var depth = mc.getNextHighestDepth();
	
		if(src.toLowerCase().indexOf("lib:")>-1){ //新增的类型(从库加载mc)
			Movie=mc.attachMovie(src.substr(4),"img_"+depth,depth)
			Movie.stop()
			Movie._x = x0;
			Movie._y = y0;
			Movie._quality = "MEDIUM";
			var wt = geo[0];
			var ht = geo[1];
			Movie.gotoAndStop(1)
			mc._xscale = wt/mc._width*100;
			mc._yscale = ht/mc._height*100;
		
		}else{
			Movie = mc.createEmptyMovieClip("img_"+depth, depth);
			Movie._x = x0;
			Movie._y = y0;
			Movie._quality = "MEDIUM";
			var wt = geo[0];
			var ht = geo[1];
			var srce = src;
			
		
			
			var mcLoader:MovieClipLoader = new MovieClipLoader();
			var loadListener:Object = new Object();
			mcLoader.addListener(loadListener);
		
			mcLoader.loadClip(src, Movie);
		
			loadListener.onLoadStart = function(mc) {
				mc.txt = mc.createTextField("txt", mc.getNextHighestDepth(), 20, 2, 200, 150);
				mc.txt.text = "Loading Picture, waiting please.";
				mc.txt.border = true;
				mc.txt.textColor = 0xFF0000;
			};
			loadListener.onLoadError = function(mc:MovieClip, errorCode:String, httpStatus:Number) {
				mc.txt.text = "Failed to Load Picture.";
			};
			loadListener.onLoadInit = function(mc, N) {
				mc.w0 = mc._width;
				mc.h0 = mc._height;
				mc.src = srce;
				mc.id = _root.imgID++;
				mc._xscale = wt/mc._width*100;
				mc._yscale = ht/mc._height*100;
				mc.txt.text = "";
				mc.txt.border = false;
				mc.largePic = new MovieClip();
				mc.onPress = function() {
					this.largePic = _root.attachMovie("Bigger", "img_"+this.id, this.id);
					depth = this.largePic.getNextHighestDepth();
					this.largePic._x = 5;
					this.largePic._y = 10;
					this.largePic.Canvas = this.largePic.createEmptyMovieClip("Canvas_"+depth, depth);
					var mcLoader1:MovieClipLoader = new MovieClipLoader();
					var loadListener1:Object = new Object();
					mcLoader1.addListener(loadListener1);
					mcLoader1.loadClip(this.src, this.largePic.Canvas);
					loadListener1.onLoadInit = function(mc1, N) {
						mc1._xscale = 100;
						mc1._yscale = 100;
						mc1._parent.Resize(mc1._width+20, mc1._height+40);
						mc1._parent._x=(mc1._parent._parent._width-mc1._parent._width)/2;
						mc1._parent._y=(mc1._parent._parent._height-mc1._parent._height)/2-20;
						mc1._x = (mc1._parent._width-mc1._width)/2;
						mc1._y = (mc1._parent._height-mc1._height)/2+10;
						
					};
				};
			};
		}//end if
	
	
	}
}
