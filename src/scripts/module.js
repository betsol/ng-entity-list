(function (window, angular) {

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

})(window, angular);
