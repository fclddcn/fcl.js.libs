function Application(sType){
		this.outPutBuffer=[];
}
Application.prototype.getClassName=function(){
		return "Application"
}
Application.prototype.lockOutPut=false;
Application.prototype.bufferOutPut=false;
Application.prototype.outPutBuffer=null;
Application.prototype.echo=function(s){
		if(this.bufferOutPut){
				this.outPutBuffer.push(s);
		}else{
				this.outPutBuffer=[s];
		}
		if(!this.lockOutPut&&typeof this.doEcho=="function"){
				this.doEcho(this.outPutBuffer);
		}
}
Application.prototype.clearOutPutBuffer=function(){
		this.outPutBuffer=[];
}
Application.prototype.registerActiveX=function(sModalName,sFileName){
		try{
				var COM=new ActiveXObject(sModalName)
		}catch(e){
				var WSHShell=new ActiveXObject("WScript.Shell"); 
				//alert("正在注册:"+sFileName)
				if(WSHShell.run("regsvr32 /s \""+ sFileName+"\"",1,true)!=0){
						throw new Error("注册'{$0}'失败".fill(sModalName))
				}
		}
}
Array.prototype.getClassName=function(){
		return "Array";
}
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
Array.prototype.each=function(fn,nStep){
		if(!nStep)nStep=1;
		if(nStep>0){
				for(var i=0;i<this.length;i+=nStep){
						if(fn.apply(this,[this[i],i])===false)break;
				}	
		}else{
				for(var i=this.length-1;i>-1;i+=nStep){
						if(fn.apply(this,[this[i],i])===false)break;
				}
		}
}
Array.prototype.fillArray=function(v){
		if(!v)return this;
		for(var i=0;i<v.length;i++){
				this.push(v[i]);
		}
		return this;
}
Array.prototype.fillHash=function(v){
		for(k in v){
				this.push(v[k]);
		}
		return this;
}
Array.prototype.fillRange=function(nStart,nEnd,nStep){
		nStep=Math.abs(!nStep?1:nStep);
		if(nEnd>nStart){
				for(var i=nStart;i<=nEnd;i+=nStep){
						this.push(i);
				}		
		}else{
				for(var i=nStart;i>=nEnd;i-=nStep){
						this.push(i);
				}
		}
		return this;
}
Array.prototype.fillEnum=function(v){
		var e=new Enumerator(v);
		for (;!e.atEnd(); e.moveNext()){
				this.push(e.item());
		}
		return this;
}
Date.prototype.dateDiff = function(interval,objDate){
		if(arguments.length<2||objDate.constructor!=Date) return undefined;
		switch(interval){
		case "s":return parseInt((objDate-this)/1000);
		case "n":return parseInt((objDate-this)/60000);
		case "h":return parseInt((objDate-this)/3600000);
		case "d":return parseInt((objDate-this)/86400000);
		case "w":return parseInt((objDate-this)/(86400000*7));
		case "m":return (objDate.getMonth()+1)+((objDate.getFullYear()-this.getFullYear())*12)-(this.getMonth()+1);
		case "y":return objDate.getFullYear()-this.getFullYear();
		default:return undefined;
		}
}
Date.prototype.getClassName=function(){
		return "Date";
}
Date.prototype.format=function(fmt){
		var o={
				"M+":this.getMonth()+1, 	// 月份
				"d+":this.getDate(), 			// 日
				"h+":this.getHours(), 		// 小时
				"m+":this.getMinutes(), 	// 分
				"s+":this.getSeconds(), 	// 秒
				"q+":Math.floor((this.getMonth()+3)/3), //季度
				"S":this.getMilliseconds() //毫秒
		};
		if(/(y+)/.test(fmt)){
				fmt=fmt.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length));
		}
		for(var k in o){
				if(new RegExp("("+k+")").test(fmt)){
						fmt=fmt.replace(RegExp.$1,(RegExp.$1.length==1)?(o[k]):(("00"+o[k]).substr((""+o[k]).length)));	
				}
		}
		return fmt;
}
Function.prototype.classes=[];
Function.prototype.extend=function(oInst,fBaseCls,arArgs){
		var oPrototype=fBaseCls.prototype;
		if(!oPrototype.getClassName || (!oPrototype.getClassName())){
				throw new Error("Class name of base calss can't be null."+oPrototype)
		}
		var sClsName=oPrototype.getClassName()
		if(!this.prototype.baseClasses || this.prototype.baseClasses.indexOf(sClsName)<0){
				for(var k in oPrototype){
						if(k=="baseClasses")continue;
						if(this.prototype[k]==undefined){
								this.prototype[k]=oPrototype[k];
						}
				}
				/**inherits 'toString', because it can not be enumerate*/
				if(/\[native code\]/.test(this.prototype.toString)){
						this.prototype.toString=oPrototype.toString;
				}
				this.prototype.attachTo=function(oDest){
						for(k in this){
								oDest[k]=this[k];
						}
				}
				if(!this.prototype.baseClasses)this.prototype.baseClasses=[]
				this.prototype.baseClasses.push(sClsName)
		}
		/**CALL THE constructor OF BASE CLASS*/
		arArgs=(arArgs&&arArgs.length)?arArgs:this.arguments;
		fBaseCls.apply(oInst,arArgs); 
}
Function.prototype.getArgs=function(){
		return new Array().fillArray(this.arguments);
}
function MathExt(){
		this.constructor.extend(this,Packer,[Math]);
}
MathExt.prototype.toString=function(){
		return "[object MathExt]";
}
MathExt.prototype.randInRange=function(nMin,nMax,nDiff){
		var a=nDiff;
		while(a==nDiff){
				a=this.floor(this.random() * (nMax - nMin + 1)) + nMin;
		}
		return a;
}
Number.prototype.format=function(fmt,bRound){
		if(typeof bRound=="undefined"){
				bRound=true;
		}
		var arSelf=(this+"").match(/^(\d*)(?:\.(\d+))?$/);
		var part1=arSelf[1],part2=arSelf[2]?arSelf[2]:"";
		//格式化整数部
		function formatPart1(sPtn){
				//由右至左替换
				//如果不够容纳，最左端的#/0填充余部
				//替换没用到的#(左侧有0变0，否则去除)
				//保留未用的0
				var arMatch=sPtn.match(/[0#]|[^0#]+/g)
				var i=arMatch?arMatch.length:0;
				var arNum=sPtn.match(/[0#]/g)
				var c=arNum?arNum.length:0;
				while(i--){
						var s=arMatch[i]
						if(s=="#"||s=="0"){
								if(part1!=""&&--c==0){
										arMatch[i]=part1;
										break
								}else{
										arMatch[i]=part1.charAt(part1.length-1);
										part1=part1.substring(0,part1.length-1);
										if(part1=="")break;
								}
						}
				}
				sPtn=arMatch.join("");
				sPtn=sPtn.replace(/^#+/,"");
				sPtn=sPtn.replace(/#/g,"0");
				return sPtn;
		}
		//格式化小数部
		function formatPart2(sPtn){
				//由左至右替换
				//填充一一对应
				//替换剩余的#(右侧有0变0，否则去除)
				//保留未用的0
				var arMatch=sPtn.match(/[0#]|[^0#]+/g)
				var n=arMatch?arMatch.length:0;
				var arNum=sPtn.match(/[0#]/g)
				var c=arNum?arNum.length:0;
				for(var i=0;i<n;i++){
						var s=arMatch[i]
						if(part2=="")break;
						if(s=="#"||s=="0"){
								//最后一个占位，四舍五入
								if(--c==0&&bRound){
										var nThis=parseInt(part2.charAt(0));
										var sNext=part2.charAt(1);
										if(sNext!=""){
												nThis+=parseInt(sNext)>4?1:0;
										}
										arMatch[i]=nThis;
								}else{
										arMatch[i]=part2.charAt(0);
								}
								part2=part2.substring(1);
						}
				}
				sPtn=arMatch.join("");
				sPtn=sPtn.replace(/\./g,"")
				sPtn=sPtn.replace(/#+$/,"");
				sPtn=sPtn.replace(/#/g,"0");
				return sPtn;
		}
		//patterns
		var p=[
				[/^[^\.]+$/,function(m0){
						return formatPart1(m0)
				}],
				[/^([^\.]+)\.(.+)$/,function(m0,m1,m2){
						//拆分时以最左的点为小数点,其它的会被去除
						return formatPart1(m1)+"."+formatPart2(m2);
				}]
		];
		//try patterns
		for(i=0;i<p.length;i++){
				var r=p[i][0];
				if(r.test(fmt)){
						return fmt.replace(r,p[i][1]);
				}
		}
		//no matches
		return this;
}
/*修正float运算*/
Number.prototype.fdiv=function(v){
		var t1=0,t2=0,r1,r2;
		try{t1=this.toString().split(".")[1].length}catch(e){}
		try{t2=v.toString().split(".")[1].length}catch(e){}
		with(Math){
				r1=Number(this.toString().replace(".",""))
				r2=Number(v.toString().replace(".",""))
				return (r1/r2)*pow(10,t2-t1);
		}
} 
Number.prototype.fmul=function(v){
		var m=0,s1=this.toString(),s2=v.toString();
		try{m+=s1.split(".")[1].length}catch(e){}
		try{m+=s2.split(".")[1].length}catch(e){}
		return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m) 
}
Number.prototype.fadd=function(v){
		var r1,r2,m;
		try{r1=this.toString().split(".")[1].length}catch(e){r1=0}
		try{r2=v.toString().split(".")[1].length}catch(e){r2=0}
		m=Math.pow(10,Math.max(r1,r2))
		return (this*m+v*m)/m 
}
Number.prototype.fsub=function(v){
    var r1,r2,m,n;
    try{r1=this.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=v.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2));
    //last modify by deeka
    //动态控制精度长度
    n=(r1>=r2)?r1:r2;
    return ((this*m-v*m)/m).toFixed(n);
}
/*
是为了适应某些不能枚举属性的对象(也就不能名称引用),比如activeX
*/
function Packer(){
		var oInst=arguments[0];
		this.getPackIn=function(){return oInst;}
}
Packer.prototype.getClassName=function(){
		return "Packer";
}
Packer.prototype.toString=function(){
		return "[Packer]";
}
Packer.prototype.callByName=function(sName){
		var sCode="this.getPackIn()."+sName+"(",arArgs=[];
		for(var i=1;i<arguments.length;i++){
				arArgs.push("arguments["+i+"]");
		}
		sCode+=arArgs.join(",")+")";
		return eval(sCode);
}
Packer.prototype.get=function(sName){
		var sCode="this.getPackIn()."+sName; 
		return eval(sCode);
}
Packer.prototype.setHash=function(hs){
		for(k in hs){
				this.set(k,hs[k])
		}
}
Packer.prototype.set=function(sName,oValue){
		var sCode="this.getPackIn()."+sName+"=oValue";
		eval(sCode);
}
Packer.prototype.method=function(sName){
		var sCode="this.getPackIn()."+sName+"(",arArgs=[];
		for(var i=1;i<arguments.length;i++){
				arArgs.push("arguments["+i+"]");
		}
		sCode+=arArgs.join(",")+")";
		return eval(sCode);
}
Packer.prototype.setProperty=function(sName,oValue){
		var sCode="this.getPackIn()."+sName+"=oValue";
		eval(sCode);
}
Packer.prototype.m_attach=function(sMethod,sAlias){
		var self=this;
		if(!sAlias)sAlias=sMethod;
		this[sAlias]=function(){
				var ar=[sMethod];
				for(var i=0;i<arguments.length;i++){
						ar.push(arguments[i]);
				}
				return self.method.apply(self,ar);
		};
}
Packer.prototype.p_attach=function(sProp,sAlias){
		var self=this;
		if(!sAlias)sAlias=sProp;
		sAlias=sAlias.ucFirst();
		this["get"+sAlias]=function(){
				return self.get(sProp);
		}
		this["set"+sAlias]=function(oValue){
				return self.set(sProp,oValue);
		}
}
/* 按关键字填充 */
String.prototype.fillHash=function(oSource,sSymbol){
		if(typeof sSymbol=="undefined"){sSymbol="$"}
		if(sSymbol.trim()!=""){sSymbol="\\"+sSymbol}
		var r=new RegExp("\\{"+sSymbol+"([^\\:\\s\\{\\}]+)(?:\\:([^\\{\\{]+))?\\}","g")
		var bIsFunc=typeof oSource=="function"
		var f=function(m0,sId,sFormat){
				if(bIsFunc){
						var oVal=oSource(sId.trim())
				}else{
						var oVal=oSource[sId.trim()]
				}
				if(oVal===null)return ""
				if(sFormat){
						sFormat=sFormat.replace(/(^\s+)|(\s+$)/g,"")
						var oConstructor=eval((typeof oVal).replace(/^./,function(chr){return chr.toUpperCase()}));
						oVal=new oConstructor(oVal)
						if(typeof oVal.format=="function"){
								return oVal.format(sFormat);	
						}else{
								return "";
						}
				}else{
						return oVal;
				}
		}
		return this.replace(r,f);
}
/* 按序号填充 */
String.prototype.fill=function(){
		var args=arguments
		return this.fillHash(args);
}
/* 返回所有匹配 */
String.prototype.matchAll=function(r){
		var ar=0,arRet=[];
		var r2=r;
		while(ar=r2.exec(this)){
				arRet.push(ar)
		}
		return arRet;
}
/* 左补位 */
String.prototype.pchLeft=function(sPch){
		var nLen=this.length>sPch.length?sPch.length:this.length;
		var r=new RegExp("^.{"+nLen+"}");
		return sPch.replace(r,this.substring(0,nLen));
}
/* 右补位 */
String.prototype.pchRight=function(sPch){
		var nLen=this.length>sPch.length?sPch.length:this.length;
		var r=new RegExp(".{"+nLen+"}$");
		return sPch.replace(r,this.substring(this.length-nLen,this.length));
}
/* 右起点取子串 */
String.prototype.subRight=function(nStart,nEnd){
		//nStart,nEnd都为从右倒数，nStart<nEnd ,nEnd可不传/可负
		var a=this.length-nStart;
		var b=this.length-nEnd;
		return this.substring(a,b);
}
/* 删除左右空格 */
String.prototype.trim=function(){
		return this.lTrim().rTrim();
}
/* 删左空格 */
String.prototype.lTrim=function(){
		return this.replace(/(^[\s\n\r\uFEFF]+)/,""); 
}
/* 删右空格 */
String.prototype.rTrim=function(){
		return this.replace(/([\s\n\r]+$)/,"");
}
/* HTML编码 */
String.prototype.htmlEncode=function(){
		return this.replace(/&/g,'&amp;').replace(/\"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
/* HTML解码 */
String.prototype.htmlDncode=function(){
		return this.replace(/&amp;/g,'&').replace(/&quot;/g,'\"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}
/* 大写第一个字母 */
String.prototype.ucFirst=function(){
		return this.replace(/(\w)(\w*)/,function(a,b,c){return b.toUpperCase()+c})
}
/* 大写每个单词第一个字母 */
String.prototype.ucWord=function(){
		return this.replace(/(\w)(\w*)/g,function(a,b,c){return b.toUpperCase()+c})
}
/* 大写第一个字母 */
String.prototype.lcFirst=function(){
		return this.replace(/(\w)(\w*)/,function(a,b,c){return b.toLowerCase()+c})
}
/* 大写每个单词第一个字母 */
String.prototype.lcWord=function(){
		return this.replace(/(\w)(\w*)/g,function(a,b,c){return b.toLowerCase()+c})
}
String.prototype.isDate0=function(oDateTime){
		var pat_hd=/^(\d{4}-(([1-9]{1})|(1[0-2]{1}))-(([1-9]{1})|([1-2]{1}[0-9]{1})|(3[0-1]{1}))){1}(\s\d{2}:\d{2}:\d{2})?$/;
		try{
				if(!pat_hd.test(oDateTime)) throw "日期非法！";
				var arr_dt=oDateTime.split(" ");
				if(arr_dt[0]=='') throw "日期非法！";
				var oDate=arr_dt[0];
				var arr_hd=oDate.split("-");
				var dateTmp;
				dateTmp= new Date(arr_hd[0],parseFloat(arr_hd[1])-1,parseFloat(arr_hd[2]));
				if(dateTmp.getFullYear()!=parseFloat(arr_hd[0]) || dateTmp.getMonth()!=parseFloat(arr_hd[1]) -1 || dateTmp.getDate()!=parseFloat(arr_hd[2])) throw "日期非法！";
				if(arr_dt[1] && arr_dt[1]!=''){
						var oTime=arr_dt[1];
						var arr_ht=oTime.split(":");
						dateTmp.setHours(arr_ht[0],arr_ht[1],arr_ht[2]);
						if(dateTmp.getHours()!=parseFloat(arr_ht[0]) || dateTmp.getMinutes()!=parseFloat(arr_ht[1]) || dateTmp.getSeconds()!=parseFloat(arr_ht[2])) throw "日期非法！";
				}
		}catch(ex){
				return false;
		}
		return true;
}
String.prototype.isDate=function(formatString){
		if(!formatString)return this.isDate0()
		formatString = formatString || "ymd";
		var m, year, month, day;
		switch(formatString){
		case "ymd" :
				m = this.match(new RegExp("^((\\d{4})|(\\d{2}))([-./])(\\d{1,2})\\4(\\d{1,2})$"));
				if(m == null ) return false;
				day = m[6];
				month = m[5]--;
				year =  (m[2].length == 4) ? m[2] : GetFullYear(parseInt(m[3], 10));
				break;
		case "dmy" :
				m = this.match(new RegExp("^(\\d{1,2})([-./])(\\d{1,2})\\2((\\d{4})|(\\d{2}))$"));
				if(m == null ) return false;
				day = m[1];
				month = m[3]--;
				year = (m[5].length == 4) ? m[5] : GetFullYear(parseInt(m[6], 10));
				break;
		case "mdy" :
				m = this.match(new RegExp("^(\\d{1,2})([-./])(\\d{1,2})\\2((\\d{4})|(\\d{2}))$"));
				if(m == null ) return false;
				day = m[3];
				month = m[1]--;
				year = (m[5].length == 4) ? m[5] : GetFullYear(parseInt(m[6], 10));
				break;
		default :
				break;
		}
		if(!parseInt(month)) return false;
		month = month==12 ?0:month;
		var date = new Date(year, month, day);
		return (typeof(date) == "object" && year == date.getFullYear() && month == date.getMonth() && day == date.getDate());
		function GetFullYear(y){return ((y<30 ? "20" : "19") + y)|0;}
}
function StringBuilder(strInit){
		this.buffer=[]
		if(strInit){
				this.buffer.push(strInit)
		}
}
/* 格式化方式添加 */
StringBuilder.prototype.appendFormat=function(str){
		var args={};
		for(var i=1;i<arguments.length;i++){
				args[i-1]=arguments[i];
		}
		this.buffer.push(str.fillHash(args));
}
/* 以哈希格式化方式添加 */
StringBuilder.prototype.hsAppendFormat=function(str,hsFill){
		this.buffer.push(str.fillHash(hsFill));
}
/* 直接添加 */
StringBuilder.prototype.append=function(str){
		this.buffer.push(str)
}
/* 输出字符串内容 */
StringBuilder.prototype.toString=function(){
		return this.buffer.join("");
}
