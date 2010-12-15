function ServerControl(el){
	this.constructor.extend(this,Element,[el.getActiveXObject()])
	//~ var Class=smartAsp.findClass(smartAsp.getRootPath()+"/smartasp/serverControl",el.getTagName()) //得到原型
	//~ if(oClass==null)throw new Error("加载服务器控件'{$0}'失败,{$1}".fill(el.getTagName(),e.message))
	//~ this.constructor.extend(this,oClass,arguments)
}

ServerControl.prototype.toString=function(){
	return "[ServerControl {$0}]".fill(this.getTagName());
}

ServerControl.prototype.renderChildren=function(){
	var ar=this.selectNodes("ancestor-or-self::node()[@runat='server']");
	var arNodes=this.getElementsByXPath(".//node()[@runat='server' and count(ancestor::node()[@runat='server'])="+(ar.length)+"]");
	for(var i=0;i<arNodes.length;i++){
		new ServerControl(arNodes[i]).render()
	}
}

ServerControl.prototype.render=function(){
	this.renderChildren();
}


