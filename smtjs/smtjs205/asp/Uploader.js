/* 读上传数据前不能读 request(<不存在的参数>) 否则会报错
 * 参数类型不正确，或不在可以接受的范围之内，或与其他参数冲突。 
 */
var Nothing=void null;
function FormField(){
	this.FileName = Nothing;
	this.FileType = Nothing;
	this.FilePath = Nothing;
	this.FileSize = Nothing;
	this.SavePath = Nothing;
	this.SourceName = Nothing;
	this.Message = Nothing;
	this.Value = Nothing;
	this.toString = new Function("return this.Value");
}
function Uploader(){
	this.Charset = "gb2312";
	this.Field = {};
	this.GetFileBody = this.MaxSize = 0;
	this.TempField = this.LastData = "";
	this.Filter = "rar|zip|txt|gif|jpg|bmp|htm|html|swf|mht";
	this.Rule=Nothing;
}
Uploader.prototype.readForm=function(ReadSize, ProgID){ //  ProgID - 可选/用于进度计算
	this.Rule = Request.ServerVariables("Http_Content_Type").Item;
	if(!this.Rule || this.Rule.indexOf("multipart/form-data")) {
		throw new Error("没有为上传表单指定enctype='multipart/form-data'类型");
	}
	this.Rule = "--" + this.Rule.split("=")[1];
	this.Rule = this.Rule.replace(/[\x00-\xff]/g,
		function($1){
			return "%" + $1.charCodeAt(0).toString(16).toUpperCase();
		});
	var TotalBytes = Request.TotalBytes;
	if(ReadSize % 2) ReadSize += 1;
	if(!ReadSize || ReadSize > TotalBytes) ReadSize = TotalBytes;
	var ReadBytes = 0;
	if(!this.Stream)this.Stream = Server.CreateObject("Adodb.Stream");
	while(ReadBytes < TotalBytes && Response.IsClientConnected()){
		ReadBytes += ReadSize;
		if(ReadBytes > TotalBytes){
			ReadSize = ReadSize + TotalBytes - ReadBytes;
			ReadBytes = TotalBytes;
		}
		if(ProgID){
			Application.Lock();
			Application.Contents(ProgID + "_TotalBytes") = TotalBytes;
			Application.Contents(ProgID + "_ReadBytes") = ReadBytes;
			Application.Unlock();
		}
		this.LastData += this.EncodeChar(this.BinToStr(Request.BinaryRead(ReadSize)));
		if(this.LastData.length < this.Rule.length) continue;
		if(!this.GetFileBody && this.LastData.indexOf(this.Rule) > -1){
			this.GetFullData();
		}else{
			if(!this.GetFileBody && this.LastData.indexOf("%0D%0A%0D%0A") > 0){
				var fieldBody = unescape(this.LastData.replace(/%(\w{2})%(\w{2})/g, "%u$2$1"));
				fieldBody = this.BinToStr(fieldBody, this.Charset).split("\r\n\r\n")[0];
				var mimeType = fieldBody.match(/Type: (.*)$/);
				if(mimeType){
					var filePath = fieldBody.match(/ filename="(.*?)"/);
					TempField = fieldBody.match(/ name="(.*?)"/)[1];
					this.Field[TempField] = new FormField;
					this.Field[TempField].FileType = mimeType[1];
					this.Field[TempField].FilePath = filePath[1];
					this.Field[TempField].SourceName = filePath[1].match(/([^\/\\]*?)$/)[1];
					this.Field[TempField].FileSize = 0;
					this.LastData = this.LastData.replace(/^(.*?)%0D%0A%0D%0A/,"");
					this.Field[TempField].Value = new Array();
					this.GetFileBody = 1;
				}
			}else if(this.GetFileBody){
				if(this.LastData.length < this.Rule.length + 6) continue;
				if(this.LastData.indexOf("%0D%0A" + this.Rule) < 0){
					var uniChar = this.LastData.slice(0, 0 - this.Rule.length - 6);
					if(uniChar.length % 6) uniChar = uniChar.slice(0, -3);
					this.Field[TempField].FileSize += uniChar.length;
					if(!this.MaxSize || this.Field[TempField].FileSize/3 <= this.MaxSize)
						this.Field[TempField].Value.push(unescape(uniChar.replace(/%(\w{2})%(\w{2})/g,"%u$2$1")));
					this.LastData = this.LastData.replace(uniChar, "");
				}else{
					var uniChar = this.LastData.split("%0D%0A" + this.Rule)[0];
					this.Field[TempField].FileSize += uniChar.length;
					this.LastData = this.LastData.replace(uniChar, "");
					if(!this.MaxSize || this.Field[TempField].FileSize/3 <= this.MaxSize){
						this.Field[TempField].Value.push(unescape(uniChar.replace(/%(\w{2})%(\w{2})/g,"%u$2$1")));
						this.Field[TempField].Value = this.Field[TempField].Value.join("");
					}else{
						this.Field[TempField].Value = "文件太大";
					}
					this.Field[TempField].FileSize = this.Field[TempField].FileSize / 3;
					this.GetFileBody = 0;
					if(this.LastData.length > this.Rule.length && ReadBytes == TotalBytes) this.GetFullData();
				}
			}
		}
	}
}
Uploader.prototype.SaveFile=function(sFld){
	var upFilter = new RegExp("\\.(" + this.Filter + ")$","i");
	if(this.Field[sFld].FilePath){
		if(!this.Field[sFld].Value){
			throw new Error("文件内容不能为空");
		}
		if(this.Filter && !this.Field[sFld].FilePath.match(upFilter)){
			throw new Error( "服务器不接受该类文档");
		}
		if(this.MaxSize && this.Field[sFld].FileSize > this.MaxSize){
			throw new Error("上传文档大小超过限制");
		}
		var filename = this.Field[sFld].SavePath;
		var strCap = this.Field[sFld].Value.charCodeAt(0).toString(16);
		while(strCap.length < 4){
			strCap = "0" + strCap;
		}
		this.Stream.Type = 2;
		this.Stream.Charset = "latin1";
		this.Stream.Open();
		this.Stream.WriteText(unescape("%" + strCap.slice(2)));
		if(this.Field[sFld].FileSize > 1){
			this.Stream.WriteText(unescape("%" + strCap.slice(0, 2)));
			this.Stream.Position = 0;
			this.Stream.Charset = "unicode";
			this.Stream.Position = 2;
			this.Stream.WriteText(this.Field[sFld].Value.slice(1));
			this.Stream.Position = 0;
			this.Stream.Charset = "latin1";
			this.Stream.Position = this.Field[sFld].FileSize;
			this.Stream.SetEOS();
		}try{
			this.Stream.SaveToFile(filename,2);//over write
			//this.Stream.SaveToFile(filename);//no over write, except when write exist
		}catch(err){
			throw err
		}finally{
			this.Stream.Close();
		}
	}	
}
Uploader.prototype.GetFullData=function(){
	this.LastData = this.LastData.split(this.Rule);
	for(var C=0; C<this.LastData.length-1; C++){
		if(this.LastData[C].length < 10) continue;
		var strField = this.ParseData(this.LastData[C]);
		var sFldName=strField[0];
		if(this.Field[sFldName]){ //此处做了修改,如果有同名字段,以逗号分隔的字串表示
			this.Field[sFldName].Value += ", " + strField[1];
		}else{
			this.Field[sFldName] = new FormField();
			this.Field[sFldName].Value = strField[1];
		}
		if(strField[3]){
			this.Field[sFldName].FilePath = strField[2];
			this.Field[sFldName].SourceName = strField[2].match(/([^\/\\]*?)$/)[1];
			this.Field[sFldName].FileType = strField[3];
			var fileInfo = this.GetFile(this.LastData[C]);
			this.Field[sFldName].Value = fileInfo[0];
			this.Field[sFldName].FileSize = fileInfo[1];
		}
	}
	this.LastData = this.LastData.pop();
}
Uploader.prototype.BinToStr=function(uniChar, encoding){
	this.Stream.Open();
	this.Stream.Charset = "unicode";
	this.Stream.WriteText(uniChar);
	this.Stream.Position = 0;
	if(encoding && encoding != "unicode") this.Stream.Charset = encoding;
	uniChar = this.Stream.ReadText();
	this.Stream.Close();
	return uniChar;
}
Uploader.prototype.EncodeChar=function(uniChar){
	uniChar = uniChar.replace(/[\x00-\xff]/g,
		function($1){
			$1=$1.charCodeAt(0).toString(16).toUpperCase();
			if($1.length < 2) $1 = "0" + $1;
			return "_00" + $1;
		});
	return escape(uniChar).replace(/_/g,"%u").replace(/%u(\w{2})(\w{2})/g,"%$2%$1");
}
Uploader.prototype.ParseData=function(uniChar){
	var fieldBody, fieldName, fieldValue, filePath, mimeType;
	uniChar = unescape(uniChar.replace(/%(\w{2})%(\w{2})/g, "%u$2$1"));
	uniChar = this.BinToStr(uniChar, this.Charset);
	fieldBody = uniChar.split("\r\n\r\n");
	fieldName = fieldBody[0].match(/ name="(.*?)"/)[1];
	mimeType = fieldBody[0].match(/Type: (.*)$/);
	filePath = fieldBody[0].match(/ filename="(.*?)"/);
	fieldBody.shift();
	fieldValue = fieldBody.join("\r\n\r\n").replace(/\r\n(\x00)?$/,"");
	return [fieldName, fieldValue, filePath?filePath[1]:Nothing, mimeType?mimeType[1]:Nothing];
}
Uploader.prototype.GetFile=function(uniChar){
	uniChar = uniChar.slice(0,-6).replace(/(.*?)(%0D%0A){2}/,"");
	var fileSize = uniChar.length / 3;
	uniChar = unescape(uniChar.replace(/%(\w{2})%(\w{2})/g,"%u$2$1"));
	return [uniChar, fileSize];
}
Uploader.prototype.MakeFileName=function(){
	var time = new Date;
	var arrName = new Array;
	arrName.push(time.getYear().toString().substr(2,2));
	arrName.push(time.getMonth()+1);
	arrName.push(time.getDate());
	arrName.push(time.getHours());
	arrName.push(time.getMinutes());
	arrName.push(time.getSeconds());
	arrName.push(Math.random().toString().substr(2,4));
	return arrName.join("!").replace(/!(\d+)/g,function($0,$1){return $1>9?$1:"0"+$1});
}
Uploader.prototype.TextForm=function(){
	TempField = new Enumerator(Request.Form);
	while(!TempField.atEnd()){
		this.Field[TempField.item()] = new FormField;
		this.Field[TempField.item()].Value = Request.Form(TempField.item()).Item;
		TempField.moveNext();
	}
}
Uploader.prototype.Form=function(Element){
	return this.Field[Element];
}
Uploader.prototype.Dispose=function(){
	this.Field = this.Stream = Nothing;
	CollectGarbage();
}
