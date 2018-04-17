openingPopups = new Set();
function popupOpenHandler(evt){
	let clicked = findValidParent(evt.target, 'popupTarget');
	if(!clicked)
		return;
	let target = document.querySelector(clicked.dataset.popupTarget);
	target.classList.add('show');
	openingPopups.add(target);
}
function popupCloseHandler(evt){
	let clicked = findValidParent(evt.target, 'popupCloseTarget');
	if(!clicked)
		return;
	let target = document.querySelector(clicked.dataset.popupCloseTarget);
	target.classList.remove('show');
	openingPopups.delete(target);
}
function popupBlurHandler(evt){
	openingPopups.forEach((dom)=>{
		if(!dom.contains(evt.target)){
			dom.classList.remove('show');
			openingPopups.delete(dom);
		}
	});
}
window.addEventListener('click', popupOpenHandler);
window.addEventListener('touchstart', popupBlurHandler);
window.addEventListener('mousedown', popupBlurHandler);
