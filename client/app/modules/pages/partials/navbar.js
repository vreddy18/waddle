(function(){

var NavbarController = function (Auth, $rootScope, $scope, UserRequests, MapFactory, $state, $dropdown, FootprintRequests){
  $scope.logout = Auth.logout;

  $scope.loadBucketlist = function () {
    UserRequests.getBucketList(window.sessionStorage.userFbID)
      .then(function (BucketData) {
        console.log(BucketData);
        // Because the navbar controller does not inherit the map or feed scope,
        // current map has to be retrieved from MapFactory.  This is used to set the inbounds 
        // immediately when 'my bucketlist' is clicked
        MapFactory.markerQuadTree = MapFactory.handleUserCheckinData(BucketData.data);
        var bounds = MapFactory.currentMap.getBounds()
        MapFactory.filterFeedByBounds(bounds)
        $state.go('map.feed');
      });
  };
  
  if (UserRequests.allData) {
    $scope.photo = UserRequests.allData.fbProfilePicture;
    $scope.name = UserRequests.allData.name;
  }

  $scope.loadAggregatedFootprints = function () {
    UserRequests.getAggregatedFeedData(window.sessionStorage.userFbID)
      .then(function (aggregatedFootprints) {
        console.log(aggregatedFootprints.data);
        MapFactory.markerQuadTree = MapFactory.handleUserCheckinData(aggregatedFootprints.data);
        var bounds = MapFactory.currentMap.getBounds();
        MapFactory.filterFeedByBounds(bounds);
        $state.go('map.feed'); 
    });
  };

  $scope.loadFootprint = function (notification) {
    console.log("loading notifications!!: ", notification);
    $scope.$root.$broadcast("displayFootprint", notification);
    // $scope.footprint = {checkin: notification.checkin, place: notification.place};
    // var checkinID = notification.checkin.checkinID;

    // FootprintRequests.openFootprint = notification;

    // FootprintRequests.getFootprintInteractions(checkinID)
    // .then(function (data) {
    //   FootprintRequests.currentFootprint = data.data;
    //   $scope.selectedFootprintInteractions = FootprintRequests.currentFootprint;
    // });
  }

  $scope.loadNotifications = function () {
    var notifications;
    UserRequests.fetchNotifications(window.sessionStorage.userFbID)
    .then(function (notifications) {
      notifications = notifications.data;
      generateNotificationsDropdown(notifications);
      if(notifications.length > 0) {
        $scope.unreadNotificationsCount = notifications.length;
      }
    });
  }

  $scope.loadNotifications();

  $scope.removeUnreadNotificationsCount = function () {
    $scope.unreadNotificationsCount = null;
  }

  var generateNotificationsDropdown = function(notifications) {
    $scope.notificationsDropdown = [];
    var dropdownItem = {};
    for(var i = 0; i < notifications.length; i++) {
      dropdownItem.text = '<p class="fa fa-download"></p>&nbsp;' + notifications[i].commenter.name + " commented on your footprint at " + notifications[i].place.name;
      // dropdownItem.click = 'loadFootprint(' + JSON.stringify(notifications[i]) + ')';
      dropdownItem.href = "/#/map/feed/" + notifications[i].checkin.checkinID;
      $scope.notificationsDropdown.push(dropdownItem);
    }
    console.log($scope.notificationsDropdown);
  }

  // var myDropdown = $dropdown(element, {title: 'blah', content: 'bsadsda'});

  $scope.dropdown = [
    {"text": '<p class="fa fa-download"></p>&nbsp;Friends', "href": '/#/map/friends'},
    {"text": '<p class="fa fa-globe"></p>&nbsp;Add Social', "href": '/#/map/providers'},
    {divider: true},
    {"text": '<p class="fa fa-download"></p>&nbsp;Log Out', "click": 'logout()'}
  ];
}

//Inject all the dependent services needed by the controller
NavbarController.$inject = ['Auth', '$rootScope', '$scope', 'UserRequests', 'MapFactory', '$state', '$dropdown', 'FootprintRequests'];

angular.module('waddle.navbar', [])
  .controller('NavbarController', NavbarController);

})();
