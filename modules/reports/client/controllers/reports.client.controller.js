'use strict';

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$http', 'leafletData', '$stateParams', '$location', 'Authentication', 'Reports',
 
  function($scope, $http, leafletData, $stateParams, $location, Authentication, Reports) {
     


    $scope.center = {};
    angular.extend($scope, {
      center: {
        lat: 43,
        lng: 14,
        zoom: 5
      },
      legend: {
        position: 'bottomleft',
        colors: ['#000000', '#800000', '#FF2200', '#D2691E', '#FFD700', '#4dc22d'],
        labels: ['Efficiency <= 0', 'Efficiency > 0', 'Efficiency > 50', 'Efficiency > 150', 'Efficiency > 250', 'Efficiency > 300']
      }
    });

    $scope.authentication = Authentication;


    // Crea un nuovo Report
    $scope.create = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'reportForm');
        return false;
      }

      var report = new Reports({
        lat: this.lat,
        lng: this.lng,
        city: this.city,
        voltage: this.voltage
      });

      report.$save(function(response) {
        $location.path('reports/' + response._id);
        $scope.lat = '';
        $scope.lng = '';
        $scope.city = '';
        $scope.voltage = '';
      },
      function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };


    // Rimuove un Report esistente
    $scope.remove = function(report) {

      if (report) {
        report.$remove();
        for (var i in $scope.reports) {
          if ($scope.reports[i] === report) {
            $scope.reports.splice(i, 1);
          }
        }
      } 

      else {
        $scope.report.$remove(function() {
          $location.path('reports');
        });
      }

    };


    // Aggiorna un Report esistente
    $scope.update = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'reportForm');
        return false;
      }

      var report = $scope.report;

      report.$update(function() {
        $location.path('reports/' + report._id);  
      }, 
      function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    };


    // Recupera una lista di Reports
    $scope.find = function() {
      $scope.reports = Reports.query();
    };


    // Restituisce la data odierna
    $scope.today = function() {
      $scope.dt = new Date("2012-01");
    };
    

    // Rimuove la data
    $scope.clear = function() {
      $scope.dt = null;
    };


    // Disabilita la selezione weekend
    $scope.disabled = function(date, mode) {
      return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    };


    // Imposta la data di partenza
    $scope.toggleMin = function() {
      $scope.minDate = $scope.minDate ? null : new Date("2012-01-01");
    };


    // Imposta la data
    $scope.setDate = function(year, month, day) {
      $scope.dt = new Date(year, month, day);
    };


    // Restituisce il tipo di data
    $scope.getDayClass = function(date, mode) {
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

        for (var i = 0; i < $scope.events.length; i++) {
          var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

          if (dayToCheck === currentDay) {
            console.log($scope.events[i].status);
            return $scope.events[i].status;
          }
        }
      }
      return '';
    };


    // Inizializza la gestione del selettore del mese
    $scope.initMonthSelector = function() {

      $scope.today();
      $scope.toggleMin();
      $scope.maxDate = new Date("2012-12-31");
      $scope.initDate = new Date("2012-01-01");

      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];
      $scope.altInputFormats = ['M!/d!/yyyy'];

      var configuration = 'regions';
    };

    function wait(ms){
      var start = new Date().getTime();
      var end = start;
      while(end < start + ms) {
        end = new Date().getTime();
      }
    }

    // Mostra la lista di Reports recuperati su una mappa
    $scope.findMap = function() {
      $scope.initMonthSelector();

      var reportsLoaded = new Promise(function(resolve, reject) {
        $scope.allMarkers = [
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]],
          [[],[],[],[],[],[],[],[],[],[],[],[]]
        ];

        $scope.reports = Reports.query();
        $http.get('modules/core/client/geoJson/regioni.geojson').success(function(data, status) {
          $scope.geojsonData = data;  
        });

        setTimeout(function() {
          resolve($scope.reports);
        }, 10000);

      });


      reportsLoaded.then(function(reports) {

        splitReportsByRegionAndMonth(reports);


        $scope.$watch('dt', function() {

//          $scope.bool = false;
         
          var regionCode = -1;
          updateMarkersByRegionCode(regionCode);  
          updateMap($scope.dt.getMonth());
          angular.extend($scope, {
            center: {
              lat: 43,
              lng: 14,
              zoom: 5
            }
          });
        });



        $scope.$apply(function () {
          console.log("apply");
          $scope.geojson = {
            data: $scope.geojsonData,
            style: style,
            onEachFeature: onEachFeature
          };

          $scope.markers = {};
//          $scope.bool = true;

        });

      });
    };

    // Aggiorna la mappa in base al mese selezionato
    function updateMap(selectedMonth) {

      for (var i = 0; i < $scope.avgs[selectedMonth].length; i++) {
        $scope.geojsonData.features[i].properties.average = $scope.avgs[selectedMonth][i];
      }
      console.log("UpdateMap terminato");
    }

    // Disegna il marker in base al valore di efficienza
    var calculateMarker = function(efficiency, report) {

      var regionCode = getRegionCode(report.region);
      var period_from = report.period_from;
      var lat = (report.lat).replace(',', '.');
      var lng = (report.lng).replace(',', '.');
      var date = new Date(period_from);
      var year = date.getYear();
      var month = date.getMonth() + 1;

      var marker = {};

      var icons = {
        green: {
          type: 'div',
          iconSize: [13, 13],
          className: 'green',
          iconAnchor: [5, 5]
        },

        orange: {
          type: 'div',
          iconSize: [13, 13],
          className: 'orange',
          iconAnchor: [5, 5]
        },

        red: {
          type: 'div',
          iconSize: [13, 13],
          className: 'red',
          iconAnchor: [5, 5]
        }
      };

      if (efficiency > 0) {

        if (efficiency > 50) {
          marker = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            focus: true,
            message: "<b>Centro di misurazione: " + report.city + "</b><br>Data: " + date.toDateString().substring(4, 7) + " " + date.toDateString().substring(10, 15) + "<br>Provincia: " + report.province + "<br>Voltaggio: " + report.voltage + "<br>Valore atteso: " + report.expected + "<br>Valore attuale: " + report.actual + "<br>Efficienza: " + efficiency,
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
            message: "<b>Centro di misurazione: " + report.city + "</b><br>Data: " + date.toDateString().substring(4, 7) + " " + date.toDateString().substring(10, 15) + "<br>Provincia: " + report.province + "<br>Voltaggio: " + report.voltage + "<br>Valore atteso: " + report.expected + "<br>Valore attuale: " + report.actual + "<br>Efficienza: " + efficiency,
            draggable: true,
            icon: icons.orange,
            month: month,
            year: year
          };
        }
      } 

      else {
        marker = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          focus: true,
          message: "<b>Centro di misurazione: " + report.city + "</b><br>Data: " + date.toDateString().substring(4, 7) + " " + date.toDateString().substring(10, 15) + "<br>Provincia: " + report.province + "<br>Voltaggio: " + report.voltage + "<br>Valore atteso: " + report.expected + "<br>Valore attuale: " + report.actual + "<br>Efficienza: " + efficiency,
          draggable: true,
          icon: icons.red
        };
      }

      return marker;
    };


    // Restituisce il codice di una regione, dato il nome per esteso
    function getRegionCode(regionString) {
      var regionCode;
      switch (regionString) {
        case "Piemonte":
          regionCode = 1;
          break;
        case "Valle d'Aosta":
          regionCode = 2;
          break;
        case "Lombardia":
          regionCode = 3;
          break;
        case "Trentino Alto Adige":
          regionCode = 4;
          break;
        case "Veneto":
          regionCode = 5;
          break;
        case "Friuli Venezia Giulia":
          regionCode = 6;
          break;
        case "Liguria":
          regionCode = 7;
          break;
        case "Emilia Romagna":
          regionCode = 8;
          break;
        case "Toscana":
          regionCode = 9;
          break;
        case "Umbria":
          regionCode = 10;
          break;
        case "Marche":
          regionCode = 11;
          break;
        case "Lazio":
          regionCode = 12;
          break;
        case "Abruzzo":
          regionCode = 13;
          break;
        case "Molise":
          regionCode = 14;
          break;
        case "Campania":
          regionCode = 15;
          break;
        case "Puglia":
          regionCode = 16;
          break;
        case "Basilicata":
          regionCode = 17;
          break;
        case "Calabria":
          regionCode = 18;
          break;
        case "Sicilia":
          regionCode = 19;
          break;
        case "Sardegna":
          regionCode = 20;
          break;
      }
      return regionCode;
    }


    // Aggiunge un marker ad una regione, nella lista del mese corrispondente
    function addMarkerToRegion(marker, regionCode, month) {  
      if($scope.allMarkers[regionCode-1][month-1]) {
        $scope.allMarkers[regionCode-1][month-1].push(marker);
      } 
    }


    // Divide e ridistribuisce i report in base alla regione e al mese
    function splitReportsByRegionAndMonth(reports) {

      var efficiency_regions = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      var efficiency_sum = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      $scope.avgs = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      for (var i = 0; i < reports.length; i++) {

        var report = reports[i];

        var regionCode = getRegionCode(report.region);
        var period_from = report.period_from;
        var lat = (report.lat).replace(',', '.');
        var lng = (report.lng).replace(',', '.');
        var date = new Date(period_from);
        var month = date.getMonth() + 1;
        var expected = report.expected;
        var actual = report.actual;
        var efficiency = expected - actual;

        var marker = calculateMarker(efficiency, report);
        addMarkerToRegion(marker, regionCode, month);

        efficiency_regions[month-1][regionCode-1] = efficiency_regions[month-1][regionCode-1] + efficiency;
        efficiency_sum[month-1][regionCode-1]++;  

      }

      for (var m=0; m < 12; m++) {
        for (var r = 0; r < 20; r++) {
          if (efficiency_sum[m][r] !== 0) {
            $scope.avgs[m][r] = efficiency_regions[m][r] / efficiency_sum[m][r];
          }
        } 
      }
    /*  console.log($scope.avgs);
      for (var i = 0; i<12; i++){
        var line = "";
        for (var j = 0; j <20; j++){
          line = line.concat($scope.avgs[i][j] + ",");
        }
        console.log(line);
      }
*/
    }


    function getColorByEfficiency(efficiency) {
      return efficiency === 0 ? '#000000' : // nero
        efficiency < 0 ? '#000000' : // nero
        efficiency > 300 ? '#4dc22d' : //verde
        efficiency > 250 ? '#FFD700' : //giallo
        efficiency > 150 ? '#D2691E' : //arancione
        efficiency > 50 ? '#FF2200' : // rosso
        efficiency > 0 ? '#800000' : // rosso scuro
        '#FFFFFF';
    }

    function style(feature) {
      var regionCode = feature.properties.COD_REG;
      var efficiency = $scope.avgs[$scope.dt.getMonth()][regionCode-1];
      console.log("style terminato");
      return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColorByEfficiency(efficiency)
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

    }


    function resetHighlight(e) {
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


    function getZoom() {
      leafletData.getMap().then(function(map) {
        var zoom = map.getZoom();
        return zoom;
      });
    }


    function updateMarkersByRegionCode(regionCode) {
      if (regionCode === -1) {
        regionCode = $scope.currentRegionCode;
      } 
      else {
        $scope.currentRegionCode = regionCode;
      }
      if (regionCode) {
        $scope.markers = $scope.allMarkers[regionCode-1][$scope.dt.getMonth()]; 
      } 
    }

    // Find existing Report
    $scope.findOne = function() {
      $scope.report = Reports.get({
        reportId: $stateParams.reportId
      });
    };

  }
]);