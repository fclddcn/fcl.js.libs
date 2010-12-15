class UPL extends Glyph {
	function UPL(den:Glyph, curFormat:TextFormat) {
		Fmt = curFormat;
		son[0] = [new Glyph(), 0, 0, 1];
		son[1] = [den, 0, 0, 1];
		refresh();
	}
	//-------------------------------------------------------------
	function refresh(x:Number):Void {
		var L = son[0][0];
		var D = son[1][0];
		var ex_length = Fmt.getTextExtent("x").width/2;
		if (x != undefined) {
			D.refresh(x);
		}
		var wd = D.geo[0]+ex_length;
		var ht = D.geo[1]+2;
		var dn = D.geo[1];
		L.son[0] = [new vector(wd, 0, 1, Fmt.color), 0, 0, 1];
		L.of = 1;
		L.geo = [wd, 1, 0.5];
		var Lx = 2;
		var Dx = (L.geo[0]-D.geo[0])/2;
		var Dy = 0;
		var Ly = D.geo[2]-D.geo[1]+1;
		geo = [wd, ht, dn];
		son = [[L, Lx, Ly, 1], [D, Dx, Dy, 1]];
	}
}
