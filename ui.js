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
        matched = str.match(/^\[[-_0-9a-zA-Z]+(\=[-_0-9a-zA-Z]+)?\]/);
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

function displayPopup(popup_dom, options){
    var popup_set = createElement('.popup-set');
    var popup_anchor = createElement('.popup-anchor');
    var popup_window = createElement('.popup-window');
    popup_window.append(popup_dom);
    popup_anchor.append(popup_window);
    popup_set.append(popup_anchor);
    document.body.append(popup_set);
    popup_set.setAttribute('onclick', 'this.remove();event.preventDefault();');
    return popup_set;
}