(function(__change) {
    'use strict';
    var currentLCID = null;
    var locale = null;
    __change.RBS_Ua_Intl = {
        initialized: false,
        initialize: function(LCID) {
            if (this.initialized) {
                if (currentLCID !== LCID) {
                    console.error('[ProximisIntl] Intl is already initialized with ' + currentLCID + ', different from ' + LCID);
                }
                return;
            }
            currentLCID = LCID;
            locale = LCID.replace('_', '-');
            if (!window.Intl) {
                var assetBasePath = (__change.navigationContext && __change.navigationContext.assetBasePath) ? __change.navigationContext.assetBasePath : '/Assets/';
                document.write('<scr' + 'ipt type="text/javascript" src="' + assetBasePath + 'Rbs/Ua/lib/intl/dist/Intl.min.js"></scr' + 'ipt>');
                document.write('<scr' + 'ipt type="text/javascript" src="' + assetBasePath + 'Rbs/Ua/lib/intl/locale-data/jsonp/' + locale + '.js"></scr' + 'ipt>');
            }
            this.initialized = true;
        }
    };
    var app = angular.module('proximisIntl', []);
    app.service('proximisIntlFormatter', function() {
        if (!__change.RBS_Ua_Intl.initialized) {
            console.error('[ProximisIntl] Intl is not initialized!');
        }
        return {
            getDateTimeFormatter: function(options) {
                return new window.Intl.DateTimeFormat(locale, options);
            },
            getNumberFormatter: function(options) {
                return new window.Intl.NumberFormat(locale, options);
            }
        };
    });
})(window.__change);