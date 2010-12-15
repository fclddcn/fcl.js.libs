function MovieClip(parent,depth,name,oInit){
		this.parent=parent;
		this.levels=[];
		this._depth=depth;
		this._name=name;
		this.canvas=this.getCanvas();
}
MovieClip.prototype.getCanvas=function(){
		if(this.parent){
				return this.parent.getCanvas();
		}else{
				return document.getElementById(this._name);
		}
}
MovieClip.prototype.getContext2D=function(){
		return this.canvas.getContext("2d");
}
MovieClip.prototype.rotate=function(r){
		var context=this.getContext2D();
		var r=r*Math.PI / 180;
		context.clearRect(0,0,500,500)
		context.translate(250, 250);
		context.rotate(r);
		context.drawImage(img,0,-75);
		//context.rotate(-r);
		context.translate(-250,-250);
}
MovieClip.prototype.reset=function(){

}
MovieClip.prototype.gotoAndPlay=function(){

}
MovieClip.prototype.drawImage=function(){

}


/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// setTimeout(function(){
// 		window.levels=[];
// 		var _root=new MovieClip(null,0,"level0");
// 		///////////////////////////////////////////////////
// 		var mc=new MovieClip(_root);
// 		img=new Image();
// 		img.onload=function(){
// 				//context.drawImage(this,0,0);
// 		}
// 		img.src="lighter.gif";
// 		////////////////////////////////////////////////////
// 		var btn=document.getElementById("button");
// 		btn.onclick=function(){
// 				mc.rotate(30);
// 		}
// },500);
