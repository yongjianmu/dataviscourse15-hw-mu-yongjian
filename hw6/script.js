/*globals VolumeRenderer, d3, console*/
var scale1 = 0.15;
var scale2 = 0.7;
var scale3 = 1.0;

var red1 = 204;
var green1 = 102;
var blue1 = 0;

var red2 = 0;
var green2 = 250;
var blue2 = 88;

var red3 = 242;
var green3 = 0;
var blue3 = 242;

var renderer,
    allHistograms = {};

function updateTransferFunction() {
    renderer.updateTransferFunction(function (value) {
        // ******* Your solution here! *******

        // Given a voxel value in the range [0.0, 1.0],
        // return a (probably somewhat transparent) color
        var aValue = value;
        var fValue = scale1;
        var sValue = scale2;
        var tValue = scale3;
        if(value <= fValue && (value > sValue || fValue - value <= sValue - value) && (value > tValue || fValue - value <= tValue - value) || value > fValue && fValue >= sValue && fValue >= tValue)
        {
            return 'rgba(' + red1 + ', ' + green1 + ', ' + blue1 + ', ' + aValue + ')';
        }
        else if(value <= sValue && (value > fValue || sValue - value <= fValue - value) && (value > tValue || sValue - value <= tValue - value) || value > sValue && sValue >= fValue && sValue >= tValue)
        {
            return 'rgba(' + red2 + ', ' + green2 + ', ' + blue2 + ', ' + aValue + ')';
        }
        else
        {
            return 'rgba(' + red3 + ', ' + green3 + ', ' + blue3 + ', ' + aValue + ')';
        }
    });
}

function setup() {
    d3.select('#volumeMenu').on('change', function () {
        renderer.switchVolume(this.value);
        console.log(this.value + ' histogram:', getHistogram(this.value, 0.025));
    });
    console.log('bonsai histogram:', getHistogram('bonsai', 0.025));

    updateTransferFunction();

    function rgb2hex(rgb){
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    }

    //reference code: "http://jsfiddle.net/pimvdb/eGjak/89/"
    var cv  = document.getElementById('cv'),
        ctx = cv.getContext('2d');

    var fValue = Math.round(scale1 * 100);
    var sValue = Math.round(scale2 * 100);
    var tValue = Math.round(scale3 * 100);

    for(var i = 0; i <= 100; i ++) {
        ctx.beginPath();
        ctx.rect(0, 0, 4, 25);

        var aValue = i / 100.0;
        var color;
        if(i <= fValue && (i > sValue || fValue - i <= sValue - i) && (i > tValue || fValue - i <= tValue - i) || i > fValue && fValue >= sValue && fValue >= tValue)
        {
            color = 'rgb(' + Math.round(aValue * red1) + ',' + Math.round(aValue * green1) + ',' + Math.round(aValue * blue1) + ')';
        }
        else if(i <= sValue && (i > fValue || sValue - i <= fValue - i) && (i > tValue || sValue - i <= tValue - i) || i > sValue && sValue >= fValue && sValue >= tValue)
        {
            color = 'rgb(' + Math.round(aValue * red2) + ',' + Math.round(aValue * green2) + ',' + Math.round(aValue * blue2) + ')';
        }
        else
        {
            color = 'rgb(' + Math.round(aValue * red3) + ',' + Math.round(aValue * green3) + ',' + Math.round(aValue * blue3) + ')';
        }
        var gradient = ctx.createLinearGradient( 0, 0, 4, 25 );
        gradient.addColorStop(0, rgb2hex(color));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
        console.log("############Value1$$$$$$$$$$$$$$"+rgb2hex(color));
    }

    cv.onclick = function(e) {
        var x = e.offsetX,
            y = e.offsetY,
            p = ctx.getImageData(x, y, 1, 1),
            dat = p.data;

        alert('The Voxel Value: ' + (Math.floor(x / 4 - 0.1) / 100.0) + '\n' + 'Color: RGB(' + dat[0] + ', ' + dat[1] + ', ' + dat[2] + ')');
    };
}

/*

 You shouldn't need to edit any code beyond this point
 (though, as this assignment is more open-ended, you are
 welcome to edit as you see fit)

 */


function getHistogram(volumeName, binSize) {
    /*
     This function resamples the histogram
     and returns bins from 0.0 to 1.0 with
     the appropriate counts
     (binSize should be between 0.0 and 1.0)

     */

    var steps = 256,    // the original histograms ranges from 0-255, not 0.0-1.0
        result = [],
        thisBin,
        i = 0.0,
        j,
        nextBin;
    while (i < 1.0) {
        thisBin = {
            count : 0,
            lowBound : i,
            highBound : i + binSize
        };
        j = Math.floor(i * steps);
        nextBin = Math.floor((i + binSize) * steps);
        while (j < nextBin && j < steps) {
            thisBin.count += Number(allHistograms[volumeName][j].count);
            j += 1;
        }
        i += binSize;
        result.push(thisBin);
    }
    console.log("result");
    console.log(result);
    return result;
}

/*
 Program execution starts here:

 We create a VolumeRenderer once we've loaded all the csv files,
 and VolumeRenderer calls setup() once it has finished loading
 its volumes and shader code

 */
var loadedHistograms = 0,
    volumeName,
    histogramsToLoad = {
        'bonsai' : 'volumes/bonsai.histogram.csv',
        'foot' : 'volumes/foot.histogram.csv',
        'teapot' : 'volumes/teapot.histogram.csv'
    };

function generateCollector(name) {
    /*
     This may seem like an odd pattern; why are we generating a function instead of
     doing this inline?

     The trick is that the "volumeName" variable in the for loop below changes, but the callbacks
     are asynchronous; by the time any of the files are loaded, "volumeName" will always refer
     to "teapot"**. By generating a function this way, we are storing "volumeName" at the time that
     the call is issued in "name".

     ** This is yet ANOTHER javascript quirk: technically, the order that javascript iterates
     over an object's properties is arbitrary (you wouldn't want to rely on the last value
     actually being "teapot"), though in practice most browsers iterate in the order that
     properties were originally assigned.

     */
    return function (error, data) {
        if (error) {
            throw new Error("Encountered a problem loading the histograms!");
        }
        allHistograms[name] = data;
        loadedHistograms += 1;

        if (loadedHistograms === Object.keys(histogramsToLoad).length) {



            renderer = new VolumeRenderer('renderContainer', {
                'bonsai': 'volumes/bonsai.raw.png',
                'foot': 'volumes/foot.raw.png',
                'teapot': 'volumes/teapot.raw.png'
            }, setup);
        }
    };
}

for(volumeName in histogramsToLoad) {
    if (histogramsToLoad.hasOwnProperty(volumeName)) {
        d3.csv(histogramsToLoad[volumeName], generateCollector(volumeName));
    }
}
