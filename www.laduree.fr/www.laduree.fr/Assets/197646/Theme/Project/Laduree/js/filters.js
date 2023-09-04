(function(__change) {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    });
    app.filter('capitalize', function() {
        return function(input) {
            return (angular.isString(input) && input.length > 0) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : input;
        }
    });
    app.filter('stripHTML', function() {
        return function(input) {
            if (!input)
                return;
            return input.split('>').map((i) => i.split('<')[0]).filter((i) => !i.includes('=') && i.trim()).join('');
        };
    });
    app.filter('trim', function() {
        return function(input, limit) {
            if (input.length > limit) {
                return input.slice(0, limit) + '...'
            } else {
                return input
            }
        };
    });
    app.filter('contain', function() {
        return function(input, value) {
            return input.includes(value)
        }
    });
    app.filter('objLength', function() {
        return function(input) {
            let newInput = {};
            for (const shippingItem in input) {
                if (input[shippingItem]) {
                    newInput[shippingItem] = input[shippingItem]
                }
            }
            return Object.keys(newInput).length;
        }
    });
})(window.__change);