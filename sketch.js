let mic;
let palavra = 'ramoncreate';

const BASE_SIZE     = 70;
const VOL_THRESHOLD = 0.01;
const MAX_JITTER    = 50;
const MAX_SCALE     = 1.2;

let bgGradColors = [];
let txtGradColors = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Arial');
  textAlign(CENTER, CENTER);
  noStroke();

  for (let i = 0; i < 4; i++) {
    bgGradColors.push(randomColor());
  }
  txtGradColors = [randomColor(), randomColor()];
}

function draw() {
  let vol = mic && mic.enabled ? mic.getLevel() : 0;
  let speaking = vol > VOL_THRESHOLD;

  if (speaking) {
    bgGradColors = [];
    for (let i = 0; i < 4; i++) {
      bgGradColors.push(randomColor());
    }
    txtGradColors = [randomColor(), randomColor()];
  }

  let ctx = drawingContext;
  const meshCols = 30;
  const meshRows = 30;
  let t = frameCount * 0.01;
  for (let j = 0; j < meshRows; j++) {
    for (let i = 0; i < meshCols; i++) {
      let u = i / (meshCols - 1);
      let v = j / (meshRows - 1);
      let u2 = constrain(u + 0.1 * sin(TWO_PI * t + v * PI), 0, 1);
      let v2 = constrain(v + 0.1 * sin(TWO_PI * t * 1.2 + u * PI), 0, 1);
      let c00 = color(bgGradColors[0][0], bgGradColors[0][1], bgGradColors[0][2]);
      let c10 = color(bgGradColors[1][0], bgGradColors[1][1], bgGradColors[1][2]);
      let c11 = color(bgGradColors[2][0], bgGradColors[2][1], bgGradColors[2][2]);
      let c01 = color(bgGradColors[3][0], bgGradColors[3][1], bgGradColors[3][2]);
      let top    = lerpColor(c00, c10, u2);
      let bottom = lerpColor(c01, c11, u2);
      let col    = lerpColor(top, bottom, v2);
      let r = floor(red(col)), g = floor(green(col)), b = floor(blue(col));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(
        i * (width  / meshCols),
        j * (height / meshRows),
        (width  / meshCols) + 1,
        (height / meshRows) + 1
      );
    }
  }

  let size   = speaking
               ? constrain(map(vol, 0, 0.2, 80, 200), 80, 200)
               : BASE_SIZE;
  let wScale = speaking
               ? constrain(map(vol, 0, 0.2, 0.8, MAX_SCALE), 0.8, MAX_SCALE)
               : 1;
  let jitter = speaking
               ? constrain(map(vol, 0, 0.2, 0, MAX_JITTER), 0, MAX_JITTER)
               : 0;

  textSize(size);
  textFont('Arial');
  let txtGrad = ctx.createLinearGradient(0, 0, width, 0);
  txtGrad.addColorStop(0, rgbStr(txtGradColors[0]));
  txtGrad.addColorStop(1, rgbStr(txtGradColors[1]));
  ctx.fillStyle = txtGrad;
  ctx.font         = `${size}px Arial`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  let totalW = 0;
  for (let ch of palavra) totalW += textWidth(ch) * wScale;
  let x = (width - totalW) / 2;
  for (let ch of palavra) {
    let lw = textWidth(ch) * wScale;
    let dx = speaking ? random(-jitter, jitter) : 0;
    let dy = speaking ? random(-jitter, jitter) : 0;
    ctx.save();
      ctx.translate(x + lw / 2 + dx, height / 2 + dy);
      ctx.scale(wScale, 1);
      ctx.fillText(ch, 0, 0);
    ctx.restore();
    x += lw;
  }
}

function touchStarted() {
  userStartAudio().then(initMic);
}
function mousePressed() {
  userStartAudio().then(initMic);
}
function initMic() {
  if (!mic) {
    mic = new p5.AudioIn();
    mic.start();
  }
}

function randomColor() {
  return [floor(random(256)), floor(random(256)), floor(random(256))];
}
function rgbStr(c) {
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
