(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    var matchParagraph = function(data) {
        return data.match(/<\s*p[^>]*>(.*)<\s*\/\s*p\s*>/);
    };
    app.directive('projectLadureeVideo', ['$document', '$sce', '$timeout', projectLadureeVideo]);

    function projectLadureeVideo($document, $sce, $timeout) {
        return {
            restrict: 'A',
            templateUrl: '/project-laduree-video.twig',
            scope: {},
            link: function(scope, elem, attrs) {
                var youtubeVideoUrl = 'https://www.youtube.com/embed/',
                    videoUrl, videoLaunched = false,
                    launchAutoParam = '',
                    isMobile = $('.icon-menu').is(':visible'),
                    iframe = elem.find('iframe');
                scope.videoId = attrs['videoId'];
                scope.sliderHome = scope.$eval(attrs['sliderHome']);
                scope.videoParameters = attrs['videoParameters'];
                const launchAuto = scope.$eval(attrs['launchAuto']);
                if (!scope.videoTitle) {
                    scope.videoTitle = attrs['videoTitle'];
                }
                if (launchAuto) {
                    launchAutoParam = '&mute=1&loop=1&version=3&showinfo=0&controls=0&playlist=' + scope.videoId;
                }
                videoUrl = $sce.trustAsResourceUrl(youtubeVideoUrl + scope.videoId + '?color=white&rel=0&autoplay=1&modestbranding=0' + launchAutoParam);
                scope.videoUrl = $sce.valueOf(videoUrl);
                scope.playVideo = function() {
                    if (!isMobile) {
                        iframe.attr('src', scope.videoUrl)
                    }
                    elem.find('.js-video-visual-container .icon').addClass('hidden');
                    iframe.addClass('playing')
                    videoLaunched = true;
                };
                if (launchAuto && !videoLaunched && !scope.sliderHome && !isMobile) {
                    $(window).scroll(function() {
                        const top_of_element = elem.offset().top;
                        const bottom_of_element = elem.offset().top + elem.outerHeight();
                        const bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
                        const top_of_screen = $(window).scrollTop();
                        if (videoLaunched) {
                            return
                        }
                        if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
                            scope.playVideo();
                        }
                    });
                } else if (scope.sliderHome && !isMobile) {
                    scope.playVideo();
                } else if (isMobile) {
                    iframe.attr('src', scope.videoUrl)
                }
            }
        };
    }
})
();