contrl.controller('GoogleMapCtrl', function($scope, $state, $stateParams, $cordovaGeolocation, gooGeoFactory, btnFactory) {

  // gooGeoFactory.distMtx()
  $scope.goToMenu = ()=>{
    $state.go('app.trips')
  }

  //sets high accuracy
  let options = {timeout: 10000, enableHighAccuracy: true};

  //DEVICE LOCATION: gets ^ options then it fires a function with a position of device
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    //sets device location to a google lat-lng and saves it as a variable
    let currentLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    // gooGeoFactory.geoCode(position.coords.latitude, position.coords.longitude)

    // establishes current options for current view
    let mapOptions = {
      center: currentLatLng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.HYBRID
    };


    //NEW MAP:  sets options and display target for a new map to scope
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);


    //DROPS MARKER: drops marker on current location
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){
      let marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: currentLatLng
      });

      google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open($scope.map, marker);
      });
    });


    //SEE Day:
    var centerControlDiv = document.createElement('div');
    var centerControl = new btnFactory.CenterControl(centerControlDiv, $scope.map);
    centerControlDiv.index = 1;
    centerControlDiv.setAttribute('class', 'see-day-btn')
    centerControlDiv.setAttribute('id', 'goToDay')
    centerControlDiv.addEventListener('click', function() {
      $state.go('app.spots')
    });
    $scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);


  },
  //runs if cordova geolocation doesnt get current location
  function(error){
    console.log("Could not get location");
  });


  //attaches autho complete to imnput field
  const userSearchField = document.getElementById('autocomplete')
  $scope.clearSearchField = () => { userSearchField.value = " " }

  const ac = new google.maps.places.Autocomplete(userSearchField);
  google.maps.event.addListener(ac, 'place_changed', function() {
    let place = ac.getPlace();
    console.log(place);
    searchMarker = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng())
    dropPin(searchMarker, place);

  })

  function dropPin(location, place) {
    console.log(location);

      var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: location
      });

      let infoWindow = new google.maps.InfoWindow({
          content: renderInfoWindow(place.name, place.formatted_address, place.formatted_phone_number, place.website, place.place_id)
      });

      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open($scope.map, marker);
      });

      google.maps.event.addListener(marker, 'dblclick', function () {
        console.log("db");
        marker.setMap(null);
      });

  }


  //creates custom infowindow and obj to push user choice to their spot
  function renderInfoWindow(name, adr, phn ,web, o) {
    console.log(o);
    let spot = {}

    let infoView = document.createElement('div');

      let h = document.createElement('h3');
      h.innerText = `${name}`;
      infoView.append(h);

      let add = document.createElement('p');
      add.innerText = `${adr}`;
      infoView.append(add)

      let phone = document.createElement('p');;
      phone.innerText = `${phn}`;
      infoView.append(phone);

      let website = document.createElement('a');
      website.setAttribute('href', `${web}`);
      website.innerText = "website";
      infoView.append(website);

      let info = document.createElement('button');
      info.innerText = 'i';
      info.setAttribute('class', 'btn');

      info.addEventListener('click', () => {
        spot.details = `${name} : ${adr} : ${phn} : ${web}`
        spot.uid = firebase.auth().currentUser.uid;
        spot.trip = $stateParams.trip
        firebase.database().ref('info').push(spot)

        .then(()=>{
          alert('You Added ' + name + ' to info')
          document.getElementById('goToDay').className = ''
        })
        .then(()=>{
          spots = {}
          console.log(spots);
        })
      })
      infoView.append(info);

    let b = document.createElement('br')
    infoView.append(b)

    let footer = document.createElement('form')
    footer.setAttribute('class', 'infoViewFooter')


      let timeLabel = document.createElement('h5')
      timeLabel.innerText = "Travel Time"
      footer.append(timeLabel)

      const arr = ['', 0.5, 1, 2, 3, 4, 5];
      let select = document.createElement('select')
      select.setAttribute('required', 'required')

      for (var i = 0; i < arr.length; i++) {
        let option = document.createElement('option');
           option.value = arr[i];
           option.text = arr[i];
           select.append(option);
      }
      footer.append(select)

      let travelTime = document.createElement('h5')
      travelTime.innerText = "Time Spent"
      footer.append(travelTime)

      const arr2 = ['', 1, 2, 3, 4, 5];
      let select2 = document.createElement('select')
      select2.setAttribute('required', 'required')

      for (var i = 0; i < arr2.length; i++) {
        let option2 = document.createElement('option');
           option2.value = arr2[i];
           option2.text = arr2[i];
           select2.append(option2);
      }
      footer.append(select2)

      let button = document.createElement('button');
      button.setAttribute('class', 'btn');
      button.innerText = 'Add';
      button.addEventListener('click', () => {
        spot.name = name
        spot.pid = o
        spot.destTime = select2.value
        spot.travelTime = select.value
        spot.trip = $stateParams.trip
        spot.uid = firebase.auth().currentUser.uid;
        firebase.database().ref('spots').push(spot)

        .then(()=>{
          if (select.value > 0) {
            alert('You Added ' + spot.name + ' to spots')
            document.getElementById('goToDay').className = ''
          }
        })
      })
      footer.append(button);

    infoView.append(footer)

    return infoView;
  }



});
