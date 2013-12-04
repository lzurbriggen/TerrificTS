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
        var Example = (function (_super) {
            __extends(Example, _super);
            function Example() {
                _super.apply(this, arguments);
            }
            Example.prototype.on = function (callback) {
                console.log('Example');

                callback();
            };

            Example.prototype.after = function () {
                console.log('Example > After');
            };
            return Example;
        })(Tc.Module);
        Module.Example = Example;
    })(Tc.Module || (Tc.Module = {}));
    var Module = Tc.Module;
})(Tc || (Tc = {}));
