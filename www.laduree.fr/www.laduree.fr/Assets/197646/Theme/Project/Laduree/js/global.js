(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.directive('projectLadureeLoad', ['$document', '$window', '$rootScope', 'RbsChange.AjaxAPI', projectLadureeLoad]);

    function projectLadureeLoad($document, $window, $rootScope, AjaxAPI) {
        return {
            restrict: 'A',
            link: function(scope, elem, attr) {
                $rootScope.ribbonLabel = attr['ribbonLabel']
                $rootScope.compositionLabel = attr['compositionLabel']
                $rootScope.macaronsBoxLabel = attr['macaronsBoxLabel']
                $rootScope.baseURI = $document[0].baseURI;
                $rootScope.touchDevice = ('ontouchstart' in document.documentElement);
                $rootScope.backLink = function() {
                    $window.history.back();
                }
                if (!$rootScope.allMacarons) {
                    $rootScope.allMacarons = {};
                    AjaxAPI.getData('Laduree/Laduree/GetAllMacarons').then(function(result) {
                        $rootScope.allMacarons = result.data.dataSets;
                        $rootScope.$emit('macarons:loaded', $rootScope.allMacarons);
                    }, function(error) {
                        $rootScope.hideCompsitionBtn = true;
                        console.error(error);
                    });
                }
                if (!$rootScope.allAllergens) {
                    $rootScope.allAllergens = {};
                    AjaxAPI.getData('Laduree/Laduree/GetAllAllergens').then(function(result) {
                        $rootScope.allAllergens = result.data.dataSets;
                        $rootScope.$emit('allergens:loaded', $rootScope.allAllergens);
                    }, function(error) {
                        console.error(error);
                    });
                }
                $rootScope.$onMany = function(events, fn) {
                    for (var i = 0; i < events.length; i++) {
                        this.$on(events[i], fn);
                    }
                }
                angular.element($window).bind("resize load", function() {
                    let vh = window.innerHeight * 0.01,
                        vw = window.innerWidth * 0.01;
                    document.documentElement.style.setProperty("--vh", "".concat(vh, "px"));
                    document.documentElement.style.setProperty("--vw", "".concat(vw, "px"));
                });
                $document[0].onreadystatechange = () => {
                    if ($document[0].readyState === 'complete') {
                        $document[0].getElementsByTagName('html')[0].style.opacity = 1;
                    }
                };
                $document.on('change', 'body', function() {
                    if ($('body').is('modal-open')) {
                        $('html').addClass('modal-open')
                    } else {
                        $('html').removeClass('modal-open')
                    }
                })
            }
        };
    }
    app.directive('projectLadureeCheckLogin', [projectLadureeCheckLogin]);

    function projectLadureeCheckLogin() {
        return {
            restrict: 'A',
            link: function(scope) {
                const userId = __change.userContext.accessorId;
                if (userId === 0 || !userId) {
                    scope.login = false
                } else {
                    scope.login = true
                }
            }
        };
    }
    app.directive('projectLadureeScrollTop', ['$window', projectLadureeScrollTop]);

    function projectLadureeScrollTop($window) {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                elem.click(function() {
                    jQuery('html, body').animate({
                        scrollTop: 0
                    }, 1000);
                });
                angular.element($window).bind("scroll resize", function() {
                    if (this.scrollY > 200) {
                        elem.addClass('shown')
                    } else {
                        elem.removeClass('shown')
                    }
                });
            }
        };
    }
    app.directive('projectLadureeHeaderImage', ['$window', projectLadureeHeaderImage]);

    function projectLadureeHeaderImage($window) {
        return {
            restrict: 'A',
            link: function(scope, elem, attr) {
                if (scope.$eval(attr['alignLeft'])) {
                    angular.element($window).bind("resize load", function() {
                        const elemPadding = elem.innerWidth() - elem.width();
                        const offset = elem.offset().left > 0 ? elem.offset().left + (elemPadding / 2) : 0;
                        elem.find('> div').css('margin-right', offset * -1)
                    });
                } else {
                    angular.element($window).bind("resize load", function() {
                        const elemPadding = elem.innerWidth() - elem.width();
                        const offset = elem.offset().left > 0 ? elem.offset().left + (elemPadding / 2) : 0;
                        elem.find('> div').css('margin-right', offset * -1)
                        elem.find('> div').css('margin-left', offset * -1)
                    });
                }
            }
        };
    }
    app.config(['$provide', function($provide) {
        $provide.decorator('rbsCommerceModeSelectorDirective', ['$delegate', '$rootScope', '$window', function($delegate, $rootScope, $window) {
            var directive = $delegate[0];
            var link = directive.link;
            directive.compile = function() {
                return function(scope, elm, attrs, controller) {
                    link.apply(this, arguments);
                    if (scope.shippingModeInfo.common.category === "store") {
                        scope.shippingMode.id = scope.shippingModeInfo.common.id;
                    }
                };
            };
            return $delegate;
        }]);
    }]);
})();