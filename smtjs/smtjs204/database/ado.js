var AdArray =0x2000 //（不适用于 ADOX。）
var adBigInt 	=20
var adBinary 	=128
var adBoolean 	=11
var adBSTR 	=8
var adChapter 	=136
var adChar 	=129
var adCurrency 	=6
var adDate 	=7
var adDBDate 	=133
var adDBTime 	=134
var adDBTimeStamp 	=135
var adDecimal 	=14
var adDouble 	=5
var adEmpty 	=0
var adError 	=10
var adFileTime =	64
var adGUID 	=72 	//传参用大括号括起的字符串
var adIDispatch =	9
var adInteger =	3
var adIUnknown =	13
var adLongVarBinary =	205
var adLongVarChar 	=201
var adLongVarWChar= 	203
var adNumeric 	=131
var adPropVariant =	138
var adSingle =	4
var adSmallInt 	=2
var adTinyInt =	16
var adUnsignedBigInt =	21
var adUnsignedInt 	=19
var adUnsignedSmallInt =	18
var adUnsignedTinyInt =	17
var adUserDefined =	132
var adVarBinary =	204
var adVarChar =	200
var adVariant =	12
var adVarNumeric =	139
var adVarWChar =	202
var adWChar =	130
//ParameterDirectionEnum
var adParamInput =1 //默认值。指示该参数是输入参数。 
var adParamInputOutput =3 //指示该参数既是输入参数，又是输出参数。 
var adParamOutput =2 //指示该参数是输出参数。 
var adParamReturnValue =4 //指示该参数是返回值。 
var adParamUnknown =0 //指示该参数的方向未知。 
//事务
//~ level = cn.BeginTrans()
//~ cn.BeginTrans
//~ cn.CommitTrans
//~ cn.RollbackTrans
//////////////////////////////////////////////////////////////
//database 
function Database(sConnStr){
	this.getConn=function(){
		var cn=new ActiveXObject("adodb.connection");
		cn.Open(sConnStr); 
		return cn;
	}
	this.getRst=function(sql){
		var cn=this.getConn();
		var rs=new ActiveXObject("adodb.recordset");
		rs.open(sql,cn,3,3);
		return rs;
	}
}
//////////////////////////////////////////////////////////////
//sql command
function DbCmd(oConn,sCmd,nCmdType){
	//code project 上的通过子查询实现的分页方法
	//~ SELECT ... FROM Table WHERE PK IN 
			//~ (SELECT TOP @PageSize PK FROM Table WHERE PK NOT IN
					//~ (SELECT TOP @StartRow PK FROM Table ORDER BY SortColumn)
			//~ ORDER BY SortColumn)
	//~ ORDER BY SortColumn
	//~ 今天用Access做sql查询的时候出现了比较奇怪的问题：
	//~ 用：
	//~ select top 10 * from [BBSXP_Threads] where IsDel=0 order by views
	//~ 却返回 大于 10 行的记录，根据理论应该是返回 按 views 排序后的 前10个记录。可是在Access中却显示大于 10 行的记录。 原来Access把按views进行排序，当views的某些记录相等时，access所处的位置相同（就像体育比赛中的并列第一），而进行排序，Access会把前10个位置进行排序，而不是排序的前10个记录。
	//~ 解决方法：
	//~ 在order by 后加入 其他唯一值的记录名。例如：
	//~ select top 10 * from [BBSXP_Threads] where IsDel=0 order by views,id
	//~ 这样就没事了。
	var self=this;
	this.oCmd=new ActiveXObject("ADODB.Command");
	this.oCmd.ActiveConnection=oConn;
	this.oCmd.CommandType=1
	this.oCmd.Prepared=false
	this.cmdParts={}
	this.setCommand(sCmd,nCmdType)
}
/* 清除参数 */
DbCmd.prototype.clearParms=function(){
	var i=this.oCmd.parameters.count;
	while(i--){
		oCmd.parameters.Delete(i);
	}
}
/* 添加参数(某些提供者不支持命名的参数,此时按顺序填充占位，参数名省略) */
DbCmd.prototype.addParam=function(nVarType,sIO,oValue,nLen,sName){
	if(typeof oValue=="string"){
		oValue=oValue.replace(/</g,"&lt;").replace(/>/g,"&gt;")
	}
	var oParm=this.oCmd.CreateParameter(sName,nVarType,sIO,nLen)
	if(!isNaN(nLen))oParm.size=nLen
	oParm.value=oValue
	this.oCmd.parameters.Append(oParm)
}
/* 设置命令 */
DbCmd.prototype.setCommand=function(sCmd,nCmdType){
	this.getCommand=function(){
		return sCmd;
	}
	this.sCmd=sCmd;
	this.cmdParts={};
	//设置命令类型
	if(!isNaN(nCmdType)){
		this.oCmd.CommandType=nCmdType;
	}
	//设置命令字
	this.oCmd.CommandText=sCmd;
	//注意正则式中(?:from\s+.+?),'.+?'使用非贪婪模式，避免吃掉order by子句
	var arRegExp={
		"CMD_TOP":/^select(\s+top\s+\d+)\s+(?:.+)(?:from\s+.+?)(\s+(order\s+by\s+.+))?\s*$/i,
		"CMD_FIELDS":/^select(?:\s+top\s+\d+)?\s+(.+)(?:from\s+.+?)(\s+(order\s+by\s+.+))?\s*$/i,
		"CMD_FROM":/^select(?:\s+top\s+\d+)?\s+(?:.+)(from\s+.+?)(\s+(order\s+by\s+.+))?\s*$/i,
		"CMD_ORDERBY":/^select(?:\s+top\s+\d+)?\s+(?:.+)(?:from\s+.+?)(?:\s+(order\s+by\s+.+))?\s*$/i
	}
	//取命令成分
	var arMatch;
	for(var k in arRegExp){
		arMatch=sCmd.match(arRegExp[k])
		if(arMatch){
			//echo(arMatch[1]+"<br>")
			this.cmdParts[k]=arMatch[1];
		}
	}
}
/* 执行命令 */
DbCmd.prototype.exec=function(){
	var rsTmp=null;
	try{
		rsTmp=this.oCmd.Execute()
	}catch(e){
		throw new Error("{$0}<br/>{$1}".fill(this.sCmd,e.message));
	}
	return rsTmp
}
/* 设置分页方(纯sql语句实现,在给定sql语句上嵌套语句,指定的分页索引应该可以一一对应查询结果的顺序) */
DbCmd.prototype.setPaged=function(nPageSize,sIndexOn){
	this.oCmd.CommandText="select count(*) as RECORD_COUNT_TMP from (select {CMD_FIELDS} {CMD_FROM}) SUB_QUERY_TMP".fillHash(this.cmdParts);
	var rs=this.oCmd.execute();
	this.Records=rs("RECORD_COUNT_TMP").value;
	this.IndexOn=sIndexOn;
	this.Pages=Math.floor(this.Records/nPageSize)+(this.Records%nPageSize>0?1:0);
	this.PageSize=nPageSize;
}
/* 读取分页 */
DbCmd.prototype.getPage=function(nPageId){
	nPageId=parseInt(nPageId)
	if(isNaN(nPageId))nPageId=1;
	if(nPageId<1)nPageId=1;
	if(nPageId>this.Pages)nPageId=this.Pages;
	this.CurrentPage=nPageId;
	//填充cmdParts对象
	this.cmdParts.PAGEID=nPageId
	this.cmdParts.PAGESIZE=this.PageSize
	this.cmdParts.ORIGIN_SQL=this.sCmd
	this.cmdParts.UID=this.IndexOn
	this.cmdParts.NUM_AFTER=this.PageSize*(nPageId-1)
	//标志原语句是否含有top *成分
	var bHaveTopPart=!isNothing(this.cmdParts["CMD_TOP"])
	//生成语句
	var sCmd="select top {PAGESIZE} * from ({ORIGIN_SQL}) SUB_QUERY_TMP1" //sql server 子查询必须命名
	//页数大于1时附加条件语句
	if(nPageId>1){
		//将参数再添加一遍
		var count=this.oCmd.parameters.count;
		for(var i=0;i<count;i++){
			var p=this.oCmd.parameters(i)
			this.oCmd.parameters.append(this.oCmd.CreateParameter(p.name,p.type,p.direction,p.size,p.value))
		}
		sCmd+=" where {UID} not in (select top {NUM_AFTER} {UID} from ({ORIGIN_SQL}) SUB_QUERY_TMP2)"
	}
	sCmd+=" {CMD_ORDERBY}"
	//oCmd.parameters.refresh() //自动从语句(提供者)生成参数, 某些时候会影响效率
	this.oCmd.CommandText=sCmd.fillHash(this.cmdParts)
	//echo(this.oCmd.CommandText)
	return this.oCmd.execute();
}
//////////////////////////////////////////////////////////////
//
var $r2h;
var $R2H=$r2h=function(oRs){
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


