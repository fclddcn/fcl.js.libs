var system = require("glue_system");
///////////////////////////////////////////////////////////////
var includer=include("glue/includer.js");
includer.extend(this,"glue/global.js");
includer.extend(this,"common.js");
//var global=require("glue/global.js")

///////////////////////////////////////////////////////////////
// print(__script__.filename)
// print(this.filename)
// 
///////////////////////////////////////////////////////////////
var files = system.glob("d:/*.*", system.glob.CASELESS);
files.each(function(v){
		//print("found file: {$me}\n".fillHash({me:v}));
});
///////////////////////////////////////////////////////////////
function Aaa(a){
		print(a);
}
function Bbb(){
		this.constructor.extend(this,Aaa,arguments);
}
///////////////////////////////////////////////////////////////
function P2(){
		this.constructor.extend(this,Packer,[])
}
var a=new P2();
///////////////////////////////////////////////////////////////
function ppp(){
		print(arguments[0])
}
