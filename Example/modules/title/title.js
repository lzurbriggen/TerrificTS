var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Tc;
(function (Tc) {
    /// <reference path="../../../terrific-2.0.1.d.ts"/>
    (function (Module) {
        var Title = (function (_super) {
            __extends(Title, _super);
            function Title() {
                _super.apply(this, arguments);
            }
            Title.prototype.on = function (callback) {
                console.log('Title');

                callback();
            };

            Title.prototype.after = function () {
                console.log('Title > After');
            };

            Title.prototype.onToggleBlue = function () {
                this.$ctx.toggleClass('blue');
            };
            return Title;
        })(Tc.Module);
        Module.Title = Title;
    })(Tc.Module || (Tc.Module = {}));
    var Module = Tc.Module;
})(Tc || (Tc = {}));
