function findValidParent(startdom, datasetItemName){
	var dom = startdom;
	while(dom && dom.dataset[datasetItemName] == undefined){
		dom = dom.parentElement;
		if(dom == document.body)
			return null;
	}
	return dom;
}

function range(a, b) {
    if(b==null)
        return new Array(a).fill(0).map((v,i)=>i);
    else
        return new Array((b-a>0)?b-a:0).fill(0).map((v,i)=>(i+a));
}
