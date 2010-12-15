var sFileArg=WScript.arguments(0);
/**/
function echo(s){
	WScript.echo(s)
}
/**/
function Runner(){
	this.buffer=[]
}
Runner.prototype.getFileText=function(sFile,sCharSet){
	var s=new ActiveXObject("Adodb.Stream");
	s.Type = 2; //text
	s.mode = 3; //r.w
	s.charset = sCharSet;
	s.open();
	s.LoadFromFile(sFile);
	return s.readtext();	
}
Runner.prototype.dealImport=function(sFile){
	var self=this;
	try{
		var sText=this.getFileText(sFile,"utf-8");
	}catch(e){
		throw new Error("\n无法打开文件"+sFile);
	}
	sText=sText.replace(/([\r\n]|^)\s*import\s+['"]([^\'\"\n\r\;]+?)['"][^\n\r]*?(\/\/|\/\*|[\r\n]|$)/ig,function(a,b,c){
		self.dealImport(c);
		return "";
	})
	this.buffer.push({code:sText,file:sFile})
}
Runner.prototype.runFile=function(sFile){
	this.dealImport(sFile)
	for(var i=0;i<this.buffer.length;i++){
		try{
			var b=this.buffer[i];
			eval(b.code);
		}catch(e){
			throw new Error("\n文件："+b.file+"\n信息："+e.message);
		}
	}
}
/**/
new Runner().runFile(sFileArg)