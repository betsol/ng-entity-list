(function (window, angular, moment) {

  'use strict';


  //====================//
  // PRIVATE PROPERTIES //
  //====================//

  var defaultScheme = {
    title: '',
    fields: {},
    add: true,
    edit: true,
    'delete': true
  };

  var defaultField = {
    title: '',
    type: 'string'
  };

  var defaultItemsPerPage = 50;


  //================//
  // ANGULAR MODULE //
  //================//

  angular.module('betsol.entityList', [
    'ui.router',
    'betsol.paginator'
  ])

    .factory('EntityList', function (Paginator) {
      return function (config) {

        var defaultConfig = {
          scope: null,
          baseStateName: '',
          repository: null,
          scheme: null,
          itemsPerPage: 50,
          formatters: getDefaultFormatters(),
          criteria: {}
        };

        config = angular.extend({}, defaultConfig, config);

        if (!config.scope) {
          return console.log('Missing scope');
        }

        if (!config.baseStateName) {
          return console.log('Missing base state name');
        }

        if (!config.repository) {
          return console.log('Missing repository');
        }

        var $scope = config.scope;
        var repository = config.repository;
        var scheme = normalizeScheme(config.scheme || {});

        var paginator = new Paginator(repository.find)
          .setItemsPerPage(config.itemsPerPage || defaultItemsPerPage)
          .setCriteria(config.criteria)
        ;

        // Loading first batch.
        paginator.first();

        $scope.baseStateName = config.baseStateName;
        $scope.scheme = scheme;
        $scope.paginator = paginator;

        if (scheme.delete) {
          $scope.delete = function (entity) {
            if (window.confirm('Вы уверены, что хотите удалить «' + entity.title + '»?')) {
              repository
                .delete(entity.id)
                .then(function () {
                  // @todo: delete item from the list instead and adjust offset accordingly!
                  paginator.first();
                })
                .catch(function () {
                  alert('Не удалось удалить запись');
                })
              ;
            }
          };
        }

        $scope.renderValue = function (entity, fieldName, field) {
          var value = eval('entity.' + fieldName);
          var formatter = config.formatters[field.type] || config.formatters.default;
          return formatter(value, field);
        }

      };
    })

  ;


  //===================//
  // PRIVATE FUNCTIONS //
  //===================//

  /**
   * Normalizes user-provided grid scheme.
   *
   * @param {object} scheme
   *
   * @returns {array}
   */
  function normalizeScheme (scheme) {
    scheme = angular.extend({}, defaultScheme, scheme);
    angular.forEach(scheme.fields, function (field, fieldName) {
      scheme.fields[fieldName] = angular.extend({}, defaultField, field);
    });
    return scheme;
  }

  function getDefaultFormatters() {
    var formatters = {};

    formatters.default = function (value) {
      return value;
    };

    formatters.date = function (value, field) {
      if (moment && moment.isMoment(value)) {
        return value.format(field.format || 'D.M.YY HH:mm:ss');
      } else if (value instanceof Date) {
        return value.toString();
      }
    };

    return formatters;

  }

})(window, angular, window.moment);
