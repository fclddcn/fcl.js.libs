class Sfx extends Glyph
{
	function Sfx (bas : Glyph, subs : Glyph, curFormat : TextFormat)
	{
		Fmt = curFormat;
		son [0] = [bas, 0, 0, 1];
		son [1] = [subs, 0, 0, 1];
		refresh ();
	}
	function refresh (x : Number) : Void
	{
		var N = son [0][0];
		var D = son [1][0];
		if (x != undefined)
		{
			N.refresh (x);
			D.refresh (x);
		}
		var wd = N.geo [0] + D.geo [0] * 0.5;
		var ht, dn, Dy;
		ht = N.geo [1] - N.geo [2] + D.geo [1] * 0.5;
		dn = ht - (N.geo [1] - N.geo [2]);
		Dy = (D.geo [1] - N.geo [2]) / 2;
		geo = [wd, ht, dn];
		son = [[N, 0, 0, 1] , [D, N.geo [0] , Dy, 0.5]];
	};
}
