class FmtStr {
	var text:String;
	var type:String;
	var format:TextFormat;
	var background = -1;
	var width:Number;
	var height:Number;
	var geo:Array;
	var TField:TextField;
	var editable:Boolean;
	//-----------------------------------------------
	function FmtStr(str:String, Format:TextFormat, writable:Boolean) {
		text = str;
		type = "FmtStr";
		editable = writable;
		format = new TextFormat();
		format.font = Format.font;
		format.size = Format.size;
		format.color = Format.color;
		format.align = Format.align;
		format.bold = Format.bold;
		format.italic = Format.italic;
		background = -1;
		width = 0;
		height = 0;
		geo = new Array();
		getgeo();
	}
	//---------------------
	function getgeo():Array {
		var wh = format.getTextExtent(this.text);
		width = wh.width;
		height = wh.height;
		if (editable) {
			width *= 1.1;
			height *= 1.1;
		}
		geo = [this.width, this.height, this.height/2];
		return geo;
	}
	//---------------------
	function refresh():Void {
		//text = TField.text;
		getgeo();
	}
	//---------------------
	function changeColor(clr:Number):Void {
		format.color = clr;
	}
	//---------------------
	function create(mc:MovieClip, x:Number, y:Number):Void {
		TField = mc.writeStr(this, x, y);
	}
	//---------------------
	function write(mc:MovieClip, x:Number, y:Number, writable:Boolean, scale:Number, clr):Void {
		if (clr != undefined) {
			format.color = clr;
		}
		format.size *= scale;
		this.create(mc, x, y);
		
		
		TField.html=true
		
		TField.htmlText=this.text;

		TField.autoSize = "left";
		format.size /= scale;
		if (this.background != -1) {
			TField.background = true;
			TField.backgroundColor = this.background;
		}
		if (writable) {
			TField.type = "input";
			TField.background = true;
			TField.backgroundColor = 0xFFFFFF;
			TField.border = true;
			TField.borderColor = 0x0000AA;
			TField.autoSize = "left";
			TField.maxChars = TField.text.length;
			TField.text = "";
		} else {
			TField.background = false;
			TField.border = false;
			TField.type = "dynamic";
			TField.selectable = false;
		}
	}
}
