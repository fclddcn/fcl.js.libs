function Excel(){
		this.constructor.extend(this,ActiveX,["Excel.Application"]);
}
Excel.prototype.clearSheets=function(oWorkBook){
		for(var i=oWorkBook.Worksheets.Count;i>1;i--){
				oWorkBook.Worksheets(i).Delete 
		}
}
Excel.prototype.loadFile=function(sFile){
		this.method("Workbooks.Open",sFile);
}
Excel.prototype.col2array=function(sColName){
		var sheet=this.get("ActiveWorkbook.Worksheets(1)");
		var i=2;
		var arBuffer=[]
		while(true){
				var txt=sheet.range("{$1}{$0}:{$1}{$0}".fill(i++,sColName)).Text
				if(!txt)break;
				arBuffer.push(txt)
		}
		return arBuffer;
}
Excel.prototype.close=function(sFile){
		this.method("Workbooks.Close");
}
Excel.prototype.show=function(b){
		this.set("Visible",b);
}
