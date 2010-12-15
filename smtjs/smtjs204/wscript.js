﻿function ActiveX(sName){
		var oInst=new ActiveXObject(sName);
		this.constructor.extend(this,Packer,[oInst])
}
function AppWScript(){
		this.constructor.extend(this,Application)
}
AppWScript.prototype.getHomePath=function(){
		var arMatch=WScript.ScriptFullName.match(/^(.+)\\.+$/);
		var sPath=arMatch[1];
		return sPath;
}
AppWScript.prototype.doEcho=function(arOutPutBuffer){
		WScript.echo(arOutPutBuffer.join("\n"));
}
function FileSystemObject(){
		this.constructor.extend(this,ActiveX,["Scripting.FileSystemObject"])
}
FileSystemObject.prototype.toString=function(){
		return "[FileSystemObject]";
}
/* 读文本文件内容 */
FileSystemObject.prototype.getFileText=function(sFile,sCharSet){
		if(!sCharSet)sCharSet="utf-8"
		var s=new ActiveXObject("Adodb.Stream");
		s.Type = 2; //text
		s.mode = 3; //r.w
		s.charset = sCharSet;
		s.open();
		s.LoadFromFile(sFile);
		return s.readtext();
}
/* 写文本文件内容 */
FileSystemObject.prototype.writeFileText=function(sFile,sText,sCharSet){
		if(!sCharSet)sCharSet="utf-8"
		var s=new ActiveXObject("Adodb.Stream");
		s.Type = 2; //text
		s.mode = 3; //r.w
		s.charset = sCharSet;
		s.open();
		s.WriteText(sText);
		s.SaveToFile(sFile, 2);
}
/* 路径下的所有文件 */
FileSystemObject.prototype.getFiles=function(sPath){
		var s=this.getPackIn()
		var folder = s.getFolder(sPath);
		var fc=new Enumerator(folder.files);
		var arRet=[]
		for (;!fc.atEnd(); fc.moveNext()){
				arRet.push(fc.item().name);
		}
		return arRet;
}
/* 路径下的所有文件夹 */
FileSystemObject.prototype.getFolders=function(sPath){
		var folder = this.getFolder(sPath);
		var fc=new Enumerator(folder.SubFolders);
		var arRet=[]
		for (;!fc.atEnd(); fc.moveNext()){
				arRet.push(fc.item().name);
		}
		return arRet;
}
/* 查找文件 */
FileSystemObject.prototype.findFile=function(sPath,sName){
		var arFile=this.getFiles(sPath)
		for(var i=0;i<arFile.length;i++){
				if(arFile[i].toLowerCase()==sName.toLowerCase()){
						return arFile[i];
				}
		}
}
/* 生成没有扩展名的文件名 */
FileSystemObject.prototype.getFileNameNoExt=function(sPath){
		var ar=/([^\\]+?)(\.[^\\\.]+)?$/.exec(sPath.replace(/\//g,"\\"));
		if(ar)return ar[1];
		return "";
}
/*  */
FileSystemObject.prototype.getFileNameExt=function(sPath){
		var ar=/([^\\]+?)(\.[^\\\.]+)?$/.exec(sPath.replace(/\//g,"\\"));
		if(ar)return ar[2];
		return "";
}
/*  */
FileSystemObject.prototype.getFileName=function(sPath){
		var ar=/([^\\]+)?$/.exec(sPath.replace(/\//g,"\\"));
		if(ar)return ar[1];
		return "";
}
/*  */
FileSystemObject.prototype.getFilePath=function(sPath){
		var ar=/(.+?)\\[^\\]+$/.exec(sPath.replace(/\//g,"\\"));
		if(ar)return ar[1];
		return "";
}
/* 建立文件夹 */
FileSystemObject.prototype.createFolder=function(sPath){
		var ar=sPath.replace(/[\\\/]+$/g).replace(/\//g,"\\").split("\\")
		for(var i=0,sDir="";i<ar.length;i++){
				sDir+=ar[i]+"\\";
				if(!this.method("folderExists",sDir)){
						this.__call("createFolder",sDir);
				}
		}
}
/* 读文件所有行*/
//~ FileSystemObject.prototype.getFileLines=function(sFile){
//~ var ForReading = 1, ForWriting = 2;
//~ var f=this.openTextFile(sFile,ForReading);
//~ var arLine=[]
//~ while(!f.AtEndOfStream){
//~ arLine.push(f.ReadLine())
//~ }
//~ return arLine
//~ }
/* 读文件所有行*/
FileSystemObject.prototype.getFileLines=function(sFile,sCharSet){
		var sText=this.getFileText(sFile,sCharSet);
		return sText.replace(/\r+/g,"\n").split(/\n+/);
}
