/*
//~ # 字串函式 [XPath]
//~ * concat 函式
//~ * contains 函式
//~ * normalize-space 函式
//~ * starts-with 函式
//~ * string 函式
//~ * string-length 函式
//~ * substring 函式
//~ * substring-after 函式
//~ * substring-before 函式
//~ * translate 函式
---------------------------------
element
---------------------------------
appendInnerHTML
appendChild
appendAttribute
fillHash
getAttributes
getXmlNode
getParentNode
getParentNode
getNextSibling
getElementById
getOuterHTML
getInnerHTML
getChildren
getAttribute
getElementsByTagName
getElementByXPath
getElementsByXPath()
insertHTMLBefore
insertHTMLAfter
nodesFromHTML
remove
removeAttribute
setInnerHTML
setStyle
setAttribute
toString
*/
function Element(oXmlNode){
	this.constructor.extend(this,AxPacker,[oXmlNode]);
	this.attachAxMethods({
		"selectNodes":"selectNodes"
	});
	this.attachAxProps({
		"tagName":"TagName"
		,"nodeType":"NodeType"
	})
}
Element.prototype.toString=function(){
	return "[ServerElement]"
}
Element.prototype.getXmlNode=function(){
	return this.getActiveXObject()
}
Element.prototype.getAttributes=function(){
	var hsAtt={}
	var oAttSet=this.getActiveXObject().attributes
	for(var i=0;i<oAttSet.length;i++){
		oAtt=oAttSet[i]
		hsAtt[oAtt.name]=oAtt.value;
	}
	return hsAtt
}
Element.prototype.setInnerHTML=function(sHTML){
	this.getActiveXObject().text="";
	this.appendInnerHTML(sHTML);
}
Element.prototype.appendInnerHTML=function(sHTML){
	var arNode=this.nodesFromHTML(sHTML.toString());
	for(var i=0;i<arNode.length;i++){
		this.getActiveXObject().appendChild(arNode[i]);
	}
}
Element.prototype.removeAttribute=function(sAtt){
	this.getActiveXObject().removeAttribute(sAtt);
}
Element.prototype.setStyle=function(sName,sValue){
	var sStyle=this.getAttribute("style")
	if(!sStyle)sStyle=""
	sStyle=sStyle.replace(/\s{2,}/g,"");
	var r=new RegExp("(^|\;)\s?("+sName+")\s?\:[^\;]+(\;|$)","i")
	if(r.test(sStyle)){
		sStyle=sStyle.replace(r,function(a,b,c,d){
			return b+c+":"+sValue+d
		})
	}else{
		sStyle+=";"+sName+":"+sValue
	}
	this.setAttribute("style",sStyle)
}
Element.prototype.getOuterHTML=function(){
	return this.getActiveXObject().xml;
}
Element.prototype.setOuterHTML=function(sHTML){
	try{
		var arNode=this.nodesFromHTML(sHTML);
		for(var i=0;i<arNode.length;i++){
			this.getActiveXObject().parentNode.insertBefore(arNode[i],this.getActiveXObject());
		}	
		this.remove();
	}catch(e){
		throw new Errot("setOuterHTML error")
	}
}
Element.prototype.getInnerHTML=function(){
	var arChild=this.getActiveXObject().childNodes;
	var sRet="";
	for(i=0;i<arChild.length;i++){
		sRet+=arChild[i].xml;
	}
	return sRet;
}
Element.prototype.fillHash=function(h){
	var sHTML=this.getOuterHTML().fillHash(h)
	this.setOuterHTML(sHTML);
	return sHTML;
}
Element.prototype.remove=function(){
	this.getActiveXObject().parentNode.removeChild(this.getActiveXObject());
}
Element.prototype.getChildren=function(){
	return this.getActiveXObject().childNodes;
}
Element.prototype.getAttribute=function(sAtt){
	return this.getActiveXObject().getAttribute(sAtt);
}
Element.prototype.appendAttribute=function(sAtt,sVal){
	var sOld=this.getAttribute(sAtt);
	if(!sOld)sOld="";
	this.setAttribute(sAtt,sOld+sVal);
}
Element.prototype.setAttribute=function(sAtt,sVal){
	this.getActiveXObject().setAttribute(sAtt,sVal);
}
Element.prototype.nodesFromHTML=function(sHTML){
	sHTML=sHTML.replace(/&nbsp;/ig,"&#160;")
	var oXmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	var sXML="<x>"+sHTML+"</x>";
	var arNode=new Array();
	if(oXmlDoc.loadXML(sXML)){
		var arChild=oXmlDoc.documentElement.childNodes;
		for(var i=0;i<arChild.length;i++){
			arNode.push(arChild[i].cloneNode(true));
		}
	}else{
		Response.write("<?xml version=\"1.0\" encoding=\"gb2312\"?>\n"+sXML)
		Response.ContentType="text/xml" //不能写成 Response.AddHeader("Content-Type","text/xml")
		Response.end()
	}
	return arNode;
}
Element.prototype.insertHTMLBefore=function(sHTML,oElem){
	var arNode=this.nodesFromHTML(sHTML);
	for(var i=0;i<arNode.length;i++){
		this.getActiveXObject().insertBefore(arNode[i],oElem.getXmlNode());
	}
}
Element.prototype.insertHTMLAfter=function(sHTML,oElem){
	var arNode=this.nodesFromHTML(sHTML);
	var elBefore=oElem.getNextSibling()
	for(var i=0;i<arNode.length;i++){
		this.getActiveXObject().insertBefore(arNode[i],elBefore.getXmlNode());
	}
}
Element.prototype.getParentNode=function(){
	return new Element(this.getActiveXObject().parentNode)
}

Element.prototype.getNextSibling=function(){
	return new Element(this.getActiveXObject().nextSibling)
}
Element.prototype.getElementById=function(sId){
	var oXNode,oElem=null;
	/*
	var this.getActiveXObject()=this.getActiveXObject().getElementsByTagName("*[@id=\""+sId+"\"]")[0];
	*/
	oXNode=this.getActiveXObject().selectSingleNode(".//*[@id='{$0}']".fill(sId));
	if(oXNode){
		oElem=new Element(oXNode); 
	}
	return oElem;
}
Element.prototype.appendChild=function(oElem){
	this.getActiveXObject().appendChild(oElem.getXmlNode());
}
Element.prototype.getElementsByTagName=function(sTag){
	var arElem=[]
	var arXmlNode=this.getActiveXObject().getElementsByTagName(sTag);
	for(var i=0;i<arXmlNode.length;i++){
		arElem.push(new Element(arXmlNode[i])); 
	}
	return arElem;
}
Element.prototype.getElementsByXPath=function(sXPath){
	var arElem=[]
	var arXmlNode=this.getXmlNode().selectNodes(sXPath);
	for(var i=0;i<arXmlNode.length;i++){
		arElem.push(new Element(arXmlNode[i])); 
	}
	return arElem;
}
Element.prototype.getElementByXPath=function(sXPath){
	var oXNode,oElem=null;
	var oXNode=this.getActiveXObject().selectSingleNode(sXPath);
	if(oXNode){
		oElem=new Element(oXNode); 
	}
	return oElem;
}




