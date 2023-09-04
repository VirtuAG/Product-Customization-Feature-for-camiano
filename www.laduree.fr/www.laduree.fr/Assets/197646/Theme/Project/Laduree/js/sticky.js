(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.directive('projectLadureeSticky', ['$window', projectLadureeSticky]);

    function projectLadureeSticky($window) {
        return {
            restrict: 'AE',
            transclude: false,
            scope: {},
            link: function(scope, elem, ) {
                const isMobile = $('.icon-menu').is(':visible');
                const stickIt = function() {
                    const windowTop = $window.pageYOffset;
                    const stickyHeaderHeight = $('#header').outerHeight()
                    const parentOffsetTop = elem.parent().offset().top - stickyHeaderHeight;
                    const elemHeight = elem.outerHeight();
                    elem.parent().css('min-height', elemHeight);
                    if ((windowTop >= parentOffsetTop)) {
                        elem.css('position', 'fixed');
                        elem.css('top', stickyHeaderHeight);
                    } else if (windowTop < parentOffsetTop) {
                        elem.css('position', '');
                        elem.css('top', '');
                    }
                }
                angular.element($window).bind("resize load", function() {
                    if (!isMobile) {
                        angular.element($window).bind("scroll", function() {
                            stickIt();
                        })
                        stickIt();
                    };
                });
            }
        };
    }
})();