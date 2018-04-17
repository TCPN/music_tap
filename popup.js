openingPopups = [];
function popupHandler(evt){
	let clicked = findValidParent(evt.target, 'popupTarget');
	if(!clicked)
		return;
	let target = document.querySelector(clicked.dataset.popupTarget);
	target.classList.add('show');
	openingPopups.push(target);
}
function popupBlurHandler(evt){
	openingPopups = openingPopups.filter((dom)=>{
		if(!dom.contains(evt.target)){
			dom.classList.remove('show');
			return false;
		}
		return true;
	});
}
window.addEventListener('click', popupHandler);
window.addEventListener('touchstart', popupBlurHandler);
window.addEventListener('mousedown', popupBlurHandler);
