/// <reference path="../../../terrific-2.0.1.d.ts"/>

module Tc.Module {
	export class Example extends Tc.Module {
		on(callback) {
			console.log('Example');

			callback();
		}

		after() {
			console.log('Example > After');
		}
	}
}