(function() {
    'use strict';
    var app = angular.module('RbsChangeApp');
    app.directive('projectLadureeCompositionModal', ['RbsChange.ModalStack', '$rootScope', 'RbsChange.AjaxAPI', projectLadureeCompositionModal]);

    function projectLadureeCompositionModal(ModalStack, $rootScope) {
        return {
            restrict: 'A',
            transclude: false,
            link: function(scope, element, attrs) {
                const datas = angular.fromJson(scope.$eval(attrs.projectLadureeCompositionModal))
                scope.openCompositionModal = function() {
                    if (datas.codes) {
                        const composition = datas.codes;
                        let filterMacarons = function(allMacarons) {
                            scope.macaronComposition = [];
                            for (const key in composition) {
                                if (composition[key] > 0) {
                                    let macaron = allMacarons.find(macaron => macaron.id.toString() === key.toString());
                                    macaron.qty = composition[key];
                                    scope.macaronComposition.push(macaron)
                                }
                            }
                        }
                        if ($rootScope.allMacarons && !angular.equals({}, $rootScope.allMacarons)) {
                            filterMacarons($rootScope.allMacarons)
                        } else {
                            $rootScope.$on('macarons:loaded', function(event, allMacarons) {
                                filterMacarons(allMacarons)
                            });
                        }
                    } else {
                        scope.datas = datas;
                    }
                    var options = {
                        templateUrl: '/project-laduree-box-detail-modal.twig',
                        size: 'lg',
                        scope: scope,
                        windowClass: 'project-laduree-composer-modal',
                        controller: function($scope) {}
                    };
                    scope.openedModal = ModalStack.open(options);
                };
                scope.closeDetail = function() {
                    scope.openedModal.close();
                }
            }
        };
    }
})
();