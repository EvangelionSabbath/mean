'use strict';

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reports',
  function ($scope, $stateParams, $location, Authentication, Reports) {
    $scope.center = {}; 
    angular.extend($scope, {
      center: {
        lat: 43,
        lng: 14,
        zoom: 7
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

      var reportsLoaded = new Promise(function(resolve, reject) {
        
        $scope.reports = Reports.query();
        
        setTimeout(function() {
          resolve($scope.reports);
          console.log ('Promise resolved.');
        }, 5000);

      });

      reportsLoaded.then(function(reports) {

        console.log('REPORTS: ' + reports);

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
        }

        for (report=0; report<1000; report++) {

          console.log('REPORT: ' + reports[report]);
          console.log('REPORT LAT: ' + reports[report].lat);
          console.log('REPORT LNG: ' + reports[report].lng);
          console.log('REPORT EXPECTED: ' + reports[report].expected);
          console.log('REPORT ACTUAL: ' + reports[report].actual);
          var lat = (reports[report].lat).replace(",",".");
          var lng = (reports[report].lng).replace(",",".");
          console.log(parseFloat(lat));
          console.log(parseFloat(lng));
          
          var expected = reports[report].expected;
          var actual = reports[report].actual;
          var efficiency = expected - actual;
          
          var period_from = reports[report].period_from;
          var date = new Date(period_from);
          console.log('DATE: ' + date);
          var year = date.getYear();
          var month = date.getMonth() + 1;

          if (efficiency > 0) {
             marker = { lat: parseFloat(lat), lng: parseFloat(lng), focus: true, message: reports[report].name, draggable: true, icon: icons.green, month: month, year: year };
          }
         
          else {
             marker = { lat: parseFloat(lat), lng: parseFloat(lng), focus: true, message: reports[report].name, draggable: true, icon: icons.red};
          }

          console.log('YEAR: ' + year);
          console.log('MONTH: ' + month);

          if (month = 1) {
 
            markers[report] = marker;

          }
         

        }

        $scope.markers = markers;
        console.log('SCOPE MARKERS: ' + $scope.markers);

      });
      
    }; // end of findMap()
    

    // Find existing Report
    $scope.findOne = function () {
      $scope.report = Reports.get({
        reportId: $stateParams.reportId
      });
    };
  }
]);
