function Controller(){
	var self=this;
	this.doc=new Document();
	ASP_GLOBAL.$=function(sId){
		var el=self.doc.getElementById(sId);
		if(!el) throw new Error("无法取得元素{$0}".fill(sId));
		return el;
	}
	ASP_GLOBAL.$c=function(sId){
		try{
			var el=self.doc.getElementById(sId);
			if(!el)throw new Error("指定的element为空")
			oClass=smartAsp.findClass(smartAsp.getRootPath()+"\\svr-ctrl",el.getTagName()) //得到原型
			var sCode="new oClass(",arArgs=["el"];
			for(var i=1;i<arguments.length;i++){
				arArgs.push("arguments["+i+"]");
			}
			sCode+=arArgs.join(",")+")";		
			return eval(sCode);
		}catch(e){
			throw new Error("加载服务器控件'{$0}'失败,{$1}".fill(el.getTagName(),e.message))
		}
	}
}
Controller.prototype.toString=function(){
	return "[Controller]";
}
Controller.prototype.runAction=function(sName){
	for(var k in this){
		if(this[k] instanceof Function && k.toLowerCase()==sName.toLowerCase()){
			this[k]();
		}
	}
	new ServerControl(this.doc).render()
	this.doc.render(); //渲染页面
}