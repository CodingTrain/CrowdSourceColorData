let r, g, b;
let database;

function pickColor() {
  /*
    Choosing from random RGB values biases the colors towards green-ish.
    Instead, we want to uniformly sample from all hues.
    We bias towards full saturation or else too many colors look either gray,
    brown, or pink.
    We bias away from full black and full white primarily because they aren't
    options presented to the user.
   */

  colorMode(HSL);
  let h = random(360);
  let s = randomGaussian(100, 35);
  let l = randomGaussian(50, 15);
  while (s < 0 || s > 100)
    s = randomGaussian(100, 35);
  while (l < 0 || l > 100)
    l = randomGaussian(50, 15);

  let c = color(h, s, l);

  colorMode(RGB);
  r = round(red(c));
  g = round(green(c));
  b = round(blue(c));

  // Create background.
  rectMode(CORNER);
  fill(0);
  rect(0, 0, width / 2, height);
  fill(255);
  rect(width / 2, 0, width / 2, height);

  // Lay out swatches side by side.
  rectMode(CENTER);
  fill(r, g, b);
  rect(width * 0.25, height / 2, width / 2 * 0.7, height * 0.7);
  rect(width * 0.75, height / 2, width / 2 * 0.7, height * 0.7);
  hideLoading();
}

function setup() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDPekCKX4ee6h9NVR2lEITGAM0XIHn-c7c",
    authDomain: "color-classification.firebaseapp.com",
    databaseURL: "https://color-classification.firebaseio.com",
    projectId: "color-classification",
    storageBucket: "",
    messagingSenderId: "590040209608"
  };
  firebase.initializeApp(config);
  database = firebase.database();

  createCanvas(480, 240).parent('#root');
  noStroke();
  pickColor();

  let buttons = [];
  buttons.push(createButton('red-ish').parent('#root').class('red-ish'));
  buttons.push(createButton('orange-ish').parent('#root').class('orange-ish'));
  buttons.push(createButton('yellow-ish').parent('#root').class('yellow-ish'));
  buttons.push(createButton('green-ish').parent('#root').class('green-ish'));
  buttons.push(createButton('blue-ish').parent('#root').class('blue-ish'));
  buttons.push(createButton('purple-ish').parent('#root').class('purple-ish'));
  buttons.push(createButton('pink-ish').parent('#root').class('pink-ish'));
  buttons.push(createButton('brown-ish').parent('#root').class('brown-ish'));
  buttons.push(createButton('grey-ish').parent('#root').class('grey-ish'));

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].mousePressed(sendData);
  }
}

function sendData() {
  showLoading();
  // send this data to something?
  // send the data to firebase!
  let colorDatabase = database.ref('colors');

  // Make an object with data in it
  var data = {
    r,
    g,
    b,
    label: this.html()
  }
  console.log('saving data');
  console.log(data);

  let color = colorDatabase.push(data, finished);
  console.log("Firebase generated key: " + color.key);

  // Reload the data for the page
  function finished(err) {
    if (err) {
      console.error("ooops, something went wrong.");
      console.error(err);
    } else {
      console.log('Data saved successfully');
      setTimeout(pickColor, 700);
    }
  }
}

function showLoading() {
  select('.loading').style('display', '');
  select('#root').hide();
}

function hideLoading() {
  select('.loading').hide();
  select('#root').show();
}