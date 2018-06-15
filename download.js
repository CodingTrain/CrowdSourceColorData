let authPromise;
let database;
let text_div;
let data;

let bodyElement;
let buttons = [];
let ready = false;




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

  

    createCanvas(100, 100).parent("#root");
    select('canvas').hide();
    text_div = createDiv().parent('#root').class('text_label');
    bodyElement = document.body;
    text_div.html(`Please wait while the data is fetched`);
    showLoading();
    // code to determine and display database length
    database
    .ref("/colors/")
    .once("value")
    .then((snapshot) => {
        data =  Object.values(snapshot.val());
        text_div.html('Data fetched');
        hideLoading();
        let download_button = createButton('Download as JSON').parent('#root').class('text_label');
        download_button.mouseClicked(download_data);
    });

    // Commenting out the loading of data for the webpage running
    // console.log("Retreiving data... (this can take a minute or two)");
    // loadData().then(data => {
    //   dataSave = data;
    //   console.log("Recieved data. To analyze", data.length, "entries, run: ");
    //   console.log("showSample(dataSave, 'red-ish')");
    //   console.log("or analyzeData(dataSave, ['red-ish', 'blue-ish'])");
    //   console.log("To clean the data by label and hue use: ");
    //   console.log("let green_data = cleanData(dataSave, 'green-ish', 60, 180)");
    //   console.log("For any help, please see the documentation above each function in the code!");
    // });
}

function download_data(){
    let data_string = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    let dl_element = document.getElementById('download_element');
    dl_element.setAttribute("href", data_string);
    dl_element.setAttribute("download", "data.json");
    dl_element.click();
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

    let img = createImage(width, height);
    let d = pixelDensity();
    img.loadPixels();
    for (let i = 0; i < width * height * d && i < entries.length; i++) {
        let { r, g, b } = entries[i];
        img.set(i % width, floor(i / height), color(r, g, b));
    }
    img.updatePixels();

    background(255);
    image(img, 0, 0);
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
      .once("value")
      .then(snapshot => Object.values(snapshot.val()));
}

function showLoading() {
    select('.loading').show();
}

function hideLoading() {
    select('.loading').hide();
    setTimeout(function(){ ready = true;}, 600);
}

