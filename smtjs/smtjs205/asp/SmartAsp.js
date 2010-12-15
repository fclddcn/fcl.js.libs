function SmartAsp(){
	this.constructor.extend(this,SmartFso);
}
/* 得到请求的Controller  */
SmartAsp.prototype.getNavControllerName=function(){
	var sNav=qr_s("nav");
	var arNav=sNav.split(", ")[0].split(".");
	if(arNav.length>1){
		arNav.pop();
		return arNav.join(".");
	}
}
/* 得到请求的Action  */
SmartAsp.prototype.getNavActionName=function(){
	var sNav=qr_s("nav");
	var arNav=sNav.split(", ")[0].split(".");
	if(arNav.length>1){
		return arNav[arNav.length-1];
	}
}
/* @sName 形如 "Aa.Bb.Cc"
 * @得到 Cc
 */
SmartAsp.prototype.getController=function(sName){
	var sRootPath=this.getRootPath();
	return this.findClass(sRootPath+"\\controller",sName);
}

/* @sName 形如 "Aa.Bb.Cc"
 * @得到 Cc
 */
SmartAsp.prototype.getModel=function(sName){
	var sRootPath=this.getRootPath();
	return this.findClass(sRootPath+"\\model\\",sName);
}
/* @sPath 形如 "D:\path"
 * @sName 形如 "Aa.Bb.Cc"
 * @得到 Cc
 */
SmartAsp.prototype.findClass=function(sPath,sName){
	var sFileName=this.findFile(sPath, sName+".js")
	if(!sFileName){
		throw new Error("class file not found," +sName);
	}
	try{
		return importc(sPath+"\\"+sFileName,this.getFileNameNoExt(sFileName))
	}catch(e){
		throw new Error(e.message)
	}
}
