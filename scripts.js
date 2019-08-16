/*
 * TODO:
 * 	add newline command
 * 	add ending bar
 * 	add repeat bars
 * 	move the cursor to chord positions
 * 	change the speed
 * 	add title
 */

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
// function findValidParent(dom){
	// var checkingDOM = dom;
	// while(checkingDOM.dataset.touch == undefined){
		// checkingDOM = checkingDOM.parentElement;
		// if(checkingDOM == document.body)
			// return null;
	// }
	// return checkingDOM;
// }

function setUpForClickingToggle(dom, datasetItem, values, callback){
	if(typeof dom == 'string')
		dom = document.getElementById(dom);
	if(!dom)
		return;
	dom.addEventListener('click', function(event){
		let oldValue = dom.dataset[datasetItem];
		dom.dataset[datasetItem] = values[(values.indexOf(dom.dataset[datasetItem]) + 1) % values.length];
		event.cancelBubble = true;
		if(callback != null)
			callback(event, oldValue);
	}, false);
}

var ABCTimeSigSPAN = document.getElementById('ABCTimeSig');
var ABCNoteUnitSPAN = document.getElementById('ABCNoteUnit');
var ABCToneSPAN = document.getElementById('ABCTone');
var ABCSpeedSPAN = document.getElementById('ABCSpeed');

var majorMinorLabelDOM = document.getElementById('majorMinorLabel');
var timeSignatureDOM = document.getElementById('timeSignatureBlock');
var timeSignatureLabelDOM = document.getElementById('timeSignatureLabel');
var beatPerMeasureDOM = document.getElementById('beatPerMeasure');
var beatUnitDOM = document.getElementById('beatUnit');
var tonalityNameDOM = document.getElementById('tonalityName');
var ABCNoteUnitDOM = document.getElementById('ABCNoteUnitButton');
var upbeatLengthDOM = document.getElementById('upbeatLength');
var upbeatUnitNoteDOM = document.getElementById('upbeatUnitNote');
setUpForClickingToggle(timeSignatureDOM, 'type', ['number', 'common', 'half'], refreshNotesAndMeasures);	
setUpForClickingToggle(beatPerMeasureDOM, 'value', ['2','3','4','6','8','9','12'], refreshNotesAndMeasures);
setUpForClickingToggle(beatUnitDOM, 'value', ['2','4','8'], refreshNotesAndMeasures);
setUpForClickingToggle(majorMinorLabelDOM, 'value', ['major', 'minor'], refreshNotesAndMeasures);
setUpForClickingToggle(tonalityNameDOM, 'value', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', ], refreshNotesAndMeasures);
setUpForClickingToggle(ABCNoteUnitDOM, 'value', ['1', '2', '4', '8', '16', ], refreshNotesAndMeasures);
setUpForClickingToggle(upbeatLengthDOM, 'value', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'], refreshUpbeatUI);
setUpForClickingToggle(upbeatUnitNoteDOM, 'value', ['4', '8', '16', ], refreshUpbeatUI);
//timeSignatureLabelDOM.onclick = function(){timeSignatureDOM.click();};

function setTonality(v){
	if(typeof v == 'string'){
		if(majorMinorLabelDOM.dataset.value == 'minor')
			tonalityNameDOM.dataset.value = (majorToneName.indexOf(v) + 3) % 12;
		else
			tonalityNameDOM.dataset.value = majorToneName.indexOf(v);
	}
	else if(typeof v == 'number')
		tonalityNameDOM.dataset.value = v;
}

function currentTonality(){
	return parseInt(tonalityNameDOM.dataset.value);
}

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
function currentBeatNote(){
	return 1 / parseInt(beatUnitDOM.dataset.value);
}
function currentABCUnitNote(){
	return 1 / parseInt(ABCNoteUnitDOM.dataset.value);
}
function currentUpbeatLength(){
	return parseInt(upbeatLengthDOM.dataset.value);
}
function currentUpbeatUnitNote(){
	return 1 / parseInt(upbeatUnitNoteDOM.dataset.value);
}
function refreshUpbeatUI(){
	let upLen = Number(upbeatLengthDOM.dataset.value);
	let upUnit = 1 / Number(upbeatUnitNoteDOM.dataset.value);
	let maxUpbeatPerMeasure = Math.round(currentBeatsPerMeasure() * currentBeatNote() / upUnit);
	upbeatLengthDOM.dataset.value = upLen % maxUpbeatPerMeasure;
	refreshNotesAndMeasures();
}

var majorToneName = 
['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B',];
var minorToneName = 
['A', 'B♭', 'B', 'C', 'C', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯',];
function updateABCSettingText(){
	//ABCTimeSigSPAN
	switch(timeSignatureDOM.dataset.type){
		case 'number':
			ABCTimeSigSPAN.textContent = beatPerMeasureDOM.dataset.value + '/' + beatUnitDOM.dataset.value;
			break;
		case 'half':
			ABCTimeSigSPAN.textContent = 'C|'
			break;
		case 'common':
		default:
			ABCTimeSigSPAN.textContent = 'C';
	}
	ABCNoteUnitSPAN.textContent = '1/' + ABCNoteUnitDOM.dataset.value;
	ABCToneSPAN.textContent = majorMinorLabelDOM.dataset.value == 'major' ? 
				 majorToneName[tonalityNameDOM.dataset.value] :
				 minorToneName[tonalityNameDOM.dataset.value] + 'm';
	//TODO: ABCSpeedSPAN
}
var SPNNoteList = ['C',['C♯','D♭'],'D',['D♯','E♭'],'E',
	'F',['F♯','G♭'],'G',['G♯','A♭'],'A',['A♯','B♭'],'B'];
//            1  2  3  4  5  6  7
var cScale = [0, 2, 4, 5, 7, 9, 11];
var cScaleNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
var ABCScalePitchName = cScale.map((v)=>(SPNNoteList[v]));
var tonalities = [];
var tonalStep = 7;
for(t = -6; t <= 5; t ++){
	let tonicPitch = (t * tonalStep + 60) % 12;
	let name = (t <= -2 ? SPNNoteList[tonicPitch][1] : SPNNoteList[tonicPitch][0]);
	let tonicABCName = name[0];
	let ABCNameOffset = cScaleNames.indexOf(tonicABCName);
	let scaleABCNames = cScaleNames.map((v,i)=>(cScaleNames[(i+ABCNameOffset) % 7]))
	let scalePitch = cScale.map((v)=>((v + tonicPitch) % 12));
	let signatureNum = t;
	let signatures = cScaleNames.map((v,i)=>(scalePitch[scaleABCNames.indexOf(v)] - cScale[i]))
	// build the map of pitch names
	let pitchNames = new Array(12).fill(0).map(()=>([]));
	let ABCnamePrefixValue = {'': 0, '=': 0, '^': +1, '_': -1};
	for(let prefix in ABCnamePrefixValue){
		for(let i in cScaleNames){
			let prefixValue = ABCnamePrefixValue[prefix];
			if(prefix == '')
				prefixValue = signatures[i];
			let pitch = (cScale[i] + prefixValue + 12) % 12;
			// sort the pitch names in order of priority
			let namePriority = 0;
			if(prefix == '')
				namePriority = 0;
			else if(prefixValue == signatures[i])
				namePriority = 10;
			else if(prefix == '=')
				namePriority = 1;
			else{
				namePriority = 2;
				if(prefix == '_')
					namePriority += 1;
				if(signatureNum != 0 && 
					((signatureNum > 0) != (prefixValue > 0)))
					namePriority += 3;
			}
			pitchNames[pitch][namePriority] = prefix + cScaleNames[i];
		}
	}
	// compact the array of pitchNames
	for(let i in pitchNames)
		pitchNames[i] = pitchNames[i].filter(()=>1);
	tonalities[tonicPitch] = {
		tonicPitch,
		name,
		tonicABCName,
		scaleABCNames,
		scalePitch,
		signatureNum,
		signatures,
		pitchNames,
	};
}

function pitchName(pitch, nameSystem, tonic, takeFlat){
	tonic = tonic || 0;
	takeFlat = takeFlat || 0;
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
	
	var tonality = tonalities.find((t)=>(t.tonicPitch == tonic));
	var ABCNote = tonality.pitchNames[(pitch % 12)][0];
	// TODO: a more itelliegent way to decide using sharp/flat
	// TODO: aware of the wrong value of octave when sharp/flat appied to B or C
	if(nameSystem == 'ABC')
		return (octave >= 5 ? ABCNote.toLowerCase() : ABCNote) + ABCOctavePostFix;
}

function durationProperty(durationTicks){
	// ABC Notation
	// Both duration and unitDura are in beats of Msr/tickPerMeasure.
	var quantumTicks = gcd(durationTicks, tickPerWholeNote);
	var numerator = Math.round(durationTicks / quantumTicks);
	var denominator = Math.round(tickPerWholeNote / quantumTicks);
	var isTriplet = (denominator % 3 == 0);
	return {
		numerator,
		denominator,
		isTriplet,
		quantumTicks,
	};
}

function partitionDurationDisplay(parition, unitNoteTicks, nameSystem){
	if (parition.isTriplet)
		unitNoteTicks = unitNoteTicks * 2 / 3;

	var unitDu = durationProperty(unitNoteTicks);
	if (parition.denominator <= unitDu.denominator){
		var inMinUnit = Math.round(parition.numerator * (unitDu.denominator / parition.denominator));
		var unitShrinkRatio = 1;
	}
	else {
		var inMinUnit = parition.numerator;
		var unitShrinkRatio = Math.round(parition.denominator / unitDu.denominator);
	}

	var prefix = '';
	if (parition.isTripletHead){
		prefix = '(3';
		if (parition.notesInTriplet != 3){
			prefix += '::' + parition.notesInTriplet;
		}
	}

	var postfix = '';
	if (inMinUnit != 1)
		postfix += inMinUnit;
	postfix += "/".repeat(Math.log2(unitShrinkRatio));

	return {
		postfix,
		prefix,
	};
}

function toNextDivisibleBy(fromThis, divisibleBy){
	var prevQuotientOfDivisible = Math.floor(fromThis / divisibleBy);
	return (prevQuotientOfDivisible + 1) * divisibleBy - fromThis;
}

partitionFactors = {
	3: [3],
	6: [2,3],
	9: [3,3],
	12: [2,2,3],
};
seperateFactors = {
	2: 2,
	3: 3,
	4: 4,
	6: 2,
	9: 3,
	12: 4,
};
tickPerWholeNote = 144;
allowStartTick = (()=>{
	var t_4_4 = {};
	t_4_4[1]        = [0];
	t_4_4[1.5/2]    = [0, 1/4];
	t_4_4[1  /2]    = [0, 1/4, 1/2];
	t_4_4[1.5/4]    = [0, 1/8, 4/8, 5/8];
	t_4_4[1  /4]    = [0, 1/8, 2/8, 4/8, 5/8, 6/8];
	t_4_4[1.5/8]    = [0, 1/16, 4/16, 5/16, 8/16, 9/16, 12/16, 13/16];
	t_4_4[1  /8]    = [0, 1/8, 2/8, 3/8, 4/8, 5/8, 6/8, 7/8];
	t_4_4[1.5/16]   = [0, 1/32, 4/32, 5/32, 8/32, 9/32, 12/32, 13/32, 16/32, 17/32, 20/32, 21/32, 24/32, 25/32, 28/32, 29/32];
	t_4_4[1  /16]   = [0, 1/16, 2/16, 3/16, 4/16, 5/16, 6/16, 7/16, 8/16, 9/16, 10/16, 11/16, 12/16, 13/16, 14/16, 15/16];

	var t_4_4_tk = {};
	for(var len in t_4_4){
		t_4_4_tk[Math.round(len * tickPerWholeNote)] = t_4_4[len].map((v)=>(Math.round(v * tickPerWholeNote)));
	}

	var verify = function(startTicksInMeasure, ticks){
		if(!t_4_4_tk[ticks])
			return true;
		return t_4_4_tk[ticks].indexOf(startTicksInMeasure) >= 0;
	};
	return verify;
})();
function Note(i_pitch, i_duration, i_displayParam, i_tieToNext){
	// duration: how long relative to a measure
	// pitch: a number, in MIDI pitch (69 = 440Hz)
	this.pitch = i_pitch || 0;
	this.duration = i_duration || 0;
	this.tieToNext = i_tieToNext || false;
	this.notePartitions = [];
	
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
	this.index = function(value){
		return notes.indexOf(this);
	};
	this.prevNote = function(){
		return notes[notes.indexOf(this) - 1];
	};
	this.nextNote = function(){
		return notes[notes.indexOf(this) + 1];
	};
	this.partIndex = function(part){
		var i = this.notePartitions.indexOf(part);
		if(i < 0)
			throw new Error("The partition does not belong to this note.");
		return i;
	}
	this.lastPart = function(){
		return this.notePartitions[this.notePartitions.length - 1];
	}
	this.prevPartOfThis = function(part){
		var partI = this.partIndex(part);
		if(partI == 0)
			return this.prevNote() && this.prevNote().lastPart();
		else
			return this.notePartitions[partI - 1];
	};
	this.nextPartOfThis = function(part){
		var partI = this.partIndex(part);
		if(partI == this.notePartitions.length - 1)
			return this.nextNote() && this.nextNote().notePartitions[0];
		else
			return this.notePartitions[partI + 1];
	};
	
	// handle the measure display
	// this.startTime = 0;

	this.partitioning = function(){
		var tickPerMeasure = tickPerWholeNote * currentBeatNote() * currentBeatsPerMeasure();
		var totalTicks = Math.round(this.duration * tickPerWholeNote);
		// tickPerMeasure is so far the smallest measure division
		//console.log(totalTicks);
		
		// partition the totalTicks into those it should be shown as
		this.notePartitions = [];
		if(this.startTime != undefined && this.startTime >= 0){
			var startTimeTicks = Math.round(this.startTime * tickPerWholeNote);
			var partitionTicks = tickPerMeasure;
			/*
			if (currentBeatsPerMeasure() % 2 == 0)
				partitionTicks = tickPerMeasure / 2;
			else if (currentBeatsPerMeasure() % 3 == 0)
				partitionTicks = tickPerMeasure / 3;
			else
				partitionTicks = tickPerMeasure;
			*/
			var partitionFactorIdx = 0;
			var maxTicksInNextPartition = Math.round(toNextDivisibleBy(startTimeTicks, partitionTicks));
			var remainTicks = totalTicks;
			while(remainTicks > 0){
				var measureStartTimeTicks = startTimeTicks - (Math.floor(startTimeTicks / tickPerWholeNote) * tickPerWholeNote);
				var thisPartition = Math.min(remainTicks, maxTicksInNextPartition);
				var describeUnit = gcd(tickPerWholeNote, thisPartition);
				var describeUnitResolution = tickPerWholeNote / describeUnit;
				if(describeUnitResolution % 3 == 0)
					; //TODO: triplets resolutions
				var thisPartInDescUnit = thisPartition / describeUnit;
				if((thisPartInDescUnit != 1 && thisPartInDescUnit != 3) || !allowStartTick(measureStartTimeTicks, thisPartition)){
					// need more partitions
					// do not do partition
					var factor = 2;
					if([2,4,8].indexOf(currentBeatsPerMeasure()) < 0)
						factor = partitionFactors[currentBeatsPerMeasure()][partitionFactorIdx] || 2;
					partitionTicks /= factor;
					partitionFactorIdx += 1;
				}else{
					var endTimeTicks = Math.round(startTimeTicks + thisPartition);
					var separateTicks = Math.round(tickPerMeasure / seperateFactors[currentBeatsPerMeasure()]);
					var reachMeasureEnd = ((endTimeTicks % tickPerMeasure) == 0);
					if (reachMeasureEnd)
						measureBarIndex += 1;
					var reachLineEnd = reachMeasureEnd
							&& measureBarIndex > 0
							&& ((measureBarIndex % (newLinePerMeasure = 4)) == 0);
					this.notePartitions.push({
						ticks: thisPartition,
						startTime: startTimeTicks,
						endTime: endTimeTicks,
						reachSeparatePoint: ((endTimeTicks % separateTicks) == 0),
						reachMeasureEnd,
						reachLineEnd,
					});
					remainTicks -= thisPartition;
					startTimeTicks += thisPartition;
					partitionTicks = tickPerMeasure;
					partitionFactorIdx = 0;
				}
				maxTicksInNextPartition = toNextDivisibleBy(startTimeTicks, partitionTicks);
			}
		}else{
			this.notePartitions = [{
				ticks: totalTicks,
				reachMeasureEnd: false,
			}];
		}
		this.notePartitions.forEach((v)=>{
			v.note = this;
			Object.assign(v, durationProperty(v.ticks));
			// check triplet property: head ? tail ?
			if (v.isTriplet){
				var prevPart = this.prevPartOfThis(v);
				if (!prevPart || !prevPart.isTriplet || prevPart.isTripletTail){
					v.isTripletHead = true;
					v.tripletHead = v;
					v.inTripletIndex = 0;
					v.notesInTriplet = 1;
				}
				else {
					v.tripletHead = prevPart.tripletHead;
					v.inTripletIndex = prevPart.inTripletIndex + 1;
					v.tripletHead.notesInTriplet = v.inTripletIndex + 1;
				}
				// check if this is a triplet tail
				var p = v;
				var tripletTicks = p.ticks;
				while (p && !p.isTripletHead) {
					p = this.prevPartOfThis.call(p.note, p);
					tripletTicks += p ? p.ticks : 0;
				} ;
				v.isTripletTail = (!durationProperty(tripletTicks).isTriplet);
			}
			// triplet property checked
		});
	}

	this.displayParam = i_displayParam || {};
	this.toString = function(){
		var durationInMeasure = "";
		var tickPerMeasure = tickPerWholeNote * currentBeatNote() * currentBeatsPerMeasure();
		var totalTicks = Math.round(this.duration * tickPerWholeNote);
		// tickPerMeasure is so far the smallest measure division
		//console.log(totalTicks);
		
		// HERE ABOUT THE NOTATION of THE NOTE

		var divideTicks = gcd(tickPerMeasure, totalTicks);
		durationInMeasure = Math.round(totalTicks/divideTicks) + "/" + Math.round(tickPerMeasure/divideTicks);
		
		if(this.displayParam.nameSystem == undefined)
			return this.pitch + ":" + durationInMeasure;
		else{
			var pn = pitchName(
				this.pitch, 
				this.displayParam.nameSystem, 
				this.displayParam.tonality || currentTonality(), 
				this.displayParam.takeFlat);
			if(this.displayParam.nameSystem == 'ABC'){
				var beatsPerMeasure = currentBeatsPerMeasure();
				var beatTicks = tickPerMeasure / beatsPerMeasure;
				var noteTicks = beatTicks * (currentABCUnitNote() / currentBeatNote());
				var noteStrings = this.notePartitions
					.map((v,i)=>{
						var du = partitionDurationDisplay(v, noteTicks, 'ABC');
						if (v.reachMeasureEnd) {
							measureBarIndex += 1;
						}
						return du.prefix + pn + du.postfix 
						+ ((i < this.notePartitions.length - 1) || this.tieToNext ? '-' : '')
						+ (v.reachSeparatePoint ? ' ' : '')
						+ (v.reachMeasureEnd ? '|' : '')
						+ (v.reachLineEnd ? '\n' : '');
					});
				return noteStrings;
			}
			else if(this.displayParam.nameSystem == 'SPN'){
				return pn + ":" + durationInMeasure + (this.tieToNext ? '-' : '');
			}
		}
	}
	
	var domobj = document.createElement("span");
	domobj.className = "note";
	this.refreshDOM = function(){
		domobj.innerHTML = '';
		this.toString().map((s)=>{
			let d = document.createElement('span');
			d.innerText = s;
			return d;
		}).forEach((d)=>(domobj.append(d)));
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
	cursorDOM.scrollIntoView();
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
	cursorDOM.scrollIntoView();
}

function deleteAllNotes(){
	notes.forEach((v)=>v.getDOM().remove());
	editCurserPosition = 0;
	notes = [];
	refreshNotesAndMeasures();
	cursorDOM.scrollIntoView();
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
	//console.log(event.type);
	//console.log(event.touches[0]);
	//console.log(event.changedTouches[0]);
	var touches = event.touches;
	var changedTouches = event.changedTouches;
	var isEditEvent = false;
	// TODO: need to clean those undetected touchend when debugging
	
	for(var i = 0; i < changedTouches.length; i ++){
		var touchedDOM = findValidParent(changedTouches[i].target, 'touch');
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
		isEditEvent = true;
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
					var newNote = new Note(pitch, dura, {
						nameSystem: 'ABC', 
						takeFlat: false
					});
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
				//console.log('note end');
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
	if(isEditEvent)
		refreshCursorPosition();
	// }
}

function refreshNotesAndMeasures(){
	var tickPerMeasure = tickPerWholeNote * currentBeatNote() * currentBeatsPerMeasure();
	var upbeatTimeLength = currentUpbeatLength() * currentUpbeatUnitNote();
	measureBarIndex = (currentUpbeatLength() > 0 ? -1 : 0);
	notes.forEach((v,i)=>{
		v.startTime = (i > 0 ? notes[i-1].startTime + notes[i-1].duration : upbeatTimeLength);
		v.partitioning();
	});
	notes.forEach((v,i)=>{
		v.refreshDOM();
	});
	updateABCSettingText();
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
		keyDOMs[i].dataset.pitchname = pitchName(keyPitch[i], keyboardPitchNameSystem, 0, keyboardPitchNameUseFlat);
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
updateABCSettingText();

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
