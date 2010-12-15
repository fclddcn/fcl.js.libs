class Lag extends Glyph
{
	function Lag (arr : Array, curFormat : TextFormat)
	{
		Fmt = curFormat;
		var wmax = 0;
		var hmax = 0;
		var dnmax = 0;
		for (var i = 0; i < arr.length; i ++)
		{
			wmax = (wmax > arr [i].geo [0]) ? wmax : arr [i].geo [0];
			son.push ([arr [i] , 0, hmax + arr [i].geo [2] , 1]);
			hmax += arr [i].geo [1];
		}
		dnmax = hmax - (arr [0].geo [1] - arr [0].geo [2])+3
		geo = [wmax, hmax , dnmax];
	}
	//---------------------------------
	function refresh (x : Number) : Void
	{
		var wd = 0;
		var ht = 0;
		var dn = 0;
		for (var i = 0; i < son.length; i ++)
		{
			son [i][0].refresh (x);
			son [i][2] = ht - son [i][0].geo [2];
			ht += son [i][0].geo [1];
			wd = (wd < son [i][0].geo [0]) ? son [i][0].geo [0] : wd;
		}
		dn = ht - (son [0][0].geo [1] + son [0][0].geo [2])+3
		geo = [wd, ht + dn, dn];
	};
}
