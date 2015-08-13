/* global XMLHttpRequest, L, moment */
'use strict';

/**
 * How many recently published images to display?
 */
var scenesToFetch = 10;

/**
 * A valid Mapbox token.
 */
var accessToken = 'INSERT_VALID_TOKEN';

/**
 * How long to wait between switching published images? 30 seconds seems good.
 */
var sceneSwitchTime = 30 * 1000;

/**
 * How often to refresh the page to get new imagery? Every 2 hours seems
 * appropriate.
 */
var scenesRefreshTime = 2 * 60 * 60 * 1000;

/**
 * The API base URL
 */
var baseURL = 'https://api.astrodigital.com/v1/';

/**
 * The Mapbox URL format for tiled images.
 */
var mbUrl = 'https://{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}';

/**
 * These are all global variables that don't need editing.
 */
var map;
var currentScene;
var currentScenes = [];
var sceneIndex = 0;

/**
 * Calls out to the API to get bounds and center for a given scene and adds
 *  it to the scene object.
 * @param {object} scene - a valid scene object to get bounds for.
 * @param {function} cb - A callback to denote completion.
 */
var getSceneBounds = function (scene, cb) {
  // If we already have bounds on the scene, we do not need to call out to the
  // API again.
  if (scene.bounds) {
    return cb();
  }

  // Request bounds information from the API
  var request = new XMLHttpRequest();
  request.onload = function () {
    var data = JSON.parse(this.responseText).results[0];
    var sw = [data.lowerLeftCornerLatitude, data.lowerLeftCornerLongitude];
    var ne = [data.upperRightCornerLatitude, data.upperRightCornerLongitude];
    var bounds = L.latLngBounds(sw, ne);
    scene.bounds = bounds;
    scene.sceneCenterLongitude = data.sceneCenterLongitude;
    scene.sceneCenterLatitude = data.sceneCenterLatitude;
    cb();
  };
  var searchURL = baseURL + 'search/?search=' + scene.scene_id;
  request.open('GET', searchURL, true);
  request.send();
};

/**
 * Calls out to the API to get the latest published scenes, making multiple
 * requests if needed to ensure it gets enough images.
 * @param {function} cb - A callback with response cb(scenes)
 */
var getLatestScenes = function (cb) {
  var scenes = [];

  // Get list of scenes from the API
  var getScenes = function (url, cb) {
    var request = new XMLHttpRequest();
    request.onload = function () {
      var data = JSON.parse(this.responseText);
      cb(data.results, data.previous);
    };
    request.open('GET', url, true);
    request.send();
  };

  // Add received scenes to the total and see if we have enough. If we don't,
  // keep on requesting more. If we do, do some data formating to turn it into
  // what we want for display.
  var handleAPIResponse = function (data, previous) {
    // Add new scenes to previous array.
    scenes.push.apply(scenes, data);

    // Check to see if we have enough results, if not, keep
    // loading previous pages to get to the number we want.
    var numberOfScenes = scenes.length;
    if (numberOfScenes < scenesToFetch) {
      // Moar scenes!
      getScenes(previous, handleAPIResponse);
    } else {
      // We have enough images, now sort them in reverse chronological order
      scenes.sort(function compare (a, b) {
        if (a.time_requested > b.time_requested) {
          return -1;
        }
        if (a.time_requested < b.time_requested) {
          return 1;
        }
        return 0;
      });

      // Remove any scenes that aren't yet ready
      var readyScenes = [];
      for (var i = 0; i < scenes.length; i++) {
        if (scenes[i].ready) {
          readyScenes.push(scenes[i]);
        }
      }
      scenes = readyScenes;

      // And trim to total number we want
      scenes = scenes.splice(0, scenesToFetch);
      if (cb && typeof cb === 'function') {
        cb(scenes);
      }
    }
  };

  var scenesURL = baseURL + 'scenes?page=last';
  getScenes(scenesURL, handleAPIResponse);
};

/**
 * Adds a new layer to the map, moves to it and removes previous layer.
 * @param {object} scene - a valid scene object to display.
 */
var displayScene = function (scene) {
  // Add new scene to the map
  var newScene = L.tileLayer(mbUrl, {id: scene.map_id, token: accessToken});
  newScene.addTo(map);
  map.fitBounds(scene.bounds, { animate: true, padding: [50, 50] });

  // Set info box content
  setInfo(scene);

  // Remove old layer
  if (map.hasLayer(currentScene)) {
    map.removeLayer(currentScene);
  }

  // Update current scene
  currentScene = newScene;
};

/**
 * Update the information in the on-screen info box.
 * @param {object} scene - a valid scene object to display info for.
 */
var setInfo = function (scene) {
  document.getElementById('location').innerHTML = scene.sceneCenterLongitude +
    ', ' + scene.sceneCenterLatitude;
  document.getElementById('satellite').innerHTML = scene.satellite.name;
  document.getElementById('method').innerHTML = scene.process_method.name;
  var date = scene.scene_id.substring(9, 16);
  var mo = moment(date, 'YYYYDDD');
  var dateString = mo.format('MMMM D, YYYY');
  document.getElementById('date-captured').innerHTML = dateString;
};

/**
 * Loop over each of the recently published scenes and display it, forever...
 */
var playScenes = function () {
  getSceneBounds(currentScenes[sceneIndex], function () {
    displayScene(currentScenes[sceneIndex]);
  });
  setTimeout(function () {
    sceneIndex++;
    if (sceneIndex >= currentScenes.length) {
      sceneIndex = 0;
    }
    playScenes();
  }, sceneSwitchTime);
};

/**
 * Initialize the map and add a baselayer.
 */
var initMap = function () {
  // Create new Leaflet map and set initial view
  map = new L.Map('map', { zoomControl: false }).setView([0, 0], 8);

  // Add base layer
  L.tileLayer(mbUrl, {id: 'astrodigital.00ffdda1', token: accessToken, minZoom: 4, maxZoom: 12}).addTo(map);
};
initMap();

/**
 * This is where we kick everything off. Start by grabbing the latest scenes.
 */
getLatestScenes(function (scenes) {
  currentScenes = scenes;
  playScenes();
});

/**
 * For long-term display purposes, we just have the page refresh every so often
 * to make sure we are always getting the latest images.
 */
setInterval(function () {
  getLatestScenes(function (scenes) {
    currentScenes = scenes;
  });
}, scenesRefreshTime);
