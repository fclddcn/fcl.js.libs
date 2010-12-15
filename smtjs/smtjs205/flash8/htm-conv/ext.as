//import flash.geom.Transform
//import flash.filters.ColorMatrixFilter;
function echo(){
	trace(arguments.join(""))
}
function DBGECHO(){
	trace(arguments.join("\t"))
}
_root.setComponentManagerDepthLow=function(){
	_root.reserved.swapDepths(0);
	_root.focusManager.swapDepths(1)
}
_root.getPath=function() {
	var url =replace( _root._url,"\\","/");
	var a=url.lastIndexOf("?");
	var b=url.lastIndexOf("/",a)+1;
	return url.substr(0,b);
}
_root.getParams=function() {
	var url=_root._url;
	var a=url.lastIndexOf("?");
	var hs={}
	if(a>-1){
		var sParam=url.substr(a+1);
		for(var p=0;p>-1;){
			var t=sParam.indexOf("&",p)
			var nLen=t-p
			if(nLen<0)nLen=void(0)
			var sPair=sParam.substr(p,nLen)
			p=t>-1?p+sPair.length+1:-1;
			var t=sPair.indexOf("=")
			if(t>=-1){
				hs[sPair.substr(0,t)]=sPair.substr(t+1)
			}
		}
	}
	return hs
}
////////////////////////////////////////////////////////////
//
MovieClip.prototype.toTop=function(nOffset){
	var d=this._parent.getNextHighestDepth()
	if(d-1-nOffset>this.getDepth()){
		this.swapDepths(d)
	}
}
MovieClip.prototype.instanceFromPath=function(sPath){
	var arPath=sPath.split(".")
	var inst=this
	for(var i=0;i<arPath.length;i++){
		inst=inst[arPath[i]]
	}
	return inst==this?null:inst
}
MovieClip.prototype.showHint=function(sHint:String,nTextColor:Number,nMaxWidth:Number){
	var fmt=new TextFormat();
	var metrics=fmt.getTextExtent(sHint);
	var tfHint=this.createTextField("tfHint",this.getNextHighestDepth(),this._xmouse+20,this._ymouse,0,0);
	fmt.font="Arial"
	fmt.size="12"
	tfHint.setNewTextFormat(fmt)
	tfHint.autoSize=true;
	tfHint.embedFonts =true;
	tfHint.selectable=false
	if(metrics.textFieldWidth>nMaxWidth){
		tfHint._width=nMaxWidth
		tfHint.multiline=true;
		tfHint.wordWrap=true;		
	}
	tfHint.text=sHint;
	tfHint.setTextFormat(fmt)
	tfHint.background=true
	tfHint.backgroundColor=0xffffc4;
	tfHint.border=true
	tfHint.borderColor=0x0;
	this.hideHint=function(){
		tfHint.remove();
	}
}
MovieClip.prototype.getBoundHeight=function(){
	return this.getBounds().yMax-this.getBounds().yMin
}
MovieClip.prototype.getBoundWidth=function(){
	return this.getBounds().xMax-this.getBounds().xMin
}
MovieClip.prototype.setHint=function(sHint:String){
	var self=this
	var bOver=false
	var bMouseDown=false
	//去掉可能存在的显示
	_root.hideHint()
	//去掉可能存在的hint侦听
	Mouse.removeListener(this.hintListener)
	if(!sHint)return;
	//事件
	this.hintListener=new Object()
	this.hintListener.onMouseMove=function(){
		if(!bMouseDown&&self.hitTest(_root._xmouse,_root._ymouse,true)){
			if(!bOver){
				bOver=true
				_root.showHint(sHint,0,200)
			}
		}else{
			if(bOver){
				bOver=false;
				_root.hideHint()
			}
		}
	}
	this.hintListener.onMouseDown=function(){
		bMouseDown=true
	}
	this.hintListener.onMouseUp=function(){
		bMouseDown=false
	}
	Mouse.addListener(this.hintListener)
}
MovieClip.prototype.limitToRectangle=function(r:flash.geom.Rectangle){
	if(this._x<r.x)this._x=r.x;
	if(this._x>r.x+r.width)this._x=r.x+r.width;;
	if(this._y<r.y)this._y=r.y;
	if(this._y>r.y+r.height)this._y=r.y+r.height;
}
MovieClip.prototype.move=function(left,top,width,height){
	this._x=left
	this._y=top
	this._width=width
	this._height=height
}
MovieClip.prototype.resetColor = function(){
   new Color(this).setTransform({ra:100, ga:100, ba:100, rb:0, gb:0, bb:0})
}
/**/
MovieClip.prototype.setColor=function (nColor : Number) : Void{
	var Color_Matrix:Array=[
		1, 0, 0, 0, 
		(nColor&0xff0000)>>16, 0, 1, 0, 0, 
		(nColor&0xff00)>>8, 0, 0, 1, 0, 
		nColor&0xff, 0, 0, 0, 1, 0
	];
	this.filters = [new ColorMatrixFilter (Color_Matrix)];
}
/**/
MovieClip.prototype.setSaturation=function(n){
	Button.prototype.setSaturation.apply(this,[n])
}
/**/
MovieClip.prototype.setChildrenEnabled=function(bValue){
	var arChild=this.getChildren()
	for(var i=0;i<arChild.length;i++){
		arChild[i].setChildrenEnabled(bValue)
		if(!bValue&&typeof arChild[i].__oldEnabled=="undefined"){ //第二个条件防止重复设置
			arChild[i].__oldEnabled=arChild[i].enabled
			arChild[i].enabled=false;
		}else{
			arChild[i].enabled=arChild[i].__oldEnabled;
			arChild[i].__oldEnabled=void(0)
		}
	}
}
/*
播放一次
修改时间 2009-2-23
*/
MovieClip.prototype.playOnceByTimer=function(nTo:Number,nFrom:Number,fPlaying:Function,fFinish:Function){
	var self=this
	var t=setInterval(function(){
		self.nextFrame()
		fPlaying.apply(self)
		if(self._currentframe==self._totalframes||self._currentframe==nTo){
			clearInterval(t)
			fFinish.apply(self)
		}
	},1000/12)
	this.gotoAndStop(isNaN(nFrom)?1:nFrom)
	_root.clearPlayTimers=function(){
		for(var i=0;i<=t;i++){
			clearInterval(i);
		}
	}
	return t;
}
/*
反复播放
修改时间 2009-2-23
*/
MovieClip.prototype.playRepeatByTimer=function(nTo:Number,nFrom:Number,fPlaying:Function){
	var self=this
	var t=setInterval(function(){
		self.nextFrame()
		fPlaying.apply(self)
		if(self._currentframe==self._totalframes||self._currentframe==nTo){
			self.gotoAndStop(isNaN(nFrom)?1:nFrom)
		}
	},1000/12)
	this.gotoAndStop(isNaN(nFrom)?1:nFrom)
	_root.clearPlayTimers=function(){
		for(var i=0;i<=t;i++){
			clearInterval(i);
		}
	}
	return t;
}
/**/
MovieClip.prototype.remove=function(){
	this.removeMovieClip();
}
/**/
MovieClip.prototype.getOffsetHeight=function(){
	return this._height;
}
/**/
MovieClip.prototype.attachMc=function(sLibName,sName,oInit){
	var nDeep=this.getNextHighestDepth();
	var mcTmp=this.attachMovie(sLibName,sName,nDeep)
	return mcTmp;
}
/**/
MovieClip.prototype.attachMcIndexed=function(sLibName,sName){
	var nDeep=this.getNextHighestDepth();
	var mcTmp=this.attachMovie(sLibName,sName+new String(nDeep),nDeep)
	return mcTmp;
}
/**/
MovieClip.prototype.createMcIndexed=function(sPerfix){
	var nDeep=this.getNextHighestDepth();
	var mcTmp=this.createEmptyMovieClip(sPerfix+nDeep,nDeep)
	return mcTmp;
}
/**/
MovieClip.prototype.showBorder=function(nThickness,nColor,nTrans){
	var b=this.getBounds()
	this.lineStyle(1, nColor, nTrans);
	this.moveTo(b.xMin,b.yMin)
	this.lineTo(b.xMax,b.yMin)
	this.lineTo(b.xMax,b.yMax)
	this.lineTo(b.xMin,b.yMax)
	this.lineTo(b.xMin,b.yMin)
}
/**/
MovieClip.prototype.fillColorRect=function(nLeft,nTop,nWidth,nHeight,nColor,nTrans){
	var b=this.getBounds()
	this.beginFill(nColor,nTrans)
	this.moveTo(nLeft,nTop)
	this.lineTo(nLeft+nWidth,nTop)
	this.lineTo(nLeft+nWidth,nTop+nHeight)
	this.lineTo(nLeft,nTop+nHeight)
	this.lineTo(nLeft,nTop)
	this.endFill()
}
/**/
MovieClip.prototype.fillColor=function(nColor,nTrans){
	var b=this.getBounds()
	this.beginFill(nColor,nTrans)
	this.moveTo(b.xMin,b.yMin)
	this.lineTo(b.xMax,b.yMin)
	this.lineTo(b.xMax,b.yMax)
	this.lineTo(b.xMin,b.yMax)
	this.lineTo(b.xMin,b.yMin)
	this.endFill()
}
/**/
MovieClip.prototype.setCursorMc=function(sLibName,xoffset,yoffset){
	if(isNaN(xoffset))xoffset=0
	if(isNaN(yoffset))yoffset=0
	if(_root.mcCursorInstance){
		_root.mcCursorInstance.remove()
	}
	var mcCur=_root.attachMc(sLibName,"mcCursorInstance")
	mcCur._x=_root._xmouse+xoffset
	mcCur._y=_root._ymouse+yoffset
	Mouse.hide()
	var fOldOnMouseMove=this.onMouseMove;
	this.onMouseMove=function(){
		if(typeof fOldOnMouseMove=="function")fOldOnMouseMove.apply(this);
		mcCur._x=_root._xmouse+xoffset
		mcCur._y=_root._ymouse+yoffset
		updateAfterEvent()
	}
	var fOldOnRollOute=this.onRollOut;
	this.onRollOut=function(){
		if(typeof fOldOnRollOute=="function")fOldOnRollOute.apply(this);
		mcCur._visible=false
		mcCur.remove()
		this.onMouseMove=fOldOnMouseMove;
		Mouse.show()
	}
	return mcCur
}
MovieClip.prototype.setUnderLine=function(bValue,nColor,nTrans){
	if(!bValue){
		this.clear()
	}else{
		var oBound=this.getBounds()
		this.lineStyle(1, nColor?nColor:0,nTrans?nTrans:100)
		this.moveTo(0,oBound.yMax)
		this.lineTo(oBound.xMax,oBound.yMax)
	}
}
/**/
MovieClip.prototype.createMc=function(sId){
	var nDeep=this.getNextHighestDepth();
	var mcTmp=this.createEmptyMovieClip(sId,nDeep)
	return mcTmp;
}
/*(按深度顺序)返回所有子元素*/
MovieClip.prototype.getChildren=function(){
	var arKey=[],arInst=[];
	var nDeep=this.getNextHighestDepth();
	for(var k in this){
		var oInst=this[k];
		if(oInst._parent==this){
			var nDepth=oInst.getDepth();
			if(!arInst[nDepth])arKey.push(nDepth);
			arInst[nDepth]=oInst;
		}
	}
	arKey.sort();
	for(var i=0;i<arKey.length;i++){
		arKey[i]=arInst[arKey[i]];
	}
	return arKey;
}
/*删除所有子元素*/
MovieClip.prototype.clearAll=function(){
	for(var k in this){
		if(this[k]._parent==this)this[k].remove();
	}
}
/*画矩形*/
MovieClip.prototype.drawRectangle=function(pPos,nWidth,nHeight,nColor,nTrans){
	this.beginFill(nColor,nTrans);
	this.moveTo(pPos.x,pPos.y);
	this.lineTo(pPos.x+nWidth, pPos.y);
	this.lineTo(pPos.x+nWidth, pPos.y+nHeight);
	this.lineTo(pPos.x, pPos.y+nHeight);
	this.lineTo(pPos.x, pPos.y);
	this.endFill();
}
MovieClip.prototype.setEnabled=function(bEnabled){
	Button.prototype.setEnabled.apply(this,[bEnabled])
}
/**/
MovieClip.prototype.removeMouseHotEvent=function(){
	Mouse.removeListener(this.getMouseHotListener())
	var arChild=this.getChildren()
	for(var i=arChild.length-1;i>-1;i--){
		var mc=arChild[i]
		mc.removeMouseHotEvent()
	}
}
/**/
MovieClip.prototype.sendMessage=function(sParam,oParam){
	var arChild=this.getChildren();
	var rtn=null;
	if(oParam.bBubble){
		for(var i=arChild.length-1;i>-1;i--){
			arChild[i].sendMessage(sParam,oParam);
		}
	}
	switch(sParam){
	case "FM_MOUSEMOVE":
		if(this==_root)return true;
		var bOver=this.sendMessage("FM_HITTEST",oParam);
		if(bOver){
			var currHot=this._parent.__currHot;
			var bListen=this.onMouseIn instanceof Function;
			if(currHot!=this){
				currHot.sendMessage("FM_MOUSEOUT")
				rtn=mc.sendMessage("FM_MOUSEIN");
			}
			this._parent.__currHot=this;
		}
		break;
	case "FM_MOUSEIN":
		rtn=this.onMouseIn();
		break;
	case "FM_MOUSEOUT":
		rtn=this.onMouseOut();
		break;
	case "FM_HITTEST":
		if(this.onUserHoverTest instanceof Function){
			rtn=this.onHoverTest(oParam.x,oParam.y,oParam.bTrsp);
		}else{
			rtn=this.hitTest(oParam.x,oParam.y,oParam.bTrsp);
		}
		break;
	default:	
		return null;
	}
	return rtn;
}
/**/
MovieClip.prototype.bindMouseHotEvent=function(bTransp,bBubble){
	if(typeof bBubble=="undefined")bBubble=true
	var oListener=new Object();
	Mouse.addListener(oListener);
	oListener.onMouseMove=function(){
		this.sendMessage("FM_MOUSEMOVE",{x:_root._xmouse,y:_root._ymouse,bBubble:bBubble})
	}
}
/**/
MovieClip.prototype.bindMouseHotEvent=function(bTransp){
	var currHot=null
	var mouseListener:Object=new Object();
	Mouse.addListener(mouseListener);	
	this.getMouseHotListener=function(){return mouseListener}
	var self=this;
	var arChild=this.getChildren()
	mouseListener.onMouseMove=function(){
		for(var i=arChild.length-1;i>-1;i--){
			var mc=arChild[i]
			if(!mc._visible)continue;
			var bOver=false
			if(mc.onUserHoverTest instanceof Function){
				bOver=mc.onUserHoverTest(_root._xmouse,_root._ymouse)
			}else{
				bOver=mc.hitTest(_root._xmouse,_root._ymouse,true)
			}
			if(!bOver)continue;
			var bListen=mc.onMouseIn instanceof Function
			if(currHot!=mc){
				if(bListen){
					currHot.onMouseOut()
					mc.onMouseIn()
				}
			}
			if(bListen){
				currHot=mc
				return;
			}
		}
		currHot.onMouseOut()
		currHot=null
	}
	for(var i=arChild.length-1;i>-1;i--){
		var mc=arChild[i]
		mc.bindMouseHotEvent(mouseListener)
	}
	mouseListener.onMouseMove()
}
////////////////////////////////////////////////////////////
//原型扩展
/* 饱和度，取值范围0~3 */
Button.prototype.setSaturation=function(n){
	var arMtr=[];
	arMtr[0]=(1-n)*0.3086+n;
	arMtr[1]=(1-n)*0.6094;
	arMtr[2]=(1-n)*0.0820;
	arMtr[5]=(1-n)*0.3086;
	arMtr[6]=(1-n)*0.6094+n;
	arMtr[7]=(1-n)*0.0820;
	arMtr[10]=(1-n)*0.3086;
	arMtr[11]=(1-n)*0.6094;
	arMtr[12]=(1-n)*0.0820+n;
	arMtr[18]=1;
	this.filters=[new ColorMatrixFilter(arMtr)];
}
/**/
Button.prototype.setEnabled=function(bEnabled){
	this.enabled=bEnabled
	this.setSaturation(bEnabled?1:0)
}
/*hitTest 不能检查透明*/
Button.prototype.hitTest=function(x,y){
	var p={x:this._x,y:this._y}
	this._parent.localToGlobal(p)
	return (p.x<=x && (p.x+this._width>=x)) && (p.y<=y && (p.y+this._height>=y))
}
////////////////////////////////////////////////////////////
//
TextField.prototype.getInnerWidth=function(){
	var tf=this.getTextFormat()
	var ex=tf.getTextExtent(this.text)
	return ex.textFieldWidth;
}
/**/
TextField.prototype.remove=function(){
	if(this.mc){//for extTf
		this.mc.removeMovieClip()
	}else{
		this.removeTextField();
	}
}
/**/
TextField.prototype.setEnabled=function(bValue){
	this.type=bValue?"input":"dynamic";
	this.selectable=bValue;
}
/**/
TextField.prototype.setFont=function(sFont){
	var tfTmp=this.getTextFormat()
	tfTmp.font=sFont;
	this.setTextFormat(tfTmp);
}
/**/
TextField.prototype.setNewFont=function(sFont){
	var tfTmp=this.getTextFormat()
	tfTmp.font=sFont;
	this.setNewTextFormat(tfTmp);
}
/**/
TextField.prototype.setColor=function(nColor){
	var tfTmp=this.getTextFormat()
	tfTmp.color=nColor;
	this.setTextFormat(tfTmp);
}
/**/
TextField.prototype.setFontSize=function(nSize){
	var tfTmp=this.getTextFormat()
	tfTmp.size=nSize;
	this.setTextFormat(tfTmp);
	this.setNewTextFormat(tfTmp);
}
/**/
TextField.prototype.setUnderLine=function(bUnderLine){
	var tfTmp=this.getTextFormat()
	tfTmp.underline=bUnderLine;
	this.setTextFormat(tfTmp);
}
/**/
TextField.prototype.getOffsetHeight=function(){
	return this._height;
}
////////////////////////////////////////////////////////////
//
XMLNode.prototype.getNodesByName=function(sNodeName){
	var arRet=new Array();
	for(var curr=this.firstChild;curr;curr=curr.nextSibling){
		if((curr.nodeType==1) && (curr.nodeName.toLowerCase()==sNodeName.toLowerCase())){
			arRet.push(curr);
		}
	}
	return arRet;
}
/**/
XMLNode.prototype.getInnerText=function(){
	var s=""
	for(var curr=this.firstChild;curr;curr=curr.nextSibling){
		s+=curr.toString()
	}
	return s;
}
/**/
XMLNode.prototype.getOuterText=function(){
	return this.toString()
}
////////////////////////////////////////////////////////////
//
Array.prototype.indexOf=function(oValue){
	var i=this.length;
	while(--i+1){
		if(oValue instanceof Function){
			if(oValue(this[i],i))return i;
		}else{
			if(this[i]==oValue)return i;
		}
	}
	return -1;
}
////////////////////////////////////////////////////////////
//
String.prototype.replace = function(s1, s2) {
	return this.split(s1).join(s2);
};
String.prototype.ltrim=function(){
	var sRtn=this
	for(var i=0;i<this.length;i++){
		var c=this.charAt(i)
		if((c!=" ")&&(c!="\t")){
			sRtn=this.substr(i)
			break;
		}
	}
	return sRtn;
};
String.prototype.rtrim=function(){
	var sRtn=this
	for(var i=this.length-1;i>-1;i--){
		var c=this.charAt(i)
		if((c!=" ")&&(c!="\t")){
			sRtn=this.substr(0,i+1)
			break;
		}
	}
	return sRtn;
};
String.prototype.trim = function() {
	return this.ltrim().rtrim();
};
String.prototype.setLowerCaseAt=function(nPos,bCase){
	var s0=nPos>0?this.substr(0,nPos-1):""
	var s1=nPos<this.length-1?this.substr(nPos+1):""
	var c=this.charAt(nPos)
	c=bCase?c.toLowerCase():c.toUpperCase()
	return [s0,c,s1].join("")
}
//============================================================
MovieClip.prototype.writeStr = function(Fstr, x, y) {
	var depth = this.getNextHighestDepth();
	if (Fstr.editable) {
		this.inputbox = this.attachMovie("textinput", "text_unl_"+depth, depth);
		this.inputbox._x = x+2;
		this.inputbox._width = Fstr.width;
		this.inputbox._height = Fstr.height;
		this.inputbox.txtbox.setNewTextFormat(Fstr.format);
		this.inputbox.txtbox.type = "dynamic";
		this.inputbox.txtbox.selectable = false;
		if (ques[step].style == "uln" || ques[Pstep].style == "uln") {
			this.inputbox.txtbox.text = underLine(Fstr.text.length);
			this.inputbox.txtbox.background = false;
			this.inputbox.border = false;
			this.inputbox._y = y+5;
		} else {
			this.inputbox.txtbox.text = space(Fstr.text.length);
			this.inputbox.txtbox.background = true;
			this.inputbox.txtbox.border = true;
			this.inputbox._y = y+2;
		}
		depth = this.getNextHighestDepth();
		this.inputxt = this.attachMovie("textinput", "text_in_"+depth, depth);
		this.inputxt._x = x+6;
		this.inputxt._y = y+3;
		this.inputxt._width = Fstr.width;
		this.inputxt._height = Fstr.height;
		this.inputxt.txtbox.setNewTextFormat(Fstr.format);
		this.inputxt.txtbox.type = "input";
		this.inputxt.txtbox.maxChars = Fstr.text.length-1;
		this.inputxt.txtbox.onChanged = function() {
			_root.inputChange(this);
		};
		return this.inputbox;
	} else {
		var tmptxt = this.createTextField(this._name+"_text_"+depth, depth, x, y, Fstr.width, Fstr.height);
		tmptxt.setNewTextFormat(Fstr.format);
		return tmptxt;
	}
};
//---------------直线------------------------------------------
MovieClip.prototype.gline = function(x0, y0, x1, y1, klr, alpha, w) {
	this.lineStyle(w, klr, alpha);
	this.moveTo(x0, y0);
	this.lineTo(x1, y1);
};
//============================================================
MovieClip.prototype.txtClear = function() {
	for (var i in this) {
		this[i].text = "";
		this[i].removeMovieClip();
	}
};
//----------------------------------------
Array.prototype.Clone = function() {
	var arr = new Array();
	for (var i = 0; i<this.length; i++) {
		if (this[i] instanceof Array) {
			arr[i] = this[i].Clone();
		} else {
			arr[i] = this[i];
		}
	}
	return arr;
};
String.prototype.replaceA = function() {
	var a = new Array();
	var index = new Array();
	a = this.split(",");
	for (i=0; i<=a.length; i++) {
		if (a[i] != "undefined" && a[i] != undefined) {
			index.push(i);
		}
	}
	for (i=0; i<=index.length-2; i++) {
		if (index[i+1]-index[i]>=2) {
			for (j=0; j<=index[i+1]-index[i]-2; j++) {
				a[index[i]+j+1] = " ";
			}
		}
	}
	return a.toString();
};
