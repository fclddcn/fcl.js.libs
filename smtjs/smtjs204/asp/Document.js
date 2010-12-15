//文档对象
function Document(){
	var self=this;
	var oXml=new ActiveXObject("Microsoft.XMLDOM")
	oXml.setProperty("SelectionLanguage", "XPath");
	oXml.async = false;
	this.constructor.extend(this,Element,[oXml]); //Msxml2.DOMDocument
	this.toString=function(){
		return "[document]"
	}
	this.loadView("base");
}
Document.prototype.applyRole=function(){
	var arRoleElem=this.getElementsByTagName("*[@for]");
	for(var i=0;i<arRoleElem.length;i++){
		var sFor=arRoleElem[i].getAttribute("for")
		var sFencePage=arRoleElem[i].getAttribute("fencePage")
		if(sFor+""!=""){
			var arFor=sFor.split(",")
			var bInRole=false
			for(var j=0;j<arFor.length;j++){
				bInRole=bInRole||currUser.isInRole(arFor[j])
				if(bInRole)break;
			}
			if((!bInRole||!currUser.haveLogin())){
				if(sFencePage){
					Response.redirect(sFencePage+"&backUrl={$0}?{$1}".fill(Request.ServerVariables("URL"),Request.ServerVariables("QUERY_STRING")));
				}else{
					arRoleElem[i].remove()
				}
			}
		}
	}
}
Document.prototype.loadView=function(sViewName){
	//加载视图
	var sPath="{$0}\\{$1}\\{$2}.xml".fill(smartAsp.getRootPath(),"view",sViewName);
	if(!this.getXmlNode().load(sPath)){
		Response.ContentType = "text/xml"
		Response.write(getFileText(sPath))
		Response.end()
	}
	//if(sViewName.indexOf("base")>-1)die(this.getInnerHTML())
	//检查nav
	this.applyNav()
	//加载子视图，加载文档之后立即加载，起到视图分开管理的作用，子视图可以嵌套
	//注意，不符nav的元素下的子视图，自然不会加载
	//这里要再次执行applyArea
	for(var arSubView=this.getElementsByTagName("subview[@srcname]");arSubView.length>0;arSubView=this.getElementsByTagName("subview[@srcname]")){
		this.applyRole() //检查role
		for(var i=0;i<arSubView.length;i++){
			try{
				var elSubView=arSubView[i]
				var sSrcName=elSubView.getAttribute("srcname")
				var xmlNode=new ActiveXObject("Microsoft.XMLDOM")
				var sPath="{$0}\\{$1}\\{$2}.xml".fill(smartAsp.getRootPath(),"view",sSrcName);
				if(!xmlNode.load(sPath)){
					//throw new Error("Fail to load view file")
					Response.ContentType = "text/xml"
					Response.write(getFileText(sPath))
					Response.end()
				}
				var oNodeTemp=new Element(xmlNode.documentElement);
				elSubView.setOuterHTML(oNodeTemp.getInnerHTML())
			}catch(e){
				throw new Error("加载子视图'{$0}.xml'出错,{$1}".fill(sSrcName,e.message))
			}
		}
		this.applyNav() //检查nav
	}
	this.applyRole() //检查role
}
Document.prototype.loadXML=function(sXml){
	if(!this.getXmlNode().loadXML(sXml)){
		throw("Fail to load XML")
	}
}
Document.prototype.getDocumentElem=function(){
	return this.getElementByXPath("//html");
}
Document.prototype.getBody=function(){
	return this.getElementByXPath("//html/body");
}
Document.prototype.getHead=function(){
	return this.getElementByXPath("//html/head");
}
Document.prototype.setTitle=function(sTitle){
	this.getTitle().setInnerHTML(sTitle)
}
Document.prototype.getTitle=function(){
	return this.getElementByXPath("//html/head/title");
}
Document.prototype.getStyle=function(){
	return this.getElementByXPath("//html/head/style");
}
Document.prototype.createElement=function(sTagName){
	var oXmlElem=this.getXmlNode().createElement(sTagName);
	var oElem=new Element(oXmlElem);
	return oElem;
}
Document.prototype.render=function(){
	//this.applyNav()
	//填充eval属性
	var ar=this.getElementsByXPath("//@*[starts-with(.,'eval:')]")
	for(var i=0;i<ar.length;i++){
		var node=ar[i].getXmlNode()
		var value=node.value
		value=value.substring(value.indexOf(":")+1)
		value=value.fillHash(function(s){
			try{
				var r=eval(s)
			}catch(e){
				throw new Error("计算eval填充时失败{$0}".fill(e.message))
			}
			return r
		})
		node.selectSingleNode("..").setAttribute(node.nodeName,value)
	}
	//删除 checked='false'
	var arNotCheck=this.getElementsByTagName("*[@checked='false']");
	for(var i=0;i<arNotCheck.length;i++){
		arNotCheck[i].removeAttribute("checked")
	}
	//删除 selected='false'
	var arNotCheck=this.getElementsByTagName("*[@selected='false']");
	for(var i=0;i<arNotCheck.length;i++){
		arNotCheck[i].removeAttribute("selected")
	}
	//删除 disabled='false'
	var arNotCheck=this.getElementsByTagName("*[@disabled='false']");
	for(var i=0;i<arNotCheck.length;i++){
		arNotCheck[i].removeAttribute("disabled")
	}
	//删掉隐藏的控件
	var arElemHide=this.getElementsByTagName("*[@visible='false']");
	for(i=0;i<arElemHide.length;i++){
		arElemHide[i].remove();
	}
	//清除其它
	var arElemHide=this.getElementsByTagName("*[@rendertype]");
	if(arElemHide.length>0){
		var arType=arElemHide[0].getAttribute("rendertype").toLowerCase().split(",")
		this.printElement(arElemHide[0],arType.find("clearall"),arType.find("inneronly"))
	}
	//删掉服务器端属性
	var arAttRmv=["visible","nav"];
	for(var i=0;i<arAttRmv.length;i++){
		this.deleteAttributes(arAttRmv[i]);
	}
	//添加令牌
	var arElem=this.getElementsByTagName("form[@token='true']");
	if(arElem.length>0){
		var token=Session("token")?Session("token"):Math.random("9")
		for(var i=0;i<arElem.length;i++){
			arElem[i].appendInnerHTML("<input type='hidden' value='{$0}' name='token'/>".fill(token))
		}
		Session("token")=token
	}
	//处理radio group
	var arElem=this.getElementsByTagName("group[@type='radio']");
	for(var i=0;i<arElem.length;i++){
		var value=arElem[i].getAttribute("value")
		var elRadio=arElem[i].getElementByXPath("input[@type='radio'][@value='{$0}']".fill(value))
		if(elRadio)elRadio.setAttribute("checked","true")
		arElem[i].setOuterHTML(arElem[i].getInnerHTML())
	}
	//处理query hold group
	var arElem=this.getElementsByTagName("form");
	function getQueryStrings(){
		var q={}
		for(var i=1;i<=Request.QueryString.Count;i++){
			q[Request.QueryString.Key(i)]=Request.QueryString(i)
		}
		return q
	}
	for(var i=0;i<arElem.length;i++){
		var sFields=arElem[i].getAttribute("holdFields")
		var arValue=[]
		if(sFields=="%all%"){
			var q=getQueryStrings()
			for(var k in q){
				arValue.push(k)
			}
		}else if(sFields){
			arValue=sFields.split(",")
		}else{
			continue;
		}
		var sFieldsWithOut=arElem[i].getAttribute("withOutfields")
		var arWithOut=[]
		if(sFieldsWithOut){
			arWithOut=sFieldsWithOut.split(",");
		}
		for(var j=0;j<arValue.length;j++){
			if(arWithOut.find(function(s){return s==arValue[j]})){
				arValue.splice(j,1)
			}
		}
		for(var j=0;j<arValue.length;j++){
			arElem[i].appendInnerHTML("<input type='hidden' name='{$0}' value='{$1}'/>".fill(arValue[j],qr_s(arValue[j])))
		}
	}
	this.printDocType()
	this.printDocument()
}
Document.prototype.printDocType=function(){
	echo("<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.0 Transitional//EN' 'http://www.w3.org/TR/REC-html40/loose.dtd'>\n")
}
/* 输出元素 */
Document.prototype.printElement=function(paramElement,bClearAll,bInnerOnly){
	if(typeof paramElement=="string"){
		paramElement=$(paramElement)
	}
	var sHTML=bInnerOnly?paramElement.getInnerHTML():paramElement.getOuterHTML()
	if(bClearAll){
		this.getDocumentElem().setInnerHTML(sHTML)
	}else{
		$("m_body").setInnerHTML(sHTML)
	}
}
/* 输出页面 */
Document.prototype.printDocument=function(){
	var sHTML=this.getDocumentElem().getOuterHTML()
	echo(unescape(sHTML.replace(/\xA0/g,"&nbsp;").replace(/\&amp\;/g,"&")));
}
Document.prototype.applyNav=function(){
	try{
		var arElem=this.getElementsByTagName("*[@nav]");
		var self=this;
		for(i=0;i<arElem.length;i++){
			var sAttr=arElem[i].getAttribute("nav").toLowerCase()
			var bFound=false;
			var arNav=sAttr.split(";") //查找';'分隔的各段
			for(var j=0;j<arNav.length;j++){
				if(sAttr.trim()==""){
					bFound=true;
					break;
				}			
				if(arNav[j].trim()=="")continue;
				var sRegExp=arNav[j].replace(/\./g,"\\.").replace(/\,/g,"|").replace(/\?|\*/g,function(a){
					if(a=="*")return ".*?";
					if(a=="?")return "[a-zA-Z0-9]*?"
				})
				if(new RegExp("^({$0})$".fill(sRegExp),"i").test(qr("nav"))){
					bFound=true;
					break;
				}
			}
			if(!bFound){
				arElem[i].remove()
			}
		}
	}catch(e){
		echo("applyNav: "+e.message)
	}
}
Document.prototype.deleteAttributes=function(sAtt){
	var arElemHide=this.getXmlNode().getElementsByTagName("*[@"+sAtt+"]");
	for(i=0;i<arElemHide.length;i++){
		arElemHide[i].removeAttribute(sAtt);
	}
}
Document.prototype.addControler=function(sName){
	var oCls=Class.create();
	controlers[sName.toLowerCase()]=oCls;
	return oCls
}
