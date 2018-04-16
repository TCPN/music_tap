
function popupHandler(evt){
	let clicked = findValidParent(evt.target, 'popupTarget');
	if(!clicked)
		return;
	let target = document.querySelector(clicked.dataset.popupTarget);
	target.classList.add('show');
}

window.addEventListener('click', popupHandler);
