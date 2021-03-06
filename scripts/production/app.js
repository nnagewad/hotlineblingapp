var hotlineBlingApp = {};
var $photoID = $('#photoID');
var $philipsHue = $('.philips-hue');
var $colors = $('#colors');
var $body = $('body');
var $owl = $('.owl');
var $button = $('button');
var $pause = $('.pause');
var $play = $('.play');
var $yolo = $('.yolo');
var $off = $('.off');
var loop;

// Obtain image according to a specific tag
hotlineBlingApp.obtainInstagram = function() {
	var apiEndpoint = 'https://api.instagram.com/v1/';
	var tag = 'hotlineblingapp'
	// query strings
	// parameters
	var clientID = '64809.ead51d4.6efb12510be948588f940f5b3333b7ee';
	// making ajax call
	$.ajax({
		url: apiEndpoint+'tags/'+tag+'/media/recent/?access_token='+clientID,
		type: 'GET',
		dataType: 'jsonp',
		success: function(instagram) {
			// Console Log the return array
			var randomPhoto = Math.floor(Math.random() * 20);
			var instagramData = instagram.data[randomPhoto];
			var link = instagramData.link;
			var instagramDataImages = instagramData.images;
			var thumbnailImage = instagramDataImages.thumbnail.url;
			var lowResolution = instagramDataImages.low_resolution.url;
			var standardResolution = instagramDataImages.standard_resolution.url;
			// Create an element
			var image = document.createElement('img');
			// Set attributes to the newly created Element
			image.crossOrigin = "Anonymous";
			image.src = 'http://crossorigin.me/'+lowResolution;
			image.id = "photo";
			// Append image onto page in order to convert to canvas
			$photoID.append(image);
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
		// console.log('x=' + xFinal, 'y=' + yFinal);
		return ('x=' + xFinal, 'y=' + yFinal);
	}
};


// Function in control of the Philips Hue Lights
var ipAddress;
var hueId = '341f606a74cc8af9473089711f7576a';
// This affects all the lights.
var allLights = 'groups/1/action';
// Individual lights - start
var light1 = 'lights/1/state';
var light2 = 'lights/2/state';
var light3 = 'lights/3/state';
// Individual lights - end


// Find the IP to the Philips Hue Bridge
hotlineBlingApp.getIPAddress = function() {
	$.ajax({
		url: 'https://www.meethue.com/api/nupnp',
		dataType: 'json',
		type: 'get',
		success: function(hueBridge) {
			ipAddress = hueBridge[0].internalipaddress;
			return ipAddress;
		},
		error: function() {
			$philipsHue.show();
		}
	});
};


// Obtain information on the Philips Hue Light
hotlineBlingApp.philipHueLightsInfo = function() {
	$.ajax({
		url: 'http://'+ipAddress+'/api/'+hueId+'/config',
		type: 'get',
		dataType: 'json',
		success: function(data) {
			console.log(data);
		},
		error: function(data) {
			$philipsHue.show();
		}
	});
}


// Turn lights On
hotlineBlingApp.philipHueLightsOn = function() {
	var lightsOn = {"on": true };
	$.ajax({
		url: 'http://'+ipAddress+'/api/'+hueId+'/'+allLights,
		type: 'put',
		dataType: 'json',
		data: JSON.stringify(lightsOn),
		error: function(data) {
			$philipsHue.show();
		}
	});
}


// Turn lights Off
hotlineBlingApp.philipHueLightsOff = function() {
	var lightsOff = {"on": false };
	$.ajax({
		url: 'http://'+ipAddress+'/api/'+hueId+'/'+allLights,
		type: 'put',
		dataType: 'json',
		data: JSON.stringify(lightsOff),
		error: function(data) {
			$philipsHue.show();
		}
	});
}


//Function to emit color to the bulb
hotlineBlingApp.philipHueLightsColor = function() {
	var bulbColors = {"xy": [xFinal,yFinal]};
	$.ajax({
		url: 'http://'+ipAddress+'/api/'+hueId+'/'+allLights,
		type: 'put',
		dataType: 'json',
		data: JSON.stringify(bulbColors),
		error: function(data) {
			$philipsHue.show();
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
	// Color of font changes based on background color
	$button.mouseenter(function() {
		$(this).css('color',rgbColor);
	});
	// Color of font reverts back to white on mouse leave.
	$button.mouseleave(function() {
		$(this).css('color','white');
	});
	$colors.css('background', rgbColor);
	hotlineBlingApp.RGBtoXY(r, g, b);
	hotlineBlingApp.philipHueLightsColor();
}


// Grab the image from the Unsplash Api and find its main colors
hotlineBlingApp.grabImageAndColor = function() {
	$photoID.empty();
	// Obtain the image and run colour theif after one second of obtaining image
	hotlineBlingApp.obtainInstagram();
	setTimeout(function(){
		hotlineBlingApp.obtainDominantColor();
	}, 1000);
}


// Grab images from Instagram every 5 seconds
hotlineBlingApp.interval = function() {
	loop = setInterval(function() {
		$body.addClass('lights-on');
		$button.addClass('lights-on-button');
		hotlineBlingApp.philipHueLightsOn();
		$photoID.empty();
		hotlineBlingApp.grabImageAndColor();
	}, 5000);
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
			$pause.css('display','inline-block');
			$yolo.hide();
			$owl.addClass('pulsing-owl');
			hotlineBlingApp.interval();
		}
	});
	// To pause the audio
	$pause.on('click', function() {
		audio.pause();
		$(this).hide();
		$play.css('display','inline-block');
		hotlineBlingApp.philipHueLightsOff();
		clearInterval(loop);
	});
	// To play the audio after being paused
	$play.on('click', function() {
		audio.play();
		$(this).hide();
		$pause.css('display','inline-block');
		hotlineBlingApp.philipHueLightsOn();
		hotlineBlingApp.interval();
	});

	// When the song ends stop getting images from instagram.  Turn off the lights, hide music playback buttons, show yolo button and return to regular color scheme.
	$(audio).bind("ended", function(){
		hotlineBlingApp.completeShutDown();
		$play.hide();
		$pause.hide();
		$yolo.css('display','inline-block');
	});
}


// Yolo Button
hotlineBlingApp.yoloButton = function() {
	$yolo.on('click', function() {
		$owl.addClass('pulsing-owl');
		hotlineBlingApp.interval();
		$(this).hide();
		$off.css('display','inline-block');
	});
}


// Off button
hotlineBlingApp.offButton = function() {
	$off.on('click', function() {
		$(this).hide();
		$yolo.show();
		hotlineBlingApp.completeShutDown();
	});
}

hotlineBlingApp.completeShutDown = function() {
	clearInterval(loop);
	$photoID.empty();
	hotlineBlingApp.philipHueLightsOff();
	$colors.css('background','black');
	$body.removeClass('lights-on');
	$button.removeClass('lights-on-button');
	$button.mouseenter(function() {
		$(this).css('color','black');
	});
	$button.mouseleave(function() {
		$(this).css('color','#a39161');
	});
	$owl.removeClass('pulsing-owl');
	$owl.appendTo('#photoID');
}


hotlineBlingApp.init = function() {
	hotlineBlingApp.getIPAddress();
	hotlineBlingApp.audio();
	hotlineBlingApp.yoloButton();
	hotlineBlingApp.offButton();
}


$(function() {
	hotlineBlingApp.init();
});