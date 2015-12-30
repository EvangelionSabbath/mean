'use strict';

// Setting up route
angular.module('reports').config(['$stateProvider',
  function ($stateProvider) {
    // Reports state routing
    $stateProvider
      .state('reports', {
        abstract: true,
        url: '/reports',
        template: '<ui-view/>'
      })
      .state('reports.list', {
        url: '',
        templateUrl: 'modules/reports/client/views/list-reports.client.view.html'
      })

      .state('reports.listMap', {
        url: '/map',
        templateUrl: 'modules/reports/client/views/map-reports.client.view.html'
      })

      .state('reports.create', {
        url: '/create',
        templateUrl: 'modules/reports/client/views/create-report.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('reports.view', {
        url: '/:reportId',
        templateUrl: 'modules/reports/client/views/view-report.client.view.html'
      })
      .state('reports.edit', {
        url: '/:reportId/edit',
        templateUrl: 'modules/reports/client/views/edit-report.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
