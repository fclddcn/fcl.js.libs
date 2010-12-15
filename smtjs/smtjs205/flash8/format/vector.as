class vector {
	var type:String;
	var x:Number;
	var y:Number;
	var thin:Number;
	var length:Number;
	var width:Number;
	var height:Number;
	var color:Number;
	//---------------------------------
	function vector(x1:Number, y1:Number, thin0:Number, cur_color:Number) {
		type = "graph";
		x = x1;
		y = y1;
		thin = thin0;
		length = Math.sqrt(x*x+y*y);
		width = Math.abs(x);
		height = Math.abs(y);
		color = cur_color;
	}
	//--------------------
	function graph(mc:MovieClip, x0:Number, y0:Number, scale:Number, clr):Void {
		if (clr != undefined) {
			color = clr;
		}
		mc.gline(x0, y0, x0+x*scale, y0+y*scale, color, 100, thin*scale);
	}
}
