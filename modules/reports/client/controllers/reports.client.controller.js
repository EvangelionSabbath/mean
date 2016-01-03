'use strict';

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Reports',
  function ($scope, $http, $stateParams, $location, Authentication, Reports) {
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

      var configuration = 'regions';
      var reportsLoaded = new Promise(function(resolve, reject) {
        
        $scope.reports = Reports.query();
        
        setTimeout(function() {
          resolve($scope.reports);
          console.log ('Promise resolved.');
        }, 30000);

      });

      reportsLoaded.then(function(reports) {

        //for (var report in reports) {

        var report;
        var marker;
        var markers = [];

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

        for (report=0; report<10000; report++) {

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
              message: reports[report].name, 
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
              message: reports[report].name, 
              draggable: true, 
              icon: icons.red 
            };
          }

          if (month === 1) {
            markers[report] = marker;
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
          $scope.markers = markers;
          /*$scope.geojson = {
            data: $scope.geojsonData,
            style: style,
            onEachFeature: onEachFeature
          };
          console.log('SCOPE GEOJSON: ' + $scope.geojson);*/
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

    function getColor(efficiency) {
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

    function getColorByEfficiency(regionCode) {



    }

    function style(feature) {
      return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.average)
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

      //if (!L.Browser.ie && !L.Browser.opera) {
      //layer.bringToFront();

      //info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
      $scope.geojson.resetStyle(e.target);
      //info.update();
    }

    function zoomToFeature(e) {
      //map.fitBounds(e.target.getBounds());
    }

    // Find existing Report
    $scope.findOne = function () {
      $scope.report = Reports.get({
        reportId: $stateParams.reportId
      });
    };
  }
]);
