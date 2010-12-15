/////////////////////////////////////////
//Debug
var debug={
	print:function(e){
		Response.clear();
		if(e.message.indexOf("[错误]")>-1){
			throw(e); //有低层抛出
		}
		var func=debug.print.caller;
		var sErr="[错误]"+e.message+"\n";
		sErr+="[堆栈]\n\n";
		Response.Status = "500 Internal Server Error";
		while(func!=null){
			var sFunc=Server.HTMLEncode(func.toString());
			sFunc=sFunc.replace(/\x20{$2}/g,"&nbsp;");
			sFunc=sFunc.replace(/\t/g,"&nbsp;&nbsp;");
			sErr+= "<font style='color:#e50'>● 实参:"
			for(var i=0;i<func.arguments.length;i++) {
				sErr+= (i>0?",":"")+func.arguments[i];
			}
			sErr+="</font>\n"+sFunc;
			func=func.caller;
			if(func!=null){
				sErr+="\n<font style='color:#070'>▲</font>\n";
			}
		}
		sErr=sErr.replace(/\n/g,"<br>");
		var e=new Error("<font style='font-family:courier new;font-size:14px'>"+sErr+"</font>");
		throw e;
	},
	trace:function(sMsg,bEndResponse){
		if(typeof bEndResponse=="undefined"){
			bEndResponse=true;
		}
		if(typeof sMsg!="undefined"){
			sMsg=new String(sMsg);
			sMsg=sMsg.replace(/\n/g,"<br>");
			Response.write(Server.HTMLEncode(sMsg))
		}
		if(bEndResponse){
			Response.end();
		}
	},
	echoForm:function(){
		echo("表单域个数{$0}<br/>".fill(Request.form.count))
		e = new Enumerator(Request.form);          
		for (;!e.atEnd();e.moveNext()){           
			x = e.item();
			echo("{$0}：{$1}<br/>".fill(x,Request.form(x).item()))
		}
	}
}
var echoForm=debug.echoForm