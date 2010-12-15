function SmartFso(){
	this.constructor.extend(this,ActiveX,["Scripting.FileSystemObject"]);
	this.attachAxMethods({
    "OpenTextFile":"OpenTextFile",
		"FileExists":"FileExists"
	});
}
SmartFso.prototype.toString=function(){
	return "[SmartFso]"
}
SmartFso.prototype.getCurrPath=function(){
	var arMatch=window.location.href.match(/^file:\/{3}(.+)\/.+$/i)
	var sPath=arMatch[1].replace(/\//g,"\\")
	return sPath
}
SmartFso.prototype.getFileText=function(sFile){
	var ForReading = 1, ForWriting = 2;
	var fso=new ActiveXObject("Scripting.FileSystemObject");
	var f=this.OpenTextFile(sFile,ForReading,-1);
	return f.ReadAll()
}
SmartFso.prototype.writeFileText=function(sFile,sText){
	var ForReading = 1, ForWriting = 2;
	var fso=new ActiveXObject("Scripting.FileSystemObject");
	var f=fso.OpenTextFile(sFile,ForWriting,-1);
	f.write(sText)
	f.close()
}
SmartFso.prototype.getFileLines=function(sFile){
	var ForReading = 1, ForWriting = 2;
	var fso=new ActiveXObject("Scripting.FileSystemObject");
	var f=fso.OpenTextFile(sFile,ForReading,-1);
	var arLine=[]
	while(!f.AtEndOfStream){
		arLine.push(f.ReadLine())
	}
	return arLine
}
SmartFso.prototype.getFolders=function(sPath){
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var folder = fso.GetFolder(sPath);
	var fc=new Enumerator(folder.SubFolders);
	var arRet=[]
	for (;!fc.atEnd(); fc.moveNext()){
		arRet.push(fc.item().name);
	}
	return arRet;
}
SmartFso.prototype.createFolder=function(sPath){
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var ar=sPath.replace(/\//g,"\\").split("\\")
	for(var i=0,sDir="";i<ar.length;i++){
		sDir+=ar[i]+"\\";
		if(!fso.FolderExists(sDir))fso.CreateFolder(sDir)
	}
}
SmartFso.prototype.getFiles=function(sPath){
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var folder = fso.GetFolder(sPath);
	var fc=new Enumerator(folder.files);
	var arRet=[]
	for (;!fc.atEnd(); fc.moveNext()){
		arRet.push(fc.item().name);
	}
	return arRet;
}
SmartFso.prototype.findFile=function(sPath,sName){
	var arFile=this.getFiles(sPath)
	for(var i=0;i<arFile.length;i++){
		if(arFile[i].toLowerCase()==sName.toLowerCase()){
			return arFile[i];
		}
	}
}
SmartFso.prototype.getFileNameNoExt=function(sPath){
	var ar=/([^\\]+?)(\.[^\\\.]+)?$/.exec(sPath.replace("/","\\"));
	if(ar)return ar[1];
	return "";
}
SmartFso.prototype.getRootPath=function(sPath){
	var sRoot=Server.mappath("./");	
	return sRoot.replace(/\\/g, "/").replace(/\/$/g,"").replace(/\//g,"\\");
}



