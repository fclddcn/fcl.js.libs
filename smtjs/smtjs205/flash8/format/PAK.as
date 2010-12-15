class PAK extends Glyph
{
	function PAK (arr : Array, curFormat : TextFormat)
	{
		Fmt = curFormat;
		var wmax = 0;
		var hmax = 0;
		var dnmax = 0;
		for (var i = 0; i < arr.length; i ++){
			hmax = (hmax > (arr [i].geo [1] - arr [i].geo [2])) ? hmax : (arr [i].geo [1] - arr [i].geo [2]);
			dnmax = (dnmax > arr [i].geo [2]) ? dnmax : arr [i].geo [2];
			son.push ([arr [i] , wmax, 0, 1]);
			wmax += arr [i].geo [0];
		}
		geo = [wmax, hmax + dnmax, dnmax];
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
			son [i][1] = wd;
			wd += son [i][0].geo [0];
			ht = (ht < (son [i][0].geo [1] - son [i][0].geo [2])) ? (son [i][0].geo [1] - son [i][0].geo [2]) : ht;
			dn = (dn < son [i][0].geo [2]) ? son [i][0].geo [2] : dn;
		}
		geo = [wd, ht + dn, dn];
	};
}
