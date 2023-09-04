(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.directive('projectAnchorScroll', ['$location', '$anchorScroll', '$timeout', '$rootScope', projectAnchorScroll])

    function projectAnchorScroll($location, $anchorScroll, $timeout, $rootScope) {
        function animateScroll(id, animated, attributes) {
            const isMobile = $('.icon-menu').is(':visible');
            const isAccordion = attributes['isAccordion'];
            var animate = typeof animated === "boolean" ? animated : true;
            var staticElements = function() {
                const header = $('#header');
                let staticElementsHeight;
                if (isMobile) {
                    return 150;
                }
                staticElementsHeight = header.outerHeight();
                return staticElementsHeight
            }
            let offset;
            if (isAccordion && !isMobile) {
                offset = jQuery('#tabs').offset();
            } else {
                offset = jQuery('#' + id).offset();
            }
            var scroll = function() {
                jQuery('html, body').animate({
                    scrollTop: offset.top + 100 - staticElements()
                }, 1000);
            }
            if (offset) {
                if (animate) {
                    scroll()
                } else {
                    $timeout(function() {
                        scroll()
                    }, 200);
                }
            } else {
                $anchorScroll(id);
            }
        }
        return {
            restrict: 'A',
            priority: 10000,
            compile: function(element, attributes) {
                let anchor;
                if (attributes['projectAnchorScroll']) {
                    $timeout(function() {
                        anchor = attributes['projectAnchorScroll'];
                        element.attr('href', window.location.pathname + window.location.search + '#' + anchor)
                    }, 100);
                }
                return function(scope, elem, attr) {
                    const isToggle = attr['isToggle'];
                    let anchor;
                    const animate = attr['animate'] ? scope.$eval(attr['animate']) : true;
                    if (attr['projectAnchorScroll']) {
                        elem.click(function(event) {
                            $timeout(function() {
                                anchor = attr['projectAnchorScroll'];
                                if (attr['isAccordion']) {
                                    $('#' + attr['isAccordion']).collapse('show');
                                    $rootScope.$emit('tabs:open', attr['isAccordion']);
                                }
                                event.preventDefault();
                                if (!isToggle) {
                                    event.stopPropagation();
                                }
                                animateScroll(anchor, animate, attr);
                            }, 100);
                        });
                    }
                }
            }
        }
    };
})();