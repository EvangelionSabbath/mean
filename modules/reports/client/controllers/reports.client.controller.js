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



    // Find a list of Reports in map
    $scope.findMap = function () {
      $scope.report = Reports.get({ 
        reportId:'565c23445bde17d727751349'
      });

    // process the coordinates coming from findOne()
      $scope.report.$promise.then(function(data) {
        console.log($scope.report.lat);
        console.log($scope.report.lng);
        var lat = ($scope.report.lat).replace(",",".");
        var lng = ($scope.report.lng).replace(",",".");
        console.log(parseFloat(lat));
        console.log(parseFloat(lng));


        angular.extend($scope, {  
       
          markers: {
            mainMarker: {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              focus: true,
              message: $scope.report.name,
              draggable: true
            }
          }
        }); // end of angular.extend
      }); // end of $promise.then()

    }; // end of findOne()
    

    // Find existing Report
    $scope.findOne = function () {
      $scope.report = Reports.get({
        reportId: $stateParams.reportId
      });
    };
  }
  ]);
