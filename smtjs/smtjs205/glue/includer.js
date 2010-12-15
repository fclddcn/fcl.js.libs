function extend(dest,file){
		var script=include(file);
		for(k in dest){
				if(dest[k]===undefined)script[k]=dest[k];
		}
		for(k in script){
				dest[k]=script[k];
		}
}


function home(){
		return __script__.parent.filename.replace(/[^\\\/]+$/,'/');
}
function libhome(){
		return __script__.filename.replace(/glue[\\\/]+[^\\\/]+$/i,'');
}
