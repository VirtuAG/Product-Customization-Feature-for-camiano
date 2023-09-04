(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.directive('ladureeGtmSwitchLang', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.click = function(lang) {
                    dataLayer.push({
                        'event': 'langue',
                        'langage': lang,
                    });
                };
            }
        }
    });
    app.directive('ladureeGtmProductList', function() {
        return {
            restrict: 'A',
            link: function($scope, elem, attr) {
                $scope.listId = attr['listId'];
                $scope.listLabel = attr['listLabel'];
                let items = [];
                $scope.addItem = function(item, last) {
                    items.push(item);
                    if (last) {
                        dataLayer.push({
                            ecommerce: null
                        });
                        dataLayer.push({
                            'event': 'view_item_list',
                            'ecommerce': {
                                'items': items
                            }
                        });
                        items = [];
                    }
                }
            }
        }
    });
    app.directive('ladureeGtmProductListItem', function() {
        return {
            restrict: 'A',
            link: function($scope, elem, attr) {
                let data = JSON.parse(attr['item']);
                let productData = {
                    'item_name': data.common.title,
                    'item_id': data.stock.sku,
                    'price': typeof(data.price.valueWithTax) !== "undefined" ? data.price.valueWithTax.toString() : '0',
                    'item_brand': '',
                    'item_category': typeof(data.typology.attributes.productCategory.value) !== "undefined" ? data.typology.attributes.productCategory.value : '',
                    'item_variant': '',
                    'item_list_name': $scope.listLabel,
                    'item_list_id': $scope.listId,
                    'index': attr['index'],
                    'quantity': 1
                };
                $scope.addItem(productData, attr['last']);
            }
        }
    });
    app.directive('ladureeGtmProductDetail', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                let data = $scope.blockData;
                let variant = [];
                if (data.rootProduct) {
                    angular.forEach(data.rootProduct.variants.axes, function(axe) {
                        if (axe.technicalName === 'PARF') {
                            angular.forEach(axe.defaultItems, function(parf) {
                                variant.push(parf.title);
                            });
                        }
                    });
                }
                dataLayer.push({
                    ecommerce: null
                });
                dataLayer.push({
                    'event': 'view_item',
                    'ecommerce': {
                        'items': [{
                            'item_name': data.common.title,
                            'item_id': data.stock.sku,
                            'price': typeof(data.price.valueWithTax) !== "undefined" ? data.price.valueWithTax.toString() : '0',
                            'item_brand': '',
                            'item_category': typeof(data.typology.attributes.productCategory.value) !== "undefined" ? data.typology.attributes.productCategory.value : '',
                            'item_variant': variant.length > 0 ? variant : '',
                            'item_list_name': '',
                            'item_list_id': 0,
                            'index': 0,
                            'quantity': 1
                        }]
                    }
                });
            }
        }
    });
    app.directive('ladureeGtmCart', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                let launchEvent = function(type, line, newQty) {
                    let category = '';
                    if (line.product !== undefined && line.product.typology !== undefined && line.product.typology.attributes !== undefined) {
                        if (typeof(line.product.typology.attributes.productCategory.value) !== "undefined") {
                            category = line.product.typology.attributes.productCategory.value;
                        }
                    }
                    dataLayer.push({
                        ecommerce: null
                    });
                    dataLayer.push({
                        'event': type,
                        'ecommerce': {
                            'items': [{
                                'item_name': line.designation,
                                'item_id': line.codeSKU,
                                'price': line.unitAmountWithTaxes.toString(),
                                'item_brand': '',
                                'item_category': category,
                                'item_variant': '',
                                'item_list_name': '',
                                'item_list_id': 0,
                                'index': 0,
                                'quantity': newQty
                            }]
                        }
                    });
                }
                $scope.eventAddProduct = function(productData, newQty) {
                    if (productData !== undefined && productData !== null) {
                        launchEvent('add_to_cart', {
                            designation: productData.common.title,
                            codeSKU: productData.stock.sku,
                            unitAmountWithTaxes: typeof(productData.price.valueWithTax) !== "undefined" ? productData.price.valueWithTax : 0,
                            product: {
                                typology: typeof(productData.typology) !== "undefined" ? productData.typology : {}
                            }
                        }, newQty);
                    }
                }
                $scope.eventAdd = function(line, newQty) {
                    launchEvent('add_to_cart', line, newQty);
                }
                $scope.eventRemove = function(line, newQty) {
                    launchEvent('remove_from_cart', line, newQty);
                }
                $scope.eventRemoveAll = function(line) {
                    $scope.eventRemove(line, 0);
                };
            }
        }
    });
    app.directive('ladureeGtmBeginCheckout', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                var items = [];
                angular.forEach(__change['cartData'].lines, function(line) {
                    let variant = [];
                    if (line.options !== undefined && line.options.axesInfo) {
                        angular.forEach(line.options.axesInfo, function(axe) {
                            if (axe.technicalName === 'PARF') {
                                variant.push(axe.value);
                            }
                        });
                    }
                    let category = '';
                    if (line.product !== undefined && line.product.typology !== undefined && line.product.typology.attributes !== undefined) {
                        if (typeof(line.product.typology.attributes.productCategory.value) !== "undefined") {
                            category = line.product.typology.attributes.productCategory.value;
                        }
                    }
                    items.push({
                        'item_name': line.product.common.title,
                        'item_id': line.codeSKU,
                        'price': line.unitAmountWithTaxes.toString(),
                        'item_brand': '',
                        'item_category': category,
                        'item_variant': variant.length > 0 ? variant : '',
                        'item_list_name': '',
                        'item_list_id': 0,
                        'index': 0,
                        'quantity': line.quantity
                    });
                });
                dataLayer.push({
                    ecommerce: null
                });
                dataLayer.push({
                    'event': 'begin_checkout',
                    'ecommerce': {
                        'checkout_step': 1,
                        'items': items
                    }
                });
            }
        };
    });
    app.directive('ladureeGtmCheckout', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            link: function($scope) {
                var items = [];
                let intStep;
                angular.forEach(__change['cartData'].lines, function(line) {
                    let variant = [];
                    if (line.options !== undefined && line.options.axesInfo) {
                        angular.forEach(line.options.axesInfo, function(axe) {
                            if (axe.technicalName === 'PARF') {
                                variant.push(axe.value);
                            }
                        });
                    }
                    let category = '';
                    if (line.product !== undefined && line.product.typology !== undefined && line.product.typology.attributes !== undefined) {
                        if (typeof(line.product.typology.attributes.productCategory.value) !== "undefined") {
                            category = line.product.typology.attributes.productCategory.value;
                        }
                    }
                    items.push({
                        'item_name': line.product.common.title,
                        'item_id': line.codeSKU,
                        'price': line.unitAmountWithTaxes,
                        'item_brand': '',
                        'item_category': category,
                        'item_variant': variant.length > 0 ? variant : '',
                        'item_list_name': '',
                        'item_list_id': 0,
                        'index': 0,
                        'quantity': line.quantity
                    });
                });
                $scope.$watch('currentStep', function(step) {
                    if (step) {
                        switch (step) {
                            case 'identification':
                                intStep = 2;
                                break;
                            case 'shipping':
                                intStep = 3;
                                break;
                            case 'payment':
                                intStep = 4;
                                break;
                        }
                        dataLayer.push({
                            ecommerce: null
                        });
                        let data = {
                            'event': 'checkout_progress',
                            'ecommerce': {
                                'checkout_step': intStep,
                                'items': items
                            }
                        };
                        if (intStep === 2) {
                            data.checkout_progress_step = 'connection';
                        }
                        dataLayer.push(data);
                    }
                });
                $rootScope.$on('gtm:addPaymentInformation', function(evt, connector) {
                    dataLayer.push({
                        ecommerce: null
                    });
                    dataLayer.push({
                        'event': 'add_payment_info',
                        'ecommerce': {
                            'checkout_step': intStep,
                            'payment_type': connector.common.title,
                            'items': items
                        }
                    });
                })
                $rootScope.$on('gtm:addShippingInformation', function() {
                    let shippingModeCodes = [];
                    if (__change['cartData']['deliveries'] !== undefined) {
                        for (const [key, delivery] of Object.entries(__change['cartData']['deliveries'])) {
                            if (delivery['options']['code'] !== undefined) {
                                shippingModeCodes.push(delivery['options']['code']);
                            }
                        }
                    }
                    dataLayer.push({
                        ecommerce: null
                    });
                    dataLayer.push({
                        'event': 'add_shipping_info',
                        'ecommerce': {
                            'checkout_step': intStep,
                            'shipping_tier': shippingModeCodes.join('-'),
                            'items': items
                        }
                    });
                })
                $rootScope.$on('gtm:selectBillingAddressInformation', function() {
                    dataLayer.push({
                        ecommerce: null
                    });
                    dataLayer.push({
                        'event': 'checkout_progress',
                        'checkout_progress_step': 'billing_information',
                        'ecommerce': {
                            'checkout_step': 4,
                            'items': items
                        }
                    });
                })
            }
        };
    }]);
    app.directive('ladureeGtmCheckoutShippingInformation', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.addShippingInformation = function() {
                    $rootScope.$emit('gtm:addShippingInformation');
                }
            }
        };
    }]);
    app.directive('ladureeGtmCheckoutPaymentInformation', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.addPaymentInformation = function(connector) {
                    $rootScope.$emit('gtm:addPaymentInformation', connector);
                }
            }
        };
    }]);
    app.directive('ladureeGtmCheckoutBillingAddress', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.selectBillingAddressInformation = function(connector) {
                    $rootScope.$emit('gtm:selectBillingAddressInformation', connector);
                }
            }
        };
    }]);
    app.directive('ladureeGtmCheckoutPaymentAdyenInformation', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            link: function($scope, elem, attr) {
                let connectorInfo = JSON.parse(attr['connectorInfo']);
                if (connectorInfo !== null) {
                    $rootScope.$emit('gtm:addPaymentInformation', connectorInfo);
                }
            }
        };
    }]);
    app.directive('ladureeGtmCheckoutValidGiftMessage', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.validGiftMessageGtm = function() {
                    dataLayer.push({
                        'event': 'checkout_gift'
                    });
                }
            }
        };
    }]);
    app.directive('ladureeGtmAddCartPopin', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                dataLayer.push({
                    'event': 'page_view',
                    'virtualPagePath': '/pop-in/pop-in-ajout-panier-2',
                    'virtualPageTitle': 'pop-in ajout panier 2',
                });
            }
        }
    });
    app.directive('ladureeGtmChooseStoreAtHome', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.chooseStoreAtHome = function() {
                    dataLayer.push({
                        'event': 'click&collect_delivery_shop',
                        'code_postal': $scope.checkedZipCode
                    });
                }
            }
        }
    });
    app.directive('ladureeGtmChooseStoreDelivery', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.chooseStoreDelivery = function() {
                    let storeTitle = '';
                    if ($scope.extendedCartBox !== undefined) {
                        storeTitle = $scope.extendedCartBox.store.storeTitle;
                    } else if ($scope.$parent.extendedCartBox !== undefined) {
                        storeTitle = $scope.$parent.extendedCartBox.store.storeTitle;
                    }
                    if (storeTitle !== '') {
                        dataLayer.push({
                            'event': 'click&collect_shop',
                            'store_code': storeTitle
                        });
                    }
                }
            }
        }
    });
    app.directive('ladureeGtmNewsletter', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.eventMailingList = function() {
                    dataLayer.push({
                        'event': 'newsletter',
                    });
                };
            }
        }
    });
    app.directive('ladureeGtmFormSuccess', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                if (typeof $scope.blockParameters.machineName !== 'undefined') {
                    dataLayer.push({
                        'event': 'contact',
                        'form_type': $scope.blockParameters.machineName
                    });
                }
            }
        }
    });
    app.directive('ladureeGtmAccountCreation', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.$watch('accountConfirmed', function(accountConfirmed, oldAccountConfirmed) {
                    if (accountConfirmed) {
                        let method = 'email';
                        if ($scope.parameters.socialEmail) {
                            method = 'facebook';
                        }
                        dataLayer.push({
                            'event': 'sign_up',
                            'method': method
                        });
                    }
                });
            }
        }
    });
    app.directive('ladureeGtmAccountLogin', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            link: function($scope) {
                $rootScope.$on('rbsUserConnected', function(event, params) {
                    dataLayer.push({
                        'event': 'login',
                        'method': 'email',
                    });
                });
                $scope.eventLogin = function(method) {}
            }
        }
    }]);
    app.directive('ladureeGtmTransactionConfirmation', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                let transactionId = $scope.blockParameters.transactionId;
                if (!isNaN(transactionId) && transactionId !== 0) {
                    dataLayer.push({
                        ecommerce: null
                    });
                    dataLayer.push({
                        'event': 'purchase',
                        'transaction_id': transactionId.toString(),
                    });
                    let constructItem = function(line) {
                        let variant = [];
                        if (line.options !== undefined && line.options.axesInfo) {
                            angular.forEach(line.options.axesInfo, function(axe) {
                                if (axe.technicalName === 'PARF') {
                                    variant.push(axe.value);
                                }
                            });
                        }
                        let category = '';
                        if (line.product !== undefined && line.product.typology !== undefined && line.product.typology.attributes !== undefined) {
                            if (typeof(line.product.typology.attributes.productCategory.value) !== "undefined") {
                                category = line.product.typology.attributes.productCategory.value;
                            }
                        }
                        items.push({
                            'item_name': line.designation !== undefined ? line.designation : line.product.common.title,
                            'item_id': line.codeSKU,
                            'price': line.unitAmountWithTaxes,
                            'item_brand': '',
                            'item_category': category,
                            'item_variant': variant.length > 0 ? variant : '',
                            'item_list_name': '',
                            'item_list_id': 0,
                            'index': 0,
                            'quantity': line.quantity
                        });
                    };
                    var items = [];
                    let couponNames = [];
                    let shippingAmount = 0;
                    let totalAmount = 0;
                    let totalTaxesAmount = 0;
                    let currencyCode = __change.currencyCode;
                    if ($scope.blockData.cart !== undefined) {
                        angular.forEach($scope.blockData.cart.deliveries, function(delivery) {
                            angular.forEach(delivery.lines, function(line) {
                                constructItem(line)
                            });
                        });
                        angular.forEach(__change.returnCartData.coupons, function(coupon) {
                            couponNames.push(coupon.code);
                        });
                        angular.forEach(__change.returnCartData.deliveries, function(delivery) {
                            angular.forEach(delivery.modifiers, function(modifier) {
                                if (modifier.options.isForShipping) {
                                    shippingAmount += modifier.amountWithTaxes
                                }
                            });
                        });
                        totalAmount = __change.returnCartData.common.totalAmount;
                        if (__change.returnCartData.common.totalTaxesAmount !== undefined && __change.returnCartData.common.totalTaxesAmount !== null) {
                            totalTaxesAmount = __change.returnCartData.common.totalTaxesAmount;
                        }
                        currencyCode = __change.returnCartData.common.currencyCode;
                    } else if ($scope.blockData.orders !== undefined) {
                        let totalAmountWithTaxes = 0;
                        let totalAmountWithoutTaxes = 0;
                        angular.forEach($scope.blockData.orders, function(order) {
                            angular.forEach(order.lines, function(line) {
                                constructItem(line)
                            });
                            angular.forEach(order.coupons, function(coupon) {
                                couponNames.push(coupon.code);
                            });
                            angular.forEach(order.modifiers, function(modifier) {
                                if (modifier.options.isForShipping) {
                                    shippingAmount += modifier.amountWithTaxes
                                }
                            });
                            totalAmountWithTaxes = order.totalAmountWithTaxes;
                            totalAmountWithoutTaxes = order.totalAmountWithoutTaxes;
                        });
                        totalAmount = totalAmountWithTaxes;
                        totalTaxesAmount = Math.round((totalAmountWithTaxes - totalAmountWithoutTaxes) * 100) / 100;
                    }
                    dataLayer.push({
                        'event': 'purchase',
                        'ecommerce': {
                            'transaction_id': transactionId.toString(),
                            'value': totalAmount.toString(),
                            'tax': totalTaxesAmount.toString(),
                            'shipping': shippingAmount.toString(),
                            'currency': currencyCode,
                            'coupon': couponNames.join(','),
                            'items': items,
                        }
                    });
                }
            }
        };
    });
    app.directive('ladureeGtmSearch', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.eventSearch = function(term) {
                    dataLayer.push({
                        'event': 'search',
                        'search_term': term,
                    });
                }
            }
        };
    });
    app.directive('ladureeGtmSearchResult', function() {
        return {
            restrict: 'A',
            link: function($scope, elem, attr) {
                dataLayer.push({
                    'event': 'view_search_results',
                    'search_term': attr['searchText'],
                });
            }
        };
    });
    app.controller('LadureeGtmController', ['$scope', function($scope) {
        $scope.trackTitle = function(title) {
            if (typeof(title) !== "undefined" && __change.isHomepage === true) {
                dataLayer.push({
                    'event': 'encart_homepage',
                    'cta_clicked': title,
                    'encart_title': 'slider homepage',
                });
            }
        };
    }]);
    app.directive('ladureeGtmStoreSearch', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.$watch('formattedAddress', function(formattedAddress, oldFormattedAddress) {
                    if (typeof(formattedAddress) !== "undefined" && formattedAddress !== null && oldFormattedAddress !== formattedAddress) {
                        dataLayer.push({
                            'event': 'search_store',
                            'searchCountry': $scope.searchCountry.isoCode,
                        });
                    }
                });
            }
        }
    });
    app.directive('ladureeGtmBookTable', function() {
        return {
            restrict: 'A',
            link: function($scope, elem, attr) {
                $scope.bookTable = function(url) {
                    dataLayer.push({
                        'event': 'book_table'
                    });
                    window.open(attr['url'], '_blank').focus();
                }
            }
        }
    });
    app.directive('ladureeGtmOpenMacaronComposer', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.open = function() {
                    dataLayer.push({
                        'event': 'start_composeur_mac',
                        'composeur_step': 0,
                        'composeur_type': 'coffret macaron'
                    });
                }
            }
        }
    });
    app.directive('ladureeGtmGiftComposer', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.startGtm = function() {
                    dataLayer.push({
                        'event': 'composeur_gift',
                        'composeur_step': 1,
                        'composeur_type': 'coffret cadeau'
                    });
                }
                $scope.selectSizeGtm = function(size) {
                    dataLayer.push({
                        'event': 'coffret_size_gift',
                        'composeur_step': 2,
                        'composeur_type': 'coffret cadeau',
                        'coffret_size': size
                    });
                }
                $scope.selectColorGtm = function(box) {
                    dataLayer.push({
                        'event': 'coffret_color_gift',
                        'composeur_step': 3,
                        'composeur_type': 'coffret cadeau',
                        'coffret_color': box.axesValues[0]
                    });
                }
                $scope.selectBoxMacaronGtm = function(box) {
                    dataLayer.push({
                        'event': 'coffret_box_mac_gift',
                        'composeur_step': 4,
                        'composeur_type': 'coffret cadeau',
                        'coffret_name': box.common.title
                    });
                }
                $scope.customGiftGtm = function(step) {
                    let s = parseInt(step, 10)
                    s += 5;
                    dataLayer.push({
                        'event': 'composeur_custom_gift',
                        'composeur_step': s,
                        'composeur_type': 'coffret cadeau'
                    });
                }
                $scope.changeSizeGtm = function() {
                    dataLayer.push({
                        'event': 'composeur_change_box',
                        'composeur_step': 4,
                        'composeur_type': 'coffret cadeau',
                    });
                }
                $scope.closeGtm = function(stepCount) {
                    dataLayer.push({
                        'event': 'composeur_stop',
                        'composeur_step': stepCount,
                        'composeur_type': 'coffret cadeau',
                    });
                }
                $scope.addBoxGtm = function(productData) {
                    if (productData !== undefined && productData !== null) {
                        let typology = typeof(productData.typology) !== "undefined" ? productData.typology : {};
                        let category = '';
                        let productQty = 0;
                        if (typology !== undefined && typology.attributes !== undefined) {
                            if (typeof(typology.attributes.productCategory.value) !== "undefined") {
                                category = typology.attributes.productCategory.value;
                            }
                            if (typeof(typology.attributes.productQty.value) !== "undefined") {
                                productQty = typology.attributes.productQty.value;
                            }
                        }
                        let price = typeof(productData.price.valueWithTax) !== "undefined" ? productData.price.valueWithTax : 0;
                        dataLayer.push({
                            ecommerce: null
                        });
                        dataLayer.push({
                            'event': 'composeur_add_to_cart',
                            'composeur_step': 5 + productQty,
                            'composeur_type': 'coffret cadeau',
                            'ecommerce': {
                                'items': [{
                                    'item_name': productData.common.title,
                                    'item_id': productData.stock.sku,
                                    'price': price.toString(),
                                    'item_brand': '',
                                    'item_category': category,
                                    'item_variant': '',
                                    'item_list_name': '',
                                    'item_list_id': 0,
                                    'index': 0,
                                    'quantity': 1
                                }],
                            }
                        });
                    }
                }
            }
        }
    });
    app.directive('ladureeGtmMacaronComposer', function() {
        return {
            restrict: 'A',
            link: function($scope) {
                $scope.startGtm = function() {
                    dataLayer.push({
                        'event': 'composeur_mac',
                        'composeur_step': 1,
                        'composeur_type': 'coffret macaron'
                    });
                }
                $scope.selectShippingGtm = function(shippingTier) {
                    dataLayer.push({
                        'event': 'shipping_info_mac',
                        'composeur_step': 2,
                        'composeur_type': 'coffret macaron',
                        'shipping_tier': shippingTier
                    });
                }
                $scope.selectBoxGtm = function(boxName) {
                    dataLayer.push({
                        'event': 'coffret_type_mac',
                        'composeur_step': 3,
                        'composeur_type': 'coffret macaron',
                        'coffret_name': boxName
                    });
                }
                $scope.filterBoxGtm = function() {
                    dataLayer.push({
                        'event': 'composeur_filter_mac',
                        'composeur_step': 3,
                        'composeur_type': 'coffret macaron',
                    });
                }
                $scope.customBoxGtm = function() {
                    dataLayer.push({
                        'event': 'composeur_custom_mac',
                        'composeur_step': 4,
                        'composeur_type': 'coffret macaron',
                    });
                }
                $scope.changeSizeGtm = function() {
                    dataLayer.push({
                        'event': 'composeur_change_box',
                        'composeur_step': 4,
                        'composeur_type': 'coffret macaron',
                    });
                }
                $scope.closeGtm = function(stepCount) {
                    dataLayer.push({
                        'event': 'composeur_stop',
                        'composeur_step': stepCount + 1,
                        'composeur_type': 'coffret macaron',
                    });
                }
                $scope.addBoxGtm = function(productData) {
                    if (productData !== undefined && productData !== null) {
                        let typology = typeof(productData.typology) !== "undefined" ? productData.typology : {};
                        let category = '';
                        if (typology !== undefined && typology.attributes !== undefined) {
                            if (typeof(typology.attributes.productCategory.value) !== "undefined") {
                                category = typology.attributes.productCategory.value;
                            }
                        }
                        let price = typeof(productData.price.valueWithTax) !== "undefined" ? productData.price.valueWithTax : 0;
                        dataLayer.push({
                            ecommerce: null
                        });
                        dataLayer.push({
                            'event': 'composeur_add_to_cart',
                            'composeur_step': 5,
                            'composeur_type': 'coffret macaron',
                            'ecommerce': {
                                'items': [{
                                    'item_name': productData.common.title,
                                    'item_id': productData.stock.sku,
                                    'price': price.toString(),
                                    'item_brand': '',
                                    'item_category': category,
                                    'item_variant': '',
                                    'item_list_name': '',
                                    'item_list_id': 0,
                                    'index': 0,
                                    'quantity': 1
                                }],
                            }
                        });
                    }
                }
            }
        }
    });
    app.directive('ladureeWishedSlot', ['RbsChange.AjaxAPI', function(AjaxAPI) {
        return {
            restrict: 'A',
            scope: true,
            link: function($scope) {
                $scope.$watch('shippingMode', function() {
                    let transporterId = $scope.shippingModeInfo.common.id;
                    AjaxAPI.postData('Laduree/Laduree/GetTransporterCode', {
                        'transporterId': transporterId
                    }).then(function(result) {
                        if (result.data.dataSets.isUrbitSlot === true) {
                            $scope.shippingMode.options.isUrbitSlot = true;
                            if (typeof $scope.method !== 'undefined') {
                                $scope.method.value = "specific";
                            }
                        } else {
                            $scope.shippingMode.options.isUrbitSlot = false;
                        }
                    }, function(result) {
                        console.error(result);
                    });
                    if ($scope.shippingMode.options.code === 'urb-it-slot') {
                        if (typeof $scope.shippingMode.options.formattedWishCustomerReceiptDateParts !== 'undefined') {
                            let originalHour = parseInt($scope.shippingMode.options.formattedWishCustomerReceiptDateParts.t.substring(0, 2));
                            let newHour = (originalHour + 2).toString();
                            if (newHour.length < 2) {
                                newHour = '0' + newHour;
                            }
                            if ($scope.shippingMode.options.formattedWishCustomerReceiptDateParts.t.substring($scope.shippingMode.options.formattedWishCustomerReceiptDateParts.t.length - 1) === 'm') {
                                if (originalHour === 11) {
                                    newHour = '01';
                                }
                                if (originalHour === 12) {
                                    newHour = '02';
                                }
                                let newT2 = newHour + $scope.shippingMode.options.formattedWishCustomerReceiptDateParts.t.substring(2);
                                let newPm = newT2.substring(0, newT2.length - 2) + 'pm';
                                $scope.shippingMode.options.formattedWishCustomerReceiptDateParts.t2 = newPm;
                            } else {
                                $scope.shippingMode.options.formattedWishCustomerReceiptDateParts.t2 = newHour +
                                    $scope.shippingMode.options.formattedWishCustomerReceiptDateParts.t.substring(2);
                            }
                        }
                    }
                });
            }
        }
    }]);
})();