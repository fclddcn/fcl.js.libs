/*
 This statement is not permitted in a class definition
*/

function Html2Glyph(){
}
var s="<font color='#321'><b>fa</b></font>";
var r=new RegExp("color");
var ar=	r.exec(s);
trace(ar)
