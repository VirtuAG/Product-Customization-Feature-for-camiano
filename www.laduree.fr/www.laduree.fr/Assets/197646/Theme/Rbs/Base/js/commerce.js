(function(__change) {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.filter('rbsFormatRate', ['proximisIntlFormatter', function(proximisIntlFormatter) {
        var formatters = {};
        return function(input, fractionSize) {
            if (!angular.isNumber(input)) {
                return input;
            }
            if (!angular.isNumber(fractionSize)) {
                fractionSize = 2;
            }
            var key = fractionSize;
            if (!formatters.hasOwnProperty(key)) {
                var options = {
                    style: 'percent',
                    minimumFractionDigits: fractionSize,
                    maximumFractionDigits: fractionSize
                };
                formatters[key] = proximisIntlFormatter.getNumberFormatter(options);
            }
            return formatters[key].format(input);
        };
    }]);
    app.filter('rbsFormatPrice', ['proximisIntlFormatter', function(proximisIntlFormatter) {
        var formatters = {};
        return function(input, currencyCode, fractionSize) {
            if (!angular.isNumber(input)) {
                return input;
            }
            fractionSize = angular.isNumber(fractionSize) ? fractionSize : undefined;
            var key = currencyCode + '-' + fractionSize;
            if (!formatters.hasOwnProperty(key)) {
                var params = {
                    style: 'currency',
                    currency: currencyCode
                };
                if (fractionSize !== undefined) {
                    params.minimumFractionDigits = fractionSize;
                    params.maximumFractionDigits = fractionSize;
                }
                formatters[key] = proximisIntlFormatter.getNumberFormatter(params);
            }
            return formatters[key].format(input);
        };
    }]);
    app.provider('RbsChange.ProductService', function ProductServiceProvider() {
        var config = {};
        this.setConfig = function(newConfig) {
            angular.extend(config, newConfig);
        };
        this.$get = ['$rootScope', '$q', 'RbsChange.ModalStack', 'RbsChange.AjaxAPI', function($rootScope, $q, ModalStack, AjaxAPI) {
            function extractPictogram(productData) {
                if (productData && productData['typology'] && productData['typology'].attributes && productData['typology'].attributes.pictograms) {
                    var attr = productData['typology'].attributes.pictograms;
                    if (attr && attr.value && attr.value.length) {
                        return attr.value;
                    }
                }
                return null;
            }

            function extractAnimations(productData, showPictogram) {
                if (productData && productData.animations && productData.animations.length) {
                    if (showPictogram !== false) {
                        angular.forEach(productData.animations, function(animation) {
                            animation.formats = animation.pictogram;
                        });
                    }
                    return productData.animations;
                }
                return null;
            }

            function extractVisuals(productData) {
                if (productData && productData.common && productData.common.visuals) {
                    var visuals = productData.common.visuals;
                    if (visuals && visuals.length) {
                        return visuals;
                    }
                }
                return null;
            }

            function extractBrand(productData) {
                if (productData && productData.common.brand && productData.common.brand.common) {
                    return productData.common.brand;
                }
                return null;
            }

            function extractURL(productData) {
                if (productData && angular.isObject(productData.common.URL) && productData.common.URL.publishedInWebsite) {
                    return productData.common.URL['contextual'] || productData.common.URL['canonical'];
                }
                return null;
            }

            function extractSpecificationsTitle(productData) {
                if (productData && angular.isObject(productData['typology']) && angular.isObject(productData['typology'].contexts.specifications)) {
                    return productData['typology'].contexts.specifications.title;
                }
                return null;
            }

            function addToCart(data, params) {
                if (!params) {
                    params = {
                        detailed: false,
                        URLFormats: 'canonical',
                        visualFormats: 'shortCartItem'
                    }
                }
                if (data) {
                    data.clientDate = (new Date()).toString();
                }
                return AjaxAPI.postData('Rbs/Commerce/Cart/Lines', data, params).then(function(result) {
                    var cart = result.data.dataSets;
                    var refreshCart = !!cart;
                    if (refreshCart) {
                        $rootScope.$broadcast('rbsRefreshCart', {
                            cart: cart,
                            linesAdded: cart.linesAdded
                        });
                    }
                    return result;
                });
            }
            return {
                extractPictogram: extractPictogram,
                extractAnimations: extractAnimations,
                extractVisuals: extractVisuals,
                extractBrand: extractBrand,
                extractURL: extractURL,
                extractSpecificationsTitle: extractSpecificationsTitle,
                addToCart: addToCart
            };
        }];
    });
    app.run(['$rootScope', 'RbsChange.AjaxAPI', function($rootScope, AjaxAPI) {
        $rootScope.$on('rbsStorelocatorChooseStore', function(event, storeId) {
            if (angular.isNumber(storeId)) {
                var data = {
                    storeId: storeId
                };
                var storeData = null;
                AjaxAPI.putData('Rbs/Storeshipping/Store/Default', data, {
                    URLFormats: 'canonical'
                }).then(function(result) {
                    if (!angular.isArray(result.data.dataSets) && angular.isObject(result.data.dataSets)) {
                        storeData = result.data.dataSets;
                    }
                    $rootScope.$emit('rbsStorelocatorDefaultStore', storeData);
                }, function(result) {
                    console.error('on rbsStorelocatorChooseStore', result, storeId);
                });
            } else {
                AjaxAPI.getData('Rbs/Storeshipping/Store/Default', {}, {
                    URLFormats: 'canonical'
                }).then(function(result) {
                    if (!angular.isArray(result.data.dataSets) && angular.isObject(result.data.dataSets)) {
                        storeData = result.data.dataSets;
                    }
                    $rootScope.$emit('rbsStorelocatorDefaultStore', storeData);
                }, function(result) {
                    console.error('on rbsStorelocatorChooseStore', result, storeId);
                });
            }
        });
        $rootScope.$on('rbsUserConnected', function(event, params) {
            if (params && params.accessorId) {
                $rootScope.$emit('rbsStorelocatorChooseStore', null);
            }
        });
    }])
})(window.__change);