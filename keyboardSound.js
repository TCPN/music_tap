function setupMIDI() {
  return MIDI.setup({
    debug: false,
    soundfontUrl: 'https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/',
    instruments: [],
  });
}

window.KeyboardSound = {
  setup() {
    if (this._setupPromise) {
      return this._setupPromise;
    }
    if (!window.MIDI) {
      this._setupPromise = new Promise((resolve, reject) => {
        let scriptEl = document.getElementById('abcjs_script');
        if (scriptEl) {
	  scriptEl.addEventListener('load', () => {
	    setupMIDI().then(resolve);
          });
	} else {
          window.addEventListener('load', () => {
	    setupMIDI().then(resolve);
          });
	}
      });
    } else {
      this._setupPromise = setupMIDI();
    }
    return this._setupPromise;
  },
  noteOn(pitch) {
    return MIDI.noteOn(0, pitch, 1, 0);
  },
  noteOff(pitch) {
    return MIDI.noteOff(0, pitch, 0);
  },
};

KeyboardSound.setup().then(() => {
  console.log('KeyboardSound initialized');
});

