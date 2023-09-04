(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.directive('projectLadureeMenu', ['$window', projectLadureeMenu]);

    function projectLadureeMenu($window) {
        return {
            restrict: 'A',
            scope: {
                elm: '@',
                toggleClass: '@',
                hideClass: '@',
                headerHeight: '@',
                menuContainer: '@',
                submenusElem: '@'
            },
            link: function(scope, element) {
                var lastScrollTop = 0;
                var doToggle = function() {
                    var elmOffsetBottom = $(scope.elm).innerHeight(),
                        check = $window.pageYOffset > elmOffsetBottom,
                        scrollTop = $window.pageYOffset,
                        posCheck = $window.pageYOffset > elmOffsetBottom;
                    $(element).toggleClass(scope.toggleClass, check);
                    if (scrollTop > lastScrollTop) {
                        $(element).toggleClass(scope.hideClass, posCheck);
                    } else {
                        $(element).toggleClass(scope.hideClass, false);
                    }
                    lastScrollTop = scrollTop;
                };
                var setMaxHeight = function() {
                    var headerHeight = $(scope.headerHeight).outerHeight(),
                        windowHeight = window.innerHeight,
                        menuHeight = windowHeight - headerHeight;
                    $(element).find(scope.submenusElem).each(function() {
                        $(this).css('height', menuHeight)
                    });
                    $(element).find(scope.menuContainer).css('max-height', menuHeight);
                };
                angular.element($window).bind("scroll resize load", function() {
                    doToggle();
                    setMaxHeight();
                });
            }
        };
    }
    app.directive('projectLadureeMenuOverlay', ['$rootScope', '$window', projectLadureeMenuOverlay]);

    function projectLadureeMenuOverlay($rootScope) {
        return {
            restrict: 'A',
            link: function(scope) {
                var openClass = 'menu__submenu--open',
                    parentOpenClass = 'menu__submenu--is-open',
                    parent = $('.header__menu-container');
                scope.overlayMenuShown = false;
                scope.$watch('overlayMenuShown', function() {
                    $rootScope.overlayMenuShown = scope.overlayMenuShown;
                });
                scope.$watch('showMenu', function() {
                    $('.menu__submenu').each(function() {
                        $(this).removeClass(openClass)
                        parent.removeClass(parentOpenClass);
                    })
                });
                scope.toggleChildren = function(id) {
                    const menuItem = $('#menu__' + id)
                    menuItem.toggleClass(openClass).css('top', parent[0].scrollTop);
                    parent.toggleClass(parentOpenClass);
                }
            }
        }
    }
})();