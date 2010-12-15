function ImageMain(elImage,elField,sSource){
	this.elImage=elImage;
	this.elField=elField;
	this.sSource=sSource
	elField.value=sSource
	this.init()
}
ImageMain.prototype.init=function(){
	this.elImage.src="/upload/"+this.elField.value;
	this.elImage.height=260;
	this.elImage.width=350;
	this.elImage.src="/upload/"+this.sSource;
	this.elImage.style.display="inline"
	this.elImage.style.cursor="pointer"
	if(this.sSource.trim()==""){
		this.elImage.style.display="none"
	}
	this.initEvent()
}
ImageMain.prototype.remove=function(){
	this.elField.value="";
	this.elImage.src="";
	this.elImage.style.display="none"
}
ImageMain.prototype.initEvent=function(){
	var self=this
	this.elImage.onclick=function(e){
		var event=e||window.event
		if(event.ctrlKey){
			self.remove()
		}else{
			window.open(this.src)
		}
	}
}
///////////////////////////////////*-----副图片-----*///////////////////////////////////
function ImageListed(elImage,elField,sSource){
	this.elImage=elImage;
	this.elField=elField;
	this.sSource=sSource
	this.init()
}
ImageListed.prototype.init=function(){
	this.elImage.style.margin="3px"
	this.elImage.src="/upload/"+this.sSource;
	this.elImage.width=180;
	this.elImage.height=120;
	this.elImage.style.cursor="pointer"
	this.initEvent()
}
ImageListed.prototype.initEvent=function(){
	var self=this
	this.elImage.onclick=function(e){
		var event=e||window.event
		if(event.ctrlKey){
			self.remove()
		}else{
			window.open(this.src)
		}		
	}
}
ImageListed.prototype.getIndex=function(){
	var nodes=this.elImage.parentNode.getElementsByTagName("img");
	var idx=-1;
	for(var i=0;i<nodes.length;i++){
		if(nodes[i]==this.elImage)idx=i;
	}
	return idx;
}
ImageListed.prototype.remove=function(){
	var id=this.getIndex();
	if(id<0){return}
	var ar=this.elField.value.split(",");
	ar.splice(id,1)
	this.elField.value=ar.join(",");
	this.elImage.parentNode.removeChild(this.elImage);
}
ImageListed.prototype.insert=function(){
	var ar=[]
	if(this.elField.value.trim()!=""){
		ar=this.elField.value.split(",");
	}
	ar.push(this.sSource)
	this.elField.value=ar.join(",");
}
//////////////////////////////////*图片选择器*//////////////////////////////////
function ImageSelector(){
	var divTitle=$("dlg").getElementsByTagName("div")[0]
	var oDialog=new Dialog($("dlg"),divTitle,{depthMamagerOn:true});//图片选择对话框
	this.oDialog=oDialog 
	this.getPicTable(0)
}
//得到指定页的图片列表
ImageSelector.prototype.getPicTable=function(nPage){
	var self=this
	new Ajax("getimages.asp?page="+nPage+"&fltvalue="+$("txt_seek").value,{
		onSuccess:function(r){
			var j=eval("("+r.responseText+")");
			self.writeTable(j);
		},
		onFailure:function(r){
			alert(r.responseText);
		}
	});

}

ImageSelector.prototype.show=function(fCallBack){
	var self=this
	
	this.btnOk=$("btnOk")
	this.btnCancel=$("btnCancel")
	this.btnSeek=$("btnSeek")
	
	this.btnSeek.onclick=function(){
		self.getPicTable()
	}
	
	window.showCover("#000",50,1)

	this.oDialog.show()
	this.oDialog.moveToCenter()
	
	this.btnCancel.onclick=function(){
		self.oDialog.close()
		window.hideCover()
	}		
	
	this.btnOk.onclick=function(){
		self.oDialog.close()
		window.hideCover()
			fCallBack(self.fileName)
	}
	
}
ImageSelector.prototype.toString=function(){
	return "[Object -ImageSelector-]"
}
//在图片选择表单显示ajax返回的数据
ImageSelector.prototype.writeTable=function(jd){
	var self=this
	var tbd=$("imgtable").getElementsByTagName("tbody")[0];
	var tbl=document.createElement("tbody")
	if($("imgtable").removeNode){
		tbd.removeNode(true)
		$("imgtable").appendChild(tbl)
	}else{
		$("imgtable").replaceChild(tbl,tbd)
	}
	var rec=jd.records;
	for(var i=0;i<rec.length;i++){
		
		var tr=document.createElement("tr");
		tbl.appendChild(tr);
		tr.fileName=rec[i]["filenm"];
		
		tr.style.cursor="pointer"

		var td=document.createElement("td");
		td.innerHTML=rec[i]["id"]==""?"nbsp":rec[i]["id"];
		tr.appendChild(td);
		
		var td=document.createElement("td");
		td.innerHTML=rec[i]["filenm"]==""?"&nbsp":rec[i]["filenm"];
		tr.appendChild(td);
		
		var td=document.createElement("td");
		td.innerHTML=rec[i]["bak"]==""?"&nbsp":rec[i]["bak"];
		tr.appendChild(td);
		
		var td=document.createElement("td");
		var d=getCnDate(new Date(rec[i]["uptime"]),"/")
		td.innerHTML=d==""?"&nbsp":d;
		tr.appendChild(td);
		
		tr.onclick=function(){
			var tbl=this.parentNode.parentNode;
			self.fileName=this.fileName;
			if(tbl.foc!=this){
				this.style.background="#ddd"
				if(tbl.foc){
					tbl.foc.style.backgroundColor="transparent"
				}
				tbl.foc=this;
			}
		}
	}

	var page=parseInt(jd.absolutepage)
	$("ctrltable").innerHTML=["第",jd.absolutepage,"页，共",jd.pagecount,"页，每页",jd.pagesize,"行,共",jd.recordcount,"行"].join("")
	this.currPage=page
	var self=this
	
	arLink=[
		{f:function(){self.getPicTable(1)},t:"[&lt;&lt;]"},
		{f:function(){self.getPicTable(self.currPage-1)},t:"[&lt;]"},
		{f:function(){self.getPicTable(self.currPage+1)},t:"[&gt;]"},
		{f:function(){self.getPicTable(jd.pagecount)},t:"[&gt;]"}
	]
	for(var i=0;i<arLink.length;i++){
		var a=document.createElement("a")
		a.href="#"
		a.innerHTML=arLink[i]["t"]
		a.ongopage=arLink[i]["f"]
		a.onclick=function(){this.ongopage();return false}
		var span=document.createElement("span")
		span.innerHTML="&nbsp;"
		$("ctrltable").appendChild(span)
		$("ctrltable").appendChild(a)
	}
}

