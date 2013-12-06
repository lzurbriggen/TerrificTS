/// <reference path="jquery.d.ts"/>
var Tc;
(function (Tc) {
    Tc.$ = jQuery;

    Tc.Config = {
        dependencies: {
            css: '/css/dependencies',
            js: '/js/dependencies'
        }
    };

    var Application = (function () {
        function Application($ctx, config) {
            this.$ctx = $ctx || Tc.$('body');
            Tc.$.extend(Tc.Config, config);
            this.modules = [];
            this.connectors = [];
            this.sandbox = new Sandbox(this, this.config);
        }
        Application.prototype.registerModules = function ($ctx) {
            if (typeof $ctx === "undefined") { $ctx = this.$ctx; }
            var modules = [], app = this;

            $ctx.find('.mod:not([data-ignore="true"])').each(function () {
                var $mod = Tc.$(this), classes = $mod.attr('class').split(' ');

                if (classes.length > 1) {
                    var modName, skins = [], connectors = [], dataConnectors;

                    for (var i = 0, len = classes.length; i < len; i++) {
                        var part = Tc.$.trim(classes[i]);

                        if (part) {
                            if (part.indexOf('-') > -1) {
                                part = Utils.String.toCamel(part);
                            }

                            if (part.indexOf('mod') === 0 && part.length > 3) {
                                modName = part.substr(3);
                            } else if (part.indexOf('skin') === 0) {
                                // Remove the mod name part from the skin name
                                skins.push(part.substr(4).replace(modName, ''));
                            }
                        }
                    }

                    dataConnectors = $mod.attr('data-connectors');

                    if (dataConnectors) {
                        connectors = dataConnectors.split(',');
                        for (var i = 0, len = connectors.length; i < len; i++) {
                            var connector = Tc.$.trim(connectors[i]);

                            if (connector) {
                                connectors[i] = connector;
                            }
                        }
                    }

                    if (modName && Tc.Module[modName]) {
                        modules.push(app.registerModule($mod, modName, skins, connectors));
                    }
                }
            });

            return modules;
        };

        Application.prototype.unregisterModules = function (modules) {
            if (typeof modules === "undefined") { modules = this.modules; }
            var connectors = this.connectors;

            if (modules === this.modules) {
                this.connectors = [];
                this.modules = [];
            } else {
                for (var i = 0, len = modules.length; i < len; i++) {
                    var module = modules[i], index;

                    for (var connectorId in connectors) {
                        if (connectors.hasOwnProperty(connectorId)) {
                            connectors[connectorId].unregisterComponent(module);
                        }
                    }

                    // Delete the module instance itself
                    index = Tc.$.inArray(module, this.modules);
                    if (index > -1) {
                        delete this.modules[index];
                    }
                }
            }
        };

        Application.prototype.start = function (modules) {
            if (typeof modules === "undefined") { modules = this.modules; }
            for (var i = 0, len = modules.length; i < len; i++) {
                modules[i].start();
            }
        };

        Application.prototype.stop = function (modules) {
            if (typeof modules === "undefined") { modules = this.modules; }
            for (var i = 0, len = modules.length; i < len; i++) {
                modules[i].stop();
            }
        };

        Application.prototype.registerModule = function ($node, modName, skins, connectors) {
            if (typeof modName === "undefined") { modName = undefined; }
            if (typeof skins === "undefined") { skins = []; }
            if (typeof connectors === "undefined") { connectors = []; }
            var modules = this.modules;

            if (modName && Tc.Module[modName]) {
                // Generate a unique ID for every module
                var id = modules.length;
                $node.data('id', id);

                // Instantiate module
                modules[id] = new Tc.Module[modName]($node, this.sandbox, id);

                for (var i = 0, len = skins.length; i < len; i++) {
                    var skinName = skins[i];

                    if (Tc.Module[modName][skinName]) {
                        modules[id] = modules[id].getDecoratedModule(modName, skinName, $node, this.sandbox, id);
                    }
                }

                for (var i = 0, len = connectors.length; i < len; i++) {
                    this.registerConnection(connectors[i], modules[id]);
                }

                return modules[id];
            }
        };

        Application.prototype.registerConnection = function (connector, component) {
            connector = Tc.$.trim(connector);

            var parts = connector.split('-'), connectorType, connectorId, identifier;

            if (parts.length === 1) {
                // default connector
                identifier = connectorId = parts[0];
            } else if (parts.length === 2) {
                // a specific connector type is given
                connectorType = parts[0];
                connectorId = parts[1];
                identifier = connectorType + connectorId;
            }

            if (identifier) {
                var connectors = this.connectors;

                if (!connectors[identifier]) {
                    if (!connectorType) {
                        connectors[identifier] = new Tc.Connector(connectorId);
                    } else if (Tc.Connector[connectorType]) {
                        connectors[identifier] = new Tc.Connector[connectorType](connectorId);
                    }
                }

                if (connectors[identifier]) {
                    component.attachConnector(connectors[identifier]);
                    connectors[identifier].registerComponent(component);
                }
            }
        };

        Application.prototype.unregisterConnection = function (connectorId, component) {
            var connector = this.connectors[connectorId];

            if (connector) {
                connector.unregisterComponent(component);
                component.detachConnector(connector);
            }
        };
        return Application;
    })();
    Tc.Application = Application;

    var Sandbox = (function () {
        function Sandbox(application, config) {
            this.application = application;
            this.config = config;
            this.afterCallbacks = [];
        }
        Sandbox.prototype.addModules = function ($ctx) {
            var modules;
            var application = this.application;

            if ($ctx) {
                modules = application.registerModules($ctx);

                application.start(modules);
            }

            return modules;
        };

        Sandbox.prototype.removeModules = function (modules) {
            var application = this.application;

            if (modules) {
                application.stop(modules);
                application.unregisterModules(modules);
            }
        };

        Sandbox.prototype.subscribe = function (connector, module) {
            var application = this.application;

            if (module instanceof Module && connector) {
                connector = connector + '';
                application.registerConnection(connector, module);
            }
        };

        Sandbox.prototype.unsubscribe = function (connectorId, module) {
            var application = this.application;

            if (module instanceof Module && connectorId) {
                connectorId = connectorId + '';
                application.unregisterConnection(connectorId, module);
            }
        };

        Sandbox.prototype.getModuleById = function (moduleId) {
            var application = this.application;

            if (application.modules[moduleId] !== undefined) {
                return application.modules[moduleId];
            } else {
                throw new Error('The module with the id ' + moduleId + ' does not exist.');
            }
        };

        Sandbox.prototype.getConfig = function () {
            return this.config;
        };

        Sandbox.prototype.getConfigParam = function (name) {
            var config = this.config;

            if (config[name] !== undefined) {
                return config[name];
            } else {
                throw new Error('The config param ' + name + ' does not exist.');
            }
        };

        Sandbox.prototype.ready = function (callback) {
            var afterCallbacks = this.afterCallbacks;

            afterCallbacks.push(callback);

            if (this.application.modules.length === afterCallbacks.length) {
                for (var i = 0; i < afterCallbacks.length; i++) {
                    var afterCallback = afterCallbacks[i];

                    if (typeof afterCallback === 'function') {
                        delete afterCallbacks[i];
                        afterCallback();
                    }
                }
            }
        };
        return Sandbox;
    })();
    Tc.Sandbox = Sandbox;

    var Module = (function () {
        function Module($ctx, sandbox, id) {
            this.$ctx = $ctx;
            this.sandbox = sandbox;
            this.id = id;
            this.connectors = [];
        }
        Module.prototype.on = function (callback) {
        };

        Module.prototype.after = function () {
        };

        Module.prototype.start = function () {
            var _this = this;
            this.on(function () {
                _this.initAfter();
            });
        };

        Module.prototype.stop = function () {
            var $ctx = this.$ctx;

            Tc.$('*', $ctx).unbind().removeData();
            $ctx.unbind().removeData();
        };

        Module.prototype.initAfter = function () {
            var _this = this;
            this.sandbox.ready(function () {
                _this.after();
            });
        };

        Module.prototype.fire = function (state, data, channels, defaultAction) {
            if (typeof data === "undefined") { data = null; }
            if (typeof channels === "undefined") { channels = null; }
            if (typeof defaultAction === "undefined") { defaultAction = null; }
            var self = this, connectors = this.connectors, shouldBeCalled = true;

            switch (arguments.length) {
                case 2:
                    if (typeof arguments[1] == 'function') {
                        // fire(state, defaultAction)
                        defaultAction = arguments[1];
                        data = null;
                    } else if (Tc.$.isArray(arguments[1])) {
                        // fire(state, channels)
                        channels = arguments[1];
                        data = null;
                    }
                    break;
                case 3:
                    if (Tc.$.isArray(arguments[1])) {
                        // fire(state, channels, defaultAction)
                        channels = arguments[1];
                        defaultAction = arguments[2];
                        data = null;
                    } else if (!Tc.$.isArray(arguments[2])) {
                        // fire(state, data, defaultAction)
                        defaultAction = arguments[2];
                        channels = null;
                    }
                    break;
            }

            state = Utils.String.capitalize(state);
            data = data || {};
            channels = channels || Object.keys(connectors);

            for (var i = 0, len = channels.length; i < len; i++) {
                var connectorId = channels[i];
                if (connectors.hasOwnProperty(connectorId)) {
                    var connector = connectors[connectorId], proceed = connector.notify(self, 'on' + state, data) || false;

                    if (!proceed) {
                        shouldBeCalled = false;
                    }
                } else {
                    throw new Error('the module #' + self.id + ' is not connected to connector ' + connectorId);
                }
            }

            if (shouldBeCalled) {
                if (typeof defaultAction === 'function') {
                    defaultAction();
                }
            }
        };

        Module.prototype.attachConnector = function (connector) {
            this.connectors[connector.connectorId] = connector;
        };

        Module.prototype.detachConnector = function (connector) {
            delete this.connectors[connector.connectorId];
        };

        Module.prototype.getDecoratedModule = function (modName, skin, $node, sandbox, id) {
            if (Tc.Utils.String.toFunction('Tc.Module.' + modName + '.' + skin)) {
                return new (Tc.Utils.String.toFunction('Tc.Module.' + modName + '.' + skin))($node, sandbox, id);
            }

            return null;
        };
        return Module;
    })();
    Tc.Module = Module;

    var Connector = (function () {
        function Connector(connectorId) {
            this.connectorId = connectorId;
            this.modules = [];
        }
        Connector.prototype.registerComponent = function (module) {
            this.modules[module.id] = module;
        };

        Connector.prototype.unregisterComponent = function (module) {
            var modules = this.modules;

            if (modules[module.id]) {
                delete modules[module.id];
            }
        };

        Connector.prototype.notify = function (origin, state, data) {
            var proceed = true, modules = this.modules;

            for (var id in modules) {
                if (modules.hasOwnProperty(id)) {
                    var module = modules[id];
                    if (module !== origin && module[state] && module[state](data) === false) {
                        proceed = false;
                    }
                }
            }

            return true;
        };
        return Connector;
    })();
    Tc.Connector = Connector;

    (function (Utils) {
        var String = (function () {
            function String() {
            }
            String.capitalize = function (str) {
                return str.substr(0, 1).toUpperCase().concat(str.substr(1));
            };

            String.toCamel = function (str) {
                return str.replace(/(\-[A-Za-z])/g, function ($1) {
                    return $1.toUpperCase().replace('-', '');
                });
            };

            String.toFunction = function (str) {
                var arr = str.split('.');

                var fn = (window || this);
                for (var i = 0, len = arr.length; i < len; i++) {
                    fn = fn[arr[i]];
                }

                if (typeof fn !== 'function') {
                    throw new Error('function not found');
                }

                return fn;
            };
            return String;
        })();
        Utils.String = String;
    })(Tc.Utils || (Tc.Utils = {}));
    var Utils = Tc.Utils;
})(Tc || (Tc = {}));
