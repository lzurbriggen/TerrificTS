/// <reference path="jquery.d.ts" />
declare module Tc {
    var $: JQueryStatic;
    class Application {
        public config: Object;
        public $ctx: JQuery;
        public modules: Module[];
        public connectors: Connector[];
        public sandbox: Sandbox;
        constructor($ctx: JQuery, config: Object);
        public registerModules($ctx?: JQuery): Module[];
        public unregisterModules(modules?: Module[]): void;
        public start(modules?: Module[]): void;
        public stop(modules?: Module[]): void;
        public registerModule($node: JQuery, modName?: string, skins?: string[], connectors?: string[]): Module;
        public registerConnection(connector: string, component: Module): void;
        public unregisterConnection(connectorId: string, component: Module): void;
    }
    class Sandbox {
        public application: Application;
        public config: Object;
        public afterCallbacks: {
            (): any;
        }[];
        constructor(application: Application, config: Object);
        public addModules($ctx: JQuery): Module[];
        public removeModules(modules: Module[]): void;
        public subscribe(connector: string, module: Module): void;
        public unsubscribe(connectorId: string, module: Module): void;
        public getModuleById(moduleId: string);
        public getConfig(): Object;
        public getConfigParam(name: string): any;
        public ready(callback: () => any): void;
    }
    class Module {
        public $ctx: JQuery;
        public sandbox: Sandbox;
        public id: string;
        public connectors: Connector[];
        constructor($ctx: JQuery, sandbox: Sandbox, id: string);
        public on(callback: () => any): void;
        public after(): void;
        public start(): void;
        public stop(): void;
        public initAfter(): void;
        public fire(state: string, data?: any, channels?: any, defaultAction?: () => any): void;
        public attachConnector(connector: Connector): void;
        public detachConnector(connector: Connector): void;
        public getDecoratedModule(modName: string, skin: string, $node: JQuery, sandbox: Sandbox, id: number): Module;
    }
    class Connector {
        public connectorId: string;
        public modules: Module[];
        constructor(connectorId: string);
        public registerComponent(module: Module): void;
        public unregisterComponent(module: Module): void;
        public notify(origin: Module, state: string, data: Object): boolean;
    }
    module Utils {
        class String {
            static capitalize(str: string): string;
            static toCamel(str: string): string;
            static toFunction(str);
        }
    }
}
