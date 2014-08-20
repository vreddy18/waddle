angular.module('waddle.map', [])
  .controller('MapController', function ($scope, $state, $stateParams, $q, Auth, UserRequests, $rootScope, MapFactory) {
    
    //an alternative to reloading the entire view
/*    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
      if (toState.name === 'map' && fromState.name !=='map'){
        var current = $state.current;
        var params = angular.copy($stateParams)
        $state.transitionTo(current, params, { reload: true, inherit: true, notify: true });
      }
    });*/

    $scope.data = {};
    $scope.data.footprint = {};

    UserRequests.getUserData(window.sessionStorage.userFbID);
    
    Auth.checkLogin()
    .then(function(){

      L.mapbox.accessToken = 'pk.eyJ1Ijoid2FkZGxldXNlciIsImEiOiItQWlwaU5JIn0.mTIpotbZXv5KVgP4pkcYrA';

      $scope.configuredMap = L.mapbox.map('map', 'injeyeo2.i9nn801b', {
        attributionControl: false,
        zoomControl: false,
        worldCopyJump: true,
        minZoom: 2,
        bounceAtZoomLimits: false
      }).setView([20.00, 0.00], 2);

      var shadedCountries = L.mapbox.featureLayer().addTo($scope.configuredMap);
      var aggregatedMarkers = new L.MarkerClusterGroup({showCoverageOnHover: false, disableClusteringAtZoom: 12, maxClusterRadius: 60});
      
      var makeMarker = function (placeName, latLng) {
        var args = Array.prototype.slice.call(arguments, 2);
        var img = args[0];
        var caption = args[1];
        var marker = L.marker(latLng, {
          icon: L.mapbox.marker.icon({
            'marker-color': '1087bf',
            'marker-size': 'large',
            'marker-symbol': 'circle-stroked'
          }),
          title: placeName
        })

        if(img && caption) {
          marker.bindPopup('<h3>' + placeName + '</h3><h4>' + caption + '</h4><img src="' + img + '"/>');
        }
        else if(img) {
          marker.bindPopup('<h3>' + placeName + '</h3><img src="' + img + '"/>');
        }
        else if(caption) {
          marker.bindPopup('<h3>' + placeName + '</h3><h4>' + caption + '</h4>');
        }
        else {
          marker.bindPopup('<h3>' + placeName + '</h3>');
        }
        aggregatedMarkers.addLayer(marker);
      };

      $scope.handleUserCheckinData = function (allUserCheckins) {
        aggregatedMarkers.clearLayers();
        var placeLatLngs;
        var markers = [];
        $scope.inBounds = [];

        $scope.data.currentCheckins = allUserCheckins;

        for(var i = 0; i < allUserCheckins.length; i++) {
          var place = allUserCheckins[i].place;
          var checkin = allUserCheckins[i].checkin;
          var placeLatLng = [place.lat, place.lng];
          var footprint = {checkin:checkin, place:place};

          // $scope.inBounds.push(footprint);
          placeLatLngs ? placeLatLngs.insert(placeLatLng, footprint) : placeLatLngs = new MapFactory.QuadTree(placeLatLng, footprint);

          if(checkin.photoSmall !=='null' && checkin.caption !== 'null') {
            makeMarker(place.name, placeLatLng, checkin.photoSmall, checkin.caption);
          }
          else if(checkin.photoSmall !== 'null') {
            makeMarker(place.name, placeLatLng, checkin.photoSmall);
          }
          else if(checkin.caption !== 'null') {
            makeMarker(place.name, placeLatLng, null, checkin.caption);
          }
          else {
            makeMarker(place.name, placeLatLng);
          }
        }

        return placeLatLngs;
      };

      $scope.configuredMap.addLayer(aggregatedMarkers);
    	// $scope.countriesBeen = [];

     //  var findCountriesBeen = function (allUserCheckins) {
     //    for(var i = 0; i < allUserCheckins.data.length; i++) {
     //      var place = allUserCheckins.data[i].place;
     //      var country = 
     //      if($scope.countriesBeen.indexOf(country) === -1) {
     //        $scope.countriesBeen.push(country);
     //      }
     //      return $scope.countriesBeen;
     //    }
     //  };

      // var addToShadedCountries = function () {
	     //  for(var j = 0; j < $scope.countriesBeen.length; j++) {
	     //    for(var i = 0; i < globalCountryData.features.length; i++){
	     //    var boundaries = globalCountryData.features[i].geometry.coordinates;
		    //     if(globalCountryData.features[i].properties['NAME'] == $scope.countriesBeen[j]) {
		    //       if(globalCountryData.features[i].geometry.type == 'MultiPolygon') {
      //           console.log('hi');
		    //         L.multiPolygon(boundaries, {stroke: false, opacity: 0.7, weight: 10, color:'#000', fillColor: '#000', fillOpacity: 0.7}).addTo(shadedCountries);
		    //       }
		    //       else {
		    //         L.polygon(boundaries, {stroke: false, fillColor: '#000'}).addTo(shadedCountries);
		    //       }
		    //     }
	     //    }
	     //  }
      // }
      // addToShadedCountries();

      if(UserRequests.allData !== undefined) {
        $scope.data.allData = UserRequests.allData.data;
        $scope.data.friends = UserRequests.allData.data.friends; 
        MapFactory.markerQuadTree = $scope.handleUserCheckinData(UserRequests.allData.data.allCheckins);
        $state.go('map.feed');
      } else {
        $state.go('frontpage')
      }	    
	  });
  });


