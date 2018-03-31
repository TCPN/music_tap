﻿
function clearAllPressedStyle(){
	// a tool for debug clean
	var prs = Array.from(document.getElementsByClassName('pressed'));
	prs.forEach((d)=>d.classList.remove('pressed'));
}

function gcd(a,b){
	a = Math.round(a);
	b = Math.round(b);
	if(b == 0)
		return a;
	return gcd(b, a % b);
}
Math.gcd=gcd;

var validClass = [''];
function findValidParent(dom){
	var checkingDOM = dom;
	while(checkingDOM.dataset.touch == undefined){
		checkingDOM = checkingDOM.parentElement;
		if(checkingDOM == document.body)
			return null;
	}
	return checkingDOM;
}

function setUpForClickingToggle(dom, datasetItem, values, callback){
	if(typeof dom == 'string')
		dom = document.getElementById(dom);
	if(!dom)
		return;
	dom.addEventListener('click', function(event){
		dom.dataset[datasetItem] = values[(values.indexOf(dom.dataset[datasetItem]) + 1) % values.length];
		event.cancelBubble = true;
		if(callback != null)
			callback(event);
	}, false);
}

var majorMinorLabelDOM = document.getElementById('majorMinorLabel');
var timeSignatureDOM = document.getElementById('timeSignature');
var timeSignatureLabelDOM = document.getElementById('timeSignatureLabel');
var beatPerMeasureDOM = document.getElementById('beatPerMeasure');
var beatUnitDOM = document.getElementById('beatUnit');
var tonalityNameDOM = document.getElementById('tonalityName');
setUpForClickingToggle(timeSignatureDOM, 'type', ['number', 'common', 'half'], refreshNotesAndMeasures);	
setUpForClickingToggle(beatPerMeasureDOM, 'value', ['2','3','4','6','8','9','12'], refreshNotesAndMeasures);
setUpForClickingToggle(beatUnitDOM, 'value', ['2','4','8'], refreshNotesAndMeasures);
setUpForClickingToggle(majorMinorLabelDOM, 'value', ['major', 'minor'], ()=>{});
setUpForClickingToggle(tonalityNameDOM, 'value', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', ], refreshNotesAndMeasures);
//timeSignatureLabelDOM.onclick = function(){timeSignatureDOM.click();};

function currentBeatsPerMeasure(){
	switch(timeSignatureDOM.dataset.type){
		case 'number':
			return parseInt(beatPerMeasureDOM.dataset.value);
		case 'half':
			return 2;
		case 'common':
		default:
			return 4;
	}
}

var SPNNoteList = ['C',['C#','Db'],'D',['D#','Eb'],'E',
	'F',['F#','Gb'],'G',['G#','Ab'],'A',['A#','Bb'],'B'];

//                         1  2  3  4  5  6  7
var majorScaleSemitones = [0, 2, 4, 5, 7, 9, 11];
var ABCScalePitchName = majorScaleSemitones.map((v)=>(SPNNoteList[v]));
var tonalities = {};
for(t = -6; t <= 5; t ++){
	let tonality = tonalities[t] = {};
	let tonalStep = 7;
	let tonicToC = (t * tonalStep + 60) % 12;
	tonality.name = (t <= -2 ? SPNNoteList[tonicToC][1] : SPNNoteList[tonicToC]);
	tonality.signature = t;
	tonality.pitchToCSemi = majorScaleSemitones.map((s)=>((s + tonicToC) % 12));
	
	tonality.pitchName = tonality.pitchToCSemi.map((s)=>{
		if(majorScaleSemitones.indexOf(s) < 0)
			return (t < 0 ? SPNNoteList[s][1] : SPNNoteList[s][0]);
		else
			return SPNNoteList[s];
	});
	tonality.pitchABCName = tonality.pitchName.map((s)=>(s[0]));
}

function pitchName(pitch, nameSystem, tonallity, takeFlat){
	// scientific pitch notation: SPN
	if(pitch == 0)
	{
		if(nameSystem == 'ABC')
			return 'z';
		else
			return '0';
	}
	var note = pitch % 12;
	var octave = (pitch - note) / 12 - 1;
	
	var noteNameSet = SPNNoteList[note];
	var SPNNoteName = noteNameSet[takeFlat?(noteNameSet.length-1):0];
	
	if(nameSystem == 'SPN')// scientific pitch notation: SPN
		return SPNNoteName + octave;
	
	var ABCOctavePostFix = '';
	if(octave < 4)
		ABCOctavePostFix = ",".repeat(4-octave);
	else if(octave > 5)
		ABCOctavePostFix = "'".repeat(octave-5);
	
	var ABCNote = SPNNoteName.replace(/(\w)#/,'^$1').replace(/(\w)b/,'_$1');
	if(nameSystem == 'ABC')
		return (octave >= 5 ? ABCNote.toLowerCase() : ABCNote) + ABCOctavePostFix;
}

function durationDisplay(durationBeats, unitDuraBeats, nameSystem){
	// ABC Notation
	// Both duration and unitDura are in beats of Msr/48.
	var wholeUnits = Math.floor(durationBeats / unitDuraBeats);
	var remains = durationBeats - wholeUnits * unitDuraBeats;
	var minUnitBeats = gcd(remains, unitDuraBeats);
	var unitShrinkRatio = Math.round(unitDuraBeats / minUnitBeats);
	
	var triplet = false;
	if(unitShrinkRatio % 3 == 0) // need triplet
	{
		triplet = true;
		unitDuraBeats = unitDuraBeats * 2 / 3;
		minUnitBeats = gcd(durationBeats, unitDuraBeats);
		unitShrinkRatio = Math.round(unitDuraBeats / minUnitBeats);
	}
	
	var inMinUnit = Math.floor(durationBeats / minUnitBeats);
	return {
		postfix: (inMinUnit==1 ? '' : inMinUnit) + "/".repeat(Math.log2(unitShrinkRatio)),
		prefix: (triplet ? '(3:2:1' : ''),
	};
}

function Note(i_pitch, i_duration, i_displayParam, i_tieToNext){
	// duration: how long relative to a measure
	// pitch: a number, in MIDI pitch (69 = 440Hz)
	this.pitch = i_pitch || 0;
	this.duration = i_duration || 0;
	this.tieToNext = i_tieToNext || false;
	
	this.setPitch = function(value){
		this.pitch = value;
		this.refreshDOM();
	};
	this.setDuration = function(value){
		this.duration = value;
		this.refreshDOM();
	};
	this.setTieToNext = function(value){
		this.tieToNext = value;
		this.refreshDOM();
	};
	
	// handle the measure display
	// this.startTime = 0;
	
	this.displayParam = i_displayParam || {};
	this.toString = function(){
		var durationInMeasure = "";
		var totalTinyBeats = Math.round(this.duration * 48); // 48 is so far the smallest measure division
		//console.log(totalTinyBeats);
		var duraBaseBeat = gcd(48, totalTinyBeats);
		
		// partition the totalTinyBeats into those it should be shown as
		var notePartitions = [];
		if(this.startTime != undefined && this.startTime >= 0){
			var fromStartTimeToNextMeasure = Math.floor(this.startTime + 1) - this.startTime;
			var MaxTinyBeatsInNextPartition = Math.round(fromStartTimeToNextMeasure * 48);
			var remainTinyBeats = totalTinyBeats;
			while(remainTinyBeats > 0){
				var thisPartition = Math.min(remainTinyBeats, MaxTinyBeatsInNextPartition);
				notePartitions.push({
					tinyBeats: thisPartition,
					reachMeasureEnd: (thisPartition == MaxTinyBeatsInNextPartition),
				});
				remainTinyBeats -= thisPartition;
				MaxTinyBeatsInNextPartition = 48;
			}
		}else{
			notePartitions = [{
				tinyBeats: totalTinyBeats,
				reachMeasureEnd: false,
			}];
		}
		
		durationInMeasure = Math.round(totalTinyBeats/duraBaseBeat) + "/" + Math.round(48/duraBaseBeat);
		
		if(this.displayParam.nameSystem == undefined)
			return this.pitch + ":" + durationInMeasure;
		else{
			var pn = pitchName(this.pitch, this.displayParam.nameSystem, this.displayParam.tonality, this.displayParam.takeFlat);
			if(this.displayParam.nameSystem == 'ABC'){
				var bpms = currentBeatsPerMeasure();
				var noteStrings = notePartitions
					.map((v,i)=>{
						var du = durationDisplay(v.tinyBeats, 48 / bpms, 'ABC');
						return du.prefix + pn + du.postfix 
						+ (i < notePartitions.length-1 ? '-' : '')
						+ (v.reachMeasureEnd ? '|' : '');
					});
				//var du = durationDisplay(totalTinyBeats, 48 / currentBeatsPerMeasure(), 'ABC');
				return noteStrings.join('') + (this.tieToNext ? '-' : '') + '';
			}
			else if(this.displayParam.nameSystem == 'SPN'){
				return pn + ":" + durationInMeasure + (this.tieToNext ? '-' : '');
			}
		}
	}
	
	var domobj = document.createElement("span");
	domobj.className = "note";
	this.refreshDOM = function(){
		domobj.innerText = this.toString();
	};
	this.getDOM = function(){
		this.refreshDOM();
		return domobj;
	};
}

var modeDOM = document.getElementById('connectNote');
function switchInputMode(){
	var modes = ['add','cont','tie'];
	modeDOM.dataset.mode = modes[(modes.indexOf(modeDOM.dataset.mode) + 1) % modes.length];
	cont = modeDOM.dataset.mode == 'cont';
	tie = modeDOM.dataset.mode == 'tie';
}

/* instantiate cursor DOM object */
var editCurserPosition = 0;

var cursorDOM = document.createElement("div");
cursorDOM.className = "edit-cursor";
cursorDOM.appendChild(document.createElement("div"));

function refreshCursorPosition(){
	if(editCurserPosition < 0)
	{
		editCurserPosition = notes.length + editCurserPosition + 1;
		if(editCurserPosition < 0){
			editCurserPosition = 0;
		}
	}else if(editCurserPosition > notes.length){
		editCurserPosition = notes.length
	}
	ABCScreen.insertBefore(
		cursorDOM, 
		notes[editCurserPosition] && notes[editCurserPosition].getDOM());
	cursorDOM.scrollIntoView();	
}

function moveCursor(shift, position){
	if(position != undefined)
		editCurserPosition = position;
	else
		editCurserPosition += shift;
	refreshCursorPosition();
}

function addNoteBeforeCursor(noteObj){
	/* noteObj should be an built Note Object (not DOM) */
	/* editCurserPosition should be 0 ~ nodes.length */
	notes = notes.slice(0, editCurserPosition)
		.concat(noteObj)
		.concat(notes.slice(editCurserPosition, notes.length));
	ABCScreen.insertBefore(noteObj.getDOM(), cursorDOM);
	editCurserPosition ++;
}

function deleteNoteBeforeCursor(){
	/* editCurserPosition should be 0 ~ nodes.length */
	if(editCurserPosition <= 0)
		return;
	/* toDelete should be an built Note Object (not DOM) */
	var toDelete = notes.splice(editCurserPosition - 1, 1);
	toDelete.forEach((v)=>v.getDOM().remove());
	editCurserPosition --;
	refreshNotesAndMeasures();
}
/* instantiate cursor DOM object: End */

var notes = [];
var cont = false, tie = false; // maybe just check the data-mode of modeDOM
var noteTriggered = false, triggerTouch = {};
var messageScreen = document.getElementById('instantMessage');
var ABCScreen = document.getElementById('ABCNote');
var pressingKeys = new Map();
var pressingLengthButton = new Map();
var pressingOthers = new Map();

function handleAllTouch(event){
	//messageScreen.textContent = 'Hello Music!';
	console.log(event.type);
	console.log(event.touches[0]);
	console.log(event.changedTouches[0]);
	var touches = event.touches;
	var changedTouches = event.changedTouches;
	// TODO: need to clean those undetected touchend when debugging
	
	for(var i = 0; i < changedTouches.length; i ++){
		var touchedDOM = findValidParent(changedTouches[i].target);
		var touchIDNum = changedTouches[i].identifier;
		var handleingMap = null;
		
		if(touchedDOM == null)
			continue;
		if(touchedDOM.dataset.name == 'rest' || touchedDOM.dataset.name == 'pitch' ){
			handleingMap = pressingKeys;
		}
		else if(touchedDOM.dataset.name == 'length'){
			handleingMap = pressingLengthButton;
		}
		else{
			handleingMap = pressingOthers;
		}
		
		if(handleingMap == null)
			continue;
		if(event.type == 'touchstart')
		{
			handleingMap.set(touchIDNum, touchedDOM);
			touchedDOM.className += ' pressed';
			
			//check if a note is triggered
			if(!noteTriggered && pressingKeys.size > 0 && pressingLengthButton.size > 0)
			{
				var pitchTouch = pressingKeys.keys().next().value;
				var pitchDOM = pressingKeys.values().next().value;
				var duraTouch = pressingLengthButton.keys().next().value;
				var duraDOM = pressingLengthButton.values().next().value;
				var pitch = parseInt(pitchDOM.dataset.value);
				var dura = (1 / parseInt(duraDOM.dataset.value));
				
				//var samePitchWithPrev = (notes.length > 0 && (notes[notes.length-1].pitch == pitch));
				var actingOnIndex = editCurserPosition - 1;
				var samePitchWithPrev = (0 <= actingOnIndex && actingOnIndex < notes.length 
					&& (notes[actingOnIndex].pitch == pitch));
				if(samePitchWithPrev && cont && !tie){ // tie is more prior than cont
					//notes[notes.length-1].duration += dura;
					notes[actingOnIndex].setDuration(dura + notes[actingOnIndex].duration);
				}else{
					if(samePitchWithPrev && tie)
					{
						//notes[notes.length-1].tieToNext = true;
						notes[actingOnIndex].setTieToNext(true);
						tie = false;
					}
					var newNote = new Note(pitch, dura, {nameSystem: 'ABC', tonality: 0, takeFlat: false});
					addNoteBeforeCursor(newNote);
					//notes.push(newNote);
				}
				
				noteTriggered = true;
				triggerTouch = {'pitch': pitchTouch, 'duration': duraTouch};
				
				cont = true;
			}
		}
		else if(event.type == 'touchend' || event.type == 'touchcancel')
		{
			var leaveDOM = handleingMap.get(touchIDNum);
			leaveDOM.className = leaveDOM.className.replace(/ pressed\b/,'');
			handleingMap.delete(touchIDNum);
			var isPitchTrigger = (touchIDNum == triggerTouch.pitch);
			var isDuraTrigger = (touchIDNum == triggerTouch.duration);
			
			if(isPitchTrigger)
			{
				cont = false;
				console.log('note end');
			}
			
			if(noteTriggered && (isPitchTrigger || isDuraTrigger))
			{
				noteTriggered = false;
			}
			
			if(isPitchTrigger)
				delete triggerTouch.pitch;
			if(isDuraTrigger)
				delete triggerTouch.duration;
		}
	}
	messageScreen.innerText =
		"Key: " + Array.from(pressingKeys.values()).map((v)=>v.dataset.value) + "\n" +
		"Duration: " + Array.from(pressingLengthButton.values()).map((v)=>v.dataset.value) + "\n";
	modeDOM.dataset.mode = (tie ? 'tie' : (cont ? 'cont' : 'add'));
	
	// Edit Mode
	// if(notes.length <= 0)
		// ABCScreen.innerHTML = "";
	// else{
	if(false/*needRedrawAll*/){
		notes.forEach((v,i)=>{
			ABCScreen.appendChild(v.getDOM());
		});
	}
	refreshNotesAndMeasures();
	refreshCursorPosition();
	// }
}

function refreshNotesAndMeasures(){
	notes.forEach((v,i)=>{
		v.startTime = (i > 0 ? Math.round((notes[i-1].startTime + notes[i-1].duration)*48)/48 : 0);
		v.refreshDOM();
	});
}

/* length Pad buttons Select */

var selectLengthDOM = document.getElementById('selectLength');
var lengthPadDOM = document.getElementById('lengthPad');
var lengthDOM = document.getElementById('length');
var BtnN = 10;
lengthDOM.dataset.col = 5;
var lengthPadPreviousMode = ''; // a tmp storage

function lengthPadsSelectPressed(){
	if(lengthPadDOM.dataset.mode == 'select'){
		lengthPadDOM.dataset.mode = lengthPadPreviousMode;
		lengthDOM.style.gridTemplateColumns = 'repeat(' + (BtnN < 5 ? BtnN : Math.ceil(BtnN / 2)) + ', 1fr)';
	}else{
		lengthPadPreviousMode = lengthPadDOM.dataset.mode;
		lengthPadDOM.dataset.mode = 'select';
		lengthDOM.style.gridTemplateColumns = '';
	}
}

selectLengthDOM.onclick = lengthPadsSelectPressed;
lengthPadDOM.onclick = function (event){
	if(lengthPadDOM.dataset.mode == 'select' && event.target.dataset.name == 'length'){
		event.target.dataset.select = (event.target.dataset.select == 'false');
		BtnN += (event.target.dataset.select == 'false' ? -1 : +1);
	}
}

/* length Pad buttons Select: End */

var keyboardPadding
// 69 = 440Hz = A4
var KBLeftPitch = 53, KBRightPitch = 77;
var KBLeftBound = 21, KBRightBound = 108;
var keyNameType = "MIDInote";

// start from C
var blackKeyList = 
[false, true, false, true, false, false, true, false, true, false, true, false];
//C     C#    D      D#    E      F      F#    G      G#    A      A#    B
function isBlackKey(pitch){
	while(pitch < 0)
		pitch += 12;
	return blackKeyList[pitch % 12];
}

var keyboardPitchNameSystem = 'SPN';
var keyboardPitchNameUseFlat = false
var keyDOMs = [];
var keyTemplate = document.getElementsByClassName('keyboard-key')[0];
keyTemplate.remove();

function drawKeyboard(){
	var keyPitchNumber = KBRightPitch - KBLeftPitch + 1;
	var keyPitch = new Array(keyPitchNumber).fill(0).map((v,i)=>(i+KBLeftPitch));
	var whiteKeyNumber = keyPitch.filter((k)=>!isBlackKey(k)).length;
	
	var bkFirst = isBlackKey(keyPitch[0]);
	var bkLast = isBlackKey(keyPitch[keyPitch.length-1]);
	
	var KBDOM = document.getElementById('keyboard');
	var keyWidth = KBDOM.offsetWidth / (whiteKeyNumber + (bkFirst ? 0.5 : 0) + (bkLast ? 0.5 : 0));
	
	while(keyDOMs.length > keyPitch.length){
		keyDOMs.pop().remove();
	}
	
	var KBDOMStyle = ((KBDOM.currentStyle|| window.getComputedStyle(KBDOM)));
	var placePoint = (bkFirst ? keyWidth / 2 : 0) + parseFloat(KBDOMStyle.marginLeft);
	//var placePoint = (bkFirst ? keyWidth / 2 : 0);
	for(var i = 0; i < keyPitch.length; i ++){
		if(i >= keyDOMs.length){
			keyDOMs.push(keyTemplate.cloneNode(true));
			KBDOM.appendChild(keyDOMs[i]);
		}
		
		keyDOMs[i].style.top = KBDOM.offsetTop;
		if(isBlackKey(keyPitch[i])){
			keyDOMs[i].style.left = (placePoint - keyWidth/3 )+ "px";
			keyDOMs[i].style.width = (keyWidth * 2/3) + "px";
			keyDOMs[i].style.height = (KBDOM.offsetHeight*3/5) + "px";
			
			keyDOMs[i].classList.add('black-key');
		}else{
			keyDOMs[i].style.left = placePoint + "px";
			keyDOMs[i].style.width = keyWidth + "px";
			keyDOMs[i].style.height = KBDOM.offsetHeight + "px";
			
			keyDOMs[i].classList.remove('black-key');
			placePoint += (keyWidth * 1.0);
		}
		keyDOMs[i].dataset.value = keyPitch[i];
		keyDOMs[i].dataset.pitchname = pitchName(keyPitch[i], keyboardPitchNameSystem, keyboardPitchNameUseFlat);
		keyDOMs[i].firstElementChild.textContent = keyPitch[i];
	}
}

function keyboardChange(leftShift,rightShift,toggleUseFlat){
	if(leftShift < 0 && KBLeftPitch == KBLeftBound)
		return;
	if(rightShift > 0 && KBRightPitch == KBRightBound)
		return;
	KBLeftPitch += leftShift;
	KBRightPitch += rightShift;
	keyboardPitchNameUseFlat ^= toggleUseFlat;
	
	drawKeyboard();
}
function keyboardToggleUseFlat(){
	keyboardChange(0,0,1);
	return keyboardPitchNameUseFlat
}

function tabClick(tabset, event){
	if(typeof tabset == "string")
		tabset = document.getElementById(tabset);
	var labels = Array.from(tabset.getElementsByClassName("tab-label"));
	var contents = tabset.getElementsByClassName("tab-content");
	
	var selectedTabIndex = labels.indexOf(event != null ? event.target : null);
	if(event == "init")
		selectedTabIndex = 0;
	if(selectedTabIndex >= 0)
		labels.forEach((v,i)=>(
			contents[i].dataset.select = labels[i].dataset.select = (i==selectedTabIndex)));
}

tabClick("displayer", "init");

/* detecting user zoom in */
var windowInnerWidthRecord = window.innerWidth;
function getZoomRatio(){
	return document.body.clientWidth / window.innerWidth;
}
var zoomDetectInterval = setInterval(function(){
	if(window.innerWidth != windowInnerWidthRecord){
		console.log("Zoomed!");
		windowInnerWidthRecord = window.innerWidth;
	}
}, 100);
/* detecting user zoom in : End*/

refreshCursorPosition();

drawKeyboard();
window.addEventListener('resize', drawKeyboard);
window.addEventListener('touchstart', handleAllTouch);
window.addEventListener('touchend', handleAllTouch);
window.addEventListener('touchcancel', handleAllTouch);

/* this will make the address bar autoly hide.*/
window.addEventListener("load",function() {  
  setTimeout(function(){
  window.scrollTo(0, 1); }, 10);
});