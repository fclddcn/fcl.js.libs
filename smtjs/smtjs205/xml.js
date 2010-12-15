function XmlNode(nd){
		this.constructor.extend(this,Packer,[nd]);
}
XmlNode.prototype.selectNodes=function(sXPath){
		var nd=this.getPackIn();
		var arNode=nd.selectNodes(sXPath); 
		return new Array().fillArray(arNode);
}
XmlNode.prototype.selectSingle=function(sXPath){
		var nd=this.getPackIn();
		var r=nd.selectSingleNode(sXPath); 
		return r;
}

XmlNode.prototype.getInnerXml=function(sXPath){
		var arChild=this.get("childNodes")
		var sRet=""
		new Array().fillArray(arChild).each(function(v){
				sRet+=v.xml;
		})
		return sRet;
}
function XmlDoc(sText){
		if (jQuery.browser.msie){//ie
				var signatures=[
						//"Msxml2.DOMDocument.6.0",
						"Msxml2.DOMDocument.5.0"
						//"Msxml2.DOMDocument.4.0",
						//"Msxml2.DOMDocument.3.0",
						//"Msxml2.DOMDocument",
						//"Msxml2.XmlDom",
						//"Microsoft.XmlDom"
				];
				var d=null
				signatures.each(function(v){
						try{
								d=new ActiveXObject(v);
						}catch(e){}
						if(d){
								//alert("您系统中可用的MSXML版本为:\n"+v);
								return false;
						}
				})
				if(!d)throw new Error("没有发现可用的xml引擎")
				d.loadXML(sText);
		}else{ //firefox
				var parser=new DOMParser();
				var d=parser.parseFromString(sText,"text/xml" );
				//
				XMLDocument.prototype.selectNodes = function (xpath){
						var xpe = new XPathEvaluator();
						var nsResolver = xpe.createNSResolver( 
								this .ownerDocument == null ?this.documentElement : this .ownerDocument.documentElement);
						var result = xpe.evaluate(xpath, this , nsResolver, 0 , null );
						var found = [];
						var res;
						while (res = result.iterateNext()){
								found.push(res);
						}
						return found;
				}
		}
		this.constructor.extend(this,Packer,[d]);
}
XmlDoc.prototype.getRootNode=function(){
		var d=this.getPackIn();
		return d.documentElement;
}
