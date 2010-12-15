class Glyph {
	public var of:Number;
	public var son:Array;
	public var geo:Array;
	public var type:String;
	public var Fmt:TextFormat;
	//-------------------------
	function Glyph() {
		of = 0;
		son = new Array();
		geo = new Array();
		type = "Glyph";
		Fmt = new TextFormat();
	}
	//--------------------------------
	public function show(mc:MovieClip, x:Number, y:Number, scale:Number, writable:Boolean, clr):Void {
		var cur_x;
		var cur_y;
		if (clr != undefined) {
			Fmt.color = clr;
		}
		for (var i = 0; i<son.length; i++) {
			cur_x = x+son[i][1]*scale;
			cur_y = y+son[i][2]*scale;
			switch (son[i][0].type) {
			case "Glyph" :
				son[i][0].show(mc, cur_x, cur_y, son[i][3]*scale, writable, clr);
				break;
			case "FmtStr" :
				son[i][0].write(mc, cur_x, cur_y, writable, scale, clr);
				break;
			case "graph" :
				son[i][0].graph(mc, cur_x, cur_y, scale, clr);
				break;
			case "Image" :
				son[i][0].show(mc, cur_x, cur_y, scale);
			default :
				break;
			}
		}
	}
	//----------------------
	public function refresh():Void {
		for (var i = 0; i<son.length; i++) {
			son[i][0].refresh();
		}
	}
}
