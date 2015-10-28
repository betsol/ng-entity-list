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

  var fieldTransformers = [];


  //================//
  // ANGULAR MODULE //
  //================//

  angular.module('betsol.entityList', [
    'ui.router',
    'betsol.paginator'
  ])

    .factory('EntityList', function (Paginator, $state) {
      return function (config) {

        var defaultConfig = {
          scope: null,
          baseStateName: '',
          repository: null,
          scheme: null,
          itemsPerPage: 50,
          formatters: getDefaultFormatters(),
          criteria: {},
          sortParams: {},
          fieldTransformers: []
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

        // Adding transformers from config.
        fieldTransformers = fieldTransformers.concat(config.fieldTransformers);

        var $scope = config.scope;
        var repository = config.repository;
        var scheme = normalizeScheme(config.scheme || {});

        var paginator = new Paginator(repository.find)
          .setItemsPerPage(config.itemsPerPage || defaultItemsPerPage)
          .setCriteria(config.criteria)
          .setSorting(config.sortParams)
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
        };

        $scope.getImageUrl = function (entity, field) {
          if ('function' === typeof field.image.url) {
            return field.image.url(entity);
          } else {
            return field.image.url;
          }
        };

        $scope.getClassNames = function (entity, field) {
          var classNames = {};
          if (field.classNames) {
            angular.forEach(field.classNames, function (value, className) {
              if ('function' === typeof value) {
                classNames[className] = value(entity);
              } else {
                classNames[className] = value;
              }
            });
          }
          return classNames;
        };

        $scope.getIconClassName = function (entity, field) {
          if ('function' === typeof field.icon) {
            return field.icon(entity);
          } else {
            return field.icon;
          }
        };

        $scope.getTooltip = function (entity, field) {
          if ('function' === typeof field.tooltip) {
            return field.tooltip(entity);
          } else {
            return field.tooltip;
          }
        };

        $scope.getLinkUrl = function (entity, field) {
          if (!field.link) {
            return null;
          }
          var link = field.link;
          if (link.stateName) {
            var params = {};
            if ('function' === typeof link.params) {
              params = link.params(entity);
            }
            return $state.href(link.stateName, params);
          } else if (link.url) {
            if ('function' === typeof link.url) {
              return link.url(entity);
            } else {
              return link.url;
            }
          } else {
            return null;
          }
        };

      };
    })

    .directive('entityField', function () {
        return {
          restrict: 'E',
          scope: false,
          templateUrl: 'field.html'
        }
      }
    )

  ;


  /**
   * Default E-Mail field transformer.
   */
  fieldTransformers.push({
    type: 'email',
    transformer: function (field, fieldName) {
      if (field.link) {
        return;
      }
      field.link = {
        url: function (entity) {
          return 'mailto:' + eval('entity.' + fieldName);
        }
      };
    }
  });

  /**
   * Default Skype field transformer.
   */
  fieldTransformers.push({
    type: 'skype',
    transformer: function (field, fieldName) {
      if (field.link) {
        return;
      }
      field.link = {
        url: function (entity) {
          return 'skype:' + eval('entity.' + fieldName) + '?chat';
        }
      };
    }
  });


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
      field = angular.extend({}, defaultField, field);
      applyTransformers(field, fieldName);
      scheme.fields[fieldName] = field;
    });
    return scheme;
  }

  /**
   * Applies field transformers to the specified field, according to type.
   *
   * @param {Object} field
   * @param {string} fieldName
   */
  function applyTransformers (field, fieldName) {
    angular.forEach(fieldTransformers, function (spec) {
      if (field.type == spec.type) {
        if ('function' !== typeof spec.transformer) {
          console.log('Missing transformer function');
          return;
        }
        spec.transformer(field, fieldName);
      }
    });
  }

  function getDefaultFormatters() {
    var formatters = {};

    formatters.default = function (value) {
      return value;
    };

    formatters.email = function (value) {
      return value.toLowerCase();
    };

    formatters.skype = function (value) {
      return value.toLowerCase();
    };

    formatters.date = function (value, field) {
      if (moment && moment.isMoment(value)) {
        return value.format(field.format || 'D.M.YY');
      } else if (value instanceof Date) {
        return value.toString();
      }
    };

    formatters.datetime = function (value, field) {
      if (moment && moment.isMoment(value)) {
        return value.format(field.format || 'DD.MM.YY HH:mm:ss');
      } else if (value instanceof Date) {
        return value.toString();
      }
    };

    return formatters;

  }

})(window, angular, window.moment);
