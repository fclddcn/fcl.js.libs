function Word(){
		this.constructor.extend(this,ActiveX,["Word.Application"]);
}
Word.prototype.loadFile=function(sFile){
		this.method("Documents.open",sFile);
};
Word.prototype.addFile=function(sFile){
		this.method("Documents.add",sFile);
};
Word.prototype.newFile=function(sFile){
		this.method("Documents.new",sFile);
};
function start(){
	var fso=new FileSystemObject();
	var w=new Word();
	w.set("visible",true);
	var arFile=fso.getFiles("D:/txt/");
	arFile.each(
		function(v){
			var sTxt=fso.getFileText("D:/txt/"+v,'utf-8');
			var doc=w.method("Documents.add");
			var r=doc.range(0,0);
			r.insertAfter(sTxt);
			doc.saveAs("d:/doc/{$0}".fill(v.replace(/\.txt$/i,".doc")));
			doc.close();
		});
}
