function Ajax(sUrl,hsArgs){
		var r=(
				this.mkax('Msxml3.XMLHTTP')||
						this.mkax('Msxml2.XMLHTTP')||
						this.mkax('Microsoft.XMLHTTP')||
						new XMLHttpRequest()
		);
		if(!r)throw new Error("Browser don't support Ajax Object.")
		this.constructor.extend(this,Packer,[r])
		this.setArgs(hsArgs);
		this.initObject();
		this.send(sUrl);
}
Ajax.prototype.getClassName=function(){
		return "Ajax"
}
Ajax.prototype.mkax=function(sName){
		var ax=null;
		try{ax=new ActiveXObject(sName)}catch(e){}
		return ax;	
}
Ajax.prototype.setArgs=function(hsArgs){
		var hs={
				method:"post",
				asynchronous:true,
				parameters:''
		}
		for(var k in hsArgs){
				hs[k]=hsArgs[k];
		}
		this.getArgs=function(){
				return hs;
		}
}
Ajax.prototype.initObject=function(){
		var self=this
		var req=this.getPackIn();
		var hsOpt=this.getArgs();
		/* patch some moz */
		if(req.readyState == null) {
				//req.readyState = 1;
				req.addEventListener("load", function () {
						req.readyState = 4;
						if (typeof req.onreadystatechange == "function"){
								req.onreadystatechange(req);
						}
				}, false
														);
		}
		/*   */
		if(hsOpt.asynchronous) {
				req.onreadystatechange=function(){
						self.onReadyState(req.readyState)
				}
		}
		this.getPackIn=function(){return req}
}
Ajax.prototype.send=function(sUrl){
		var hsOpt=this.getArgs();
		var req=this.getPackIn();
		req.open(hsOpt.method,sUrl,hsOpt.asynchronous);
		var isPost=hsOpt.method.toLowerCase()=="post"
		if(isPost){
				req.setRequestHeader("content-length",100);    
				req.setRequestHeader("content-type","application/x-www-form-urlencoded");     
		}
		req.send(isPost?hsOpt.parameters:null);
}
Ajax.prototype.callBack=function(){
		throw new Error(this);
}
Ajax.prototype.responseIsSuccess=function(s){
		return s == undefined || s == 0 || (s >= 200 && s < 300);	
}
Ajax.prototype.getStateName=function(n){
		return ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'][n];
}
Ajax.prototype.responseIsFailure=function(s){
		return !this.responseIsSuccess(s);
}
Ajax.prototype.onReadyState= function(nReadyState) {
		var event=this.getStateName(nReadyState)
		var req=this.getPackIn();
		var hsOpt=this.getArgs();
		if (event == 'Complete') {
				if(!hsOpt['on' + event]){
						event=this.responseIsSuccess(req.status) ? 'Success' : 'Failure'
				}
				/* if ((this.header('Content-type') || '').match(/^text\/javascript/i))this.evalResponse(); */
				if(/^\uFEFF/.test(req.responseText)){
						this.utf8bom=true;
				}
		}
		try{
				if(hsOpt['on' + event])hsOpt['on' + event](req);
		}catch(e){
				if(hsOpt['onException'])hsOpt['onException'](e);
		}
		/* Avoid memory leak in MSIE: clean up the oncomplete event handler */
		if (event == 'Complete')
				req.onreadystatechange = null;
}
function AppBrowser(){
		this.constructor.extend(this,Application)
		this.constructor.extend(this,FileSystemObject)
		this.constructor.extend(this,BrwzWin)
}
AppBrowser.prototype.toString=function(){
		return "[AppBrowser]";
}
AppBrowser.prototype.getClassName=function(){
		return "AppBrowser";
}
AppBrowser.prototype.outPutBuffer=null;
AppBrowser.prototype.getHomePath=function(){
		var arMatch=window.location.href.match(/^(.+)\/.+$/);
		var sPath=arMatch[1].replace(/file:\/{3}/,'').replace(/\//g,"\\");
		return unescape(sPath);	
}
AppBrowser.prototype.doEcho=function(arOutPutBuffer){
		alert(arOutPutBuffer.join("\n"));
}
AppBrowser.prototype.$=function(s){
		return document.getElementById(s)
}
AppBrowser.prototype.createElement=function(s){
		return document.createElement(s)
}
AppBrowser.prototype.createTextNode=function(s){
		return document.createTextNode(s)
}
AppBrowser.prototype.centerWindow=function(widthX,heightY){
		window.resizeTo(widthX, heightY);
		window.moveTo((screen.width-widthX)/2, (screen.height-heightY)/2);
}
AppBrowser.prototype.focusMainWindow=function(){
		window.focus();
}
/* 子项取值  */
AppBrowser.prototype.getGroupValue=function(arGroup) {
		var arBuf=[];
		for(var i=0;i<arGroup.length;i++){
				if(arGroup[i].checked || arGroup[i].selected){
						arBuf.push(arGroup[i].value);
				}
		}
		return arBuf.join(",")
}
/* 子项赋值  */
AppBrowser.prototype.setGroupValue=function(arGroup,arValue) {
		for(var i=0;i<arGroup.length;i++){
				var b=arValue.indexOf(arGroup[i].value)>-1;
				switch("{$0}-{$1}".fill(arGroup[i].tagName,arGroup[i].type).toLowerCase()){
				case "input-radio":
				case "input-checkbox":
						arGroup[i].checked=b;
						break
				case "option-":
						arGroup[i].selected=b;
						break;
				}
		}
}
AppBrowser.prototype.getBrowseFolder=function() {
		var a=new ActiveXObject("Ext.MainModal");
		var sh=new ActiveXObject("Shell.Application");
		var mPath = sh.BrowseForFolder(a.ExGetForegroundWindow(), "请选择文件夹", 0, 0);
		window.focus();
		return mPath;
}
AppBrowser.prototype.removeElements=function(arGroup) {
		for(var i=arGroup.length-1;i>-1;i--){
				arGroup[i].parentNode.removeChild(arGroup[i]);
		}
}
AppBrowser.prototype.getOpenFileName=function(Filter) {
		var fd= new ActiveXObject("MSComDlg.CommonDialog")
		fd.Filter = Filter;
		fd.FilterIndex = 2;
		fd.MaxFileSize = 128;// must setting
		fd.ShowOpen()
		return fd.FileName.length>0?fd.FileName:null
}
AppBrowser.prototype.getSaveFileName=function(Filter) {
		var fd= new ActiveXObject("MSComDlg.CommonDialog")
		fd.Filter = Filter;
		fd.FilterIndex = 2;
		fd.MaxFileSize = 128;// must setting
		fd.DialogTitle="保存为"
		fd.ShowSave()
		return fd.FileName.length>0?fd.FileName:null
}
AppBrowser.prototype.getBrowseFolder=function() {
		var a=new ActiveXObject("Ext.MainModal");
		var sh=new ActiveXObject("Shell.Application");
		var path = sh.BrowseForFolder(a.ExGetForegroundWindow(), "请选择文件夹", 0, 0);
		//if(window)window.focus()
		return path;
}
function BrwzWin(){
		this.constructor.extend(this,Packer,[window])
		if(!this.debug)delete this.onerror;
}
BrwzWin.prototype.ce=function(sTagName,elParent,oInit,sStyle){
    return this.$ce(sTagName,elParent,oInit,sStyle).getPackIn();
}
BrwzWin.prototype.$ce=function(sTagName,elParent,oInit,sStyle){
		if(!oInit)oInit={};
    var node=this.document.createElement(sTagName);
    var el= new Element(node);
    if(elParent){
        new Element(elParent).insertBefore(el,oInit.elBefore)
    }
		if(oInit){
				el.setHash(oInit)
		}
    if(sStyle)el.newCss(sStyle)
	  return el;
}
BrwzWin.prototype.ei=function(sId){
		if(sId.tagName)return sId
		return this.document.getElementById(sId);
}
BrwzWin.prototype.$ei=function(sId){
		return new Element(this.ei(sId));
}
BrwzWin.prototype.et=function(p,sTagName){
		return (new Array()).fillArray(p.getElementsByTagName(sTagName));
}
BrwzWin.prototype.en=function(sName){
		return this.document.getElementsByName(sName);
}
BrwzWin.prototype.$f=function(arg){
		return new Form(arg);
}
BrwzWin.prototype.popup=function(sLink,winName,hsOptions){
		var hsWinOptions={
				titlebar:"no",
				toolbar:"no",
				directories:"no",
				resizable:"yes",
				scrollbars:"yes",
				menubar:"no",
				status:"no",
				width:800,//firfox 850px
				height:600,
				channelmode:"no"
		}
		for(k in hsWinOptions){
				if(hsOptions&&hsOptions[k]){
						hsWinOptions[k]=hsOptions[k];
				}
		}
		if(!hsWinOptions.left){
				hsWinOptions.left=0.5*(screen.width-hsWinOptions.width)
		}
		if(!hsWinOptions.top){
				hsWinOptions.top=0.3*(screen.height-hsWinOptions.height)
		}
		var arArgs=[]
		for(k in hsWinOptions){
				arArgs.push("{$0}={$1}".fill(k,hsWinOptions[k]));
		}
		var theWindow=window.open(sLink,winName,arArgs.join(","));
		theWindow.focus();
		return theWindow;
}
/* pupup from an anchor element */
BrwzWin.prototype.popupA=function(link,width,height,left,top,oArgs){
		var hs={width:width,height:height,left:left,top:top}
		for(var k in oArgs){
				hs[k]=oArgs[k]
		}
		this.popup(link.href,link.target,hs)
		return false;
}
/* 输出内容 */
BrwzWin.prototype.trace=function(sContent){
		if(this.traceWindow){if(this.traceWindow.closed)this.traceWindow=null;}
		if(!this.traceWindow){this.traceWindow=this.popup("","TRACE_WINDOW")}
		var oDoc=this.traceWindow.document
		oDoc.write("<div>{$0}<div/>".fill(sContent));
		oDoc.body.scrollTop=oDoc.body.scrollHeight;	
		this.traceWindow.focus()
}
/* 用文本框输出内容 */
BrwzWin.prototype.traceText=function(sContent){
		if(this.traceWindow){if(this.traceWindow.closed)this.traceWindow=null;}
		if(!this.traceWindow){this.traceWindow=this.popup("","TRACE_WINDOW")}
		var obody=this.traceWindow.document.body
		obody.innerHTML+="<textarea style='width:100%;height:200px'>{$0}</textarea>".fill(sContent);
		obody.scrollTop=obody.scrollHeight;
		this.traceWindow.focus()
}
/* 
	错误处理
	ff可以定位实际文件
	ie可以显示堆栈
	其它浏览器可能不支持window.onerror
*/
BrwzWin.prototype.onerror=function(sErr,sSrc,nLine){
		var oFun=window.onerror.caller
		var sMsg="Message:"+sErr.htmlEncode()+"\n"
		sMsg+="Url: "+sSrc+"\n"
		sMsg+="Line:"+nLine+"\n"
		if(!oFun){
				sMsg+="<font color='#990000'>Can't catch the function(Outer a function or not IE)</font>"
		}
		while(oFun!=null){
				var oArgs=oFun.arguments;
				var sArgs=""
				for(var i=0;i<oArgs.length;i++){
						sArgs += "{$0}[{$1}]:<b style='color:#950'>{$2}</b>".fill(sArgs!=""?",":"",typeof(oArgs[i]),oArgs[i]);
				}
				var sFunc=oFun.toString().htmlEncode().replace(/\t/g,"&nbsp;&nbsp;")
				sFunc=sFunc.replace(" ","&nbsp;")
				sMsg+="\n<font color='#009900'>Caller:</font>{$0}\n{$1}\n".fill(sArgs==""?"No":sArgs,sFunc) 
				oFun=oFun.caller;
		}
		sMsg="<font color='#990000'><u>Clent Script Error:</u></font><br/><font color='#555555' style='font-family:courier new;line-height:20px;white-space:nowrap'>{$0}</font>".fill(sMsg.replace(/\n/g,"<br/>"))
		sMsg=sMsg.replace(/function/gi,"<font color='#5500ff'>function</font>")
		this.trace(sMsg+"<br/><br/>")
		return true;
}
/* 返回遮盖层 */
BrwzWin.prototype.getCover=function(){
		return void(0);
}
/* 隐藏遮盖层 */
BrwzWin.prototype.hideCover=function(){
		var cov=window.getCover()
		if(cov)document.body.removeChild(cov);
		//document.body.style.overflow="auto";
		//document.body.scroll="" //ie6
		if(this.getBrowserType()=="ie"){
				var s=document.getElementsByTagName("select");
				for(var i=0;i<s.length;i++){
						s[i].style.visibility="visible";
				}
		}
}
/* IE的实际顶层容器 */
BrwzWin.prototype.getIeTruebody=function(){
		return (document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body;
}
/* 显示一个遮盖层 */
BrwzWin.prototype.showCover=function(sColor,nTransparent,depth,arListExp){
		if(this.getBrowserType()=="ie"){
				var s=document.getElementsByTagName("select");
				for(var i=0;i<s.length;i++){
						s[i].style.visibility="hidden";
				}
				if(!arListExp)arListExp=[]
				for(var i=0;i<arListExp.length;i++){
						arListExp[i].style.visibility="visible";
				}
		}
		//document.body.scroll="no" //ie6
		//隐藏滚动条
		var s_top=document.body.scrollTop;
		var s_left=document.body.scrollLeft;
		var cov=document.createElement("div");
		document.body.appendChild(cov);
		this.getCover=function(){return cov}
		//默认透明度
		if(isNaN(nTransparent))nTransparent=50;
		//设置样式
		cov.style["zIndex"]=depth;
		cov.style.backgroundColor=sColor;	
		cov.style.filter="alpha(opacity="+nTransparent+")";
		cov.style.MozOpacity=nTransparent/100; 
		cov.style.position="absolute"
		cov.style.display="block";
		cov.style.top=0;
		cov.style.left=0;
		//自动充满
		var sBrowserType=this.getBrowserType();
		var de=document.documentElement;
		if(sBrowserType=="ie"){
				de=this.getIeTruebody();
		}
		function fill(){
				var wids=de.scrollWidth;
				var hgts=de.scrollHeight;
				var widc=de.clientWidth;
				var hgtc=de.clientHeight;
				cov.style.width=(wids>widc?wids:widc)+"px";
				cov.style.height=(hgts>hgtc?hgts:hgtc)+"px";
		}
		var e=this.addEventHandler(window,"resize",fill)
		this.fillCoverSize=function(){
				cov.style.width=0;
				cov.style.height=0;
				if(sBrowserType=="ie"){
						fill();
				}else{
						var a=document.createEvent("MouseEvents");
						a.initEvent("resize",true,true);
						window.dispatchEvent(a);					
				}
		}
		this.fillCoverSize()
}
/* 得到浏览器类型 */
BrwzWin.prototype.getBrowserType=function(){
		var oTypes={
				ns:(document.layers),
				ie:(document.all),
				w3:(document.getElementById && !(document.all))
		}
		var sType="";
		for(var k in oTypes){
				if(oTypes[k]){
						sType=k;
						break;
				}
		}
		return k;
}
BrwzWin.prototype.addEventHandler = function (oTarget, sEventType, fnHandler){
		if(oTarget.addEventListener) { //DOM方法
				oTarget.addEventListener(sEventType, fnHandler, false);
		} else if (oTarget.attachEvent){ //IE方法
				oTarget.attachEvent("on" + sEventType, fnHandler);
		}else{ //其他未知浏览器
				oTarget["on" + sEventType] = fnHandler;
		}
}
BrwzWin.prototype.goto = function (sUrl){
		this.location.href=sUrl
}
function Calendar(){
		this.mm=null; this.yy=null
		this.init();
	  this.showDate(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
    this.now=new Date().format("yyyy-MM-dd")
}
Calendar.prototype.init=function(){
		var self=this
		var theDoc=document;
		//theDoc=$ce("iframe",theDoc.body,theDoc.body.childNodes[0],null,"position:absolute;display:block;width:20px;").get("contentWindow").document
		//theDoc.write("<font color='red'>iframe testing...</font>")
		this.layer=$ce("div",theDoc.body,theDoc.body.childNodes[0],"border:1px solid \
	#a00;height:210px;width:170px;left:0px;top:0px;px;background:#fff;color:#000;font-size:12px;\
		font-family:arial;z-index:999;display:none");
		///////////////////////////
		this.bar=$ce("div",this.layer,null,"background:#a00;color:#fff;font-weight:normal;\
		height:20px;line-height:20px;cursor:move;padding:0 5px")
		this.bar.set("innerHTML","<span style='float:left'>日历</span>")
		///////////////////////////
		var close=$ce("div",this.bar,null,"cursor:pointer;float:right;border:0px solid #000;line-height:19px;height:19px;*height:15px;*line-height:15px;vertical-align:top")
		close.set("innerHTML","[X]")
		close.set("onclick",function(){
				self.asDialog.close()
		})
		///////////////////////////
		this.topBar=$ce("table",this.layer,null,"border:0px solid #000;border-collapse: collapse ;\
	;width:100%;height:20px;margin:0px");
		var tbody=$ce("tbody",this.topBar)
		var tr=$ce("tr",tbody)
		var td1=$ce("th",tr,null,"cursor:pointer;width:20px")
		td1.set("onclick",function(){
				self.monthAdd(-1)
		})
		td1.set("innerHTML","&lt;");
		var td2=$ce("th",tr,null,";border:none;padding:0;")
		td2.set("innerHTML","");
		var td3=$ce("th",tr,null,";border:none")
		var td4=$ce("th",tr,null,"cursor:pointer;width:20px")
		td4.set("innerHTML","&gt;");
		td4.set("onclick",function(){
				self.monthAdd(1)
		})
		//////////////////////////////
		this.lstYear=$ce("select",td2,null,"width:100%;vertical-align:top;width:65px;height:20px;margin:0;padding:0");
		this.lstMonth=$ce("select",td3,null,"width:100%;vertical-align:bottom;width:65px;height:20px;margin:0;padding:0")
		//////////////////////////////
		var ulWeek=$ce("div",this.layer,null,"line-height:20px;margin-left:1px;")
		var arWeek=["日","一","二","三","四","五","六"];
		arWeek.each(function(v){
				var li=$ce("div",ulWeek,null,"width:23px;margin:1px 1px 0 0;height:22px;text-align:center;border:0px solid\
	#000;font-size:12px;clear:none;float:left;font-size:12px;cursor:default;")
				li.set("innerHTML",v)
		})
		/////////////////////////////////
		this.cells=[]
		var ulCell=$ce("div",this.layer,null,"line-height:23px;margin-left:1px;")
		new Array().fillRange(0,38).each(function(v){
				var li=$ce("div",ulCell)
				li.set("innerHTML",v)
				li.newCss("background:#ccc;margin:1px 1px 0 0;width:23px;\
		 height:23px;text-align:center;border:0px solid\
		#000;font-size:12px;clear:none;float:left;font-size:12px;cursor:pointer;")
				self.cells.push(li)
		})    
		var li=$ce("div",ulCell,null,"background:#ccc;margin:1px 1px 0 0;width:23px;height:23px;text-align:center;border:0px solid\
	#000;font-size:12px;clear:none;float:left;font-size:12px;cursor:pointer;width:71px")
		li.set("innerHTML","今天")
		li.set("onclick",function(){
				self.done(new Date())
		})
		this.asDialog=new Dialog(this.layer.getPackIn(),this.bar.getPackIn())
}
Calendar.prototype.showDate=function(y,m){
		var self=this;
		var firstday = new Date(y,m,1).getDay();  //当月第一天的星期几
		this.lstYear.set("onchange",null);
		this.lstMonth.set("onchange",null);
		new Array().fillRange(0,38).each(function(v){
				var d=new Date(y,m,v-firstday+1)
				self.cells[v].set("innerHTML",d.getDate());
				self.cells[v].get("style").color=(d.getMonth()!=m)?"#999":"#000"
				if(d.format("yyyy-MM-dd")==self.now){
						self.cells[v].get("style").background="#0ff"
				}else{
						self.cells[v].css("background:#ccc")
				}
				self.cells[v].set("onclick",function(){
						self.done(d)
				})
		})
		//填充年和月的下拉列表
		if(y!=self.yy){ //重建年列表,如果选择了另一年
				this.lstYear.set("innerHTML","")
				new Array().fillRange(y-5,y+5).each(function(v){
						var op=$ce("option",self.lstYear)
						op.set("innerHTML",v);
						op.set("value",v)
						if(v==y)op.set("selected",true)
				})		
		}
		if(!self.mm){ //月列表只建一次
				this.lstMonth.set("innerHTML","")
				new Array().fillRange(1,12).each(function(v){
						var op=$ce("option",self.lstMonth)
						op.set("innerHTML",v);
						op.set("value",v)
						if(v==m+1)op.set("selected",true)
				})
		}
		//给下拉列表赋值
		this.lstMonth.set("value",m+1)
		this.lstYear.set("value",y)
		//记住显示的年份
		this.mm=m; this.yy=y;
		//事件,年和月的下拉列表
		this.lstYear.set("onchange",function(){
				self.showDate(parseInt(this.value),self.mm)
		})
		this.lstMonth.set("onchange",function(){
				self.showDate(self.yy,parseInt(this.value)-1)
		})
}
Calendar.prototype.monthAdd=function(n){
		var d=new Date(this.yy,this.mm+n)
		this.showDate(d.getFullYear(),d.getMonth())
}
Calendar.prototype.input=function(el){
	  var style=this.layer.get("style")
    if(el.value.isDate('ymd')){
        var ar=el.value.split("-");     
        this.yy=parseInt(ar[0])
        this.mm=parseInt(ar[1])-1
        this.now=el.value
    }
	  el=new Element(el)
	  this.el=el
	  this.layer.css("left:{$0}px;top:{$1}px".fill(el.getOffsetLeft(),el.getOffsetTop()+el.get("offsetHeight")))	
	  this.showDate(this.yy,this.mm)
	  this.asDialog.show({cover:1})
}
Calendar.prototype.done=function(value){
		this.el.set("value",value.format("yyyy-MM-dd"))
		this.asDialog.close()
}
/*
------------------------------------
对话框
事件:onClose
by fcl
------------------------------------
*/
function Dialog(elDlg,elHot,hsParams){
		if(!hsParams)hsParams={}
		this.getParams=function(){
				return hsParams;
		}
		this.getElement=function(){
				return elDlg;
		}
		this.getElementHot=function(){
				return elHot;
		}
		elDlg.style.position="absolute";
		this.hotElement=elHot;
		if(!this.hotElement)this.hotElement=elDlg;
		this.hotElement.style.cursor = "move";
		this.orig_x = parseInt(elDlg.style.left) - document.body.scrollLeft;
		this.orig_y = parseInt(elDlg.style.top) - document.body.scrollTop;
		if(hsParams.depthMamagerOn){
				this.pushToArray();
				elDlg.style.zIndex =  window.dialogs.length+1;
		}
		this.initDrag();
}
Dialog.prototype.toString=function(){
		return "[object Dialog]";
}
/* 移到中心位置 */
Dialog.prototype.moveToCenter=function(){
		document.body.style.height="100%"; //解决ff的client区不是默认充满的
		var de=document.documentElement;
		if(window.getBrowserType()=="ie"){
				de=window.getIeTruebody();
		}
		var widc=de.clientWidth;
		var hgtc=de.clientHeight;	
		var de=document.body;
		this.getElement().style.margin="0px"
		this.getElement().style.left=(widc-this.getElement().offsetWidth)/2+de.scrollLeft + 'px';
		this.getElement().style.top =(hgtc-this.getElement().offsetHeight)/2+de.scrollTop + 'px';
}
/* 令对话框成为焦点 */
Dialog.prototype.focDialog=function(){
		var d=document;
		//d.onselect = new Function("return false;");
		//d.ondragstart = new Function("return false");
		var arElName=["INPUT","TEXTAREA"]
		d.onselectstart = function(){
				var r=arElName.indexOf(event.srcElement.tagName.toUpperCase())>-1;
				return r;
		}
		var hsParams=this.getParams()
		if(!hsParams.depthMamagerOn)return;
		if(this.getElement().style.zIndex != window.dialogs.length+1){
				for(i=0;i<window.dialogs.length;i++){
						if(window.dialogs[i]!=this){
								window.dialogs[i].getElement().style.zIndex-=1;
						}
				}
				this.getElement().style.zIndex=window.dialogs.length+1;
		}
}
/* 放入对话框队列 */
Dialog.prototype.pushToArray=function(){
		if(!window.dialogs){
				window.dialogs=[this];
		}else{
				window.dialogs.push(this);
		}
}
/* 初始化拖拽 */
Dialog.prototype.initDrag=function(){
		var self=this;
		//拖拽行为
		if(this.getElement()!=this.hotElement){
				this.getElement().onmousedown=function(e){
						self.focDialog();
				}
				this.hotElement.onmousedown=function(e){
						self.beginDrag(e);
				}
		}else{
				this.getElement().onmousedown=function(e){
						self.focDialog();
						self.beginDrag(e);
				}
		}
}
/* 显示 */
Dialog.prototype.show=function(hsParams){
		this.getElement().style["display"]="block";
		if(hsParams&&hsParams.cover==1)window.showCover("#000",10,2,this.getElement().getElementsByTagName("select"))
		if(hsParams&&hsParams.center==1)this.moveToCenter()
}
/* 关闭 */
Dialog.prototype.close=function(){
		this.getElement().style["display"]="none";
		window.hideCover();
		if(this.onClose)this.onClose;
}
/* 开始拖拽 */
Dialog.prototype.beginDrag=function(e){
		var self=this;
		this.focDialog();
		var d=document;
		if(!e)e=window.event;
		var x=e.clientX+d.body.scrollLeft-this.getElement().offsetLeft;
		var y=e.clientY+d.body.scrollTop-this.getElement().offsetTop;
		var thisElem=this.getElement();
		d.onmousemove = function(e){
				if(!e)e=window.event;
				thisElem.style.margin="0px";
				var x1=e.clientX+document.body.scrollLeft-x;
				var y1=e.clientY+document.body.scrollTop-y;
				thisElem.style.left = x1+"px";
				thisElem.style.top = y1+"px";
				thisElem.orig_x = parseInt(thisElem.left) - document.body.scrollLeft;
				thisElem.orig_y = parseInt(thisElem.top) - document.body.scrollTop;
		}
		d.onmouseup = function(){
				d.onmousemove = null;
				d.onmouseup = null;
				d.ondragstart = null;
				d.onselectstart = null;
				d.onselect = null;
				if(window.fillCoverSize)window.fillCoverSize();
		}
		if(this.bScroll){
				var orig_scroll = window.onscroll?window.onscroll:function (){};
				window.onscroll = function (){
						orig_scroll();
						thisElem.left = self.orig_x + document.body.scrollLeft;
						thisElem.top = self.orig_y + document.body.scrollTop;
				}
		}
		return true
}
function Element(el){
		if(typeof el=="string"){
				el=document.getElementById(el);
		}
		this.constructor.extend(this,Packer,[el]);
}
Element.prototype.toString=function(){
		return "[object element]"
}
Element.prototype.getClassName=function(){
		return "element"
}
Element.prototype.getDomNode=function(){
		return this.getPackIn();
}
/* 函数  */
Element.prototype.setAttribute=function(a,v){
		return this.method("setAttribute",a,v)
}
Element.prototype.getAttribute=function(a){
		return this.method("getAttribute",a)
}
Element.prototype.getElementsByTagName=function(t){
		return this.method("getElementsByTagName",t)
}
Element.prototype.getParentNode=function(){
		return this.get("parentNode")
}
Element.prototype.getInnerHTML=function(){
		return this.get("innerHTML")
}
Element.prototype.getOwnerDocument=function(){
		return this.get("ownerDocument")
}
/*   */
Element.prototype.getNextElement=function(){
		var el=this.getDomNode()
		while(el=el.nextSibling){
				if(el.tagName){
						return el;
				}
		}
}
/*   */
Element.prototype.getForm=function(){
		var el=this.getDomNode()
		if(el.tagName.toLowerCase()=="form"){
				return el;
		}
		if(el.form)return elem.form;
		var p=el.parentNode
		while(p){
				if(p.tagName.toLowerCase()=="form"){
						return p
				}
				p=p.parentNode
		}
}
/*   */
Element.prototype.setStyle=function(s,v){
	  this.getDomNode().style[s]=v;
}
/*   */
Element.prototype.setOuterHTML=function(s){
		if(window.getBrowserType()=="ie"){
				this.getDomNode().outerHTML=s //ie
		}else{
				var r = this.getOwnerDocument().createRange();
				r.setStartBefore(this.getDomNode());
				var df = r.createContextualFragment(s);
				this.getParentNode().replaceChild(df, this.getDomNode());
		}
}
Element.prototype.getChildNodes=function(){
		return this.get("childNodes");
}
/*   */
Element.prototype.getSonNodesByTagName=function(sTagName){
		sTagName=sTagName.toLowerCase()
		var arEl=[];
		var arChild=this.get("childNodes");
		for(var i=0;i<arChild.length;i++){
				var node=arChild[i];
				if((node.tagName+"").toLowerCase()==sTagName){
						arEl.push(node);
				}
		}		
		return arEl;
}
Element.prototype.getNextSibling=function(){
		return this.get("nextSibling");
}
Element.prototype.getPreviousSibling=function(){
		return this.get("previousSibling");
}
/*   */
Element.prototype.getSiblingsByTagName=function(sTagName,nDirec){
		var arEl=[],sTagName=sTagName.toLowerCase();
		if(nDirec>0){
				for(var elNode=this.getNextSibling();elNode;elNode=elNode.nextSibling){
						if((elNode.tagName+"").toLowerCase()==sTagName){
								arEl.push(elNode);
						}
				}
		}else if(nDirec<0){
				for(var elNode=this.getPreviousSibling();elNode;elNode=elNode.previousSibling){
						if((elNode.tagName+"").toLowerCase()==sTagName){
								arEl.push(elNode);
						}
				}
		}
		return arEl;
}
Element.prototype.insertBefore=function(oNode,oBefore){
		if(oNode.getPackIn)oNode=oNode.getPackIn();
		if(oBefore&&oBefore.getPackIn)oBefore=oBefore.getPackIn();
		if(oBefore)
				this.getPackIn().insertBefore(oNode,oBefore)
		else{
				this.getPackIn().appendChild(oNode)
		}
}
Element.prototype.css=function(sCss){
		var el=this.getPackIn();
		sCss=sCss.toLowerCase()
		var ar=[
				[/\r|\n/g,""],[/\s*\:\s*/g,":"],[/\s*\;\s*/g,";"],[/;{2,}/g,";"],[/(^;)|(;$)/,""]
		];
		ar.each(function(v,i){
				sCss=sCss.replace(v[0],v[1])
		})
		var ar=sCss.split(";")
		for(var i=0,s=ar[0];i<ar.length;s=ar[++i]){
				if(arMatch=/^([a-z\-]+)\:(.+)$/.exec(s)){
						arMatch[1]=arMatch[1].replace(/-([a-zA-Z])/g,function(a,b){ //foo-bar形式变成fooBar形式
								return b.toUpperCase()
						});
						if(arMatch[1]=="float"){
								el.style.cssFloat=arMatch[2]
								el.style.styleFloat=arMatch[2]
						}else{
								el.style[arMatch[1]]=arMatch[2];
						}
				}
		}
}
/*   */
Element.prototype.newCss=function(sCss){
		var el=this.getPackIn();
		el.style.cssText=sCss
}
/*   */
Element.prototype.getOffsetLeft=function(){
		var el=this.getPackIn();
		var n = el.offsetLeft;
		while (el = el.offsetParent) n += el.offsetLeft;
		return n;
}
/*   */
Element.prototype.getOffsetTop=function(){
		var el=this.getPackIn();
		var n = el.offsetTop;
		while (el = el.offsetParent) n += el.offsetTop;
		return n;
}
function Form(el){
		if(el instanceof String){
				el=document.getElementById(el);
		}else if(el.form){
				el=el.form;
		}else if(el.tagName){
				el=new Element(el).getForm();
		}
		this.constructor.extend(this,Element,[el])
}
Form.prototype.toString=function(){
		return "[object form]"
}
Form.prototype.submit=function(sUrl){
	  var f=this.getDomNode();
	  if(sUrl)f.action=sUrl;
    this.getPackIn().onsubmit=function(){
        return false;
    }
	  this.validator.errorItem=[document.forms[0]];
	  this.validator.errorMessage=["以下原因导致提交失败：\t\t\t\t"];
	  if(!this.validator.check(this.getPackIn(),1)){
        return;
    }
		/*get 方式下,url 的 query 部分被忽略，办法是作为 hidden 添加到 form*/
		if(f.method.toLowerCase()!="post"){
				var r=/[^&\?]+=[^&]*(&|$)/g
				var m=sUrl.match(r)
				if(m){
						for(var i=0;i<m.length;i++){
								var ar=m[i].split("=")
								if(!f[ar[0]]){
										var hide=document.createElement("input")
										hide.type="hidden"
										hide.name=ar[0]
										hide.id=ar[0]
										f.appendChild(hide)
								}else{
										var hide=f[ar[0]]
								}
								hide.value=ar[1]
						}
				}
		}
		f.submit();
		return false;
}
Form.prototype.ajaxPost=function(sUrl,hsData,hsArg){
		var arParam=[];
		for(var k in hsData){
				arParam.push(k+"="+hsData[k]);
		}
		hsArg.parameters=arParam.join("&");
		new Ajax(sUrl,hsArg);
}
Form.prototype.ajaxPost=function(sUrl,hsData,hsArg){
		var arElem=[].fillArray(this.getPackIn().elements);
		this.validator.errorItem=[document.forms[0]];
		this.validator.errorMessage=["以下原因导致提交失败：\t\t\t\t"];
		this.validator.check(this.getPackIn(),3);
}
Form.prototype.validator={}
Form.prototype.validator.dataTypes={
		SafeString : "this.isSafe(value)",
		Limit : "this.limit(value.length,el.getAttribute('min'),  el.getAttribute('max'))",
		LimitB : "this.limit(this.lenB(value), el.getAttribute('min'), el.getAttribute('max'))",
		Date : "this.isDate(value, el.getAttribute('format'))",
		Repeat : "value == document.getElementsByName(el.getAttribute('to'))[0].value",
		Range : "el.getAttribute('min') < value && value < el.getAttribute('max')",
		Compare : "this.compare(value,el.getAttribute('operator'),el.getAttribute('to'))",
		Custom : "this.exec(value, el.getAttribute('regexp'))",
		Group : "this.mustChecked(el.getAttribute('name'), el.getAttribute('min'), el.getAttribute('max'))",
		Require : /.+/,
		Email : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
		Phone : /^((\(\d{3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}$/,
		Mobile : /^((\(\d{3}\))|(\d{3}\-))?1\d{10}$/,
		IdCard : /^\d{15}(\d{2}[A-Za-z0-9])?$/,
		Currency : /^\d+(\.\d+)?$/,
		Number : /^\d+$/,
		Zip : /^[1-9]\d{5}$/,
		QQ : /^[1-9]\d{4,8}$/,
		Integer : /^[-\+]?\d+$/,
		Double : /^[-\+]?\d+(\.\d+)?$/,
		English : /^[A-Za-z]+$/,
		Chinese :  /^[\u0391-\uFFE5]+$/,
		UnSafe : /^(([A-Z]*|[a-z]*|\d*|[-_\~!@#\$%\^&\*\.\(\)\[\]\{\}<>\?\\\/\'\"]*)|.{0,5})$|\s/,
		Url : /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/
																							 }
		Form.prototype.validator.check=function(elForm,mode){
				var count = elForm.elements.length;
				this.errorMessage.length = 1;
				this.errorItem.length = 1;
				this.errorItem[0] = elForm;
				for(var i=0;i<count;i++){
						var el=elForm.elements[i],value=el.value
						var _dataType = el.getAttribute("dataType");
						if(!_dataType)continue;
						if(typeof(_dataType) == "elFormect" || typeof(this.dataTypes[_dataType]) == "undefined")  continue;
						this.clearState(el);
						if(el.getAttribute("require") == "false" && value == "") continue;
						if(!(this[_dataType] instanceof RegExp)){
								if(!eval(this.dataTypes[_dataType])) {
										this.addError(i, el.getAttribute("msg"));
								}	
						}else{
								if(!this.dataTypes[_dataType].test(value+"")){
										this.addError(i, el.getAttribute("msg"));
								}
						}
				}
				if(this.errorMessage.length > 1){
						mode = mode || 1;
						var errCount = this.errorItem.length;
						switch(mode){
						case 2 :
								for(var i=1;i<errCount;i++)
										this.errorItem[i].style.color = "red";
						case 1 :
								alert(this.errorMessage.join("\n"));
								try{this.errorItem[1].focus()}catch(e){}
								break;
						case 3 :
								for(var i=1;i<errCount;i++){
										try{
												var span = document.createElement("SPAN");
												span.id = "__ErrorMessagePanel";
												span.style.color = "red";
												this.errorItem[i].parentNode.appendChild(span);
												span.innerHTML = this.errorMessage[i].replace(/\d+:/,"*");
										}
										catch(e){alert(e.description);}
								}
								try{this.errorItem[1].focus()}catch(e){}
								break;
						default :
								alert(this.errorMessage.join("\n"));
								break;
						}
						return false;
				}
				return true;
		}
		Form.prototype.validator.isSafe = function(str){
				return !(this.dataTypes.UnSafe.test(str));
		}
		Form.prototype.validator.clearState = function(elem){
				with(elem){
						if(style.color == "red")style.color = "";
						var lastNode = parentNode.childNodes[parentNode.childNodes.length-1];
						if(lastNode.id == "__ErrorMessagePanel")
								parentNode.removeChild(lastNode);
				}
		}
		Form.prototype.validator.addError =function(index, str){
				this.errorItem[this.errorItem.length] = this.errorItem[0].elements[index];
				this.errorMessage[this.errorMessage.length] = this.errorMessage.length + ":" + str;
		}
		Form.prototype.validator.limit = function(len,min,max){
				min = min || 0;
				max = max || Number.MAX_VALUE;
				return min <= len && len <= max;
		}
		Form.prototype.validator.lenB = function(str){
				return str.replace(/[^\x00-\xff]/g,"**").length;
		}
		Form.prototype.validator.exec = function(op, reg){
				return new RegExp(reg,"g").test(op);
		}
		Form.prototype.validator.compare =function(op1,operator,op2){
				switch (operator) {
				case "NotEqual":
						return (op1 != op2);
				case "GreaterThan":
						return (op1 > op2);
				case "GreaterThanEqual":
						return (op1 >= op2);
				case "LessThan":
						return (op1 < op2);
				case "LessThanEqual":
						return (op1 <= op2);
				default:
						return (op1 == op2);            
				}
		}
		Form.prototype.validator.mustChecked=function(name, min, max){
				var groups = document.getElementsByName(name);
				var hasChecked = 0;
				min = min || 1;
				max = max || groups.length;
				for(var i=groups.length-1;i>=0;i--)
						if(groups[i].checked) hasChecked++;
				return min <= hasChecked && hasChecked <= max;
		}
		Form.prototype.validator.isDate=function(sValue, formatString){
				return sValue.isDate(formatString)
		}
		function ScriptLoader(onFinish){
				this.onFinish=onFinish;
				var arMissions=[];
				this.getMissions=function(){
						return arMissions;
				}
		}
		ScriptLoader.prototype.load=function(sFileNames){
				var self=this,i=0;
				var arMissions=this.getMissions()
				this.onMissionLoaded=function(){
						var m=arMissions[++i]
						if(m){
								self.loadMission(m);
						}else{
								if(self.onFinish)self.onFinish();
						}
				}
				this.loadMission(arMissions[0]);
		}
		ScriptLoader.prototype.addMission=function(sPath,sCharSet,sFileNames){
				var arMissions=this.getMissions()
				arMissions.push({
						path:sPath,
						fileNames:sFileNames,
						charSet:sCharSet
				})
		}
		ScriptLoader.prototype.loadMission=function(oMission){
				var self=this,i=0;
				var head=document.getElementsByTagName('head').item(0);
				var ar=oMission.fileNames.split(";");
				var sPath=oMission.path;
				var charSet=oMission.charSet;
				function onLoaded(){
						var sFile=ar[++i]
						if(sFile){
								load(sFile)
						}else{
								self.onMissionLoaded()
						}
				}
				function load(sFile){
						var script=document.createElement('script');
						script.charset=charSet;
						script.src=sPath+"/"+sFile;
						script.type='text/javascript';
						///script.defer=true;
						script.onload=script.onreadystatechange=function(){
								onLoaded();
						}	
						head.appendChild(script); 
				}
				load(ar[0])
		}
		function Style(str){
				this.setString(str)
		}
		Style.prototype.toString=function(){
				return "[Style]"
		}
		Style.prototype.setString=function(sStyle){
				if(!sStyle)sStyle="";
				var arTmp=sStyle.split(";");
				var hsStyle={}
				for(var i=0;i<arTmp.length;i++){
						var s=arTmp[i]
						var p=s.indexOf(":");
						if(p>0){
								hsStyle[s.substring(0,p)]=s.substring(p+1).toLowerCase();
						}
				}
				this.getValue=function(sKey){
						return hsStyle[sKey.toLowerCase()];
				}
				this.getHash=function(){
						return hsStyle;
				}	
		}
		Style.prototype.setValue=function(sKey,sValue){
				this.getHash()[sKey.toLowerCase()]=sValue;
		}
		Style.prototype.join=function(){
				var hs=this.getHash();
				var ar=[];
				for(k in hs){
						ar.push("{$0}:{$1}".fill(k,hs[k]));
				}
				return ar.join(";");
		}
		function TabBar(sTabHtmlNormal,sTabHtmlSelected){
				var arTabs=[]
				this.getTabs=function(){
						return arTabs;
				}
				this.selectedIndex=-1
				this.getTabHtmlNormal=function(){
						return sTabHtmlNormal;
				}
				this.getTabHtmlSelected=function(){
						return sTabHtmlSelected;
				}
		}
		TabBar.prototype.addTabs=function(){
				var self=this;
				var ar=[].fillArray(arguments)
				ar.each(function(ar,i){
						self.addTab(ar[0],ar[1])
				})
		}
		TabBar.prototype.addTab=function(elTab,elPan){
				var self=this;
				var arTabs=this.getTabs();
				var hsTab={elTab:elTab,elPan:elPan,text:elTab.innerHTML}
				elTab.index=arTabs.push(hsTab)-1
				this.renderNormalTab(hsTab)
				elTab.onclick=function(){
						self.selectById(this.index)
				}
				elTab.style.cursor="pointer"
		}
		TabBar.prototype.renderSelectedTab=function(hsTab){
				hsTab.elTab.innerHTML=this.getTabHtmlSelected().fill(0,hsTab.text)
				hsTab.elPan.style.display="inline"
		}
		TabBar.prototype.renderNormalTab=function(hsTab){
				hsTab.elTab.innerHTML=this.getTabHtmlNormal().fill(0,hsTab.text)
				hsTab.elPan.style.display="none"
		}
		TabBar.prototype.selectById=function(id){
				var arTab=this.getTabs();
				var hsTab=arTab[id];
				if(this.selectedIndex==id)return;
				if(this.selectedIndex>-1)this.renderNormalTab(arTab[this.selectedIndex])
				this.renderSelectedTab(arTab[id])
				this.selectedIndex=id
		}
		////////////////////////////////////////////////////////////////////
		//树形目录的一个结点(基于li元素)
		//@1:treeview对象,@2:li元素
		////////////////////////////////////////////////////////////////////
		function TreeNode(oTreeView,elNode){
				this.constructor.extend(this,Element,[elNode]);
				this.getTreeView=function(){
						return oTreeView;
				}
				this.imgIcon=null;
				this.imgExpand=null;
				this.markElements();
				elNode.style.cursor="default"
		}
		/* toString */
		TreeNode.prototype.toString=function(){
				return "[object TreeNode]"
		}
		/* 标记DOM结点对象 */
		TreeNode.prototype.markElements=function (){
				this.elText=this.getSonNodesByTagName("a")[0];
				this.elText.style.cursor="pointer"
				if(!this.elText){
						throw new Error("can not found node <a> tag");
				}
				/* 注意，找到子树 */
				this.elSubTree=new Element(this.elText).getSiblingsByTagName("ul",1)[0];
				//如果结点需要ajax加载，显示为父结点
				if(this.isAjaxSubLoad() && !this.elSubTree){
						this.createSubMenuNode()
				}
				this.isParent=function(){
						return !!this.elSubTree
				}
		}
		/* 得到前一个相邻结点 */
		TreeNode.prototype.getPrevSibling=function(){
				var oNode=null;
				var li=this.getElement().previousSibling
				if(li)if((li.tagName+"").toLowerCase()=="li")oNode=new TreeNode(this.getTreeView(),li)
				return oNode
		}
		/* 得到后一个相邻结点 
TreeNode.prototype.getNextSibling=function(){
		var oNode=null;
		var li=this.getElement().nextSibling
		if(li)if((li.tagName+"").toLowerCase()=="li")oNode=new TreeNode(this.getTreeView(),li)
		return oNode
}
*/
		/* 得到最后一个子结点
TreeNode.prototype.getLast=function(){
		var oNode=null;
		var arEl=new Element(this.elSubTree).getSonNodesByTagName("li");
		if(arEl.length>0){
				oNode=new TreeNode(this.getTreeView(),arEl[arEl.length-1])
		}
		return oNode;
}
 */
		/* 得到第一个子结点 */
		TreeNode.prototype.getFirst=function(){
				var oNode=null;
				if(!this.elSubTree) return oNode;
				var arEl=new Element(this.elSubTree).getSonNodesByTagName("li");
				if(arEl.length>0){
						oNode=new TreeNode(this.getTreeView(),arEl[0])
				}
				return oNode;
		}
		/* 得到文本 */
		TreeNode.prototype.getText=function(){
				return this.elText.innerHTML
		}
		/* 设置文本 */
		TreeNode.prototype.setText=function(sText){
				return this.elText.innerHTML=sText;
		}
		/* 得到ID */
		TreeNode.prototype.getId=function(){
				return this.getAttribute("nodeId")
		}
		/* 是否已展开 */
		TreeNode.prototype.isExpanded=function(){
				return this.getElement().getAttribute("expanded")=="true";
		}
		/* 本结点LI */
		TreeNode.prototype.getElement=function(){
				return this.getDomNode();
		}
		/* 子树UL */
		TreeNode.prototype.getSubMenuElement=function(){
				return this.elSubTree;
		}
		/* 是否最后一个 */
		TreeNode.prototype.isLast=function(){
				return this.getSiblingsByTagName("li",1).length==0
		}
		/* 是否第一个 */
		TreeNode.prototype.isFirst=function(){
				return this.getSiblingsByTagName("li",-1).length==0
		}
		/* 是否以ajax加载子树 */
		TreeNode.prototype.isAjaxSubLoad=function(){
				return (this.getAttribute("ajaxSubLoad")+"").toLowerCase()=="true"
		}
		/* 设置是否以ajax加载子树 */
		TreeNode.prototype.setAjaxSubLoad=function(b){
				this.getDomNode().setAttribute("ajaxSubLoad",b)
		}
		/* 生成子树UL */
		TreeNode.prototype.createSubMenuNode=function(){
				this.elSubTree=document.createElement("ul")
				this.elSubTree.style.display=this.isExpanded()?"block":"none"
				this.getElement().appendChild(this.elSubTree)
		}
		/* 添加HTML做为子结点 */
		TreeNode.prototype.insertNodeHTML=function(sHTML,oTreeNodeBefore){
				if(!this.elSubTree){
						this.createSubMenuNode()
				}
				this.getTreeView().insertNodeHTML(this,sHTML,oTreeNodeBefore)
		}
		TreeNode.prototype.setSubHTML=function(sHTML){
				this.elSubTree.innerHTML=sHTML
				this.render()
		}
		/* 刷新,会重新生成子结点 */
		TreeNode.prototype.refresh=function(){
				this.markElements();
				this.render();
		}
		/* 刷新,不重新生成子结点 */
		TreeNode.prototype.refreshSelf=function(){
				this.markElements()
				this.render(true)
		}
		/* 设置结点HTML(自身和子结点) */
		TreeNode.prototype.setNodeHTML=function(sHTML){
				this.setOuterHTML(sHTML);
				this.refresh()
		}
		/* 删除结点 */
		TreeNode.prototype.remove=function(sHTML){
				var oTree=this.getTreeView()
				if(this==oTree.selectedNode)oTree.selectedNode=null;
				var oPrev=this.getPrevSibling()
				var p=this.getParent()
				this.setOuterHTML("");
				//
				if(oPrev)oPrev.refresh()
				if(!p.getFirst())p.refresh()
		}
		/* 得到父LI结点 */
		TreeNode.prototype.getParent=function(){
				var oNode=null;
				var el=null;
				try{el=this.getElement().parentNode.parentNode}catch(e){}
				if(el){
						if(el.tagName.toLowerCase()=="li"){
								oNode=new TreeNode(this.getTreeView(),el);
						}
				}
				return oNode;
		}
		/* 得到id路径 */
		TreeNode.prototype.getPathOfId=function(){
				var sPath=""
				for(var n=this;n;n=n.getParent()){
						sPath="/{$0}{$1}".fill(n.getId(),sPath)
				}
				return sPath;
		}
		/* 得到id路径 */
		TreeNode.prototype.getPathOfText=function(){
				var sPath=""
				for(var n=this;n;n=n.getParent()){
						sPath="/{$0}{$1}".fill(n.getText(),sPath)
				}
				return sPath;
		}
		/* 设置选择 */
		TreeNode.prototype.setSelected=function(bValue){
				var oTree=this.getTreeView()
				if(bValue){
						this.elText.className="focLink"
						if(this.getTreeView().selectedNode){
								if(oTree.selectedNode!=this){
										oTree.selectedNode.setSelected(false)
								}else{return}
						}
						if(oTree.onSelectNode){
								oTree.onSelectNode(this)
						}
						this.getTreeView().selectedNode=this
				}else{
						this.getTreeView().selectedNode=null
						this.elText.className=""
				}
		}
		/* 删除符号 */
		TreeNode.prototype.clearSymbols=function(){
				for(var el=this.elText.previousSibling;el;el=this.elText.previousSibling){
						el.parentNode.removeChild(el)
				}
		}
		/* 显示 */
		TreeNode.prototype.render=function(bNoRefreshSub){
				this.clearSymbols()
				this.imgIcon=document.createElement("img");
				this.imgExpand=document.createElement("img");
				var self=this;
				var oNodeParent=this.getParent()
				//添加缩进线
				for(var p=oNodeParent;p;){
						var imgTab=document.createElement("img");
						this.getElement().insertBefore(imgTab,this.getElement().childNodes[0]);
						imgTab.src=p.isLast()?this.icon("img_blank"):this.icon("I");
						if(p){p=p.getParent()}else{p=null}
				}
				//添加图形
				this.getElement().insertBefore(this.imgExpand,this.elText)
				this.getElement().insertBefore(this.imgIcon,this.elText)
				//生成视图
				if(this.elSubTree){		//父结点
						//显示子树
						this.elSubTree.className="treeSubMenu"
						this.setExpanded(this.isExpanded())
						if(!bNoRefreshSub){
								var arLi=new Element(this.elSubTree).getSonNodesByTagName("li");
								for(var i=0;i<arLi.length;i++){
										var el=arLi[i];
										var n=new TreeNode(self.getTreeView(),el);
										n.render();
								}
						}
				}else{								//叶子结点
						if(this.isLast()){
								this.imgExpand.src=oNodeParent||!this.isFirst()?this.icon("L"):this.icon("line")
						}else if(this.isFirst()){
								this.imgExpand.src=oNodeParent?this.icon("T"):this.icon("L2")
						}else{
								this.imgExpand.src=this.icon("T")
						}
						this.imgIcon.src=this.icon("img_child")
				}
				//事件:开闭子菜单---点击结点文本, +/-按钮, 或图标
				this.imgIcon.ondblclick=this.imgExpand.onclick=this.elText.ondblclick=function(){
						if(self.elSubTree){
								self.setExpanded(!self.isExpanded());
						}
						self.setSelected(true);
						//self.getTreeView().onNodeDblClick(self);
				}
				this.imgIcon.onclick=this.elText.onclick=function(){
						self.setSelected(true);
						//self.getTreeView().onNodeClick(self);
				}
		}
		TreeNode.prototype.icon=function(sName){
				return "{$0}/{$1}.gif".fill(this.getTreeView().getIconPath(),sName);
		}
		/* 设置+/-状态*/
		TreeNode.prototype.setExpanded=function(b){
				var oNodeParent=this.getParent()
				//结点的icon和outline
				var oFirst=this.getFirst();
				if(!oFirst){
						if(this.isLast()){
								//this.imgExpand.src=oNodeParent?this.icon("L"):this.icon("line");
						}else if(this.isFirst()){
								this.imgExpand.src=this.icon("T");
						}else{
								this.imgExpand.src=this.icon("T");
						}
						this.imgIcon.src=this.icon("img_1A");
				}else if(b){
						if(this.isLast()){
								this.imgExpand.src=oNodeParent||!this.isFirst()?this.icon("Lminus"):this.icon("Lminus_root");
						}else if(this.isFirst()){
								this.imgExpand.src=oNodeParent?this.icon("Tminus"):this.icon("Tminus_root");
						}else{
								this.imgExpand.src=this.icon("Tminus");
						}
						this.imgIcon.src=this.icon("img_1B");
				}else{
						if(this.isLast()){
								this.imgExpand.src=oNodeParent||!this.isFirst()?this.icon("Lplus"):this.icon("Lplus_root");
						}else if(this.isFirst()){
								this.imgExpand.src=oNodeParent?this.icon("Tplus"):this.icon("Tplus_root");
						}else{
								this.imgExpand.src=this.icon("Tplus");
						}
						this.imgIcon.src=this.icon("img_1A");
				}
				//子树的开合显示
				for(var nd=this.elText.nextSibling;nd;nd=nd.nextSibling){
						if((nd.tagName+"").toLowerCase()=="ul"){
								nd.style.display=(b)?"block":"none";   
								break;
						}
				}
				this.getElement().setAttribute("expanded",b?"true":null);
		}
		/*  
-----------------------------
TREEVIEW 类
图标和CSS位于 "<wwwroot>/TreeImg"
-----------------------------
*/
		////////////////////////////////////////////////////////////////////
		//树形目录对象
		//参数1:包含根结点li元素的容器
		////////////////////////////////////////////////////////////////////
		function TreeView(elSubTree,sIconPath){
				this.constructor.extend(this,Element);
				this.getIconPath=function(){
						return sIconPath;
				}
				this.init()
				this.selectedNode=void(0);
				elSubTree.className="treeMenu"
				this.onNodeClick=function(oNode){} //事件:点击结点
				this.treeView=this;
				this.elSubTree=elSubTree
		}
		TreeView.prototype.elSubTree=null;
		/* toString */
		TreeView.prototype.toString=function(){
				return "[object TreeView]"
		}
		/* 初始化 */
		TreeView.prototype.init=function init(){
				var arNodeRoot=this.getSonNodesByTagName("li")
				for(var i=0;i<arNodeRoot.length;i++){
						new TreeNode(this,arNodeRoot[i]).render();
				}
		}
		/* 得到最后一个子结点 */
		TreeView.prototype.getLast=function(){
				var oNode=null;
				var arEl=this.getSonNodesByTagName("li")
				if(arEl.length>0){
						oNode=new TreeNode(this,arEl[arEl.length-1])
				}
				return oNode;
		}
		/* 得到第一个子结点 */
		TreeView.prototype.getFirst=function(){
				var oNode=null;
				var arEl=this.getSonNodesByTagName("li")
				if(arEl.length>0){
						oNode=new TreeNode(this,arEl[0])
				}
				return oNode;
		}
		/* 刷新,会重新生成结点 */
		TreeView.prototype.refresh=function(){
				this.init()
		}
		/* 删除结点 */
		TreeView.prototype.deleteNode=function(oTreeNode){
				var oPrevNode=oTreeNode.getPrevSibling()
				var oNextNode=oTreeNode.getNextSibling()
				var elTemp=oTreeNode.getElement();
				var oNodeParent=oTreeNode.getParentNode()
				if(!oNodeParent)oNodeParent=this;
				if(!elTemp){
						throw new Error("invalid treenode");
				}
				//令父结点删除本Dom对象
				var ul=oNodeParent.getSubMenuElement();
				ul.removeChild(elTemp);
				//如果子结点数为0，令父结点变为叶子结点
				if(ul.getElementsByTagName("li").length<1){
						ul.parentNode.removeChild(ul);
				}
				//在必要的时候刷新视图
				if(oPrevNode){
						//刷新前一个
						if(oPrevNode.isLast()){
								oPrevNode.refresh()
						}
				}else{
						//刷新变成叶子结点的父对结点
						if(!oNextNode){
								if(oNodeParent){
										oNodeParent.refresh();
								}else{
										this.refresh()
								}
						}
				}
				//检测是否删除了选中结点
				if(oTreeNode==this.selectedNode){
						this.selectedNode==null
				}
		}
		/* 由路径得到结点 */
		TreeView.prototype.nodeFromPath=function(sPath){
				var oNodeRet=null;
				var arElNodes=this.getElementsByTagName("li");
				for(var i=0;i<arElNodes.length;i++){
						var oNode=new TreeNode(this,arElNodes[i])
						var sPathTmp=oNode.getPathOfId();
						if(sPathTmp==sPath){
								oNodeRet=oNode;
								break;
						}
				}
				return oNodeRet;
		}
		/* 向结点插入html  */
		TreeView.prototype.insertNodeHTML=function(oNode,sHTML,oTreeNodeBefore){
				var elTemp=document.createElement("div")
				elTemp.innerHTML=sHTML;
				var arChild=elTemp.childNodes;
				var nLiCount=this.getSonNodesByTagName("li"); //添加前,子结点(li)的数量
				for(var n=elTemp.childNodes[0];n;n=n.nextSibling){
						if(n.tagName){
								var sHTMLAdd=""
								if(n.tagName.toLowerCase="li"){
										sHTMLAdd=n.innerHTML;
										var elNodeNew=document.createElement("li")
										if(oTreeNodeBefore){
												oNode.elSubTree.insertBefore(elNodeNew,oTreeNodeBefore.getElement())
										}else{
												oNode.elSubTree.appendChild(elNodeNew)
										}
										var oAttribs=n.attributes
										for (var i = 0; i < oAttribs.length; i++){
												var oAttrib = oAttribs[i];
												elNodeNew.setAttribute(oAttrib.nodeName,oAttrib.nodeValue);
										}
										elNodeNew.innerHTML=sHTMLAdd;
										oNode.render()
								}else{
										continue;
								}
						}
				}
				//在必要的时候刷新
				if(nLiCount==0){
						//刷新原来为叶子结点的父结点
						this.refresh()
				}else{
						//刷新原来的最后一个结点
						var oPrevNode=this.getLast().getPrevSibling()
						if(oPrevNode){
								oPrevNode.refresh()
						}
				}
		}
