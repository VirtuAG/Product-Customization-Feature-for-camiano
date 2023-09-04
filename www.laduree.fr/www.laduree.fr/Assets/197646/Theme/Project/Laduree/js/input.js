(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.config(['$provide', function($provide) {
        $provide.decorator('rbsDatePickerDirective', ['$delegate', function($delegate) {
            var directive = $delegate[0];
            var link = directive.link;
            directive.templateUrl = "/project-laduree-date-picker.twig";
            directive.compile = function() {
                return function(scope, elm, attrs) {
                    link.apply(this, arguments);
                    let loading = true;
                    scope.day = null;
                    scope.year = null;
                    scope.month = null;
                    var unbindWatcher = scope.$watch('picker.value', function() {
                        if (loading) {
                            loading = false;
                            if (scope.picker.value) {
                                scope.day = scope.picker.value.getDate();
                                scope.year = scope.picker.value.getFullYear();
                                scope.month = scope.picker.value.getMonth();
                            }
                            unbindWatcher();
                        }
                    });

                    function generateArrayOfYears() {
                        const max = new Date().getFullYear()
                        const min = max - 100
                        let years = []
                        for (var i = max; i >= min; i--) {
                            years.push(i)
                        }
                        return years;
                    }
                    scope.years = generateArrayOfYears()
                    scope.months = 12;
                    scope.getNumber = function(num) {
                        return new Array(num);
                    }
                    elm.find('select').each(function() {
                        $(this).on('select2:select', function(e) {
                            if (scope.day > 0 && scope.month >= 0 && scope.year > 0) {
                                scope.picker.value = new Date(parseInt(scope.year), parseInt(scope.month), parseInt(scope.day))
                            }
                        });
                    })
                };
            };
            return $delegate;
        }]);
    }]);
    app.directive('projectLadureeSelect2', ['$timeout', projectLadureeSelect2]);

    function projectLadureeSelect2($timeout) {
        return {
            restrict: 'AC',
            require: 'ngModel',
            link: function(scope, elem, attrs) {
                const options = attrs['select2Options'] ? scope.$eval(attrs['select2Options']) : {};
                const noResults = attrs['noResults'] ? attrs['noResults'] : '';
                let key, defaultOptions = {
                    language: {
                        noResults: function() {
                            return noResults;
                        }
                    }
                }
                if (options) {
                    for (key in options) {
                        defaultOptions[key] = options[key];
                    }
                }
                $timeout(function() {
                    elem.select2(defaultOptions);
                    elem.select2Initialized = true;
                });
                var refreshSelect = function() {
                    if (!elem.select2Initialized) return;
                    $timeout(function() {
                        elem.trigger('change');
                    });
                };
                var recreateSelect = function() {
                    if (!elem.select2Initialized) return;
                    $timeout(function() {
                        elem.select2('destroy');
                        elem.select2(defaultOptions);
                    });
                };
                scope.$watch(attrs.ngModel, refreshSelect);
                if (attrs.ngOptions) {
                    var list = attrs.ngOptions.match(/ in ([^ ]*)/)[1];
                    scope.$watch(list, recreateSelect);
                }
                if (attrs.ngDisabled) {
                    scope.$watch(attrs.ngDisabled, refreshSelect);
                }
                elem.select2(defaultOptions)
            }
        };
    }
})();