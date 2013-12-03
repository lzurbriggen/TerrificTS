/// <reference path="jquery.d.ts"/>

module Tc {

	export var $: JQueryStatic = jQuery; 

	var Config: any = {
		dependencies: {
			css: '/css/dependencies',
			js: '/js/dependencies'
		}
	}

	export class Application {
		config: Object;
		$ctx: JQuery;
		modules: Module[];
		connectors: Connector[];
		sandbox: Sandbox;

		constructor($ctx: JQuery, config: Object) {
			this.$ctx = $ctx || $('body');
			//$.extend(Tc.Config, config);
			this.modules = [];
			this.connectors = [];
			this.sandbox = new Sandbox(this, this.config);
		}

		registerModules($ctx: JQuery = this.$ctx): Module[] {
			var modules: Module[] = [],
			    app = this;

			$ctx.find('.mod:not([data-ignore="true"])').each(function() {
				var $mod = $(this),
					classes = $mod.attr('class').split(' ');

				if (classes.length > 1) {
					var modName,
						skins = [],
						connectors = [],
						dataConnectors;

					for (var i = 0, len = classes.length; i < len; i++) {
						var part = $.trim(classes[i]);

						// do nothing for empty parts
						if(part) {
							// convert to camel if necessary
							if (part.indexOf('-') > -1) {
								part = Utils.String.toCamel(part);
							}

							if (part.indexOf('mod') === 0 && part.length > 3) {
								modName = part.substr(3);
							}
							else if (part.indexOf('skin') === 0) {
								// Remove the mod name part from the skin name
								skins.push(part.substr(4).replace(modName, ''));
							}
						}
					}

					dataConnectors = $mod.attr('data-connectors');

					if (dataConnectors) {
						connectors = dataConnectors.split(',');
						for (var i = 0, len = connectors.length; i < len; i++) {
							var connector = $.trim(connectors[i]);
							// do nothing for empty connectors
							if(connector) {
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
		}

		unregisterModules(modules: Module[] = this.modules) {
			var connectors: Connector[] = this.connectors;

			if(modules === this.modules) {
				this.connectors = [];
				this.modules = [];
			} else {
				for (var i = 0, len = modules.length; i < len; i++) {
					var module: Module = modules[i],
						index: number;

					// Delete the references in the connectors
					for (var connectorId in connectors) {
						if (connectors.hasOwnProperty(connectorId)) {
							connectors[connectorId].unregisterComponent(module);
						}
					}

					// Delete the module instance itself
					index = $.inArray(module, this.modules);
					if(index > -1) {
						delete this.modules[index];
					}
				}
			}
		}

		start(modules: Module[] = this.modules): void {
			for (var i = 0, len = modules.length; i < len; i++) {
				modules[i].start();
			}
		}

		stop(modules: Module[] = this.modules): void {
			for (var i = 0, len = modules.length; i < len; i++) {
				modules[i].stop();
			}
		}

		registerModule($node: JQuery, modName: string = undefined, skins: string[] = [], connectors: string[] = []): Module {
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

				// Register connections
				for (var i = 0, len = connectors.length; i < len; i++) {
					this.registerConnection(connectors[i], modules[id]);
				}

				return modules[id];
			}
		}

		registerConnection(connector: string, component: Module) {
			connector = $.trim(connector);

			var parts = connector.split('-'),
				connectorType,
				connectorId,
				identifier;

			if(parts.length === 1) {
				// default connector
				identifier = connectorId = parts[0];
			}
			else if(parts.length === 2) {
				// a specific connector type is given
				connectorType = parts[0];
				connectorId = parts[1];
				identifier = connectorType + connectorId;
			}

			if(identifier) {
				var connectors = this.connectors;

				if (!connectors[identifier]) {
					// Instantiate the appropriate connector if it does not exist yet
					if (!connectorType) {
						connectors[identifier] = new Tc.Connector(connectorId);
					}
					else if (Tc.Connector[connectorType]) {
						connectors[identifier] = new Tc.Connector[connectorType](connectorId);
					}
				}

				if (connectors[identifier]) {
					component.attachConnector(connectors[identifier]);
					connectors[identifier].registerComponent(component);
				}
			}
		}

		unregisterConnection(connectorId: string, component: Module) {
			var connector =  this.connectors[connectorId];

			// Delete the references in the connector and the module
			if (connector) {
				connector.unregisterComponent(component);
				component.detachConnector(connector);
			}
		}
	}

	export class Sandbox {
		application: Application;
		config: Object;
		afterCallbacks: {(): any}[];

		constructor(application: Application, config: Object) {
			this.application = application;
			this.config = config;
			this.afterCallbacks = [];
		}

		addModules($ctx: JQuery): Module[] {
			var modules: Module[];
			var application = this.application;

			if ($ctx) {
				modules = application.registerModules($ctx);

				application.start(modules);
			}

			return modules;
		}

		removeModules(modules: Module[]) {
			var application = this.application;

			if (modules) {
				application.stop(modules);
				application.unregisterModules(modules);
			}
		}

		subscribe(connector: string, module: Module) {
			var application = this.application;

			if(module instanceof Module && connector) {
				connector = connector + '';
				application.registerConnection(connector, module);
			}
		}

		unsubscribe(connectorId: string, module: Module) {
			var application = this.application;

			if(module instanceof Module && connectorId) {
				connectorId = connectorId + '';
				application.unregisterConnection(connectorId, module);
			}
		}

		getModuleById(moduleId: string) {
			var application = this.application;

			if (application.modules[moduleId] !== undefined) {
				return application.modules[moduleId];
			}
			else {
				throw new Error('The module with the id ' + moduleId + ' does not exist.');
			}
		}

		getConfig(): Object {
			return this.config;
		}

		getConfigParam(name: string): any {
			var config = this.config;

			if (config[name] !== undefined) {
				return config[name];
			}
			else {
				throw new Error('The config param ' + name + ' does not exist.');
			}
		}

		ready(callback: () => any) {
			var afterCallbacks = this.afterCallbacks;

			afterCallbacks.push(callback);

			if (this.application.modules.length === afterCallbacks.length) {
				for (var i = 0; i < afterCallbacks.length; i++) {
					var afterCallback = afterCallbacks[i];

					if(typeof afterCallback === 'function') {
						delete afterCallbacks[i];
						afterCallback();
					}
				}
			}
		}
	}

	export class Module {
		$ctx: JQuery;
		sandbox: Sandbox;
		id: string;
		connectors: Connector[];

		constructor($ctx: JQuery, sandbox: Sandbox, id: string) {
			this.$ctx = $ctx;
			this.sandbox = sandbox;
			this.id = id;
			this.connectors = [];
		}

		on(callback: () => any) {

		}

		after() {

		}


		start() {
			this.on(() => {
				this.initAfter();
			});
		}

		stop() {
			var $ctx = this.$ctx;

			$('*', $ctx).unbind().removeData();
			$ctx.unbind().removeData();
		}

		initAfter() {
			this.sandbox.ready(() => {
				this.after();
			});
		}

		fire(state: string, data: any = null, channels: any = null, defaultAction: () => any = null) {
			var self = this,
				connectors = this.connectors,
				shouldBeCalled = true; // indicates whether the default handler should be called 

			// Handle parameter variations
			switch (arguments.length) {
				case 2:
					if (typeof arguments[1] == 'function') {
						// fire(state, defaultAction)
						defaultAction = arguments[1];
						data = null;
					} else if ($.isArray(arguments[1])) {
						// fire(state, channels)
						channels = arguments[1];
						data = null;
					}
					break;
				case 3:
					if ($.isArray(arguments[1])) {
						// fire(state, channels, defaultAction)
						channels = arguments[1];
						defaultAction = arguments[2];
						data = null;
					} else if (!$.isArray(arguments[2])) {
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
				if(connectors.hasOwnProperty(connectorId)) {
					var connector = connectors[connectorId],
						proceed = connector.notify(self, 'on' + state, data) || false;

					if (!proceed) {
						shouldBeCalled = false;
					}

				} else {
					throw new Error('the module #' + self.id + ' is not connected to connector ' + connectorId);
				}
			}

			// Execute default action unless a veto is provided
			if (shouldBeCalled) {
				if (typeof defaultAction === 'function') {
					defaultAction();
				}
			}
		}

		attachConnector(connector: Connector) {
			 this.connectors[connector.connectorId] = connector;
		}

		detachConnector(connector: Connector) {
			delete this.connectors[connector.connectorId];
		}

		getDecoratedModule(modName: string, skin: string, $node: JQuery, sandbox: Sandbox, id: number): Module {
			// Check if module class exists
			if(Tc.Utils.String.toFunction('Tc.Module.' + modName + '.' + skin)){
				return new (Tc.Utils.String.toFunction('Tc.Module.' + modName + '.' + skin))($node, sandbox, id);
			}

			return null;
		}
	}

	export class Connector {
		connectorId: string;
		modules: Module[];

		constructor(connectorId: string) {
			this.connectorId = connectorId;
			this.modules = [];
		}

		registerComponent(module: Module) {
			this.modules[module.id] = module;
		}

		unregisterComponent(module: Module) {
			var modules = this.modules;

			if(modules[module.id]) {
				delete modules[module.id];
			}
		}

		notify(origin: Module, state: string, data: Object): boolean {
			var proceed = true,
			    modules = this.modules;

			for(var id in modules) {
				if(modules.hasOwnProperty(id)) {
					var module = modules[id];
					if(module !== origin && module[state] && module[state](data) === false) {
						proceed = false;
					}
				}
			}

			return true;
		}
	}

	export module Utils {
		export class String {
			static capitalize(str: string): string {
				 return str.substr(0, 1).toUpperCase().concat(str.substr(1));
			}

			static toCamel(str: string): string {
				 return str.replace(/(\-[A-Za-z])/g, function($1){return $1.toUpperCase().replace('-','');});
			}

			static toFunction(str) {
				var arr = str.split('.');

				var fn = (window || this);
				for (var i = 0, len = arr.length; i < len; i++) {
					fn = fn[arr[i]];
				}

				if (typeof fn !== 'function') {
					throw new Error('function not found');
				}

				return  fn;
			}
		}
	}	
}