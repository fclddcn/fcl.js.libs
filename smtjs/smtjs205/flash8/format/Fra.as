class Fra extends Glyph
{
	function Fra (num : Glyph, den : Glyph, curFormat : TextFormat)
	{
		Fmt = curFormat;
		son [0] = [new Glyph () , 0, 0, 1];
		son [1] = [num, 0, 0, 1];
		son [2] = [den, 0, 0, 1];
		refresh ();
	}
	//-------------------------------------------------------------
	function refresh (x : Number) : Void
	{
		var L = son [0][0];
		var N = son [1][0];
		var D = son [2][0];
		var ex_length = Fmt.getTextExtent ("x").width / 2;
		if (x != undefined)
		{
			N.refresh (x);
			D.refresh (x);
		}
		var wd = Math.max (N.geo [0] , D.geo [0]) + ex_length;
		var ht = N.geo [1] + D.geo [1] - 4;
		var dn = D.geo [1] -2;
		L.son [0] = [new vector (wd, 0, 1, Fmt.color) , 0, 0, 1];
		L.of = 1;
		L.geo = [wd, 1, 0.5];
		var Lx = 2;
		var Nx = (L.geo [0] - N.geo [0]) / 2;
		var Ny = - N.geo [2];
		var Dx = (L.geo [0] - D.geo [0]) / 2;
		var Dy = D.geo [1] - D.geo [2] - 2;
		var Ly = 2;
		geo = [wd, ht, dn];
		son = [[L, Lx, Ly, 1] , [N, Nx, Ny, 1] , [D, Dx, Dy, 1]];
	};
}
