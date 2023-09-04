(function(jQuery, __change) {
    'use strict';
    __change.RBS_Ua_Intl.initialize(__change.navigationContext.LCID);
    var app = angular.module('RbsChangeApp', ['ngCookies', 'ngAnimate', 'ngMessages', 'ui.bootstrap', 'infinite-scroll', 'proximisIntl']);
    app.config(['$compileProvider', '$interpolateProvider', '$locationProvider', '$anchorScrollProvider', '$sceDelegateProvider', function($compileProvider, $interpolateProvider, $locationProvider, $anchorScrollProvider, $sceDelegateProvider) {
        $interpolateProvider.startSymbol('(=').endSymbol('=)');
        $locationProvider.html5Mode(true);
        $anchorScrollProvider.disableAutoScrolling();
        if (!__change.debug || !__change.debug.angularDevMode) {
            $compileProvider.debugInfoEnabled(false);
        }
        $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://*.omn.proximis.com/**']);
    }]);
    if (!!window.chrome && !!window.chrome.webstore) {
        app.directive('input', ['$interval', function($interval) {
            return {
                restrict: 'E',
                scope: false,
                require: '?ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    if (ctrl && ctrl.$validators.required && elm.attr('type') === 'password') {
                        ctrl.$validators.required = function(modelValue) {
                            if (elm.is(':-webkit-autofill')) {
                                return true;
                            }
                            return !!modelValue;
                        };
                        var count = 0;
                        var interval = $interval(function() {
                            if (elm.is(':-webkit-autofill')) {
                                ctrl.$validate();
                            } else if (count < 20) {
                                count++;
                                return;
                            }
                            $interval.cancel(interval);
                        }, 50);
                    }
                }
            }
        }]);
    }
    app.directive('a', function() {
        return {
            restrict: 'E',
            scope: false,
            compile: function(element, attributes) {
                if (!attributes['target']) {
                    element.attr('target', '_self');
                }
            }
        }
    });
    app.run(['$anchorScroll', function($anchorScroll) {
        $anchorScroll.yOffset = 20;
    }]);
    app.directive('rbsAnchor', ['$location', '$anchorScroll', function($location, $anchorScroll) {
        function animateScroll(id) {
            var offset = jQuery('#' + id).offset();
            if (offset) {
                jQuery('html, body').animate({
                    scrollTop: offset.top - 20
                }, 1000);
            } else {
                $anchorScroll(id);
            }
        }
        return {
            restrict: 'A',
            compile: function(element, attributes) {
                var anchor = attributes['rbsAnchor'];
                if (anchor) {
                    element.attr('href', window.location.pathname + window.location.search + '#' + anchor);
                }
                return function(scope, elem) {
                    if (anchor) {
                        elem.click(function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            animateScroll(anchor);
                        });
                    }
                }
            }
        }
    }]);
    app.directive('rbsMaxHeight', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            templateUrl: '/rbs-max-height.twig',
            transclude: true,
            scope: {},
            link: function(scope, elm, attrs) {
                scope.containerNode = elm.find('.max-height-container');
                scope.contentNode = elm.find('.max-height-content').get(0);
                scope.deployed = false;
                scope.showButtons = false;
                scope.maxHeight = parseInt(attrs['rbsMaxHeight'], 10);
                if (isNaN(scope.maxHeight) || scope.maxHeight < 0) {
                    scope.maxHeight = 0;
                }
                scope.toggle = function() {
                    scope.deployed = !scope.deployed;
                    refreshStyles();
                };
                var height;
                $timeout(checkHeight, 100);

                function checkHeight() {
                    var newHeight = scope.contentNode.offsetHeight;
                    if (height !== newHeight) {
                        height = newHeight;
                        var newShowButtons;
                        if (!scope.maxHeight) {
                            newShowButtons = false;
                        } else {
                            newShowButtons = (height > scope.maxHeight + 20);
                        }
                        if (scope.showButtons !== newShowButtons) {
                            scope.showButtons = newShowButtons;
                            refreshStyles();
                        }
                    }
                    $timeout(checkHeight, 100);
                }

                function refreshStyles() {
                    if (!scope.showButtons || scope.deployed) {
                        scope.containerNode.css({
                            overflow: 'visible',
                            'max-height': ''
                        });
                    } else {
                        scope.containerNode.css({
                            overflow: 'hidden',
                            'max-height': scope.maxHeight + 'px'
                        });
                    }
                }
            }
        }
    }]);
    app.directive('rbsDatePicker', [function() {
        return {
            restrict: 'A',
            templateUrl: '/rbs-date-picker.twig',
            require: 'ngModel',
            scope: {
                minDate: '=',
                maxDate: '='
            },
            link: function(scope, elm, attrs, ngModel) {
                scope.fieldId = attrs['fieldId'];
                scope.fieldName = attrs['fieldName'];
                scope.placeholder = attrs['placeholder'];
                scope.options = {
                    'min-mode': attrs['mode'] || 'day',
                    'max-mode': attrs['mode'] || 'day',
                    minDate: scope.minDate ? new Date(scope.minDate) : null,
                    maxDate: scope.maxDate ? new Date(scope.maxDate) : null
                };
                scope.picker = {
                    opened: false,
                    value: null
                };
                scope.open = function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    scope.picker.opened = true;
                };
                ngModel.$parsers.unshift(function(viewValue) {
                    function addZero(i) {
                        return ((i < 10) ? '0' : '') + i;
                    }
                    if (viewValue) {
                        return viewValue.getFullYear() +
                            '-' + addZero(viewValue.getMonth() + 1) +
                            '-' + addZero(viewValue.getDate()) +
                            'T00:00:00+00:00';
                    }
                    return null;
                });
                ngModel.$formatters.unshift(function(modelValue) {
                    if (modelValue) {
                        return new Date(modelValue);
                    }
                    return null;
                });
                ngModel.$render = function() {
                    if (ngModel.$viewValue) {
                        scope.picker.value = ngModel.$viewValue;
                    }
                };

                function isInRange(sc) {
                    if (!(sc.picker.value)) {
                        return true;
                    } else {
                        var dt = new Date(sc.picker.value);
                        return !((scope.options.maxDate && (dt > scope.options.maxDate)) || (scope.options.minDate && (dt < scope.options.minDate)));
                    }
                }
                scope.$watch('picker.value', function(fieldValue) {
                    if (angular.isObject(fieldValue)) {
                        if (fieldValue.getTimezoneOffset()) {
                            fieldValue.setHours(0 - (fieldValue.getTimezoneOffset() / 60));
                        }
                        ngModel.$setViewValue(fieldValue);
                    } else {
                        ngModel.$setViewValue(null);
                    }
                    if (!scope.picker.opened) {
                        ngModel.$setValidity('$valid', isInRange(scope));
                    }
                });
            }
        };
    }]);
    app.directive('rbsPagination', [function() {
        return {
            restrict: 'A',
            templateUrl: '/rbs-pagination.twig',
            scope: {
                pagination: '=rbsPagination',
                updateOffset: '='
            },
            link: function(scope) {
                function refreshData() {
                    if (angular.isObject(scope.pagination)) {
                        scope.pageNumber = Math.floor(scope.pagination.offset / scope.pagination.limit) + 1;
                        scope.pageCount = Math.ceil((scope.pagination.count) / scope.pagination.limit);
                    } else {
                        scope.pageNumber = 0;
                        scope.pageCount = 0;
                    }
                    scope.pagesToShow = [];
                    var start = scope.pageNumber > 3 ? scope.pageNumber - 3 : 1;
                    var end = ((scope.pageCount - scope.pageNumber) > 3) ? scope.pageNumber + 3 : scope.pageCount;
                    for (var i = start; i <= end; i++) {
                        scope.pagesToShow.push(i);
                    }
                }
                scope.$watch('pagination', function() {
                    refreshData();
                }, true);
                scope.setPageNumber = function(pageNumber) {
                    scope.updateOffset((pageNumber - 1) * scope.pagination.limit);
                }
            }
        }
    }]);
    app.directive('rbsLoading', function() {
        return {
            restrict: 'A',
            template: '<img alt="" src="data:image/gif;base64,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" />',
            link: function(scope) {}
        }
    });
    app.directive('rbsBlockContainer', ['RbsChange.AjaxAPI', function(AjaxAPI) {
        return {
            restrict: 'A',
            scope: true,
            link: {
                pre: function(scope, element, attrs) {
                    var blockId = attrs['rbsBlockContainer'];
                    scope.blockId = blockId;
                    scope.blockName = attrs['name'];
                    scope.blockParameters = AjaxAPI.getBlockParameters(blockId);
                    scope.blockData = AjaxAPI.globalVar(blockId);
                    scope.blockNavigationContext = AjaxAPI.globalVar('lastNavigationContext') || AjaxAPI.globalVar('navigationContext');
                }
            }
        }
    }]);
    app.directive('rbsTrackConsultedDocument', ['RbsChange.AjaxAPI', 'RbsChange.Cookies', function(AjaxAPI, cookies) {
        function getCookieExpireDate(days) {
            var cookieTimeout = days * 86400000;
            var date = new Date();
            date.setTime(date.getTime() + cookieTimeout);
            return date.toGMTString();
        }
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var data = {
                    documentId: attrs.rbsTrackConsultedDocument,
                    modelName: attrs.modelName
                };
                if (!data.documentId) {
                    console.warn('rbsTrackConsultedDocument: no document id');
                } else if (!data.modelName) {
                    console.warn('rbsTrackConsultedDocument: no document model name');
                } else {
                    var trackersManager = AjaxAPI.globalVar('rbsWebsiteTrackersManager');
                    var cookieName = 'rbsConsultedDocuments_' + data.modelName;
                    if (cookies.isAccepted('technical')) {
                        var oldValue = cookies.getObject(cookieName);
                        if (!angular.isArray(oldValue)) {
                            oldValue = [];
                        }
                        oldValue.splice(0, 0, data.documentId);
                        var newValue = [],
                            obj = {};
                        angular.forEach(oldValue, function(docId) {
                            if (!obj[docId]) {
                                newValue.push(docId);
                                obj[docId] = true;
                            }
                        });
                        if (trackersManager.configuration) {
                            var excess = newValue.length - trackersManager.configuration.consultedMaxCount;
                            if (excess > 0) {
                                newValue.splice(trackersManager.configuration.consultedMaxCount, excess);
                            }
                            var persistDays = trackersManager.configuration.consultedPersistDays;
                            cookies.putObject('technical', cookieName, newValue, {
                                expires: getCookieExpireDate(persistDays)
                            });
                        }
                    } else {
                        cookies.remove(cookieName);
                    }
                }
            }
        }
    }]);
    app.directive('rbsTooltipIfDisabled', [function() {
        return {
            restrict: 'A',
            scope: {
                title: '<rbsTooltipIfDisabled',
                form: '<'
            },
            link: {
                pre: function(scope, element, attrs) {
                    if (scope.title) {
                        element.wrap('<span class="tooltip-if-disabled"></span>');
                        var span = element.parent('span');
                        attrs.$observe('disabled', function(value) {
                            scope.disabled = !!value;
                            if (value) {
                                span.addClass('tooltip-disabled');
                                span.tooltip({
                                    placement: 'bottom',
                                    title: scope.title
                                });
                            } else {
                                span.removeClass('tooltip-disabled');
                                span.tooltip('destroy');
                            }
                        });
                        span.click(function() {
                            if (scope.disabled && scope.form) {
                                scrollToFirstInvalidField(element, scope.form);
                                scope.$apply();
                            }
                        });
                    }
                }
            }
        };
    }]);
    app.directive('rbsScrollToFirstInvalidField', [function() {
        return {
            restrict: 'A',
            scope: {
                form: '<'
            },
            link: {
                pre: function(scope, element, attrs) {
                    element.click(function() {
                        if (scope.form) {
                            scrollToFirstInvalidField(element, scope.form);
                            scope.$apply();
                        }
                    });
                }
            }
        };
    }]);

    function scrollToFirstInvalidField(element, form) {
        if (form && element) {
            angular.forEach(form.$error.required, function(field) {
                field.$setDirty();
            });
            var firstInvalid = element.closest('[name=' + form.$name + ']').find('.ng-invalid');
            if (firstInvalid) {
                jQuery('html, body').animate({
                    scrollTop: firstInvalid.offset().top - 20
                }, 1000);
            }
        }
    }
    app.directive('rbsImportValues', function() {
        return {
            link: function(scope, element) {
                angular.forEach(element[0].querySelectorAll('[data-ng-model], [ng-model]'), function(item) {
                    if (item.value === undefined || angular.isFunction(item.value)) {
                        return;
                    }
                    var name = item.getAttribute('data-ng-model') || item.getAttribute('ng-model');
                    var scopeVar = scope;
                    var parts = name.split('.');
                    var last = parts.pop();
                    angular.forEach(parts, function(part) {
                        if (angular.isObject(scopeVar[part])) {
                            scopeVar = scopeVar[part];
                        } else {
                            scopeVar = scopeVar[part] = {};
                        }
                    });
                    scopeVar[last] = item.value;
                });
            },
        };
    });
    app.filter('rbsTrustHtml', ['$sce', function($sce) {
        return function(html) {
            return $sce.trustAsHtml(html);
        };
    }]);
    app.filter('rbsI18n', ['RbsChange.AjaxAPI', function(AjaxAPI) {
        var i18n = AjaxAPI.globalVar('i18n');

        function filter(key) {
            return i18n[key];
        }
        return filter;
    }]);
    app.filter('rbsDate', ['RbsChange.AjaxAPI', '$filter', function(AjaxAPI, $filter) {
        var i18n = AjaxAPI.globalVar('i18n');

        function filter(input, format) {
            if (angular.isUndefined(format)) {
                format = i18n.dateFormat;
            }
            return $filter('date')(input, format);
        }
        return filter;
    }]);
    app.filter('rbsDateTime', ['RbsChange.AjaxAPI', '$filter', function(AjaxAPI, $filter) {
        var i18n = AjaxAPI.globalVar('i18n');

        function filter(input, format) {
            if (angular.isUndefined(format)) {
                format = i18n.dateTimeFormat;
            }
            return $filter('date')(input, format);
        }
        return filter;
    }]);
    app.filter('rbsTime', ['RbsChange.AjaxAPI', '$filter', function(AjaxAPI, $filter) {
        var i18n = AjaxAPI.globalVar('i18n');

        function filter(input, format) {
            if (angular.isUndefined(format)) {
                format = i18n.timeFormat;
            }
            return $filter('date')(input, format);
        }
        return filter;
    }]);
    app.filter('rbsAttribute', function() {
        function filter(documentData, key) {
            var args = Array.prototype.slice.call(arguments);
            if (args.length < 2 || !angular.isString(key)) {
                return null;
            }
            var definition = null;
            for (var i = 0; i < args.length; i++) {
                if (i === 1) {
                    continue;
                }
                var document = args[i];
                if (angular.isObject(document) && angular.isObject(document['typology']) && angular.isObject(document['typology']['attributes']) && angular.isObject(document['typology']['attributes'][key])) {
                    definition = document['typology']['attributes'][key];
                    if (definition.value !== null) {
                        return definition;
                    }
                }
            }
            return definition;
        }
        return filter;
    });
    app.filter('rbsVisibleAttributes', ['$filter', function($filter) {
        function filter(document, visibility, mode) {
            if (!angular.isString(visibility) || mode !== 'flat' && mode !== 'group' || !angular.isObject(document) || !angular.isObject(document['typology']) || !angular.isObject(document['typology']['visibilities']) || !angular.isArray(document['typology']['visibilities'][visibility])) {
                return [];
            }

            function getGroupData(group, document) {
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i].key === group.key) {
                        return groups[i];
                    }
                }
                var groupData = angular.copy(document['typology']['groups'][group.key]);
                groupData.attributes = [];
                groupData.key = group.key;
                groups.push(groupData);
                return groupData;
            }
            var groups = [];
            var attributes = [];
            angular.forEach(document['typology']['visibilities'][visibility], function(group) {
                var groupData = getGroupData(group, document);
                angular.forEach(group.items, function(item) {
                    for (var i = 0; i < attributes.length; i++) {
                        if (attributes[i].key === item.key) {
                            return;
                        }
                    }
                    var attribute = $filter('rbsAttribute')(document, item.key);
                    if (angular.isObject(attribute)) {
                        attribute.key = item.key;
                        attributes.push(attribute);
                        groupData.attributes.push(attribute);
                    }
                });
            });
            if (mode === 'flat') {
                return attributes;
            } else {
                return groups;
            }
        }
        return filter;
    }]);
    app.directive('rbsAttributeValue', ['RbsChange.AjaxAPI', '$sce', '$compile', function(AjaxAPI, $sce, $compile) {
        return {
            restrict: 'A',
            templateUrl: '/rbs-attribute-value.twig',
            replace: false,
            scope: {
                attribute: '=rbsAttributeValue'
            },
            link: function(scope, element, attributes) {
                scope.imageFormat = attributes['imageFormat'] || 'attribute';
                scope.isDocumentArray = function(attribute) {
                    attribute = attribute || scope.attribute;
                    return (attribute && attribute.type === 'DocumentIdArray');
                };
                scope.isJSON = function(attribute) {
                    attribute = attribute || scope.attribute;
                    return (attribute && attribute.type === 'JSON');
                };
                scope.isDocument = function(attribute) {
                    attribute = attribute || scope.attribute;
                    return (attribute && attribute.type === 'DocumentId');
                };
                scope.isLinkValue = function(value) {
                    return (value && value.common.URL && value.common.URL['canonical']);
                };
                scope.isLink = function(attribute) {
                    attribute = attribute || scope.attribute;
                    return (scope.isDocument(attribute) && scope.isLinkValue(attribute.value));
                };
                scope.isHtml = function(attribute) {
                    attribute = attribute || scope.attribute;
                    return (attribute && attribute.type === 'RichText' && angular.isString(attribute.value));
                };
                scope.isDate = function(attribute) {
                    attribute = attribute || scope.attribute;
                    return (attribute && attribute.type === 'Date');
                };
                scope.isDateTime = function(attribute) {
                    attribute = attribute || scope.attribute;
                    return (attribute && attribute.type === 'DateTime');
                };
                scope.isString = function(attribute) {
                    attribute = attribute || scope.attribute;
                    return (attribute && !scope.isDocumentArray(attribute) && !scope.isDocument(attribute) && !scope.isHtml(attribute) && !scope.isDate(attribute) && !scope.isDateTime(attribute) && !scope.isJSON(attribute));
                };
                scope.getValueTitle = function(attribute) {
                    if (attribute && attribute.formattedValue) {
                        var formattedValue = attribute.formattedValue;
                        if (angular.isString(formattedValue)) {
                            return formattedValue;
                        } else if (angular.isObject(formattedValue) && angular.isObject(formattedValue.common) && formattedValue.common.title) {
                            return formattedValue.common.title;
                        }
                    }
                    return attribute.value;
                };
                scope.$watch('attribute', function(attribute) {
                    var directiveName = attribute.renderingMode;
                    if (!directiveName) {
                        directiveName = 'default';
                    } else {
                        directiveName = directiveName.replace(/([A-Z])/g, function(_, letter, offset) {
                            return (offset ? '-' : '') + letter.toLowerCase();
                        });
                    }
                    directiveName = 'rbs-attribute-value-' + directiveName;
                    var container = element.find('.attribute-value-container');
                    container.html('<div data-' + directiveName + '=""></div>');
                    $compile(container.contents())(scope);
                }, true);
            }
        }
    }]);
    app.directive('rbsAttributeValueDefault', function() {
        return {
            restrict: 'A',
            templateUrl: '/rbs-attribute-value-default.twig'
        }
    });
    app.directive('rbsAttributeValueImageFormatted', function() {
        return {
            restrict: 'A',
            templateUrl: '/rbs-attribute-value-image-formatted.twig'
        }
    });
    app.directive('rbsAttributeValueImageFull', function() {
        return {
            restrict: 'A',
            templateUrl: '/rbs-attribute-value-image-full.twig'
        }
    });
    app.directive('rbsAttributeValueVideo', function() {
        return {
            restrict: 'A',
            templateUrl: '/rbs-attribute-value-video.twig'
        }
    });
    app.directive('rbsAttributeValueFile', function() {
        return {
            restrict: 'A',
            templateUrl: '/rbs-attribute-value-file.twig'
        }
    });
    app.directive('rbsAttributeValueHtmlFragment', function() {
        return {
            restrict: 'A',
            templateUrl: '/rbs-attribute-value-html-fragment.twig'
        }
    });
    app.directive('rbsDirectiveGenerator', ['$compile', function($compile) {
        return {
            link: function(scope, element, attrs) {
                if (attrs.rbsDirectiveGenerator) {
                    element.append($compile('<div data-' + attrs.rbsDirectiveGenerator + '=""></div>')(scope));
                }
            }
        };
    }]);
    app.directive('rbsRefresher', function() {
        return {
            restrict: 'A',
            transclude: true,
            controller: ['$scope', '$transclude', '$attrs', '$element', function($scope, $transclude, $attrs, $element) {
                var childScope;
                $scope.$watch($attrs.condition, function() {
                    $element.empty();
                    if (childScope) {
                        childScope.$destroy();
                        childScope = null;
                    }
                    $transclude(function(clone, newScope) {
                        childScope = newScope;
                        $element.append(clone);
                    });
                });
            }]
        };
    });
    app.provider('RbsChange.AjaxAPI', function AjaxAPIProvider() {
        var apiURL = '/ajax.V1.php/',
            LCID = 'fr_FR',
            defaultParams = {
                websiteId: null,
                sectionId: null,
                pageId: null,
                data: {}
            };
        var headers = {
            "Content-Type": "application/json"
        };
        this.setHeader = function(name, value) {
            headers[name] = value;
        };
        this.setApiURL = function(url) {
            apiURL = url;
        };
        this.$get = ['$http', '$location', '$rootScope', 'RbsChange.ModalStack', '$uibModal', '$compile', function($http, $location, $rootScope, ModalStack, $uibModal, $compile) {
            if (angular.isObject(__change)) {
                setContextParams(defaultParams, __change.navigationContext);
            }

            function setContextParams(params, navigationContext) {
                if (angular.isObject(navigationContext)) {
                    if (navigationContext.websiteId) {
                        params.websiteId = navigationContext.websiteId;
                    }
                    if (navigationContext.sectionId) {
                        params.sectionId = navigationContext.sectionId;
                    }
                    if (navigationContext['pageIdentifier']) {
                        var p = navigationContext['pageIdentifier'].split(',');
                        if (p.length === 2) {
                            params.pageId = parseInt(p[0], 10);
                            LCID = p[1];
                        }
                    }
                }
            }

            function globalVar(name, value) {
                if (angular.isObject(__change)) {
                    if (angular.isUndefined(value)) {
                        return __change.hasOwnProperty(name) ? __change[name] : value;
                    } else {
                        return __change[name] = value;
                    }
                }
                return __change;
            }

            function getVersion() {
                return 'V1';
            }

            function getLCID() {
                return LCID;
            }

            function getBlockParameters(blockId) {
                if (angular.isObject(__change.blockParameters[blockId])) {
                    return __change.blockParameters[blockId];
                }
                console.error('Parameters not found for block', blockId);
                return {};
            }

            function getDefaultParams() {
                return angular.copy(defaultParams);
            }

            function getHttpConfig(method, actionPath) {
                if (angular.isArray(actionPath)) {
                    actionPath = actionPath.join('/');
                }
                var config = {
                    method: 'POST',
                    url: apiURL + LCID + '/' + actionPath,
                    headers: angular.copy(headers)
                };
                config.headers['X-HTTP-Method-Override'] = method;
                return config;
            }

            function buildConfigData(data, params) {
                var configData = getDefaultParams();
                if (angular.isObject(params)) {
                    angular.extend(configData, params);
                }
                if (angular.isObject(data)) {
                    angular.extend(configData.data, data);
                }
                configData.referer = $location.absUrl();
                return configData;
            }

            function sendData(method, actionPath, data, params) {
                var config = getHttpConfig(method, actionPath);
                config.data = buildConfigData(data, params);
                return $http(config);
            }

            function getData(actionPath, data, params) {
                return sendData('GET', actionPath, data, params);
            }

            function postData(actionPath, data, params) {
                return sendData('POST', actionPath, data, params);
            }

            function putData(actionPath, data, params) {
                return sendData('PUT', actionPath, data, params);
            }

            function deleteData(actionPath, data, params) {
                return sendData('DELETE', actionPath, data, params);
            }

            function reloadBlock(blockName, blockId, blockParameters, blockNavigationContext) {
                var parameters = angular.copy(blockParameters);
                parameters.blockId = blockId;
                var data = {
                    layout: {
                        name: blockName,
                        id: blockId
                    },
                    parameters: parameters,
                    themeName: themeName
                };
                var context = {
                    cacheTTL: parameters.tTL || parameters.TTL
                };
                setContextParams(context, blockNavigationContext);
                return getData('Rbs/Theme/Block', data, context);
            }

            function replaceElementContent(element, newContent, scope) {
                if (newContent) {
                    element.html(newContent);
                    $compile(element)(scope);
                    return true;
                } else {
                    console.warn('Couldn\'t replace the content after reloadBlock');
                    return false;
                }
            }
            var navigationContext = globalVar('navigationContext');
            var themeName = (angular.isObject(navigationContext) ? navigationContext.themeName : null) || 'Rbs_Base';
            var themePath = 'Theme/' + themeName.split('_').join('/');

            function getThemeName() {
                return themeName;
            }

            function getThemePath() {
                return themePath;
            }
            var waitingModal;
            var countWaitingModal = 0;

            function openWaitingModal(message) {
                var options = {
                    templateUrl: '/rbs-ajax-waiting-modal.twig',
                    keyboard: false,
                    backdrop: 'static',
                    backdropClass: 'modal-backdrop-ajax-waiting-modal',
                    windowClass: 'modal-ajax-waiting-modal',
                    size: 'sm',
                    controller: 'RbsAjaxWaitingModal',
                    resolve: {
                        message: function() {
                            return message;
                        }
                    }
                };
                if (!waitingModal) {
                    waitingModal = $uibModal.open(options);
                }
                countWaitingModal++;
            }

            function closeWaitingModal(parentModalsToClose) {
                if (parentModalsToClose) {
                    ModalStack.close(parentModalsToClose - 1);
                }
                countWaitingModal--;
                if (countWaitingModal <= 0) {
                    countWaitingModal = 0;
                    var modal = waitingModal;
                    waitingModal = null;
                    if (modal) {
                        var deferredDismiss = function() {
                            modal.dismiss('cancel');
                        };
                        modal.opened.then(deferredDismiss, deferredDismiss);
                    }
                }
            }
            return {
                getVersion: getVersion,
                getLCID: getLCID,
                globalVar: globalVar,
                getBlockParameters: getBlockParameters,
                getDefaultParams: getDefaultParams,
                getData: getData,
                postData: postData,
                putData: putData,
                deleteData: deleteData,
                reloadBlock: reloadBlock,
                replaceElementContent: replaceElementContent,
                getThemeName: getThemeName,
                getThemePath: getThemePath,
                openWaitingModal: openWaitingModal,
                closeWaitingModal: closeWaitingModal
            };
        }];
    });
    app.controller('RbsAjaxWaitingModal', ['$uibModalInstance', '$scope', 'message', function(modalInstance, scope, message) {
        scope.message = message;
        var closeFunction = function() {};
        modalInstance.result.then(closeFunction, closeFunction);
    }]);
    app.service('RbsChange.ModalStack', ['$uibModal', '$timeout', function($uibModal, $timeout) {
        var className = 'modal-hidden-stack';
        var opened = [];

        function open(options) {
            hideStack();
            var classNames = className + ' modal-stack-idx-' + (opened.length + 1);
            if (options.windowClass) {
                options.windowClass += ' ' + classNames;
            } else {
                options.windowClass = classNames;
            }
            var modal = $uibModal.open(options);
            if (!options.hasOwnProperty('controller')) {
                modal.result.then(closeAll, closeAll);
            } else if (!options.customClose) {
                modal.result.then(showPrevious, showPrevious);
            }
            opened.push(modal);
            return modal;
        }

        function close(parentModalsToClose) {
            if (opened.length) {
                var modal = opened[opened.length - 1];
                var deferredDismiss = function() {
                    $timeout(function() {
                        modal.dismiss('cancel');
                    });
                };
                modal.opened.then(deferredDismiss, deferredDismiss);
            }
            if (parentModalsToClose > 0) {
                opened.pop();
                close(parentModalsToClose - 1);
            } else {
                showPrevious();
            }
        }

        function closeAll() {
            for (var i = 0; i < opened.length; i++) {
                opened[i].dismiss('close all');
            }
            opened = [];
        }

        function showPrevious() {
            opened.pop();
            if (opened.length) {
                jQuery('.modal-stack-idx-' + opened.length).show();
            }
        }

        function hideStack() {
            jQuery('.' + className).hide();
        }
        this.open = open;
        this.close = close;
        this.closeAll = closeAll;
        this.showPrevious = showPrevious;
    }]);
    app.controller('RbsMinimalModal', ['RbsChange.ModalStack', '$scope', '$uibModalInstance', function(ModalStack, scope, $uibModalInstance) {}]);
    app.service('RbsChange.ResponsiveSummaries', ['$rootScope', function($rootScope) {
        var items = {};
        this.registerItem = function(name, scope, toCompile, options) {
            items[name] = {
                name: name,
                scope: scope,
                toCompile: toCompile,
                options: angular.isObject(options) ? options : {}
            };
            $rootScope.$emit('ResponsiveSummaries.updated');
        };
        this.getItems = function(names) {
            var result = [];
            for (var i = 0; i < names.length; i++) {
                if (items[names[i]]) {
                    result.push(items[names[i]]);
                }
            }
            return result;
        }
    }]);
    app.factory('RbsChange.RecursionHelper', ['$compile', function($compile) {
        return {
            compile: function(element, link) {
                if (angular.isFunction(link)) {
                    link = {
                        post: link
                    };
                }
                var contents = element.contents().remove();
                var compiledContents;
                return {
                    pre: (link && link.pre) ? link.pre : null,
                    post: function(scope, element) {
                        if (!compiledContents) {
                            compiledContents = $compile(contents);
                        }
                        compiledContents(scope, function(clone) {
                            element.append(clone);
                        });
                        if (link && link.post) {
                            link.post.apply(null, arguments);
                        }
                    }
                };
            },
            baseCompile: function(element) {
                return $compile(element);
            }
        };
    }]);
    app.service('RbsChange.Cookies', ['$rootScope', '$cookies', 'RbsChange.AjaxAPI', function(rootScope, $cookies, AjaxAPI) {
        var data = {};
        var categories = {};
        loadConsent();

        function loadConsent() {
            data = JSON.parse($cookies.get('rbsWebsiteTrackerConsentGdpr') || '{}');
            categories = data.acceptedCookies || {};
        }

        function getConsent() {
            return angular.copy(data);
        }

        function setConsent(acceptedCookies, consentMode, consentSource) {
            var expireDate = new Date();
            expireDate.setMonth(expireDate.getMonth() + 6);
            var dataToStore = {
                acceptedCookies: acceptedCookies,
                previousIdentifier: data.identifier || null,
                consentMode: consentMode,
                consentSource: consentSource
            }
            var promise = AjaxAPI.postData('Rbs/Website/TrackerConsent', dataToStore);
            promise.then(function(result) {
                dataToStore.identifier = result.data.identifier;
                $cookies.putObject('rbsWebsiteTrackerConsentGdpr', dataToStore, {
                    expires: expireDate
                });
                loadConsent();
                rootScope.$emit('RbsWebsiteCookies:set', {
                    type: consentSource === 'banner' ? consentMode : consentSource,
                    source: consentSource,
                    mode: consentMode
                });
            }, function(e) {
                console.error('[RbsChange.Cookies.setConsent]', e);
            });
            return promise;
        }

        function removeConsent() {
            $cookies.remove('rbsWebsiteTrackerConsentGdpr');
        }

        function get(cookieName) {
            return $cookies.get(cookieName) || null;
        }

        function getObject(cookieName) {
            return $cookies.getObject(cookieName) || null;
        }

        function getAll() {
            return $cookies.getAll();
        }

        function put(cookieCategory, cookieName, cookieValue, cookieOptions) {
            if (isAccepted(cookieCategory)) {
                $cookies.put(cookieName, cookieValue, cookieOptions);
            } else {
                console.warn('could not write cookie', cookieName, 'because category', cookieCategory, 'is not authorized.')
            }
        }

        function putObject(cookieCategory, cookieName, cookieValue, cookieOptions) {
            if (isAccepted(cookieCategory)) {
                $cookies.putObject(cookieName, cookieValue, cookieOptions);
            } else {
                console.warn('could not write cookie', cookieName, 'because category', cookieCategory, 'is not authorized.')
            }
        }

        function remove(cookieName, cookieOptions) {
            $cookies.remove(cookieName, cookieOptions);
        }

        function isAccepted(cookieCategory) {
            return (categories[cookieCategory] === true) || cookieCategory === 'technical';
        }
        this.getConsent = getConsent;
        this.setConsent = setConsent;
        this.removeConsent = removeConsent;
        this.get = get;
        this.getObject = getObject;
        this.getAll = getAll;
        this.put = put;
        this.putObject = putObject;
        this.remove = remove;
        this.isAccepted = isAccepted;
    }]);
})(window.jQuery, window.__change);