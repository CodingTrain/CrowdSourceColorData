let r, g, b;
let authPromise;
let database;
let rgbDiv;

let bodyElement;
let buttons = [];
let ready = false;
let dataSave;
let limit = 200;

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

  authPromise = firebase.auth().signInAnonymously();

  createCanvas(200, 200).parent('#root');
  rgbDiv = createDiv().parent('#root');
  bodyElement = document.body;
  ready = true;

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
    buttons[i].mouseClicked(showSampleData);
  }

  //Commenting out the loading of data for the webpage running
  console.log("Retreiving data... (this can take a minute or two)");
  showLoading();
  loadData().then(data => {
    hideLoading();
    dataSave = data;
    console.log("Recieved data. To analyze", data.length, "entries, run: ");
    //console.log("showSample(dataSave, 'red-ish')");
    showSample(dataSave, 'red-ish');
    rgbDiv.html('red-ish');
    console.log("or analyzeData(dataSave, ['red-ish', 'blue-ish'])");
    console.log("To clean the data by label and hue use: ");
    console.log("let green_data = cleanData(dataSave, 'green-ish', 60, 180)");
    console.log("For any help, please see the documentation above each function in the code!");
  });
}

/** Produce a filtered version of the input data.
 *   First, all data whose label does not match 'name' is discarded.
 *   Then, all data must encode a RGB color which has a hue
 *   value greater than minHue and less than maxHue.
 *   Special case!
 *   If minHue > maxHue, the range wraps around the 360->0 hue gap.
 * @function cleanData
 * @param {Array} data - returned by loadData(), saved in dataSave
 * @param {string} name - the label to produce clean data for
 * @param {number} minHue - 0 <= minHue <= 360. Lower limit of hue range
 * @param {number} maxHue - 0 <= maxHue <= 360. Upper limit of hue range
 * @return {Array} Your squeeky clean data!
 * @example let green_data = cleanData(dataSave, 'green-ish', 60, 180)
 * @example let red_data = cleanData(dataSave, 'red-ish', 300, 60)
 */
function cleanData(data, name, minHue, maxHue) {
  const entries = filterData(data, name);
  console.log("Cleaning", entries.length, "entries for", name);
  let result = [];
  for (let entry of entries) {
    let { r, g, b } = entry;
    let h = hue(color(r, g, b));
    if (minHue < h && h < maxHue) {
      result.push(entry);
    } else if (minHue > maxHue && (minHue < h || h < maxHue)) {
      result.push(entry);
    }
  }
  console.log("Result contains", result.length, "entries.");
  return result;
}

function showSampleData() {
  rgbDiv.html(this.html());
  showSample(dataSave, this.html());
}

/** Actually draw on the canvas as many colors from that
 *   label as possible, with one pixel for each color.
 * @function showSample
 * @param {Array} data - returned by loadData(), saved in dataSave
 * @param {Array} name - name of the label to draw, ex. "blue-ish"
 * @return {undefined}
 * @example showSample(dataSave, 'green-ish')
 */
function showSample(data, name) {
  const entries = filterData(data, name);
  console.log("Found", entries.length, "entries for", name);

  let randomIndex = floor(random(entries.length));
  if(entries[randomIndex]) {
    r = entries[randomIndex].r;
    g = entries[randomIndex].g;
    b = entries[randomIndex].b;
    updateBodyBG();
  }

  let square = ceil(sqrt(entries.length));
  let w = width / square;
  let h = height / square;

  background(255);
  noStroke();
  for (let i = 0; i < square * square && i < entries.length; i++) {
    let { r, g, b } = entries[i];
    fill(color(r, g, b));
    rect((i % square) * w, floor(i / square) * h, w, h);
  }
}

/** Show hue metrics for colors of the data.
 * @async
 * @function analyzeData
 * @param {Array} data - returned by loadData(), saved in dataSave
 * @param {Array} colors - color labels to analyze
 * @return {undefined}
 * @example analyzeData(data, buttons.map(e=>e.html()))
 */
function analyzeData(data, colors) {
  for (name of colors) {
    const entries = filterData(data, name);
    console.log("Found", entries.length, "entries for", name);
    let avgHue = 0;
    let validCount = 0;
    for (let { r, g, b } of entries) {
      let h = hue(color(r, g, b));
      avgHue += h;
      validCount++;
    }
    avgHue /= validCount;
    console.log("Average", name, "hue: ", avgHue);
  }
}

function filterData(data, name) {
  return data.filter(({ label, r, g, b }) => label === name && Number.isInteger(r) && Number.isInteger(g) && Number.isInteger(b));
}

function loadData() {
  return database
    .ref("/colors/")
    .limitToFirst(limit)
    .once("value")
    .then(snapshot => Object.values(snapshot.val()));
}

function showLoading() {
  select('.loading').show();
  select('canvas').hide();
  for (button of buttons) button.addClass("disabled");
  ready = false;
}

function hideLoading() {
  select('.loading').hide();
  select('canvas').show();
  for (button of buttons) button.removeClass("disabled");
  setTimeout(function(){ ready = true;}, 600);
}

function updateBodyBG(){
  bodyElement.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 1.0)`;
}
