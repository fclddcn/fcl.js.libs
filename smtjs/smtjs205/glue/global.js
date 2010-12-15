function printf(){
		var ar=new Array().fillArray(arguments);
		var s=ar.shift();
		try{
				if(!s.fill)s=s.toString();
		}catch(e){
				return;
		}
		print(s.fill.apply(s,ar));
}
function echo(){
		print(new Array().fillArray(arguments).join(""),"\n");
}
function echoc(){
		print(new Array().fillArray(arguments).join(","),"\n");
}
function echot(){
		print(new Array().fillArray(arguments).join("\t"),"\n");
}
