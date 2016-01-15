'use strict';

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$http', 'leafletData', '$stateParams', '$location', 'Authentication', 'Reports',
  function ($scope, $http, leafletData, $stateParams, $location, Authentication, Reports) {
    $scope.center = {}; 
    angular.extend($scope, {
      center: {
        lat: 43,
        lng: 14,
        zoom: 5
      }
    });

    $scope.authentication = Authentication;

    // Create new Report
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'reportForm');

        return false;
      }

      // Create new Report object
      var report = new Reports({
        lat: this.lat,
        lng: this.lng,
        city: this.city,
        voltage: this.voltage
      });

      // Redirect after save
      report.$save(function (response) {
        $location.path('reports/' + response._id);

        // Clear form fields
        $scope.lat = '';
        $scope.lng = '';
        $scope.city = '';
        $scope.voltage = '';

      }, 
      function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Report
    $scope.remove = function (report) {
      if (report) {
        report.$remove();

        for (var i in $scope.reports) {
          if ($scope.reports[i] === report) {
            $scope.reports.splice(i, 1);
          }
        }
      } else {
        $scope.report.$remove(function () {
          $location.path('reports');
        });
      }
    };

    // Update existing Report
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'reportForm');

        return false;
      }

      var report = $scope.report;

      report.$update(function () {
        $location.path('reports/' + report._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Reports
    $scope.find = function () {
      $scope.reports = Reports.query();
    };

    // Shows the retrieved list of Reports in map
    $scope.findMap = function () {



      $scope.today = function() {
        $scope.dt = new Date("2012-01");
      };
      $scope.today();

      $scope.clear = function() {
        $scope.dt = null;
      };

      // Disable weekend selection
      $scope.disabled = function(date, mode) {
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
      };

      $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date("2012-01-01");
      };

    

      $scope.toggleMin();
      $scope.maxDate = new Date("2012-12-31");
      $scope.initDate = new Date("2012-01-01");


      $scope.setDate = function(year, month, day) {
        $scope.dt = new Date(year, month, day);
      };

      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];
      $scope.altInputFormats = ['M!/d!/yyyy'];

      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      var afterTomorrow = new Date();
      afterTomorrow.setDate(tomorrow.getDate() + 1);
      $scope.events =
      [
        {
          date: tomorrow,
          status: 'full'
        },
        {
          date: afterTomorrow,
          status: 'partially'
        }
      ];
      $scope.getDayClass = function(date, mode) {
        if (mode === 'day') {
          var dayToCheck = new Date(date).setHours(0,0,0,0);

          for (var i = 0; i < $scope.events.length; i++) {
            var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

            if (dayToCheck === currentDay) {
              return $scope.events[i].status;
            }
          }
        }

        return '';
      };





      var configuration = 'regions';
      var reportsLoaded = new Promise(function(resolve, reject) {
        
        $scope.reports = Reports.query();
        
        setTimeout(function() {
          resolve($scope.reports);
          console.log ('Promise resolved.');
        }, 10000);

      });

      reportsLoaded.then(function(reports) {

        //for (var report in reports) {

        var report;
        var marker;
        
        $scope.piemonteMarkers = [];
        $scope.aostaMarkers = [];
        $scope.lombardiaMarkers = [];
        $scope.trentinoMarkers = [];
        $scope.venetoMarkers = [];
        $scope.friuliMarkers = [];
        $scope.liguriaMarkers = [];
        $scope.emiliaMarkers = [];
        $scope.toscanaMarkers = [];
        $scope.umbriaMarkers = [];
        $scope.marcheMarkers = [];
        $scope.lazioMarkers = [];
        $scope.abruzzoMarkers = [];
        $scope.moliseMarkers = [];
        $scope.campaniaMarkers = [];
        $scope.pugliaMarkers = [];
        $scope.basilicataMarkers = [];
        $scope.calabriaMarkers = [];
        $scope.siciliaMarkers = [];
        $scope.sardegnaMarkers = [];

        var icons = {
          green: {
            type: 'div',
            iconSize: [10, 10],
            className: 'green',
            iconAnchor:  [5, 5]
          },

          orange: {
            type: 'div',
            iconSize: [10, 10],
            className: 'orange',
            iconAnchor:  [5, 5]
          },

          red: {
            type: 'div',
            iconSize: [10, 10],
            className: 'red',
            iconAnchor:  [5, 5]
          }
        };
        //medie regionali
        var efficiency_regions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var efficiency_sum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var avgs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (report=0; report<1000; report++) { //16000

          var lat = (reports[report].lat).replace(',','.');
          var lng = (reports[report].lng).replace(',','.');
          
          var expected = reports[report].expected;
          var actual = reports[report].actual;
          var efficiency = expected - actual;
          
          var period_from = reports[report].period_from;
          var date = new Date(period_from);
          var year = date.getYear();
          var month = date.getMonth() + 1;

          //aggiungo report ai vettori
          var indexRegions = getRegionCode(reports[report].region);
          //console.log("------------indici " + indexRegions);
          efficiency_regions[indexRegions - 1] = efficiency_regions[indexRegions - 1] + efficiency;
          efficiency_sum[indexRegions - 1]++;

          if (efficiency > 0) {
            marker = { 
              lat: parseFloat(lat), 
              lng: parseFloat(lng), 
              focus: true, 
              message: "<b>Centro di misurazione: " + reports[report].city + "</b><br>Provincia: " + reports[report].province + "<br>Voltaggio: " + reports[report].voltage + "<br>Valore atteso: " + reports[report].expected + "<br>Valore attuale: " + reports[report].actual + "<br>Efficienza: " + efficiency,
              draggable: true, 
              icon: icons.green, 
              month: month, 
              year: year 
            };
          }
          else {
            marker = { 
              lat: parseFloat(lat), 
              lng: parseFloat(lng), 
              focus: true, 
              message: "<b>Centro di misurazione: " + reports[report].city + "</b><br>Provincia: " + reports[report].province + "<br>Voltaggio: " + reports[report].voltage + "<br>Valore atteso: " + reports[report].expected + "<br>Valore attuale: " + reports[report].actual + "<br>Efficienza: " + efficiency,
              draggable: true, 
              icon: icons.red 
            };
          }

          if (month === 1) {
            addMarkerToRegion(indexRegions, report, marker);
          }
         
        }
        //stampa di prova per gli array
        console.log(efficiency_regions);
        console.log(efficiency_sum);
        for (var i = 0; i < avgs.length; i++){
          if (efficiency_sum[i] !== 0) {
            avgs[i] = efficiency_regions[i] / efficiency_sum[i];
          }
        }
        console.log(avgs);

        $http.get('modules/core/client/geoJson/regioni.geojson').success(function(data, status) {
          for (var i = 0; i < avgs.length; i++){
            console.log(data.features[i].properties);
            data.features[i].properties.average = avgs[i];
            console.log(data.features[i].properties);
          }
          angular.extend($scope, {
            geojson: {
              data: data,
              style: style,
              onEachFeature: onEachFeature
            }
          });
        });

        $scope.$apply(function(){
          $scope.markers = [];
        });

      });
      
    }; // end of findMap()

    function getRegionCode(regionString){
      var regionCode;
      switch (regionString){
        case "Piemonte": regionCode = 1; break;
        case "Valle d'Aosta": regionCode = 2; break;
        case "Lombardia": regionCode = 3; break;
        case "Trentino Alto Adige": regionCode = 4; break;
        case "Veneto": regionCode = 5; break;
        case "Friuli Venezia Giulia": regionCode = 6; break;
        case "Liguria": regionCode = 7; break;
        case "Emilia Romagna": regionCode = 8; break;
        case "Toscana": regionCode = 9; break;
        case "Umbria": regionCode = 10; break;
        case "Marche": regionCode = 11; break;
        case "Lazio": regionCode = 12; break;
        case "Abruzzo": regionCode = 13; break;
        case "Molise": regionCode = 14; break;
        case "Campania": regionCode = 15; break;
        case "Puglia": regionCode = 16; break;
        case "Basilicata": regionCode = 17; break;
        case "Calabria": regionCode = 18; break;
        case "Sicilia": regionCode = 19; break;
        case "Sardegna": regionCode = 20; break;
      }
      return regionCode;
    }

    function addMarkerToRegion(indexRegions, report, marker){
      switch (indexRegions){
        case 1: $scope.piemonteMarkers[report] = marker; break;
        case 2: $scope.aostaMarkers[report] = marker; break;
        case 3: $scope.lombardiaMarkers[report] = marker; break;
        case 4: $scope.trentinoMarkers[report] = marker; break;
        case 5: $scope.venetoMarkers[report] = marker; break;
        case 6: $scope.friuliMarkers[report] = marker; break;
        case 7: $scope.liguriaMarkers[report] = marker; break;
        case 8: $scope.emiliaMarkers[report] = marker; break;
        case 9: $scope.toscanaMarkers[report] = marker; break;
        case 10: $scope.umbriaMarkers[report] = marker; break;
        case 11: $scope.marcheMarkers[report] = marker; break;
        case 12: $scope.lazioMarkers[report] = marker; break;
        case 13: $scope.abruzzoMarkers[report] = marker; break;
        case 14: $scope.moliseMarkers[report] = marker; break;
        case 15: $scope.campaniaMarkers[report] = marker; break;
        case 16: $scope.pugliaMarkers[report] = marker; break;
        case 17: $scope.basilicataMarkers[report] = marker; break;
        case 18: $scope.calabriaMarkers[report] = marker; break;
        case 19: $scope.siciliaMarkers[report] = marker; break;
        case 20: $scope.sardegnaMarkers[report] = marker; break;
      }
    }

    function getColorByEfficiency(efficiency) {
      // if $scope.configuration === 2 ...
      // Il codice regione 12 corrisponde al Lazio
      return efficiency === 0 ? '#BD0026':
        efficiency < 0 ? '#BD0026':
        efficiency > 200 ? '#E31A1C':
        efficiency > 300 ? '#FC4E2A':
        efficiency > 400 ? '#FD8D3C':
        efficiency > 500 ? '#FEB24C':
        efficiency > 600 ? '#FED976':
        '#FFEDA0';
    }


    function style(feature) {
      return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColorByEfficiency(feature.properties.average)
      };
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }

    function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });

      // if (!L.Browser.ie && !L.Browser.opera) {
      //   layer.bringToFront();
      // }

      //info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
      //$scope.geojson.resetStyle(e.target);
      //info.update();
      var layer = e.target;

      layer.setStyle({
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      });
    }
    

    function zoomToFeature(e) {
      leafletData.getMap().then(function(map) {
        map.fitBounds(e.target.getBounds());
      });    
      
      updateMarkersByRegionCode(e.target.feature.properties.COD_REG);
      
    }

    function updateMarkersByRegionCode(regionCode) {
      switch (regionCode){
        case 1: $scope.markers = $scope.piemonteMarkers; break;
        case 2: $scope.markers = $scope.aostaMarkers; break;
        case 3: $scope.markers = $scope.lombardiaMarkers; break;
        case 4: $scope.markers = $scope.trentinoMarkers; break;
        case 5: $scope.markers = $scope.venetoMarkers; break;
        case 6: $scope.markers = $scope.friuliMarkers; break;
        case 7: $scope.markers = $scope.liguriaMarkers; break;
        case 8: $scope.markers = $scope.emiliaMarkers; break;
        case 9: $scope.markers = $scope.toscanaMarkers; break;
        case 10: $scope.markers = $scope.umbriaMarkers; break;
        case 11: $scope.markers = $scope.marcheMarkers; break;
        case 12: $scope.markers = $scope.lazioMarkers; break;
        case 13: $scope.markers = $scope.abruzzoMarkers; break;
        case 14: $scope.markers = $scope.moliseMarkers; break;
        case 15: $scope.markers = $scope.campaniaMarkers; break;
        case 16: $scope.markers = $scope.pugliaMarkers; break;
        case 17: $scope.markers = $scope.basilicataMarkers; break;
        case 18: $scope.markers = $scope.calabriaMarkers; break;
        case 19: $scope.markers = $scope.siciliaMarkers; break;
        case 20: $scope.markers = $scope.sardegnaMarkers; break;
      }
    }

    // Find existing Report
    $scope.findOne = function () {
      $scope.report = Reports.get({
        reportId: $stateParams.reportId
      });
    };
  }
]);
