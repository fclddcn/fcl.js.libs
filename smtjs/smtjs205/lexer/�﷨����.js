////////////////////////////////////////////////////////////
//
//小数
//支持加减乘除，乘方，开方，取负,取正运算符
//支持函数和括号，可嵌套
//支持逗号表达式

//括号→ 函数→ 求幂(^) 开方(@) →乘(*) 除(/) → 加(+) 减(-) → 逗号
var optsDefine1={"^":3,"@":3,"<negative>":2,"<positive>":2,"*":1,"/":1,"+":0,"-":0,",":"-1"};
var optsDefine2={"<lbrace>":100,"<rbrace>":100,"<function>":99}

function Lexer(){
	this.buffer="";
	this.n=0 //未读的数量
	this.p=0 //当前位置
	this.curr="" //当前字符
	this.tokens=[];
}

/*标记入栈*/
Lexer.prototype.tsave=function(type,value){
	var t={type:type,value:value};
	this.tokens.push(t);
	return t;
}

/*是否数字字符*/
Lexer.prototype.isDigit=function(sChr){
	var nAsc=-1;
	if(sChr!=null)nAsc=sChr.charCodeAt(0);
	return nAsc>=48&&nAsc<=57;
}

/*是否字母字符*/
Lexer.prototype.isAlpha=function (sChr){
	var nAsc=-1;
	if(sChr!=null)nAsc=sChr.charCodeAt(0);
	return (nAsc>=65&&nAsc<=90) || (nAsc>=97&&nAsc<=122)
}

/*添加代码*/
Lexer.prototype.setCode=function(sCode){
	this.buffer+=sCode;
	this.n=this.buffer.length;
	this.p=0;
	this.tokens=[];
	this.next()
}

/*下一字符*/
Lexer.prototype.next=function (){
	if(--this.n>-1){
		this.curr=this.buffer.charAt(this.p++);
	}else{
		this.curr=null;
	}
	return this.curr
}

/*词法分析*/
Lexer.prototype.lex=function (){
	var t;
	for(;;){
		t="";
		switch(this.curr){
			/*end of buffer*/
			case null:return this.tokens
			/*new line*/
			case "\n":
			case "\r":continue;
			/*operator*/
			case ",":
			case "+":;case "-":;
			case "*":;case "/":;case "=":;
			case "^":;case "@":;case "_":;case "|":{
				this.tsave("<opr>",this.curr)
				this.next();
				break;
			}
			case ":":{
				this.next();
				if(this.curr!="="){
					break;
				}else{
					this.tsave("<opt>",":=")
					this.next();
				}
			}
			/*brace*/
			case "{":case "(":case "[":{
				this.tsave("<lbrace>",this.curr)
				this.next();
				break;
			}
			case "}":case ")":case "]":{
				this.tsave("<rbrace>",this.curr)
				this.next();
				break;
			}
			/*escape*/
			case "\\":{
				while(true){
					this.next();
					if(!this.isAlpha(this.curr)){
						if(t==""){
							this.tsave("<escape>",this.curr);
							this.next();
						}else{
							this.tsave("<escape>",t);
						}
						break;
					}
					t+=this.curr;
				}
				break;
			}
			/*other*/
			default:{
				if(this.curr==" "){
					this.tsave("<space>"," ")
					this.next();
				}else if(this.isDigit(this.curr)||this.curr=="."){
					var i=0
					do{
						if(this.curr=="."){
							if(++i>1)throw new Error("过多的小数点,列"+this.p)
						}
						t+=this.curr;
						this.next();
					}while(
						this.isDigit(this.curr)||(this.curr==".")
					)
					this.tsave("<digit>",t)
				}else if(this.isAlpha(this.curr)){
					do{
						t+=this.curr;
						this.next()
					}while(
						this.isAlpha(this.curr)||this.isDigit(this.curr)||this.curr=="_"
					)
					if(this.curr=="("){
						this.tsave("<function>",t)
						this.next()
					}else{
						this.tsave("<valuename>",t)
					}
				}else{//unknown
					this.next() 
				}
			}
		}
	}
}
/* 生成逆波兰式 */
Lexer.prototype.toPlArray=function(arTokens){
	var arReturn=[],arBuffer=[];
	var bFindNum=false;
	for(var i=0;i<arTokens.length;i++){
		var t=arTokens[i];
		if(typeof optsDefine1[t.value]!="undefined"||typeof optsDefine2[t.type]!="undefined"){ //操作符
			//检查函数闭合/参数表/逗号表达式
			if(t.type=="<function>"){ 
				var tFunc=t
				var nParamCount=0,nn=-1
				for(var j=i+1;j<arTokens.length;j++){
					if(arTokens[j].type=="<digit>"||arTokens[j].type=="<function>"||arTokens[j].type=="<lbrace>"){
						if(nn==-1)nParamCount++;
					}
					if(arTokens[j].value==","&&nn==-1){ //区分逗号表达式和实参表
						arTokens[j].value=null;
						arTokens[j].type=null;
					}
					if(arTokens[j].type=="<lbrace>"||arTokens[j].type=="<function>"){
						nn--;
					}
					if(arTokens[j].type=="<rbrace>"){nn++}
					if(nn==0){
						break;
					}else{
						if(j==arTokens.length-1){
							throw new Error("缺少右括号");
						}
					}
				}
				tFunc.paramCount=nParamCount;
			}
			//检测负数(起始，或上一个标记为非操作数)
			if(!bFindNum&&t.value=="-"){
				t.value="<negative>"
			}
			if(!bFindNum&&t.value=="+"){
				t.value="<positive>"
			}
			//跟据优先级保存缓存的操作符
			var j=arBuffer.length;
			while(--j>-1){
				var b=arBuffer[j];
				if(b.type=="<lbrace>" && t.type=="<rbrace>"){ //t为闭括号，遇到开括号时弹出开括号
					arBuffer.pop();
					break;
				}else if((b.type=="<function>") && t.type=="<rbrace>"){ //t为闭括号，遇到函数时弹出函数
					var oFunc=arBuffer.pop();
					arReturn.push(oFunc);
					break;
				}else if(t.type=="<lbrace>"||t.type=="<function>"){ //t为开括号或函数,直接压栈
					break;
				}else if((b.type!="<lbrace>")&&(t.type=="<rbrace>"||optsDefine1[t.value]<=optsDefine1[b.value])){ //t为操作符或右括号
					arReturn.push(arBuffer.pop());
				}else{
					break;
				}
			}
			//缓存操作符和开括号
			if(t.type!="<rbrace>"){
				arBuffer.push(t);
				bFindNum=false;
			}else{
				bFindNum=true;
			}
		}else{ //保存操作数
			arReturn.push(t)
			bFindNum=true
		}
	}
	//保存剩下的操作符
	while(arBuffer.length){
		arReturn.push(arBuffer.pop());
	}
	return arReturn;
}
////////////////////////////////////////////////////////////
//生成逆波兰式字串
Lexer.prototype.toPlString=function(arTokens){
	var s=""
	for(var i=0;i<arTokens.length;i++){
		if(arTokens[i].type)s+=arTokens[i].value+" "
	}
	return s
}
////////////////////////////////////////////////////////////
//结果
Lexer.prototype.calc=function(arTokens){
	//计算结果
	var arNum=[];
	for(var i=0;i<arTokens.length;i++){
		var oToken=arTokens[i],tValue=oToken.value;
		if(!tValue)continue
		if(typeof optsDefine1[tValue]!="undefined"){
			var n=null,p=arNum.pop();
			switch(tValue){
				case "<negative>": //取负(单目)
					var n=-p;break;
				case "<positive>":  //取正(单目)
					n=p;break;
				case "^": //指数(2目)
					n=Math.pow(arNum.pop(),p);break;
				case "@": //根式(2目)
					n=Math.pow(arNum.pop(),1/p);break;
				case "+": //(2目)
					n=arNum.pop()+p;break;
				case "-": //(2目)
					n=arNum.pop()-p;break;
				case "*": //(2目)
					n=arNum.pop()*p;break;
				case "/": //(2目)
					n=arNum.pop()/p;break;
				case ",":
					arNum.pop()//丢掉前一个操作数
					n=p;break;
				default:
					throw new Error("未知操作符")
			}
			arNum.push(n);
		}else if(oToken.type=="<function>"){ //函数(不确定目)
			var n=null;
			var arParam=arNum.splice(arNum.length-oToken.paramCount-1,oToken.paramCount);
			arParam=arParam.reverse();
			n=fff[oToken.value].apply(this,arParam);
			arNum.push(n);
		}else{
			arNum.push(parseFloat(tValue));
		}
	}
	//测试结果
	return arNum.pop();
}
////////////////////////////////////////////////////////////
//定义函数集合
var fff={}
fff.add=fff.add_2=function(){
	var r=0;
	for(var i=0;i<arguments.length;i++){
		r+=arguments[i];
	}
	return r;
}

var add=fff.add;

////////////////////////////////////////////////////////////
//测试
var s0="5*(1+2+6.3)";
var s1="5*(1+2+6.3)";
print("原式为:"+s0,"\n");

var lxr=new Lexer();
//lxr.setCode(s0);
lxr.setCode("\\{\\lim_{n\\to\\infty}x_n {\\rm\\ exists} \\iff\limsup_{n\\to\\infty}x_n = \\liminf_{n\\to\\infty}x_n.");

var ar=lxr.toPlArray(lxr.lex());
print("逆波兰式为:"+lxr.toPlString(ar),"\n");
print("正确结果应为:",eval(s0),"\n");
print("编译运行结果:",lxr.calc(ar),"\n");







