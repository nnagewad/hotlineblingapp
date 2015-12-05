var hotlineBlingApp = {};

// Function to obtain images from UnSplash's website
// hotlineBlingApp.obtainImage = function() {
// 	var apiEndpoint = 'https://api.unsplash.com/photos/';
// 	// query strings
// 	// header
// 	var acceptVersion = 'v1';
// 	// parameters
// 	var clientID = '3340e74b359dee24ab6d22a1f0cf6369ec40f0d597baec1f6348ee3b5f4b1f45';
// 	// random page selector
// 	var randomPage = Math.floor((Math.random() * 50) + 1);
// 	console.log(randomPage);
// 	var imagePerPage = 10;
// 	// making ajax call
// 	$.ajax({
// 		url: apiEndpoint+'?page='+randomPage+'&per_page='+imagePerPage+'&client_id='+clientID,
// 		type: 'get',
// 		dataType: 'json',
// 		success: function(data) {
// 			// Console Log the return array
// 			console.log(data);
// 			// Select a random image from the array
// 			var randomPhoto = data[Math.random() * data.length | 0];
// 			// Create an element
// 			var image = document.createElement('img');
// 			// Set attributes to the newly created Element
// 			image.crossOrigin = "Anonymous";
// 			image.src = 'http://crossorigin.me/'+randomPhoto.urls.thumb;
// 			image.id = "photo";
// 			// Append image onto page in order to convert to canvas
// 			$('#photoID').append(image);
// 		},
// 		error: function(data) {
// 			console.log(data);
// 		}
// 	});
// }

hotlineBlingApp.obtainInstagram = function() {
	var apiEndpoint = 'https://api.instagram.com/v1/';
	var tag = 'pantone'
	// query strings
	// parameters
	var clientID = '64809.ead51d4.6efb12510be948588f940f5b3333b7ee';
	// making ajax call
	$.ajax({
		url: apiEndpoint+'tags/'+tag+'/media/recent/?access_token='+clientID,
		type: 'get',
		dataType: 'jsonp',
		success: function(instagram) {
			// Console Log the return array
			var randomPhoto = Math.floor(Math.random() * 20);
			console.log(randomPhoto);
			console.log(instagram);
			var link = instagram.data[randomPhoto].link;
			var thumbnailImage = instagram.data[randomPhoto].images.thumbnail.url;
			console.log('link: '+link);


			// Create an element
			var image = document.createElement('img');
			// Set attributes to the newly created Element
			image.crossOrigin = "Anonymous";
			image.src = 'http://crossorigin.me/'+thumbnailImage;
			image.id = "photo";
			// Append image onto page in order to convert to canvas
			$('#photoID').append(image);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

// Function to get Color Palette by using ColorTheif on images from UnSplash
// hotlineBlingApp.obtainColorPalette = function() {
// 	var sourceImage = document.getElementById('photo');
// 	var colorThief = new ColorThief();
// 	var colors = colorThief.getPalette(sourceImage);
	
// 	// Loop through to obtain the different colour palette.
// 	for (i = 0; i < colors.length; i++) {

// 		var newDiv = document.createElement('div');
// 		newDiv.className= 'color';
// 		$('#colors').append(newDiv);

// 		// Print colors in the console.
// 		var rgbColor = 'rgb('+colors[i]+')';
// 		console.log(rgbColor);

// 		// Print colors on the screen
// 		$('#colors').children().eq(i).css('background', rgbColor);
// 	}
// }


// A function to enchance the colors of the light
hotlineBlingApp.EnhanceColor = function(normalized) {
	if (normalized > 0.04045) {
	   return Math.pow( (normalized + 0.055) / (1.0 + 0.055), 2.4);
	}
	else {
	   return normalized / 12.92;
	}
};


// A function to get XY coordinates of rgb value.
hotlineBlingApp.RGBtoXY = function(r, g, b) {
	rNorm = r / 255.0;
	gNorm = g / 255.0;
	bNorm = b / 255.0;

	rFinal = hotlineBlingApp.EnhanceColor(rNorm);
	gFinal = hotlineBlingApp.EnhanceColor(gNorm);
	bFinal = hotlineBlingApp.EnhanceColor(bNorm);

	X = rFinal * 0.649926 + gFinal * 0.103455 + bFinal * 0.197109;
	Y = rFinal * 0.234327 + gFinal * 0.743075 + bFinal * 0.022598;
	Z = rFinal * 0.000000 + gFinal * 0.053077 + bFinal * 1.035763;

	if (X + Y + Z == 0) {
		return (0,0);
	}
	else {
		xFinal = X / (X + Y + Z);
		yFinal = Y / (X + Y + Z);
		console.log('x=' + xFinal, 'y=' + yFinal);
		return ('x=' + xFinal, 'y=' + yFinal);
	}
};


//Function to emit color to the bulb
hotlineBlingApp.philipHueLightsColor = function() {
	var colorTest = {"xy": [xFinal,yFinal]};
	$.ajax({
		url: lightsEndpoint+hueId+'/'+light3+'/state',
		type: 'put',
		dataType: 'json',
		data: JSON.stringify(colorTest),
		success: function(data) {
			console.log(data);
		},
		error: function(data) {
			alert('nope');
		}
	});
}


// Function to get Dominant Color by using ColorTheif on images from UnSplash
hotlineBlingApp.obtainDominantColor = function() {
	var sourceImage = document.getElementById('photo');
	var colorThief = new ColorThief();
	var colors = colorThief.getColor(sourceImage);
	var rgbColor = 'rgb('+colors+')';
	var r = colors[0];
	var g = colors[1];
	var b = colors[2];
	console.log('r: '+r);
	console.log('g: '+g);
	console.log('b: '+b);
	$('#colors').css('background', rgbColor);
	hotlineBlingApp.RGBtoXY(r, g, b);
	hotlineBlingApp.philipHueLightsColor();
}


// Grab the image from the Unsplash Api and find its main colors
hotlineBlingApp.grabImageAndColor = function() {
	$('#photoID').empty();
	// Obtain the image and run colour theif after one second of obtaining image
	// hotlineBlingApp.obtainImage();
	hotlineBlingApp.obtainInstagram();
	setTimeout(function(){
		// hotlineBlingApp.obtainColorPalette();
		hotlineBlingApp.obtainDominantColor();
	}, 1000);
}


// Loop through to obtain images and it's color value automatically
hotlineBlingApp.loop = function() {
	var loop = 100;
	var lightDuration = 5000;
	hotlineBlingApp.philipHueLightsOn();
	for (i=0; i < loop; i++) {
		(function(ind) {
			setTimeout(function(){
				$('#photoID').empty();
				hotlineBlingApp.grabImageAndColor();
			}, 500 + (lightDuration * ind));
		})(i);
	}
}


// Function in control of the Philips Hue Lights
var lightsEndpoint = 'http://192.168.0.39/api/';
var hueId = '341f606a74cc8af9473089711f7576a';
var light1 = 'lights/1';
var light2 = 'lights/2';
var light3 = 'lights/3';

hotlineBlingApp.philipHueLightsInfo = function() {
	$.ajax({
		url: lightsEndpoint+hueId+'/config',
		type: 'get',
		dataType: 'json',
		success: function(data) {
			console.log(data);
		},
		error: function(data) {
			console.log(data);
		}
	});
}

// Turn lights On
hotlineBlingApp.philipHueLightsOn = function() {
	var lightsOn = {"on": true };
	$.ajax({
		url: lightsEndpoint+hueId+'/'+light3+'/state',
		type: 'put',
		dataType: 'json',
		data: JSON.stringify(lightsOn),
		success: function(data) {
			console.log(data);
		},
		error: function(data) {
			alert('nope');
		}
	});
}


// Turn lights Off
hotlineBlingApp.philipHueLightsOff = function() {
	var lightsOff = {"on": false };
	$.ajax({
		url: lightsEndpoint+hueId+'/'+light3+'/state',
		type: 'put',
		dataType: 'json',
		data: JSON.stringify(lightsOff),
		success: function(data) {
			console.log(data);
		},
		error: function(data) {
			alert('nope');
		}
	});
}

