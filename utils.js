function findValidParent(startdom, datasetItemName){
	var dom = startdom;
	while(dom.dataset[datasetItemName] == undefined){
		dom = dom.parentElement;
		if(dom == document.body)
			return null;
	}
	return dom;
}
