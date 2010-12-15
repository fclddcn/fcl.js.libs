class Epn extends Glyph
{
	function Epn (bas : Glyph, ept : Glyph, curFormat : TextFormat)
	{
		Fmt = curFormat;
		son [0] = [bas, 0, 0, 1];
		son [1] = [ept, 0, 0, 1];
		refresh ();
	}
	//------------------------------------------------
	function refresh (x : Number) : Void
	{
		var B = son [0][0];
		var N = son [1][0];
		if (x != undefined)
		{
			B.refresh (x);
			N.refresh (x);
		}
		var Ny = -N.geo[2]/2;
		var wd = B.geo [0] + N.geo [0] * 0.5;
		var ht = Math.max (B.geo [1] , B.geo [2] + N.geo [1] * 0.5);
		var dn = B.geo [2];
		geo = [wd, ht, dn];
		son = [[B, 0, 0, 1] , [N, B.geo [0] , Ny, 0.5]];
	};
}
