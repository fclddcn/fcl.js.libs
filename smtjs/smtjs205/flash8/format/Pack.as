class Pack extends Glyph {
	function Pack(x:String, curFormat:TextFormat, writable:Boolean) {
		Fmt = curFormat;
		var Fmt_x = new FmtStr(x, Fmt, writable);
		of = 0;
		son[0] = [Fmt_x, 0, -Fmt.getTextExtent("x").height/2, 1];
		geo = Fmt_x.getgeo();
	}
	//------------------------------------------------
	function refresh(x:Number) {
		son[0][0].refresh();
		geo = son[0][0].getgeo();
	}
}
