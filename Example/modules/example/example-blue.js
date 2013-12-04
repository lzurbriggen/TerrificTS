var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Tc;
(function (Tc) {
    (function (Module) {
        /// <reference path="../../../terrific-2.0.1.d.ts"/>
        /// <reference path="example.ts"/>
        (function (Example) {
            var Blue = (function (_super) {
                __extends(Blue, _super);
                function Blue() {
                    _super.apply(this, arguments);
                }
                Blue.prototype.on = function (callback) {
                    var _this = this;
                    console.log('Example (Blue)');

                    this.$ctx.on('click', function () {
                        _this.fire('ToggleBlue', ['c1']);
                    });

                    callback();
                };

                Blue.prototype.after = function () {
                    console.log('Example (Blue) > After');
                };
                return Blue;
            })(Tc.Module.Example);
            Example.Blue = Blue;
        })(Module.Example || (Module.Example = {}));
        var Example = Module.Example;
    })(Tc.Module || (Tc.Module = {}));
    var Module = Tc.Module;
})(Tc || (Tc = {}));
