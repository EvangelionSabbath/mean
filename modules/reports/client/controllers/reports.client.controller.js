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
        }, 10000);

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

        $http.get('modules/core/client/geoJson/province.geojson').success(function(data, status) {
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

    function getColor(regionCode) {
      // if $scope.configuration === 2 ...
      // Il codice regione 12 corrisponde al Lazio
      return regionCode === 12 ? '#BD0026':
        regionCode < 12 ? '#BD0026':
        regionCode > 20 ? '#E31A1C':
        regionCode > 15 ? '#FC4E2A':
        regionCode > 10 ? '#FD8D3C':
        regionCode > 5 ? '#FEB24C':
        regionCode > 0 ? '#FED976':
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
        fillColor: getColor(feature.properties.COD_REG)
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
