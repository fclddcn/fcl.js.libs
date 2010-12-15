import flash.geom.Point
dynamic class Paragraph{
	public function toString(){
		return "[Paragraph]"
	}
	public function Paragraph(mcParent:MovieClip,arContentNode:Array,x:Number,y:Number,nWidth:Number,nLineDist:Number,oFormat:TextFormat){
		this.setContentNodes(arContentNode)
		this.setMcParent(mcParent)
		this.setFormat(oFormat)
		this.setLeft(x)
		this.setTop(y)
		this.getWidthLimit=function(){
			return nWidth
		}
		this.getLineDistance=function(){
			return nLineDist;
		}
	}
	public function setTop(y){
		this.getTop=function(){
			return y
		}
	}
	public function setLeft(x){
		this.getLeft=function(){
			return x
		}
	}
	public function setFormat(oFormat){
		this.getFormat=function(){
			return oFormat;
		}
	}
	public function setContentNodes(arContentNode){
		var arNode=[];
		for(var i=0;i<arContentNode.length;i++){
			var nd=arContentNode[i]
			if(nd.nodeType==3){	
				var arSplit=nd.toString().replace("\n","").replace("\r","").split(" ")
				for(var j=0;j<arSplit.length;j++){
					nd=new XMLNode(1,"PAK")
					nd.appendChild(new XMLNode(3,arSplit[j]))
					arNode.push(nd)
				}
			}else{
				arNode.push(nd)
			}
		}
		//get
		this.getContentNodes=function(){
			return arNode
		}
	}
	public function setMcParent(mc){
		this.getMcParent=function(){
			return mc
		}
	}
	
	public function setLines(nLines){
		this.getLines=function(){
			return nLines
		}
	}
	
	public function render(bShowBorder){
		var self=this
		var Format=this.getFormat()
		var nLeft=this.getLeft(),nTop=this.getTop()
		var arNode=this.getContentNodes()
		var arWord=[]
		var nWidthLimit=this.getWidthLimit()
		var nHeight=0,nLines=0
	
		var m=Format.getTextExtent("A")
		var nMax=m.textFieldHeight //默认行高
	
		function updateLinePos(){
			self.setLines(++nLines)
			var nMiddle=nTop+nMax*0.5
			var lf=0
			for(var i=0;i<arWord.length;i++){
				arWord[i]._y=nMiddle-Math.floor(arWord[i]._height*0.5-arWord[i]._y+arWord[i].getBounds().yMin)
				arWord[i]._x=lf
				lf+=arWord[i].getBoundWidth()
				self.onWordRendered(i,arWord[i],arWord[i].node,nMiddle)
			}
			nHeight+=nMax
			self.getHeight=function(){
				return nHeight;
			}
		}

		for(var i=0;i<arNode.length;i++){
			var nd=arNode[i]
			var d=this.getMcParent().getNextHighestDepth()
			var mc=this.getMcParent().createEmptyMovieClip("wordMc"+d,d).createEmptyMovieClip("formatMc",0)
			XMLtoGlyph(nd,Format).show(mc,0,0,1,false,0x000000)
			nMax=Math.max(mc._parent.getBoundHeight(),nMax)
			nLeft+=mc._parent.getBoundWidth()
			if(bShowBorder){//显示边框
				mc.showBorder(1,0xff,100)
			}
			if(nLeft>nWidthLimit||arNode[i].nodeName.toLowerCase()=="br"){
				updateLinePos()
				arWord=[]
				nTop+=nMax+this.getLineDistance()
				//nMax=mc._parent.getBoundHeight()
				nMax=m.textFieldHeight //默认行高
				nLeft=mc._parent.getBoundWidth()
			}
			arWord.push(mc._parent)
			if(i==arNode.length-1){
				updateLinePos()
			}
			mc._x=this.getLeft()
			mc._parent.node=nd
		}
	}
}