'use strict';

// Configuring the Reports module
angular.module('reports').run(['Menus',
  function (Menus) {
    // Add the reports dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Reports',
      state: 'reports',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'reports', {
      title: 'List Reports',
      state: 'reports.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'reports', {
      title: 'Create Reports',
      state: 'reports.create',
      roles: ['user']
    });
  }
]);
