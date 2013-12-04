/// <reference path="../../../terrific-2.0.1.d.ts"/>

module Tc.Module {
	export class Title extends Tc.Module {
		on(callback) {
			console.log('Title');

			callback();
		}

		after() {
			console.log('Title > After');
		}

		onToggleBlue() {
			this.$ctx.toggleClass('blue');
		}
	}
}