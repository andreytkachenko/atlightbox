/**
 * Created by tkachenko on 14.04.15.
 */

ATF.invoke(['$directiveProvider', 'utils', 'LightBoxController', 'jQuery'],
    function ($directiveProvider, utils, lightBoxController, $) {
        var lightBoxInitialized = false;
        var $lightBoxScope = lightBoxController.scope;
        var initializeLightBox = function (scope, data, view) {
            var $tpl = view($lightBoxScope);

            if (!$tpl.parent().length) $tpl.appendTo(document.body);
            $lightBoxScope.setItems(data);

            $lightBoxScope.$on('light-box.slide', (function (index, item) {
                scope.$emit('goto', item.id);
            }).bind(scope));

            lightBoxInitialized = true;
        };

        $directiveProvider.register('$LightBox', {
            link: function (name, $el, scope, args) {
                var indexExpr = utils.eval(args[0]);
                var dataExpr = utils.eval(args[1]);

                $($el).click(function () {
                    if (!lightBoxInitialized) {
                        initializeLightBox(scope, dataExpr(scope), args[2]);
                    }

                    setTimeout(function () {
                        $lightBoxScope.open(indexExpr(scope));
                    }, 0);
                });

                return $el;
            }
        });
    });
