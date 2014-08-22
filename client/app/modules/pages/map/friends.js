(function(){

var FriendsController = function ($scope, $state, UserRequests, MapFactory) {

  if(UserRequests.allData) {
    $scope.allUserFriends = UserRequests.allData.friends;
    console.log($scope.allUserFriends);
  }

  $scope.clickFriend = function (friend) {
    UserRequests.getUserData(friend)
      .then(function (data){
        MapFactory.markerQuadTree = MapFactory.handleUserCheckinData(data.data);
        $state.go('map.feed')
      });
  };
};

FriendsController.$inject = ['$scope', '$state', 'UserRequests', 'MapFactory'];

angular.module('waddle.friends', [])
  .controller('FriendsController', FriendsController);

})();
