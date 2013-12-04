TerrificTS
==========

TerrificTS is an experimental port of TerrificJs to TypeScript.
The aim is to be able to use the TypeScript class-pattern in Terrific-modules and skins. I ported the whole script to TypeScript (maybe a bit overkill, as only the 'Module'-class is needed).
The script works, but was not tested at all. Open the [index.html](Example/index.html) in a browser to give it a shot.

If you are not familiar with TerrificJs, check out [terrifically.org](http://terrifically.org).
The same goes for [typescriptlang.org](http://www.typescriptlang.org) for TypeScript.

Usage
------
I recommend to check the provided example to get a grip, but in short:
You need at least the [terrific-2.0.1.js](terrific-2.0.1.js) aswell as the [terrific-2.0.1.d.ts](terrific-2.0.1.d.ts) files from the root of this repository. Make sure to include the js-file in your Terrific-project as usual. The .d.ts-file contains the definitions to be used from TypeScript. You will obviously use TypeScript instead of plain JavaScript for the modules, take a look at the [example.ts](Example/modules/example/example.ts)- aswell as the [example-blue.ts](Example/modules/example/example-blue.ts)-files which contain a basic template to be used for your modules and skins.

Do not forget to reference additional declaration-files like the jquery.d.ts if you need to work with it. [Here](https://github.com/borisyankov/DefinitelyTyped)'s a list of declaration-files for many js-libraries.