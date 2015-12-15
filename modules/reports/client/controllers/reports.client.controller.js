'use strict';

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reports',
  function ($scope, $stateParams, $location, Authentication, Reports) {
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

       // Find a list of Reports in map
       $scope.findMap = function () {
      //$scope.reports = Reports.query();
      Reports.query().$promise.then(function(result) {
        $scope.reports = result;
        $scope.markers = createMarkers(result);
      });
    };

        // Create markers
        var createMarkers = function(reports) {
//          for(var i in reports){
  var i = 1;
           var actual = reports[i].actual;
           var expected = reports[i].expected;
           var efficiency = actual-expected;
           if (efficiency > 0) {
             // TODO
           }
           console.log("act: " + actual);
           console.log("exp: " + expected);
           console.log("lat: " + reports[i].lat);
           console.log("lng: " + reports[i].lng);
           console.log("i: " + i);

           angular.extend($scope, {
               
                markers: {
                 mainMarker: {
                 lat: reports[i].lat,
                 lng: reports[i].lng,
                 focus: true,
                 message: reports[i].city,
                 draggable: true
                 }
                }
          }); // end of angular.extend
//         }
       };

    // Find existing Report
    $scope.findOne = function () {
      $scope.report = Reports.get({
        reportId: $stateParams.reportId
      });
    };
  }
  ]);
