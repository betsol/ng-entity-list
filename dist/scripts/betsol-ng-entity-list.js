/**
 * betsol-ng-entity-list - Automatic entity lists for Angular.js
 * @version v0.2.1
 * @link https://github.com/betsol/ng-entity-list
 * @license MIT
 *
 * @author Slava Fomin II <s.fomin@betsol.ru>
 */
(function (window, angular, moment) {

  'use strict';


  //====================//
  // PRIVATE PROPERTIES //
  //====================//

  var defaultScheme = {
    fields: {},
    edit: true,
    'delete': true
  };

  var defaultField = {
    name: '',
    title: '',
    type: 'string'
  };

  var defaultTemplateUrl = 'templates/entity-list.html';

  var defaultItemsPerPage = 50;

  var fieldTransformers = [];


  //================//
  // ANGULAR MODULE //
  //================//

  angular.module('betsol.entityList', [
    'ui.router',
    'betsol.paginator',
    'ngDropdowns',
    'angular-inview'
  ])

    .provider('EntityListConfig', function () {

      var templateUrl = defaultTemplateUrl;

      var service = {
        setTemplateUrl: function (newTemplateUrl) {
          templateUrl = newTemplateUrl;
          return this;
        },
        getTemplateUrl: function () {
          return templateUrl;
        }
      };

      service.$get = function () {
        return service;
      };

      return service;

    })

    .directive('bsEntityList', ['EntityListConfig', function (EntityListConfig) {
      return {
        restrict: 'E',
        scope: {
          config: '='
        },
        templateUrl: function () {
          return EntityListConfig.getTemplateUrl();
        },
        controller: ['$scope', '$state', 'Paginator', function ($scope, $state, Paginator) {

          var defaultConfig = {
            baseStateName: '',
            repository: null,
            scheme: null,
            itemsPerPage: 50,
            formatters: getDefaultFormatters(),
            criteria: null,
            sortParams: null,
            fieldTransformers: []
          };

          var config = angular.extend({}, defaultConfig, $scope.config);

          if (!config.baseStateName) {
            return console.log('Missing base state name');
          }

          if (!config.repository) {
            return console.log('Missing repository');
          }

          // Adding transformers from config.
          fieldTransformers = fieldTransformers.concat(config.fieldTransformers);

          var repository = config.repository;
          var scheme = normalizeScheme(config.scheme || {});

          var paginator = new Paginator(repository.find)
            .setItemsPerPage(config.itemsPerPage || defaultItemsPerPage)
          ;

          if (config.criteria) {
            paginator.setCriteria(config.criteria)
          }

          if (config.sortParams) {
            paginator.setSorting(config.sortParams)
          }

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

          $scope.renderValue = function (entity, field) {
            var value = eval('entity.' + field.name);
            var formatter = config.formatters[field.type] || config.formatters.default;
            return formatter(value, field);
          };

          $scope.$emit('bs.entity-list.init', {
            getPaginator: function () {
              return $scope.paginator;
            }
          });

        }]
      }
    }])

    .directive('entityField', ['$compile', '$state', function ($compile, $state) {
        return {
          restrict: 'E',
          scope: false,
          link: function ($scope, $directiveElement) {

            var field = $scope.field;
            var entity = $scope.entity;
            var elementType = 'span';
            if (field.link) {
              elementType = 'a';
            }

            var $element = $('<' + elementType + '/>');

            // Link functionality.
            if (field.link) {
              $element.attr('href', getLinkUrl(field.link, entity));
              if (field.link.target) {
                $element.attr('target', field.link.target);
              }
            }

            // Tooltip functionality.
            if (field.tooltip) {
              $element.attr('title', funcToScalar(entity, field.tooltip));
            }

            // Class Names.
            if (field.classNames) {
              angular.forEach(field.classNames, function (value, className) {
                value = funcToScalar(entity, value);
                if (value) {
                  $element.addClass(className);
                }
              });
            }

            // Icon element.
            if (field.icon) {
              appendNewElement($element, 'span')
                .addClass(funcToScalar(entity, field.icon))
              ;
            }

            // Image element.
            if (field.image && field.image.url) {
              appendNewElement($element, 'img')
                .attr('src', funcToScalar(entity, field.image.url))
              ;
            }

            // Value element.

            var ngBindValue = 'renderValue(entity, field)';

            // Adding filters if necessary.
            if (field.filter) {
              ngBindValue += ' | ' + (Array.isArray(field.filter) ? field.filter.join(' | ') : field.filter);
            }

            $element.append(
              $('<span/>')
                .attr('ng-bind', ngBindValue)
            );

            $element = $compile($element)($scope);
            $directiveElement.append($element);
            $scope.value = $scope.entity[$scope.field.name];
          }
        };


        function appendNewElement ($parent, type) {
          var $element = $('<' + type + '/>');
          $parent.append($element);
          $element.after("\n");
          return $element;
        }

        /**
         * @param {object} link
         * @param {object} entity
         *
         * @returns {string}
         */
        function getLinkUrl (link, entity) {
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
            return '#';
          }
        }

        function funcToScalar (argument, funcOrScalar) {
          if ('function' === typeof funcOrScalar) {
            return funcOrScalar(argument);
          } else {
            return funcOrScalar;
          }
        }

      }]
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
   * @returns {object}
   */
  function normalizeScheme (scheme) {
    scheme = angular.extend({}, defaultScheme, scheme);
    angular.forEach(scheme.fields, function (field, fieldName) {
      field = angular.extend({}, defaultField, field);
      field.name = fieldName;
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
