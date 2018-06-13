let r, g, b;
let database;
let rgbDiv;

function pickColor() {
  r = floor(random(256));
  g = floor(random(256));
  b = floor(random(256));
  background(r, g, b);
  rgbDiv.html(`R:${r} G:${g} B:${b}`);
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


  createCanvas(100, 100).parent('#root');
  rgbDiv = createDiv().parent('#root');
  
  pickColor();

  let buttons = [];
  buttons.push(createButton('red-ish').parent('#root').class('red-ish'));
  buttons.push(createButton('green-ish').parent('#root').class('green-ish'));
  buttons.push(createButton('blue-ish').parent('#root').class('blue-ish'));
  buttons.push(createButton('orange-ish').parent('#root').class('orange-ish'));
  buttons.push(createButton('yellow-ish').parent('#root').class('yellow-ish'));
  buttons.push(createButton('pink-ish').parent('#root').class('pink-ish'));
  buttons.push(createButton('purple-ish').parent('#root').class('purple-ish'));
  buttons.push(createButton('brown-ish').parent('#root').class('brown-ish'));
  buttons.push(createButton('grey-ish').parent('#root').class('grey-ish'));

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].mousePressed(sendData);
  }
}

function sendData() {
  // send this data to something?
  // send the data to firebase!
  let colorDatabase = database.ref('colors');

  // Make an object with data in it
  var data = {
    r: r,
    g: g,
    b: b,
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
      pickColor();
    }
  }
}
