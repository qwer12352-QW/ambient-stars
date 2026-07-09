let stars = [];
const STAR_COUNT = 120;

let hueSlider, intensitySlider, startBtn;
let synth;
let playing = false;

function setup() {
  const container = select('#canvasContainer');
  const canvas = createCanvas(container.width, windowHeight - select('.controls').height);
  canvas.parent('canvasContainer');
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
  }

  hueSlider = select('#hue');
  intensitySlider = select('#intensity');
  startBtn = select('#startBtn');
  startBtn.mousePressed(toggleSound);

  // Simple ambient synth with Tone.js
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 4, decay: 1, sustain: 0.6, release: 6 }
  }).toDestination();

  // slow random notes loop
  Tone.Transport.bpm.value = 40;
  Tone.Transport.loop = true;
  Tone.Transport.loopEnd = '8m';
  Tone.Transport.scheduleRepeat(() => {
    if (!playing) return;
    const now = Tone.now();
    let notes = ['C4','E4','G4','B3','D4','A3'];
    const chord = [
      random(notes),
      random(notes),
      random(notes)
    ];
    synth.triggerAttackRelease(chord, '4n', now);
  }, '2n');
}

function windowResized() {
  const container = select('#canvasContainer');
  resizeCanvas(container.width, windowHeight - select('.controls').height);
}

function draw() {
  // background with slight blur effect
  background(2,2,18, 20);
  const hue = float(hueSlider.value());
  const intensity = float(intensitySlider.value());

  // draw stars
  for (let s of stars) {
    s.update(intensity);
    s.show(hue);
  }
}

function toggleSound() {
  if (!playing) {
    Tone.start();
    Tone.Transport.start();
    playing = true;
    startBtn.html('Stop Sound');
  } else {
    Tone.Transport.stop();
    playing = false;
    startBtn.html('Start Sound');
  }
}

class Star {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3.5);
    this.baseAlpha = random(100, 255);
    this.offset = random(TWO_PI);
    this.speed = random(0.002, 0.01);
  }
  update(intensity) {
    // twinkle by sine wave, modulated by intensity
    this.alpha = this.baseAlpha * (0.3 + 0.7 * (0.5 + 0.5 * sin((millis() / 1000) * TWO_PI * this.speed + this.offset)));
    this.alpha *= lerp(0.4, 1.4, intensity);
  }
  show(hue) {
    push();
    translate(this.x, this.y);
    noStroke();
    const c = color(`hsla(${hue}, 80%, 70%, ${this.alpha/255})`);
    fill(c);
    circle(0, 0, this.size);
    pop();
  }
}