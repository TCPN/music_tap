
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

var SPNNoteList = ['C',['C#','Db'],'D',['D#','Eb'],'E',
	'F',['F#','Gb'],'G',['G#','Ab'],'A',['A#','Bb'],'B'];
function pitchName(pitch, nameSystem, takeFlat){
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
	this.displayParam = i_displayParam || {};
	this.toString = function(){
		var duraStr = "";
		var totalTinyBeats = Math.round(this.duration * 48); // 48 is so far the smallest measure division
		//console.log(totalTinyBeats);
		var duraBaseBeat = gcd(48, totalTinyBeats);
		
		duraStr = Math.round(totalTinyBeats/duraBaseBeat) + "/" + Math.round(48/duraBaseBeat);
		if(this.displayParam.nameSystem == undefined)
			return this.pitch + ":" + duraStr;
		else{
			var pn = pitchName(this.pitch, this.displayParam.nameSystem, this.displayParam.takeFlat);
			if(this.displayParam.nameSystem == 'ABC'){
				var du = durationDisplay(totalTinyBeats, 12, 'ABC'); // assume for 4 beats / Msr
				return du.prefix + pn + du.postfix + (this.tieToNext ? '-' : '');
			}
			else if(this.displayParam.nameSystem == 'SPN'){
				return pn + ":" + duraStr + (this.tieToNext ? '-' : '');
			}
		}
	}
}

var modeDOM = document.getElementById('connectNote');
function switchInputMode(){
	var modes = ['add','cont','tie'];
	modeDOM.dataset.mode = modes[(modes.indexOf(modeDOM.dataset.mode) + 1) % modes.length];
	cont = modeDOM.dataset.mode == 'cont';
	tie = modeDOM.dataset.mode == 'tie';
}

var notes = [];
var cont = false, tie = false; // maybe just check the data-mode of modeDOM
var noteTriggered = false, triggerTouch = {};
var screen = document.getElementById('resultScreen');
var pressingKeys = new Map();
var pressingLengthButton = new Map();
var pressingOthers = new Map();

function handleAllTouch(event){
	//screen.textContent = 'Hello Music!';
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
				
				var samePitchWithPrev = (notes.length > 0 && (notes[notes.length-1].pitch == pitch));
				if(samePitchWithPrev && cont && !tie){ // tie is more prior than cont
					notes[notes.length-1].duration += dura;
				}else{
					if(samePitchWithPrev && tie)
					{
						notes[notes.length-1].tieToNext = true;
						tie = false;
					}
					var newNote = new Note(pitch, dura, {nameSystem: 'ABC'});
					notes.push(newNote);
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
	screen.innerText =
		"Key: " + Array.from(pressingKeys.values()).map((v)=>v.dataset.value) + "\n" +
		"Duration: " + Array.from(pressingLengthButton.values()).map((v)=>v.dataset.value) + "\n" + 		
		"Notes: " + notes.join(' ');
		// "Key: " + pressingKeys.map((v)=>v.dataset.value) + "\n" +
		// "Duration: " + pressingLengthButton.map((v)=>v.dataset.length);
	modeDOM.dataset.mode = (tie ? 'tie' : (cont ? 'cont' : 'add'));
}

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
		
		//keyDOMs[i].style.top = KBDOM.offsetTop;
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
		keyDOMs[i].dataset.pitchname = pitchName(keyPitch[i], keyboardPitchNameSystem);
		keyDOMs[i].firstElementChild.textContent = keyPitch[i];
	}
}

function keyboardChange(leftShift,rightShift){
	if(leftShift < 0 && KBLeftPitch == KBLeftBound)
		return;
	if(rightShift > 0 && KBRightPitch == KBRightBound)
		return;
	KBLeftPitch += leftShift;
	KBRightPitch += rightShift;
	
	drawKeyboard();
}

drawKeyboard();
window.addEventListener('touchstart', handleAllTouch);
window.addEventListener('touchend', handleAllTouch);
window.addEventListener('touchcancel', handleAllTouch);

/* this will make the address bar autoly hide.*/
window.addEventListener("load",function() {  
  setTimeout(function(){
  window.scrollTo(0, 1); }, 10);
});