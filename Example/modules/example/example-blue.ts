/// <reference path="../../../terrific-2.0.1.d.ts"/>
/// <reference path="example.ts"/>

module Tc.Module.Example {
	export class Blue extends Tc.Module.Example {
		on(callback){
			console.log('Example (Blue)');

			this.$ctx.on('click', () => {
				this.fire('ToggleBlue', ['c1']);
			});

			callback();
		}

		after() {
			console.log('Example (Blue) > After');
		}
	}
}