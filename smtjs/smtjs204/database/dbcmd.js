function DbCmdAccess(oConn,sCmd){
	this.constructor.extend(this,ActiveX,["ADODB.Command"]);
	this.setActiveConnection(oConn);
	this.setCommandType(1);
	this.setPrepared(false);
	this.setCommandText(sCmd);
}
DbCmdAccess.prototype.$$execute={type:'m'}
DbCmdAccess.prototype.$$createParameter={type:'m'}
DbCmdAccess.prototype.$$commandText={type:'p'}
DbCmdAccess.prototype.$$Parameters={type:'p'}
DbCmdAccess.prototype.$$Prepared={type:'p'}
DbCmdAccess.prototype.$$CommandType={type:'p'}
DbCmdAccess.prototype.$$ActiveConnection={type:'p'}
/*    */
DbCmdAccess.prototype.clearParms=function(){
	var params=this.getParameters()
	var i=params.count;
	while(i--){
		params.Delete(i);
	}
}
/*   */
DbCmdAccess.prototype.exec=function(){
	try{
		return this.execute();
	}catch(e){
		throw new Error(e.message+"\n"+this.getCommandText());
	}
}
/*   */
DbCmdAccess.prototype.setPaged=function(nPageSize,sIndexOn,bDesc){
	var sCmd=this.getCommandText()
	this.setCommandText("select count(*) as c from ({$0})".fill(sCmd));
	var rs=this.execute();
	this.Records=rs("c").value;
	this.IndexOn=sIndexOn;
	this.Desc=bDesc;
	this.Pages=Math.floor(this.Records/nPageSize)+(this.Records%nPageSize>0?1:0);
	this.getPageSize=function(){
		return nPageSize
	}
	this.setCommandText(sCmd)
}
/* 分页(纯sql语句实现,在给定sql语句上嵌套语句)  
 * access必须至少含有一个非重复字段排序,否则可能出现多余记录
 */
DbCmdAccess.prototype.getPage=function(nPageId){
	/* 处理当前页号 */
	if(isNaN(nPageId)||nPageId<1)nPageId=1;
	if(nPageId>this.Pages)nPageId=this.Pages;
	this.CurrentPage=nPageId;
	/* 判断实际能显示多少行 */
	var nTop=this.Records-(nPageId-1)*this.getPageSize()
	if(nTop>this.getPageSize())nTop=this.getPageSize()
	/* 读取排序关键字(位于末尾) */
	var ar=/order\s+by\s+(.+?)\s*$/i.exec(this.getCommandText())
	if(!ar)throw new Error("分页时必须有排序条件");
	/* 分析拼接sql所需要的内容 */
	var arMatch,arNew=[],rFld=/([^,\s]+)(?:\s+(desc|asc))?/ig;
	while(arMatch=rFld.exec(ar[1])){
		arNew.push(arMatch[1]+(arMatch[2].toLowerCase()=="desc"?"":" desc"))
	}
	var h={
		cmd:this.getCommandText(),
		od2:ar[1], /* 原序 */
		od1:arNew.join(), /* 反序 */
		records_tmp:nPageId*this.getPageSize(),
		renderCount:nTop
	}
	/* 防止出现 select top 0 错误 */
	if(h.records_tmp<1)h.records_tmp=1
	if(h.renderCount<1)h.renderCount=1
	/* 拼接 SQL */
	this.setCommandText(["select * from (",
		"select top {$renderCount} * from (",
		"select top {$records_tmp} * from ({$cmd}) order by {$od2}",
		") order by {$od1}",
		") order by {$od2}"].join("").fillHash(h))
	var rs=this.execute();
	return rs;
}
/* 添加参数(某些提供者不支持命名的参数,此时按顺序填充占位，参数名省略)  */
DbCmdAccess.prototype.addParam=function(nVarType,sIO,oValue,nLen,sName){
	if(typeof oValue=="string"){
		oValue=oValue.replace(/</g,"&lt;").replace(/>/g,"&gt;")
	}
	var oParm=this.createParameter(sName,nVarType,sIO,nLen)
	if(!isNaN(nLen))oParm.size=nLen
	oParm.value=oValue
	this.getParameters().Append(oParm)
}
var $r2h=function(oRs){
	var oHs={};
	if(!oRs.eof){
		var fields=new Enumerator(oRs.fields);
		while(!fields.atEnd()){
			var oFld=fields.item();
			oHs[oFld.name]=oFld.value!=null?oFld.value:"";
			fields.moveNext()
		}
	}
	return oHs;
}