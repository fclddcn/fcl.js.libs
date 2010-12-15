AdArray = 0x2000; //（不适用于 ADOX。）
adBigInt = 20;
adBinary = 128;
adBoolean = 11;
adBSTR = 8;
adChapter = 136;
adChar = 129;
adCurrency = 6;
adDate = 7;
adDBDate = 133;
adDBTime = 134;
adDBTimeStamp = 135;
adDecimal = 14;
adDouble = 5;
adEmpty = 0;
adError = 10;
adFileTime = 64;
adGUID = 72; //传参用大括号括起的字符串
adIDispatch = 9;
adInteger = 3;
adIUnknown = 13;
adLongVarBinary = 205;
adLongVarChar = 201;
adLongVarWChar = 203;
adNumeric = 131;
adPropVariant = 138;
adSingle = 4;
adSmallInt = 2;
adTinyInt = 16;
adUnsignedBigInt = 21;
adUnsignedInt = 19;
adUnsignedSmallInt = 18;
adUnsignedTinyInt = 17;
adUserDefined = 132;
adVarBinary = 204;
adVarChar = 200;
adVariant = 12;
adVarNumeric = 139;
adVarWChar = 202;
adWChar = 130;

adUseClient = 3;
adUseNone = 1 ;
adUseServer = 2 ;

//ParameterDirectionEnum
adParamInput = 1; //默认值。指示该参数是输入参数。
adParamInputOutput = 3; //指示该参数既是输入参数，又是输出参数。
adParamOutput = 2; //指示该参数是输出参数。
adParamReturnValue = 4; //指示该参数是返回值。
adParamUnknown = 0; //指示该参数的方向未知。

adStateClosed = 0; //指示对象已关闭。
adStateOpen = 1; //指示对象已打开。
adStateConnecting = 2; //指示对象正在连接。
adStateExecuting = 4; //指示对象正在执行命令。
adStateFetching = 8 ;//指示正在检索对象的行。

////////////////////////////////////////////////////////////////////////////////////////////////////
//
function Database(sConnStr, nCursorLocation) {
	this.getConn = function() {
		var cn = new ActiveXObject("adodb.connection");
		cn.cursorLocation = typeof nCursorLocation == "undefined" ? adUseServer : nCursorLocation;
		cn.Open(sConnStr);
		return cn;
	}
	this.getRst = function(sql) {
		var cn = this.getConn();
		var rs = new ActiveXObject("adodb.recordset");
		rs.open(sql, cn, 3, 3);
		return rs;
	}
}
