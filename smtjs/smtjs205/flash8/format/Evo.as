class Evo extends Glyph
{
	function Evo (bas : Glyph, N : Glyph, curFormat : TextFormat)
	{
		Fmt = curFormat;
		son [0] = [N, 0, 0, 1];
		son [1] = [new Glyph () , 0, 0, 1];
		son [2] = [bas, 0, 0, 1];
		refresh ();
	}
	//------------------------------------------------
	function refresh (x : Number) : Void
	{
		var N = son [0][0];
		var S = son [1][0];
		var B = son [2][0];
		if (x != undefined)
		{
			N.refresh (x);
			B.refresh (x);
		}
		S.of = 1;
		var h = B.geo [1]-2;
		var w = B.geo [0] + 4;
		S.son [0] = [new vector (h / 8, - h / 4, 1, Fmt.color) , 0, h / 4, 1];
		S.son [1] = [new vector (h / 8, h / 2, 1, Fmt.color) , h / 8, 0, 1];
		S.son [2] = [new vector (h / 4, - h + 2, 1, Fmt.color) , h / 4, h / 2, 1];
		S.son [3] = [new vector (w, 0, 1, Fmt.color) , h / 2, - h / 2 + 2, 1];
		S.geo = [w + h, h , h / 2];
		var wd = (N.geo [0] >= h) ? S.geo [0] + N.geo [0] * 0.5 : S.geo [0];
		var ht = Math.max (B.geo [2] + N.geo [1] * 0.7, S.geo [1]);
		var dn = B.geo [2];
		geo = [wd, ht, dn];
		var Ny = - N.geo [2]/2;
		var Sx = (N.geo [0] >= h) ? (N.geo [0] - h) / 2 + h / 4 : h / 8;
		var Sy = 0;
		son = [[N, h/8, Ny, 0.5] , [S, Sx, Sy, 1] , [B, Sx + h / 2 + 1, 0, 1]];
	};
}
