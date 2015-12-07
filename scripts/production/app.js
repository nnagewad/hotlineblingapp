var hotlineBlingApp = {};


// Obtain image according to a specific tag
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


// Function in control of the Philips Hue Lights
var lightsEndpoint = 'http://192.168.0.39/api/';
var hueId = '341f606a74cc8af9473089711f7576a';
var allLights = 'groups/1/action';
var light1 = 'lights/1/state';
var light2 = 'lights/2/state';
var light3 = 'lights/3/state';

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
		url: lightsEndpoint+hueId+'/'+allLights,
		type: 'put',
		dataType: 'json',
		data: JSON.stringify(lightsOn),
		success: function(data) {
			console.log(data);
		},
		error: function(data) {
			alert('Lost Connection with Philips Hue');
		}
	});
}


// Turn lights Off
hotlineBlingApp.philipHueLightsOff = function() {
	var lightsOff = {"on": false };
	$.ajax({
		url: lightsEndpoint+hueId+'/'+allLights,
		type: 'put',
		dataType: 'json',
		data: JSON.stringify(lightsOff),
		success: function(data) {
			console.log(data);
		},
		error: function(data) {
			alert('Lost Connection with Philips Hue');
		}
	});
}


//Function to emit color to the bulb
hotlineBlingApp.philipHueLightsColor = function() {
	var colorTest = {"xy": [xFinal,yFinal]};
	$.ajax({
		url: lightsEndpoint+hueId+'/'+allLights,
		type: 'put',
		dataType: 'json',
		data: JSON.stringify(colorTest),
		success: function(data) {
			console.log(data);
		},
		error: function(data) {
			alert('Lost Connection with Philips Hue');
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
	hotlineBlingApp.obtainInstagram();
	setTimeout(function(){
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


// Konami code taken from: https://css-tricks.com/snippets/jquery/konomi-code/ 
// Konami code to play Drake's Hotline Bling.
// Simply type "d-r-a-k-e" to play the song
hotlineBlingApp.audio = function () {
	var kkeys = [];
	var drake = '68,82,65,75,69';  // Keys that spell d-r-a-k-e
	var audio = new Audio('audio/hotlineBling.mp3');
	$(document).keydown(function(e) {
		kkeys.push( e.keyCode );
		if ( kkeys.toString().indexOf( drake ) >= 0 ) {
			$(document).unbind('keydown',arguments.callee);
			audio.play();
			$('.controls').append("<button class='pause'>Pause</button>").append("<button class='play'>Play</button>");
		}
	});
	// To pause the audio
	$('.controls').on('click', '.pause', function() {
		audio.pause();
		$('.pause').hide();
		$('.play').show();
	});
	// To play the audio after being paused
	$('.controls').on('click', '.play', function() {
		audio.play();
		$('.play').hide();
		$('.pause').show();
	});
}


hotlineBlingApp.init = function() {
	hotlineBlingApp.audio();
}


$(function() {
	hotlineBlingApp.init();
});