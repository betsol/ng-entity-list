module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'expect'],
    files: [
      // Third-party dependencies
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/betsol-ng-paginator/dist/betsol-ng-paginator.js',
      'bower_components/angular-dropdowns/dist/angular-dropdowns.js',
      'bower_components/angular-inview/angular-inview.js',

      // Module files
      'dist/scripts/betsol-ng-entity-list.js',

      // Tests
      'test/**/test-*.js'
    ],
    exclude: [],
    preprocessors: {},
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARN,
    autoWatch: false,
    browsers: ['Chrome', 'Firefox'],
    singleRun: true
  });
};
