function createElement(str) {
    // tag
    var matched = str.match(/^[-_0-9a-zA-Z]*/);
    var tag = (matched && matched[0]) || 'div';
    str = str.substr(matched && matched[0].length);

    // id
    var matched = str.match(/^#[-_0-9a-zA-Z]+/);
    var id = (matched && matched[0].substr(1)) || null;
    str = str.substr(matched && matched[0].length);

    // class
    var classes = [];
    do {
        matched = str.match(/^\.[-_0-9a-zA-Z]+/);
        if(matched)
            classes.push(matched && matched[0].substr(1));
        str = str.substr(matched && matched[0].length);
    } while(matched);

    // attr
    var attr = [];
    do {
        matched = str.match(/^\[[-_0-9a-zA-Z]+(\=([^\]])+)?\]/);
        if(matched) {
            var attr_str = matched && matched[0].substr(1, matched[0].length - 2);
            var attr_parts = attr_str.split('=');
            var attr_name = attr_parts.shift();
            attr.push([attr_name, attr_parts.join('=')]);
        }
        str = str.substr(matched && matched[0].length);
    } while(matched);
    //console.log({tag, id, classes, attr});

    var elem = document.createElement(tag);
    if(id != null)
        elem.id = id;
    elem.className = classes.join(' ');
    for(let [k, v] of attr) {
        elem.setAttribute(k, v);
    }
    return elem;
}

function html(str){
    var tmp = document.createElement('div');
    tmp.innerHTML = str;
    return tmp.firstChild;
}

function displayAsPopup(popup_dom, options){
    options = options || {};
    var popup_set = createElement('.popup-set');
    var popup_anchor = createElement('.popup-anchor');
    var popup_obj = options.popupType == 'window' ? createElement('.popup-window') : createElement('.popup-widge');
    if(options.anchorAlign && options.anchorAlign.match(/top|bottom|left|right|up|down/g))
        options.anchorAlign.match(/top|bottom|left|right|up|down/g).forEach((v)=>popup_anchor.classList.add('align-'+v));
    if(options.anchorX)
        popup_anchor.style.left = options.anchorX;
    if(options.anchorY)
        popup_anchor.style.top = options.anchorY;
    popup_obj.append(popup_dom);
    popup_anchor.append(popup_obj);
    popup_set.append(popup_anchor);
    document.body.append(popup_set);
    popup_set.setAttribute('onclick', 'this.remove();event.preventDefault();');
    return popup_set;
}

function displayTargetPopup(target, options, event) {
    options = options || target.dataset || {};
    if(options.popup)
        var popup_dom = options.popup;
    else if(target.dataset.popupCode)
        var popup_dom = eval(target.dataset.popupCode);
    else if(target.dataset.popup)
        var popup_dom = document.querySelector(target.dataset.popup);
    else
        var popup_dom = target;
    if(options.anchorPosition == 'this'){
        var target_rect = target.getClientRects()[0];
        options.anchorX = (target_rect.left + target_rect.right) / 2 / document.body.offsetWidth * 100 + '%';
        options.anchorY = (target_rect.top + target_rect.bottom) / 2 / document.body.offsetHeight * 100 + '%';
    }
    displayAsPopup(popup_dom, options);
}
