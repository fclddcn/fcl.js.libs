// -*- gofile: "Html2Glyph.swf"; -*-

var s="<font color='red'><b>fa</b>11</font>";
var r=new RegExp("<(\\w+)\\s[^<>/]*>(.*)</\\1>","g");

while(ar=r.exec(s)){
	trace(ar)
}
