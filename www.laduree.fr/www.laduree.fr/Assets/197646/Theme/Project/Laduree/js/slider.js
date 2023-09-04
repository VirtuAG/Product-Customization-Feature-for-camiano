(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.directive('projectLadureeSlider', ['$timeout', '$rootScope', '$window', projectLadureeSlider]);

    function projectLadureeSlider($timeout, $rootScope, $window) {
        return {
            restrict: 'AE',
            transclude: false,
            scope: {},
            link: function(scope, elem, attrs) {
                const customOptions = scope.$eval(attrs['sliderOptions']);
                let btnCreated = false,
                    nextText = attrs['nextText'],
                    prevText = attrs['prevText'],
                    pauseText = attrs['pauseText'],
                    playText = attrs['playText'],
                    stepText = attrs['stepText'],
                    delay = attrs['delay'] ? scope.$eval(attrs['delay']) : 500,
                    sliderPlaying = true,
                    lineDotClass = 'owl-dot-selected',
                    windowElement = angular.element($window);
                const getOffset = function() {
                    if (elem.find('.' + lineDotClass)[0] && elem.find('.owl-dot.active')[0]) {
                        const activeDotOffset = elem.find('.owl-dot.active')[0].offsetLeft;
                        const parentPadding = ($(elem.find('.' + lineDotClass)[0].closest('div')).innerWidth() - $(elem.find('.' + lineDotClass)[0].closest('div')).width()) / 2;
                        elem.find('.' + lineDotClass)[0].style.marginLeft = activeDotOffset - parentPadding + 'px';
                    }
                };
                const createBtn = function(options) {
                    if (((customOptions && customOptions.pauseBtn) || (options && options.pauseBtn)) && !btnCreated) {
                        btnCreated = true;
                        elem.find('.owl-dots').wrap('<div class="owl-dots-container"></div>')
                        elem.find('.owl-dots-container').prepend($('<span>').prop({
                            className: 'btn btn--rounded btn--secondary btn--rounded-small'
                        }).addClass(sliderPlaying ? 'play' : '').attr('alt', sliderPlaying ? pauseText : playText));
                        var stopPlayBtn = elem.find('.owl-dots-container .btn');
                        stopPlayBtn.on('click', function() {
                            if (sliderPlaying) {
                                sliderPlaying = false;
                                elem.trigger('stop.owl.autoplay')
                                stopPlayBtn.removeClass('play').attr('alt', playText);
                            } else {
                                sliderPlaying = true;
                                elem.trigger('play.owl.autoplay')
                                stopPlayBtn.addClass('play').attr('alt', pauseText);
                            }
                        })
                    }
                };
                const createSlider = function(options) {
                    $timeout(function() {
                        if (attrs['carouselName'] === 'slick') {
                            let key, defaultOptions = {
                                prevArrow: '<button type="button" role="presentation" alt="' + prevText + '" class="owl-prev"><span class="icon icon-arrow"></span></button>',
                                nextArrow: '<button type="button" role="presentation" alt="' + nextText + '" class="owl-next"><span class="icon icon-arrow"></span></button>'
                            };
                            if (options) {
                                for (key in options) {
                                    defaultOptions[key] = options[key];
                                }
                            } else {
                                for (key in customOptions) {
                                    defaultOptions[key] = customOptions[key];
                                }
                            }
                            elem.not('.slick-initialized').slick(defaultOptions);
                        } else {
                            let key, defaultOptions = {
                                navText: ['<span class="icon icon-arrow"></span>', '<span class="icon icon-arrow"></span>']
                            };
                            if (options) {
                                for (key in options) {
                                    defaultOptions[key] = options[key];
                                }
                            } else {
                                for (key in customOptions) {
                                    defaultOptions[key] = customOptions[key];
                                }
                            }
                            elem.owlCarousel(defaultOptions);
                            let resizeLineDot = function() {
                                if (elem.find('.' + lineDotClass).length === 0) {
                                    elem.find('.owl-dots').after($('<span>').prop({
                                        className: lineDotClass
                                    }).width(elem.find('.owl-dot').outerWidth()));
                                } else {
                                    elem.find('.' + lineDotClass).width(elem.find('.owl-dot').outerWidth())
                                }
                                getOffset()
                            }
                            if ((customOptions && customOptions.lineDot) || (options && options.lineDot)) {
                                resizeLineDot();
                                windowElement.on('resize orientationchange', function() {
                                    resizeLineDot();
                                });
                            }
                            let number = 1;
                            elem.find('.owl-dot').each(function() {
                                $(this).attr('alt', stepText + number);
                                number++;
                            })
                            elem.find('.owl-nav .owl-prev').attr('alt', prevText)
                            elem.find('.owl-nav .owl-next').attr('alt', nextText)
                            if ((customOptions && customOptions.sliderNav) || (options && options.sliderNav)) {
                                elem.find('.owl-dots').wrap("<div class='owl-navigation'></div>");
                                elem.find('.owl-nav .owl-prev').prependTo(elem.find('.owl-navigation'));
                                elem.find('.owl-nav .owl-next').appendTo(elem.find('.owl-navigation'));
                            }
                            createBtn(options);
                            if (customOptions && customOptions.sliderNavBefore || (options && options.sliderNavBefore)) {
                                if (!elem.find('.owl-nav').hasClass('disabled')) {
                                    elem.find('.owl-dots').wrap("<div class='owl-navigation'></div>");
                                    elem.find('.owl-nav .owl-next').prependTo(elem.find('.owl-navigation'));
                                    elem.find('.owl-nav .owl-prev').prependTo(elem.find('.owl-navigation'));
                                }
                            }
                            createBtn();
                            elem.on('changed.owl.carousel resize initialized.owl.carousel', function() {
                                if ((customOptions && customOptions.lineDot) || (options && options.lineDot)) {
                                    getOffset()
                                }
                            });
                        }
                    }, delay);
                }
                createSlider();
                $rootScope.$on('carouselUpdate', function(event, element, options) {
                    if (element[0] === elem[0]) {
                        element.find('.' + lineDotClass).remove();
                        $rootScope.$emit('carousel:changing');
                        $timeout(function() {
                            createSlider(options);
                            $rootScope.$emit('carousel:changed');
                            elem.removeClass('owl-hidden');
                        }, 1000);
                    }
                })
            }
        };
    }
})();