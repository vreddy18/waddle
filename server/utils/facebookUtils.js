var https = require('https');
var qs = require('querystring');
var Q = require('q');
var _ = require('lodash');

var utils = {};

//FACEBOOK HELPER METHODS

utils.exchangeFBAccessToken = function (fbToken) {
  var deferred = Q.defer();

  var query = {
    grant_type: 'fb_exchange_token',
    client_id: process.env.WADDLE_FACEBOOK_APP_ID,
    client_secret: process.env.WADDLE_FACEBOOK_APP_SECRET,
    fb_exchange_token: fbToken
  };

  var queryPath = 'https://graph.facebook.com/oauth/access_token?' + qs.stringify(query);

  https.get(queryPath, function (res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function () {
      deferred.resolve(qs.parse(data));
    })

  }).on('error', function (e) {
    deferred.reject(e);
  });

  return deferred.promise;
};


utils.getFBTaggedPlaces = function (user) {
  var deferred = Q.defer();

  var fbID = user.getProperty('facebookID');
  var fbToken = user.getProperty('fbToken');
  
  var query = {
    access_token: fbToken
  };

  var queryPath = 'https://graph.facebook.com/'+fbID+'/tagged_places?' + qs.stringify(query);

  https.get(queryPath, function (res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function () {
      deferred.resolve(JSON.parse(data));
    })

  }).on('error', function (e) {
    deferred.reject(e);
  });

  return deferred.promise;
};

utils.getFBPhotos = function (user) {
  var deferred = Q.defer();

  var fbID = user.getProperty('facebookID');
  var fbToken = user.getProperty('fbToken');

  var query = {
    access_token: fbToken
  };

  var queryPath = 'https://graph.facebook.com/'+fbID+'/photos?' + qs.stringify(query);

  var photoContainer = [];

  deferred.resolve(utils.makeFBPhotosRequest(queryPath, photoContainer));

  return deferred.promise;
};

utils.makeFBPhotosRequest = function (queryPath, photoContainer) {
  var deferred = Q.defer();

  https.get(queryPath, function (res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function () {
      var dataObj = JSON.parse(data);

      photoContainer.push(dataObj.data)

      if (! dataObj.paging) {
        deferred.resolve(_.flatten(photoContainer, true));
      } else {
        deferred.resolve(utils.makeFBPhotosRequest(dataObj.paging.next, photoContainer));
      }
    })

  }).on('error', function (e) {
    deferred.reject(e);
  });

  return deferred.promise;
};

utils.parsePhotoList = function (userFBPhotoData, photoList) {

  _.each(photoList, function (photo) {
    if (photo.place) {
      var place = {
        'name': photo.place.name,
        'lat': photo.place.location.latitude,
        'lng': photo.place.location.longitude,
        'checkinTime': new Date(photo.created_time)
      }

      if (photo.likes) {
        place.likes = photo.likes.data.length;
      }
      
      // do stuff here to pluck out relevant fields
      userFBPhotoData.push(place);
    }
  });

  return userFBPhotoData;
};

utils.parseCheckinData = function (userFBCheckinData, checkinList) {

  _.each(checkinList, function (checkin) {
      var place = {
        'name': checkin.place.name,
        'lat': checkin.place.location.latitude,
        'lng': checkin.place.location.longitude,
        'checkinTime': new Date(checkin.created_time)
      }
      // do stuff here to pluck out relevant fields
      userFBCheckinData.push(place);
  });

  return userFBCheckinData;
};

utils.integrateFBPhotosAndCheckins = function (user, photoData, checkinData) {
  
};

module.exports = utils;