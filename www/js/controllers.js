angular.module('starter.controllers', [])

.controller('AuthCtrl', function($scope, $timeout, $ionicModal, $q, $http, $location) {

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/auth.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };


  // Form data for the login modal
  $scope.loginData = {};
  // Perform the login action when the user submits the login form
  $scope.doLogin = () => {
      $location.url('/menu')
  }
  console.log('login fired', $scope.loginData)
  // Simulate a login delay. Remove this and replace with your login
  // code if using a login system
  $timeout(function() {
    $scope.closeLogin();
  }, 1000)



})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/logout.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogout = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.logout = function() {
    $scope.modal.show();
  };


})

.controller('FormCtrl', function($scope, $location, firebaseFactory) {
  //empty object
  $scope.day = {}

  //takes input values and creates a "day" object in firebase
  $scope.createForm = () => {
    console.log($scope.day);
    firebaseFactory.postForm($scope.day)
    .then(() => {
      $scope.city = $scope.day.city
      console.log($scope.city);
    })
    .then(() => $scope.day = {})
  }

  //takes user to see their day
  $scope.goToDay = () => {
    console.log("got to day");
    console.log($scope.city);
    $location.url(`/app/trips/${$scope.city}/spots`);
  }

})

.controller('TripsCtrl', function($scope, arrFactory, firebaseFactory){

  // empty array will store all city values from object
  let allCities = [];

  //gets all destinations and sets them to values
  firebaseFactory.getForm()
    .then((val) => {
      //stores returned data in variable
      let allDestinations = val.data.destination
      //takes all objects and extracts all instince values of city key
      angular.forEach(allDestinations, (k, v) => {
        //pushes all cities to array
        allCities.push(k.city)
        //filters 1 instince per city
        $scope.cities = arrFactory.cleanArr(allCities)
      })
    })

})

.controller('CityCtrl', function($scope, $stateParams ,firebaseFactory){

  $scope.currentCity = $stateParams.city
})

.controller('SpotCtrl', function($scope, $stateParams, firebaseFactory){
  $scope.currentCity = $stateParams.city
  let destArr = [];

  firebaseFactory.getForm()
    .then((val) => {
      let allDestinations = val.data.destination


      angular.forEach(allDestinations, (v, k) => {
        if (v.city === $scope.currentCity) {
          //push days to user for card iteration
          destArr.push(v)
        }
      })
      $scope.dest = destArr
    })



})
.controller('InfoCtrl', function($scope, $stateParams, firebaseFactory){

  $scope.currentCity = $stateParams.city

  $scope.obj = {
    city : $scope.currentCity
  };

  $scope.addInfo = () => {
    console.log($scope.obj.infonote);
    firebaseFactory.postInfo($scope.obj)
    .then(() => $scope.obj.infonote = null)
  }

})
