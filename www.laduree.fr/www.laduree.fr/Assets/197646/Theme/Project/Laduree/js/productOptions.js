(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.directive('rbsCatalogProductProjectOptions', ['$rootScope', rbsCatalogProductProjectOptions]);

    function rbsCatalogProductProjectOptions($rootScope) {
        return {
            restrict: 'A',
            templateUrl: '/project-laduree-product-detail-options.twig',
            link: function(scope) {
                scope.projectOptions = {};
                scope.$watchCollection('selected', function(selected) {
                    scope.projectOptions._composition = {
                        "codes": {},
                        "composition": {},
                        "selectionId": null
                    };
                    if (selected) {
                        if (selected.macaronqtyList) {
                            selected.macaronqtyList.forEach(item => {
                                if (item.macaron) {
                                    scope.projectOptions._composition['codes'][item.macaron.id] = item.quantity;
                                } else {
                                    scope.projectOptions._composition['codes'][item.id] = item.qty;
                                }
                            });
                        }
                        if (selected.id) {
                            scope.projectOptions._composition['selectionId'] = selected.id;
                        }
                    }
                    scope.projectOptions._composition = JSON.stringify(scope.projectOptions._composition)
                });
                $rootScope.$on('composer:setselection', function(event, args) {
                    var selectionId = scope.selectionId ? scope.selectionId : 0;
                    scope.projectOptions._composition = {
                        "codes": {},
                        "composition": {},
                        "selectionId": selectionId
                    };
                    if (args.length > 0) {
                        args.forEach(item => {
                            if (item.macaron) {
                                scope.projectOptions._composition['codes'][item.macaron.id] = item.quantity;
                            } else {
                                scope.projectOptions._composition['codes'][item.id] = item.qty;
                            }
                        });
                    }
                    scope.projectOptions._composition = JSON.stringify(scope.projectOptions._composition)
                });
                var populateAddProductData = scope.populateAddProductData;
                scope.populateAddProductData = function(addProductData) {
                    angular.forEach(addProductData.lines, function(lineData) {
                        lineData.options = scope.projectOptions;
                    });
                    if (populateAddProductData) {
                        populateAddProductData(addProductData);
                    }
                };
            }
        }
    }
    app.directive('projectLadureeGiftBoxProjectOptions', ['$rootScope', projectLadureeGiftBoxProjectOptions]);

    function projectLadureeGiftBoxProjectOptions($rootScope) {
        return {
            restrict: 'A',
            templateUrl: '/project-laduree-gift-box-detail-options.twig',
            link: function(scope) {
                let projectOptions = {};
                scope.projectOptions = {
                    _composition: {}
                };
                $rootScope.$on('composerSelectProduct', function(event, data) {
                    let skuList;
                    let titleList;
                    let products = [];
                    if (data) {
                        data.map(productsList => {
                            if (productsList.selectedItem) {
                                products.push({
                                    'visual': productsList.selectedItem.typology.attributes.composerVisual.value.common.URL.canonical,
                                    'categoryTitle': productsList.title,
                                    'title': productsList.selectedItem.common.title
                                })
                                skuList = !skuList ? productsList.selectedItem.stock.sku : skuList + '|' + productsList.selectedItem.stock.sku
                                titleList = !titleList ? productsList.selectedItem.common.title : titleList + '|' +
                                    productsList.selectedItem.common.title
                            }
                        });
                        projectOptions._giftBoxContentSku = skuList
                        projectOptions._giftBoxContentTitle = titleList
                    }
                    projectOptions._giftBoxProductsList = products;
                    scope.projectOptions._composition = JSON.stringify(projectOptions)
                })
                scope.$watch('selectedRibbon', function(selectedRibbon) {
                    delete projectOptions._giftBoxRibbon
                    delete projectOptions._giftBoxRibbonVisual
                    if (selectedRibbon) {
                        projectOptions._giftBoxRibbon = selectedRibbon.common.title
                        projectOptions._giftBoxRibbonVisual = selectedRibbon.data.visual.listItem
                    }
                });
                scope.$watch('boxParent', function(boxParent) {
                    delete projectOptions._giftBoxParentTitle
                    delete projectOptions._giftBoxParentVisual
                    if (boxParent) {
                        projectOptions._giftBoxParentTitle = boxParent.common.title
                        projectOptions._giftBoxParentVisual = boxParent.common.visuals[0].listItem
                    }
                });
                scope.$watch('selectedMacaronsBoxes', function(selectedMacaronsBoxes) {
                    delete projectOptions._giftBoxMacaronsBoxTitle
                    delete projectOptions._giftBoxMacaronsBoxSku
                    delete projectOptions._giftBoxMacaronsBoxVisual
                    if (selectedMacaronsBoxes) {
                        projectOptions._giftBoxMacaronsBoxTitle = selectedMacaronsBoxes.common.title
                        projectOptions._giftBoxMacaronsBoxSku = selectedMacaronsBoxes.stock.sku
                        projectOptions._giftBoxMacaronsBoxVisual = selectedMacaronsBoxes.typology.attributes.composerVisual.value.common.URL.canonical
                    }
                });
                var populateAddProductData = scope.populateAddProductData;
                scope.populateAddProductData = function(addProductData) {
                    angular.forEach(addProductData.lines, function(lineData) {
                        lineData.options = scope.projectOptions;
                    });
                    if (populateAddProductData) {
                        populateAddProductData(addProductData);
                    }
                };
            }
        }
    }
    var projectOptionDefinitions = null;

    function returnOneCompositionLineHtml(def, productOption) {
        var html = [];
        var result = JSON.parse(productOption);
        var composition = result["composition"];
        var macaronQty;
        var compositionArr = [];
        for (var macaronTitle in composition) {
            macaronQty = composition[macaronTitle];
            compositionArr.push("<span>" + macaronTitle + " (x" + macaronQty + ")</span>");
        }
        html.push('<dt>' + def.title + '</dt>');
        html.push('<dd>' + compositionArr.join(", ") + '</dd>');
        return html;
    }

    function returnGiftBoxCompositionLineHtml(def, productOption, $rootScope) {
        var html = [];
        var result = JSON.parse(productOption);
        if (result._giftBoxRibbon) {
            html.push('<dl class="product-resume__compo">')
            html.push('<dt>' + $rootScope.ribbonLabel + '</dt>');
            html.push('<dd>' + result._giftBoxRibbon + '</dd>');
            html.push('</dl>')
        }
        if (result._giftBoxMacaronsBoxTitle) {
            html.push('<dl class="product-resume__compo">')
            html.push('<dt>' + $rootScope.macaronsBoxLabel + '</dt>');
            html.push('<dd>' + result._giftBoxMacaronsBoxTitle + '</dd>');
            html.push('</dl>')
        }
        html.push('<dl class="product-resume__compo">')
        html.push('<dt>' + def.title + '</dt>');
        html.push('<dd>' + result._giftBoxContentTitle.replace(/\|/g, ', ') + '</dd>');
        html.push('</dl>')
        return html;
    }
    app.directive('cartLineProjectOptions', ['$compile', '$rootScope', 'RbsChange.AjaxAPI', cartLineProjectOptions]);

    function cartLineProjectOptions($compile, $rootScope, AjaxAPI) {
        return {
            restrict: 'A',
            require: "^rbsCommerceCartDeliveries",
            template: '<div></div>',
            link: function(scope, elem, attrs, cartController) {
                if (!scope.line.product.typology.attributes.isGiftBox || scope.line.product.typology.attributes.isGiftBox.value !== true) {
                    if (!$rootScope.macaronsList) {
                        var macaronsList = {};
                        AjaxAPI.getData('Laduree/Laduree/GetAllMacarons').then(function(data) {
                            if (data.dataSets) {
                                var l = data.dataSets.length;
                                for (var i = 0; i < l; i++) {
                                    if (data.dataSets[i].id) {
                                        macaronsList[data.dataSets[i].id] = data.dataSets[i].label;
                                    }
                                }
                            }
                        }, function(error) {});
                        $rootScope.macaronsList = macaronsList;
                        scope.macaronsOption = [];
                        scope.macaronsCursor = 0;
                    }
                }
                if (projectOptionDefinitions === null) {
                    projectOptionDefinitions = [];
                    var cartData = cartController.getCartData();
                    if (cartData.hasOwnProperty('projectOptionDefinitions')) {
                        projectOptionDefinitions = cartData['projectOptionDefinitions'];
                    }
                }
                if (projectOptionDefinitions.length) {
                    scope.$watch('line.options', function(lineOptions) {
                        if (lineOptions) {
                            if (!scope.line.product.typology.attributes.isGiftBox || scope.line.product.typology.attributes.isGiftBox.value !== true) {
                                var html = ['<dl class="product-resume__compo">'];
                            } else {
                                var html = [''];
                            }
                            angular.forEach(projectOptionDefinitions, function(def) {
                                var s = def.storageName;
                                if (lineOptions.hasOwnProperty(s)) {
                                    if (def.title === "Composition" && lineOptions[s]) {
                                        if (scope.line.product.typology.attributes.isGiftBox && scope.line.product.typology.attributes.isGiftBox.value === true) {
                                            try {
                                                var res = returnGiftBoxCompositionLineHtml(def, lineOptions[s], $rootScope);
                                                Array.prototype.push.apply(html, res);
                                            } catch (e) {
                                                console.error("Parsing error:", e);
                                            }
                                        } else {
                                            try {
                                                var res = returnOneCompositionLineHtml(def, lineOptions[s]);
                                                Array.prototype.push.apply(html, res);
                                                if (scope.macaronsOption) {
                                                    scope.macaronsOption[scope.macaronsCursor] = JSON.parse(lineOptions[s]);
                                                }
                                                scope.macaronsCursor++;
                                            } catch (e) {
                                                console.error("Parsing error:", e);
                                            }
                                        }
                                    }
                                }
                            });
                            html.push('</dl>');
                            replaceChildren(html.length > 2 ? html.join('') : '');
                        }
                    });
                }
                var contentScope = null;

                function replaceChildren(html) {
                    if (contentScope) {
                        contentScope.$destroy();
                        contentScope = null;
                    }
                    elem.html(html);
                    if (html != '') {
                        contentScope = scope.$new();
                        $compile(elem.contents())(contentScope);
                    }
                }
            }
        }
    }
    app.directive('processLineProjectOptions', ['$compile', '$rootScope', processLineProjectOptions]);

    function processLineProjectOptions($compile, $rootScope) {
        return {
            restrict: 'A',
            template: '<div></div>',
            link: function(scope, elem) {
                scope.macaronsList = {};
                scope.macaronsOption = [];
                scope.macaronsCursor = 0;
                if (projectOptionDefinitions === null) {
                    var processEngine = scope.processEngine;
                    projectOptionDefinitions = [];
                    var cartData = processEngine.getObjectData();
                    if (cartData.hasOwnProperty('projectOptionDefinitions')) {
                        projectOptionDefinitions = cartData['projectOptionDefinitions'];
                    }
                }
                if (projectOptionDefinitions.length) {
                    scope.$watch('line.options', function(lineOptions) {
                        if (lineOptions) {
                            var html = ['<dl class="product-resume__compo">'];
                            angular.forEach(projectOptionDefinitions, function(def) {
                                var s = def.storageName;
                                if (lineOptions.hasOwnProperty(s)) {
                                    if (def.title === "Composition" && lineOptions[s]) {
                                        if (scope.line.product.typology.attributes.isGiftBox && scope.line.product.typology.attributes.isGiftBox.value === true) {
                                            try {
                                                var res = returnGiftBoxCompositionLineHtml(def, lineOptions[s], $rootScope);
                                                Array.prototype.push.apply(html, res);
                                            } catch (e) {
                                                console.error("Parsing error:", e);
                                            }
                                        } else {
                                            try {
                                                var res = returnOneCompositionLineHtml(def, lineOptions[s]);
                                                Array.prototype.push.apply(html, res);
                                                scope.macaronsOption[scope.macaronsCursor] = JSON.parse(lineOptions[s]);
                                                scope.macaronsCursor++;
                                            } catch (e) {
                                                console.error("Parsing error:", e);
                                            }
                                        }
                                    }
                                }
                            });
                            html.push('</dl>');
                            replaceChildren(html.length > 2 ? html.join('') : '');
                        }
                    });
                }
                var contentScope = null;

                function replaceChildren(html) {
                    if (contentScope) {
                        contentScope.$destroy();
                        contentScope = null;
                    }
                    elem.html(html);
                    if (html != '') {
                        contentScope = scope.$new();
                        $compile(elem.contents())(contentScope);
                    }
                }
            }
        }
    }
    app.directive('productreturnLineProjectOptions', ['$compile', productreturnLineProjectOptions]);

    function productreturnLineProjectOptions($compile) {
        return {
            restrict: 'A',
            template: '<div></div>',
            link: function(scope, elem) {
                scope.macaronsList = {};
                scope.macaronsOption = [];
                scope.macaronsCursor = 0;
                if (projectOptionDefinitions === null) {
                    var orderData = scope.orderData;
                    projectOptionDefinitions = [];
                    if (orderData.hasOwnProperty('projectOptionDefinitions')) {
                        projectOptionDefinitions = orderData['projectOptionDefinitions'];
                    }
                }
                if (projectOptionDefinitions.length) {
                    scope.$watch('line.shipmentLine.options', function(lineOptions) {
                        if (lineOptions) {
                            var html = ['<dl class="product-resume__compo">'];
                            angular.forEach(projectOptionDefinitions, function(def) {
                                var s = def.storageName;
                                if (lineOptions.hasOwnProperty(s)) {
                                    if (def.title === "Composition" && lineOptions[s]) {
                                        try {
                                            var res = returnOneCompositionLineHtml(def, lineOptions[s]);
                                            Array.prototype.push.apply(html, res);
                                            scope.macaronsOption[scope.macaronsCursor] = JSON.parse(lineOptions[s]);
                                            scope.macaronsCursor++;
                                        } catch (e) {
                                            console.error("Parsing error:", e);
                                        }
                                    }
                                }
                            });
                            html.push('</dl>');
                            replaceChildren(html.length > 2 ? html.join('') : '');
                        }
                    });
                }
                var contentScope = null;

                function replaceChildren(html) {
                    if (contentScope) {
                        contentScope.$destroy();
                        contentScope = null;
                    }
                    elem.html(html);
                    if (html !== '') {
                        contentScope = scope.$new();
                        $compile(elem.contents())(contentScope);
                    }
                }
            }
        }
    }
    app.directive('ladureeBoxComposition', [ladureeBoxComposition]);

    function ladureeBoxComposition() {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, elem, attrs) {
                scope.boxComposition = "";
                try {
                    var res = JSON.parse(attrs.ladureeBoxComposition);
                    var composition = res["composition"];
                    var macaronQty;
                    var compositionArr = [];
                    for (var macaronTitle in composition) {
                        macaronQty = composition[macaronTitle];
                        compositionArr.push(macaronTitle + " (x" + macaronQty + ")");
                    }
                    scope.boxCompositionArr = compositionArr;
                    scope.boxComposition = compositionArr.join(", ");
                } catch (e) {
                    console.error("Parsing error:", e);
                }
            }
        }
    }
    app.directive('ladureeGiftBoxComposition', ['$rootScope', '$timeout', ladureeGiftBoxComposition]);

    function ladureeGiftBoxComposition($rootScope, $timeout) {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, elem, attrs) {
                scope.boxComposition = "";
                $timeout(function() {
                    try {
                        var result = JSON.parse(attrs.ladureeGiftBoxComposition);
                        if (result._giftBoxRibbon) {
                            scope.boxComposition = scope.boxComposition + '<dl class="product-resume__compo">';
                            scope.boxComposition = scope.boxComposition + '<dt>' + $rootScope.ribbonLabel + '</dt>';
                            scope.boxComposition = scope.boxComposition + '<dd>' + result._giftBoxRibbon + '</dd>';
                            scope.boxComposition = scope.boxComposition + '</dl>';
                        }
                        if (result._giftBoxMacaronsBoxTitle) {
                            scope.boxComposition = scope.boxComposition + '<dl class="product-resume__compo">';
                            scope.boxComposition = scope.boxComposition + '<dt>' + $rootScope.macaronsBoxLabel + '</dt>';
                            scope.boxComposition = scope.boxComposition + '<dd>' + result._giftBoxMacaronsBoxTitle + '</dd>';
                            scope.boxComposition = scope.boxComposition + '</dl>';
                        }
                        scope.boxComposition = scope.boxComposition + '<dl class="product-resume__compo">';
                        scope.boxComposition = scope.boxComposition + '<dt>' + $rootScope.compositionLabel + '</dt>';
                        scope.boxComposition = scope.boxComposition + '<dd>' + result._giftBoxContentTitle.replace(/\|/g, ', ') + '</dd>';
                        scope.boxComposition = scope.boxComposition + '</dl>';
                    } catch (e) {
                        console.error("Parsing error:", e);
                    }
                }, 100)
            }
        }
    }
})();