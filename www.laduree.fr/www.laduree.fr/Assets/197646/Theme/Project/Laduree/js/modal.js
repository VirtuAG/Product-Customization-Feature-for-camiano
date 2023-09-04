(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.controller('commonModalController', ['$scope', '$element', 'RbsChange.ModalStack', '$rootScope', commonModalController]);

    function commonModalController($scope, $element, ModalStack, $rootScope) {
        const modalUrl = $element[0].getAttribute('data-common-modal-url');
        const emailField = $element.find($element[0].getAttribute('data-email-field'));
        if (angular.isString(modalUrl) && modalUrl.length > 0) {
            $scope.modalUrl = modalUrl;
            $scope.email = ''
            $scope.openModal = function() {
                if (emailField.length > 0 && emailField.val().length > 0) {
                    $scope.email = emailField.val();
                }
                ModalStack.open({
                    templateUrl: '/project-laduree-modal.twig',
                    size: 'lg',
                    scope: $scope,
                });
            };
            $rootScope.$on('modal:close', function() {
                ModalStack.close()
            });
        }
    }
    app.directive('commonModal', ['$http', '$compile', commonModal]);

    function commonModal($http, $compile) {
        return {
            restrict: 'A',
            link: function(scope, element) {
                const emailParam = scope.email ? '?email=' + scope.email : '';
                if (angular.isDefined(scope.modalUrl)) {
                    scope.modalContentMode = 'loading';
                    $http.get(scope.modalUrl + emailParam).then(function(result) {
                        const mainSelector = '.common-modal-content';
                        element.find(mainSelector).replaceWith('<div class="common-modal-content">' + result.data + '</div>');
                        $compile(element.find(mainSelector).contents())(scope);
                        scope.modalContentMode = 'success';
                    }, function(result) {
                        scope.modalContentMode = 'error';
                        console.error('error', result);
                    });
                }
            },
        };
    }
})();