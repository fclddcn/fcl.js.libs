ExtControls={}
//---Spin---
ExtControls.Spin=function(el){
		this.constructor.extend(this,Element,[el])
		this.init()
}
ExtControls.Spin.prototype.check=function(){
		var v=this.get("value");
		if(!v)v=0;
		this.set("value",isNaN(v)?0:v);
}
ExtControls.Spin.prototype.init=function(){
		var self=this;
		var input=this.getPackIn();
		var nStep=parseFloat(this.getAttribute("spinStep"));
		if(isNaN(nStep))nStep=1;
		//ȷ��ֵΪ����
		this.check();
		//
		var a=window.ce("a",this.getParentNode(),this.get("nextSibling"),"");
		a.innerHTML="[+]";
		a.href="#";
		a.onclick=function(){
				self.check();
				var v=parseFloat(input.value);
				v=v.fadd(nStep)
				input.value=v;
				return false;
		}
		//
		var b=window.ce("a",this.getParentNode(),this.get("nextSibling"),"");
		b.innerHTML="[-]";
		b.href="#";
		b.onclick=function(){
				self.check();
				var v=parseFloat(input.value);
				v=v.fsub(nStep)
				input.value=v;
				return false;
		}
}
//---Date---
ExtControls.Date=function(el){
		this.constructor.extend(this,Element,[el])
		if(!window.calendar)
		window.calendar=new Calendar()
		el.onclick=function(){
				window.calendar.input(this);
		}
}
//---PicList---
ExtControls.PicList=function(el){
		var self=this;
		this.constructor.extend(this,Element,[el]);
		var sPath=this.getAttribute("picPath");
		var sStyle=this.getAttribute("picStyle");
		var nPadding=parseInt(this.getAttribute("picPadding"));
		var elParent=this.getParentNode();
		var arList=this.get("value").split(",");
		var nPicCount=parseInt(this.getAttribute("picCount"));
		var div=ce("div",elParent,this.get("nextSibling"),"border:1px;width:100%");
		var aAdd=ce("a",div,null,"border:1px");
		new Element(aAdd).setHash({innerHTML:"���<br/>",href:"#"});
		//
		aAdd.onclick=function(){
				self.showSelector();
				return false;
		}
		//
		arList.each(function(v,i){
				if(v=="")return;
				var img=ce("img",div);
				img.src=sPath+v;
				if(sStyle)new Element(img).newCss(sStyle+";cursor:pointer;");
				img.ondblclick=function(){
						this.parentNode.removeChild(this);
				}
		})
}
ExtControls.PicList.prototype.showSelector=function(){
		var dlgImg=window.dlgImg
		if(!dlgImg){
				var divFrame=ce("div",document.body,null,"background:#fff;z-index:99;position:absolute;\
             border:2px solid #000;top:0;left:0;*width:100px;min-width:100px");
				var divTitle=ce("div",divFrame,null,"background:#559;color:#fff;width:100%",{innerHTML:'ͼƬѡ��'});
				var dlgImg=new Dialog(divFrame,divTitle);
				window.dlgImg=dlgImg;
		}
		panel=ce("div",divFrame)
		var sUrl=this.getAttribute("picUrl")
		if(!sUrl)throw new Error("PicList:url is empty!");
		var ajax=new Ajax(sUrl,{onSuccess:function(r){
				panel.innerHTML=r.responseText
				window.dlgImg.moveToCenter()
				divFrame.style.width=divFrame.offsetWidth+"px"; //hack IE title width
		}})
		dlgImg.show({center:1,cover:1});
}
//---PowerTable---
ExtControls.PowerTable=function(el){
		this.el=el
		this.init()
}
ExtControls.PowerTable.prototype.init=function(){
		var el=this.el;
		var self=this;
		var focLine=null
		new Array().fillArray($(el).find("tbody>tr")).each(function(tr,i){
				tr.style.cursor="pointer"
				tr.oldBgColor=tr.style.background
				tr.onclick=function(){
						if(focLine)focLine.style.background=focLine.oldBgColor;
						this.style.background="#faa"
						focLine=this
				}
		})
}
function myctrl(b){
  this.box=b;
  this.create();
}
myctrl.prototype.create=function(){
  this.ctrl=this.box.getAttribute("type");
  if(!this.ctrl){ //flat���ֿؼ�
    return;
  }
  //��ʼ
  if(this["init_"+this.ctrl]){
    this["init_"+this.ctrl]();
  }else{
		return
	}
  this.box.ctrl=this.ctrl;
}
myctrl.prototype.init_label=function(){
  this.ctrl=document.createElement("span");
  this.box.parentNode.insertBefore(this.ctrl,this.box) 
  this.ctrl.value=this.box.value;
  this.ctrl.style.width=this.box.getAttribute("width");
  this.ctrl.id=this.box.getAttribute("ctrlid");
}
myctrl.prototype.init_radios=function(){
  this.ctrl=document.createElement("span");
  this.ctrl.value="";
  this.box.parentNode.insertBefore(this.ctrl,this.box) 
  var self=this;
  var items;
  eval("items="+this.box.getAttribute("items"));
  for(var obj in items){
    var radio=document.createElement("<input type=radio name="+this.ctrl+" value="+items[obj]+">");
    radio.type="radio";
    radio.onclick=function(){
      self.ctrl.value=this.value;
    }
    var txt=document.createElement("span");
    txt.innerHTML=obj;
    this.ctrl.appendChild(txt);
    this.ctrl.appendChild(radio);
    if(this.box.value==items[obj]){
      radio.checked=true;
    }
  }
	this.ctrl.parentNode.removeChild(this.box)
}
myctrl.prototype.init_checks=function(){
  this.ctrl=document.createElement("div");
  this.box.parentNode.insertBefore(this.ctrl,this.box) 
  var items;
  eval("items="+this.box.getAttribute("items"));
  for(var obj in items){
    var chk=document.createElement("input");
    chk.type="checkbox";
    var txt=document.createElement("span")
    txt.innerHTML=obj;
    this.ctrl.appendChild(txt);
    this.ctrl.appendChild(chk);
    chk.name=this.ctrl;
    chk.value=items[obj];
    if(this.box.value){
    if(this.box.value.indexOf(items[obj])>-1){
      chk.checked=true;
    }}
  }
	this.ctrl.parentNode.removeChild(this.box)
}
myctrl.prototype.init_input=function(){
  var type=this.box.getAttribute("type");
  this.ctrl=document.createElement(this.ctrl);
  this.ctrl.name=this.ctrl;
  try{
    if(type)this.ctrl.type=type;
  }catch(e){
    alert(e.description)
  }
  this.box.parentNode.insertBefore(this.ctrl,this.box) 
  this.ctrl.value=this.box.value;
  this.ctrl.style.width=this.box.getAttribute("width");
  this.ctrl.id=this.box.getAttribute("ctrlid");
	var self=this;
	this.ctrl.onkeyup=function(e){
		var evt=window.event||e;
		if(self.onkeyup)self.onkeyup(evt);
  }
	this.ctrl.parentNode.removeChild(this.box)
}
myctrl.prototype.init_textarea=function(){
  this.ctrl=document.createElement(this.ctrl);
  this.ctrl.name=this.ctrl;
  this.box.parentNode.insertBefore(this.ctrl,this.box) 
  this.ctrl.value=this.box.value;
  this.ctrl.style.width=this.box.getAttribute("width");
  this.ctrl.style.height=this.box.getAttribute("height");
	this.ctrl.parentNode.removeChild(this.box)
}
myctrl.prototype.init_select=function(){
  this.ctrl=document.createElement(this.ctrl);
  this.ctrl.name=this.ctrl;
  this.box.parentNode.insertBefore(this.ctrl,this.box) 	
  var options;
  eval("options="+this.box.getAttribute("options"));
  for(var obj in options){
    var option=document.createElement("option");
    option.innerHTML=obj;
    option.value=options[obj];
    if(option.value==this.box.value){
      option.selected=true;
    }
    this.ctrl.appendChild(option);
  }
	this.ctrl.parentNode.removeChild(this.box)
}
myctrl.prototype.applyStyle=function(elem,s){
	try{
		for(var stylename in s){
			elem.style[stylename]=s[stylename];
		}
	}catch(e){
		alert("Error in myctrl.applyStyle: "+[elem.tagname,s[stylename]])
	}
}
myctrl.prototype.css=function(el,sCss){
	sCss=sCss.toLowerCase()
	sCss=sCss.replace(/\r|\n/g,"") //����
	sCss=sCss.replace(/\s*\:\s*/g,":"); //ð�����ߵĿո�
	sCss=sCss.replace(/\s*\;\s*/g,";"); //�ֺ����ߵĿո�
	sCss=sCss.replace(/;{2,}/g,";"); //ȥ���ظ��ķֺ�
	sCss=sCss.replace(/(^;)|(;$)/,"") //ȥ��β�ķֺ�
	var ar=sCss.split(";")
	for(var i=0,s=ar[0];i<ar.length;s=ar[++i]){
		if(arMatch=/^([a-z\-]+)\:(.+)$/.exec(s)){
			//trace([arMatch[1],"  ",arMatch[2]])
			arMatch[1]=arMatch[1].replace(/-([a-zA-Z])/g,function(a,b){ //foo-bar��ʽ���fooBar��ʽ
				return b.toUpperCase()}
			)
			el.style[arMatch[1]]=arMatch[2]
		}
	}
}
///////////////////////////////////////////////////////////////////
// exselect �ǽ��ı��������Զ���������б�, �ص��ǿ�ѡҲ������
//////////////////////////////////////////////////////////////////
myctrl.prototype.init_exselect=function(){
	var self=this;
	var isIe=window.getBrowserType()=="ie"
	//��ǰ�ı�����,Ҫ���ɵȿ��б�
  var width=parseInt(this.box.offsetWidth);
	if(isNaN(width)||width<100)width=100
	width=width-2
	//����(���߿�), ��һ��span,��Ϊ���ɵĿؼ�ӦΪ inline ����
  var artbox=document.createElement("div");
	this.css(artbox,"height:18px;background:#fff;line-height:18px;text-align:left;\
		vertical-align:top;display:inline;zoom:1;width:{$0}px;\
		padding:0px;border:1px solid #aaa;white-space:nowrap".fill(width)
	)
	if(!isIe){
		this.css(artbox,"display:inline-block")
	}
	//�����ĵ�
	this.box.parentNode.insertBefore(artbox,this.box) 
	var ctrlValue=this.box.value
	//��¡ԭ�ı���(�ޱ߿�), �ŵ�������
  var elInput=this.box.cloneNode(true);
  elInput.type="text";
	elInput.name=""
	artbox.appendChild(elInput);
	this.css(elInput,"width:{$0}px;height:15px;border:0;background:#fff;\
	vertical-align:top;margin:0px".fill(width-21))
	if(!isIe){
		this.css(elInput,"width:{$0}px".fill(width-18))
	}
  //~ //���������ť
  var btn=document.createElement("div");
	artbox.appendChild(btn);
	this.css(btn,	"display:block;margin-top:1px;padding-top:5px;position:absolute;border:0px solid #fff;\
	background:#fff;width:18px;text-align:center;height:12px;vertical-align:middle")
	if(!isIe){
		this.css(btn,"margin-left:{$0}px;margin-top:-19px;padding-top:6px".fill(width-19))
	}
	btn.onclick=function(){//��ֹ�����ťʱ�ύ�� (firefox)
		return false; 
	}	
	//~ //�����б�
	var divDroplist=document.createElement(isIe?"div":"select")
	artbox.appendChild(divDroplist); 
  this.css(divDroplist,"position:absolute;background-color:#eee;z-index:100;display:none;\
    width:{$0}px;margin-top:0px;margin-left:-1px;border:1px solid #000".fill(width-2));
	this.css(divDroplist,"margin-left:{$0}px;margin-top:20px".fill(-width+18))
	//�½�һ��hidden
	var elHide=document.createElement("input")
	elHide.type="hidden"
	elHide.name=this.box.name
	elHide.value=elInput.value
	//�ı��������¼�
	var _disabled=this.box.getAttribute("locked")?true:false;
	elInput.onkeydown=function(e){
		var evt=window.event||e;
		evt.returnValue=!_disabled;
	}
  elInput.onkeyup=function(e){
		var evt=window.event||e;
		if(!_disabled){
			elHide.value=this.value;
		}
		if(self.onkeyup)self.onkeyup(evt);
  }
  elInput.onchange=function(){
    elHide.value=this.value;
  }
	//��Ϊֻ��
  var sLocked=this.box.getAttribute("locked")
	var bLocked=sLocked&&sLocked.toLowerCase()=="true"
  if(bLocked){
    this.applyStyle(elInput,{background:"#eee",cursor:"default"});
    if(!this.box.value)options[0].onmousedown();
  }
	//~ //������ť�е��¼�ͷ
  btn.innerHTML="\
		<div style='margin:auto;font-size:0px;width:6px;height:2px;background:#00c'></div>\
		<div style='margin:auto;font-size:0px;width:4px;height:2px;background:#00c'></div>\
		<div style='margin:auto;font-size:0px;width:2px;height:2px;background:#00c'></div>";
	//��Ӳ˵�������˵�
  var hsOpts=eval("("+this.box.getAttribute("options")+")");
  var bValueAsText=this.box.getAttribute("valueastext")=="true";
  for(var k in hsOpts){
		//ÿ��ѡ����һ��div
    var opt=document.createElement(isIe?"div":"option");
    opt.innerHTML=bValueAsText?k:hsOpts[k];
    opt.value=k;
    this.css(opt,"cursor:default;width:100%;background:#eee;padding-Left:2px;text-Align:left");
    //ÿ��ѡ����¼�
    opt.onmouseover=function(){
			divDroplist.selectedIndex=this.index
      this.style.background="#999"
    }
    opt.onmouseout=function(){
      this.style.background="transparent"
    }
    opt.onmousedown=function(){
      elInput.value=this.innerHTML;
			elHide.value=this.value;
      this.parentNode.style.display="none";
			btn.style.background="#fff"
			window.showSelects(true)
    }
    divDroplist.appendChild(opt);
		if(ctrlValue==k){
			opt.onmousedown()
		}
		if(!isIe)divDroplist.size++;
  }
	//~ //����ɲ��ֵ��¼�
  btn.onmousedown=function(){
    var curr=divDroplist.style.display;
    var disp=(curr=="")?"none":"";
		window.showSelects(false)
		divDroplist.style.display=disp;
		if(isIe){
			if(disp=="")divDroplist.focus()
		}else{
			this.onmouseout=function(){
				divDroplist.focus()
			}
		}
  }
	//����ɲ��ֵ��¼�
  btn.onmouseup=function(){
		//(isIe?artbox:divDroplist).focus()
  }
  window.addEventHandler(divDroplist,"blur",function(){ //���ⲿ���
    btn.style.background="#fff"
    divDroplist.style.display="none";
		window.showSelects(true)
  })
  divDroplist.onblur=function(){ //���ⲿ���
    btn.style.background="#fff"
    divDroplist.style.display="none";
		window.showSelects(true)
  }
	elInput.onkeydown=function(d){ //����ֻ��
		var evt=window.event||e;
		evt.returnValue=!bLocked;
	}
	//����������
	artbox.appendChild(elHide);
	//�Ƴ�ԭ�ı���
	this.box.parentNode.removeChild(this.box)
}

