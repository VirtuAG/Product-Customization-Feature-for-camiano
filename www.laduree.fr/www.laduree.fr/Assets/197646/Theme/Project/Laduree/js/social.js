(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.directive('projectLadureeInstagramFeed', projectLadureeInstagramFeed);

    function projectLadureeInstagramFeed() {
        return {
            restrict: 'AE',
            transclude: false,
            link: function(scope, elem, attrs) {
                if (!attrs['tokenId'])
                    return;
                var feed = new Instafeed({
                    get: 'user',
                    target: elem[0],
                    limit: 4,
                    userId: '621790364',
                    template: '<a href="{{link}}" class="instagram__link"><span class="instagram__image-container"><img class="instagram__image" alt="{{caption}}" src="{{image}}" /></span></a>',
                    accessToken: attrs['tokenId']
                });
                feed.run();
            }
        };
    }
})();