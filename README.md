# DevOps Toolbox

[![NPM Badge](https://img.shields.io/badge/npm-1.2.1-blue.svg)](https://www.npmjs.com/package/@exaprint/devops-toolbox)

This project helps Developpers, SysAdmin, DevOps, TechOps, NoOps to build DevOps pipelines for any project in any languages.

## Install

```bash
  # Dev Install
  $ npm i --save-dev @exaprint/devops-toolbox
  # Prod Install
  $ npm i --save @exaprint/devops-toolbox
  # Global Install
  $ npm i -g @exaprint/devops-toolbox
```

## Technical stack

This project is developed in nodeJS.
The main running process is based on plugins, internaly included and externally (tier plugins cooming soon).

All you need to do is to create a `.dotbox.json` file in your project root and fill it with all your CI CD tools.

Note: to use a plugin (tool) you need to install it before inside your project (or globally).
DevOps-Toolbox come without any embedded plugin.

## Usage

```
  Usage: devops-toolbox [options] <stackName>
  OR
  Usage: dotbox [options] <stackName>

  DevOps Toolbox is a tool to help developers to run CI and CD commands.
  <stackName>    The stack name provided in config file.
  
  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -c, --config <config-file>  Set DOTbox config file. Defaults to "./.dotbox.json"
```

## Config file description

The config file must contains valid JSON.
You can have multiple config file and specified one by one using the `--config` CLI option.

```bash
  $ dotbox -c configs/foo.json
```

### Stacks

A Stack is list of plugins to execute.
You can execute any defined stack by passing the stack name as first argument.

Plugins must be place in a `tasks` property.

For exemple, if your `.dotbox.json` contains:

```js
{
  "ci": { // Stack Name
   "tasks": [
     {
      "plugin" : "eslint"
     },
     {
      "plugin" : "jsdoc"
     }     
   ]
  }
}
```

You can execute the stack using the following command:

```bash
  $ dotbox ci
```
This will execute successively all plugin defined in the `ci` stack.

Note that `ci` is an arbitrary name. Feel free to name your stack as you want.

By default dotbox will execute all plugins in order synchronously, but if you want to execute them all asynchronously, you add the `async` param to your JSON Stack block:

```json
{
  "ci": {
    "async": true,
    "tasks": [
      {
        "plugin" : "eslint"
      },
      {
        "plugin" : "jsdoc"
      }     
    ]
  }
}
```

You can define as many Stack as you want:

```json
{
  "FirstStack": {
    "async": false,
    "tasks": [
      {
        "plugin" : "eslint"
      },
      {
        "plugin" : "mocha"
      }     
    ]
  },

  "SecondStack": {
    "async": true,
    "tasks": [
      {
        "plugin" : "jsdoc"
      },
      {
        "plugin" : "plato"
      }
    ]
  }
}
```

## Run with `npm` / `yarn`
When you got dotbox fully configured, you now can add some script like the following to you `package.json`:

```json
{
  "scripts": {
    "test": "dotbox test",
    "lint": "dotbox lint",
    "ci": "dotbox ci",
    "deploy": "dotbox deploy",
    "deploy-function": "dotbox deploy-function",
    "undeploy": "dotbox undeploy"
  }
}
```


### Plugins

A plugin is an object containing at least the plugin name inside a `plugin` property.

```json
{
  "ci": {
   "tasks": [
     {
      "plugin" : "eslint"
     }    
   ]
  }
}
```

A plugin is an object with defined properties and all plugins have common properties :

* `plugin` : (Required) The plugin name
* `function` : (Default to `default`) Define witch plugin function to execute. A plugin function is define by a plugin itself.
* `blocking` : (Default to `true`) If set to false, dotbox will not fail the global execution and just emit a warning in case of failure. If set to `true` and stack `async` (the default) dotbox will stop the process at the first plugin failure.
* `verbose` : (Default to `false`) Define verbosity. (This will get some improvements soon)

For example, if I want a stack with a non blocking linter and blocking tester: 

```json
{
  "myStack": {
    "tasks": [
      {
        "plugin" : "eslint",
        "blocking": false
      },
      {
        "plugin" : "mocha"
      }
    ]
  }
}
```

To learn more about plugin options and functions step out to the Plugin API Reference.

## Plugin API Reference

### List of plugins by category

#### --- Analysis ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| `plato`      | JavaScript source code visualization, static analysis, and complexity tool | Javascript | [Github Project](https://github.com/es-analysis/plato)|

#### --- Documentation ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| `jsdoc`      | API documentation generator for JavaScript, similar to Javadoc or phpDocumentor | Javascript | [usejsdoc.org](http://usejsdoc.org/)|

#### --- Linting ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| `eslint`     | The pluggable linting utility for JavaScript and JSX | Javascript | [eslint.org](http://eslint.org/)|
| `jshint`      | JSHint is a tool that helps to detect errors and potential problems in your JavaScript code | Javascript | [jshint.com](http://jshint.com/)|
| `xo`          | JavaScript happiness style linter based on EsLint | Javascript | [Github Project](https://github.com/sindresorhus/xo)|

#### --- Security ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| `nsp`      | nsp is the main command line interface to the Node Security Platform. It allows for auditing a package.json or npm-shrinkwrap.json file against the API. | Javascript, NodeJS | [Github Project](https://github.com/nodesecurity/nsp)|

#### --- Unit Tests ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| `mocha`      | Mocha is a feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun | Javascript, NodeJS | [mochajs.org](https://mochajs.org/)|

#### --- Deployments ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| `serverless`  | The Serverless Framework allows you to deploy auto-scaling, pay-per-execution, event-driven functions to any cloud. | Javascript, NodeJS | [serverless.com](https://serverless.com/)|
| `dpl`         | Dpl (dee-pee-ell) is a deploy tool made for continuous deployment. (Made by Tavis-CI) | * | [Github Project](https://github.com/travis-ci/dpl)|

#### --- Misc & tools ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| `custom-cmd`      | A simple plugin to run any shell function | Shell | |
| `symlink-resolver`      | A plugin able to resolve symlinks (copy the true file at the symlink's place) and restore them | Shell | |


### Plugin Reference

#### Plato

* Plugin name: `plato`
* Description: JavaScript source code visualization, static analysis, and complexity tool
* Requirements: Install Plato using NPM
* Supported languages: Javascript, NodeJs
* Project link: [https://github.com/es-analysis/plato](https://github.com/es-analysis/plato)

Options available (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "plato",                // [Required] Plugin Name

        "outputDir": "artifacts/plato",   // The output directory
        "eslintrcPath": "",               // Specify a eslintrc file for ESLint linting
        "jshintrcPath": "",               // Specify a jshintrc file for JSHint linting
        "title": "",                      // Title of the report
        "autoTitle": true,                // Try to load the project name inside package.json (only if title option is empty or undefined)
        "recurse": true,                  // Recursively search directories
        "targets": [],                    // List of target files/directories to process
        "customArgs": []                  // Custom list of argument (one argument per row)
      }
    ]
  }
}
```

#### JsDoc

* Plugin name: `jsdoc`
* Description: API documentation generator for JavaScript, similar to Javadoc or phpDocumentor
* Requirements: Install JsDoc using NPM
* Supported languages: Javascript, NodeJs
* Project link: [http://usejsdoc.org/](http://usejsdoc.org/)

Options available (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "jsdoc",                // [Required] Plugin Name,
  
        "outputDir": "artifacts/jsdoc",   // The path to the output folder for the generated documentation
        "configFilePath": "",             // The path to a JSDoc configuration file
        "templatePath": "",               // The path to the template to use for generating output
        "packagePath": "",                // The package.json file that contains the project name, version, and other details
        "readmePath": "",                 // The README.md file to include in the generated documentation
        "targets": [],                    // List of target files/directories to process       
        "customArgs": []                  // Custom list of argument (one argument per row)
      }
    ]
  }
}
```

#### EsLint

* Plugin name: `eslint`
* Description: The pluggable linting utility for JavaScript and JSX
* Requirements: Install EsLint using NPM
* Supported languages: Javascript, NodeJs
* Project links: [http://eslint.org/](http://eslint.org/) | [https://github.com/eslint/eslint](https://github.com/eslint/eslint)

Options available (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "eslint",               // [Required] Plugin Name

        "eslintrcPath": "",               // Use configuration from this file or shareable config
        "checkstyleExport": false,        // Activate or not the checkstyle export in [checkstyleExportPath]
        "checkstyleExportPath": "artifacts/eslint/eslint.xml", // Checkstyle export file
        "targets": ['.'],                    // List of target files/directories to process       
        "customArgs": []                  // Custom list of argument (one argument per row)        
      }
    ]
  }
}
```

#### JsHint

* Plugin name: `jshint`
* Description: JSHint is a tool that helps to detect errors and potential problems in your JavaScript code
* Requirements: Install JsHint using NPM
* Supported languages: Javascript, NodeJs
* Project links: [http://jshint.com/](http://jshint.com/) 

Options available (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "jshint",               // [Required] Plugin Name

        "checkstyleExport": false,        // Activate or not the checkstyle export in [checkstyleExportPath]
        "checkstyleExportPath": "artifacts/jshint/jshint.xml", // Checkstyle export file
        "targets": ['.'],                 // List of target files/directories to process       
        "customArgs": []                  // Custom list of argument (one argument per row)        
      }
    ]
  }
}
```

#### XO

* Plugin name: `xo`
* Description: JavaScript happiness style linter based on EsLint
* Requirements: Install XO using NPM
* Supported languages: Javascript, NodeJs
* Project links: [https://github.com/sindresorhus/xo](https://github.com/sindresorhus/xo) 

Options available (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "xo",                   // [Required] Plugin Name

        "targets": [],                    // List of target files/directories to process
        "customArgs": []                  // Custom list of argument (one argument per row)        
      }
    ]
  }
}
```

#### NSP

* Plugin name: `nsp`
* Description: nsp is the main command line interface to the Node Security Platform. It allows for auditing a package.json or npm-shrinkwrap.json file against the API.
* Requirements: Install NSP using NPM
* Supported languages: Javascript, NodeJs
* Project links: [https://github.com/nodesecurity/nsp](https://github.com/nodesecurity/nsp) 

Options available (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "nsp",      // [Required] Plugin Name

        "output": "default",  // Adjust the client outputs (default, summary, json, codeclimate, none)
        "customArgs": []      // Custom list of argument (one argument per row)        
      }
    ]
  }
}
```

#### MochaJS

* Plugin name: `mocha`
* Description: Mocha is a feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun.
* Supported languages: Javascript, NodeJs
* Project links: [https://github.com/nodesecurity/nsp](https://github.com/nodesecurity/nsp)
* Available functions: 
  * `default`: Execute the standard mocha CLI 
    * Requirements: Install `mocha` using NPM
  * `jenkins`: Run your Mocha unit tests with both XUnit and LCov output (for Jenkins).
    * Requirements: Install `jenkins-mocha` using NPM

Options available for `default` function (with their default values):
```js
{
  "MyStack": {  
    "tasks": [
      {
        "plugin": "mocha",                // [Required] Plugin Name

        "useNyc": false,                  // Execute mocha over NYC (require nyc to be installed)
        "nycReporters": [],               // Setup NYC reporters
        "nycCustomArgs": [],              // Custom list of argument (one argument per row) passed to NYC
        "colors": true,                   // Force enabling of colors
        "recursive": true,                // Include sub directories
        "timeout": 0,                     // Set test-case timeout in milliseconds [0 | undefined = 2000]
        "targets": [],                    // List of target files/directories to process                
        "customArgs": []                  // Custom list of argument (one argument per row)        
      }
    ]
  }
}
```

Options available for `jenkins` function (with their default values):
```js
{
  "MyStack": {  
    "tasks": [
      {
        "plugin": "mocha",                // [Required] Plugin Name
        "function": "jenkins",            // Plugin's function Name

        "useNyc": false,                  // Execute mocha over NYC (require nyc to be installed)
        "colors": true,                   // Force enabling of colors
        "recursive": true,                // Include sub directories
        "timeout": 0,                     // Set test-case timeout in milliseconds [0 | undefined = 2000]
        "targets": [],                    // List of target files/directories to process                
        "customArgs": [],                 // Custom list of argument (one argument per row)
        
        "cobertura": true,                // To have nyc use the cobertura reporter
        "noCoverage": false              // Turn coverage reporting off entirely
      }
    ]
  }
}
```

#### The Serverless Framework

* Plugin name: `serverless`
* Description: The Serverless Framework allows you to deploy auto-scaling, pay-per-execution, event-driven functions to any cloud.
* Requirements: Install Serverless Framework using NPM
* Supported languages: Javascript, NodeJs
* Project links: [serverless.com](https://serverless.com) 

Options available (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "serverless",             // [Required] Plugin Name
        "slsFunction": "",                  // [Required] Serverless function to call (related to the SLS CLI API Reference)

        "quiet": false,                     // If set to true, the --verbose flag will not be used
        "stage": null,                      // The stage in your service that you want to deploy to
        "region": null,                     // The region in that stage that you want to deploy to
        "removeNpmDevDependencies": true,   // Auto remove NPM Dev Dependencies before running the SLS function
        "restoreNpmDevDependencies": false, // Auto restore NPM Dev Dependencies after running the SLS function
        "resolveSymlinks": [],              // Resolve symlinks by copying true files as replacement before running the SLS function
        "restoreSymlinks": true,            // Restore symlinks after running the SLS function (only if resolveSymlinks is not empty)
        "customArgs": []                    // Custom list of argument (one argument per row)
      }
    ]
  }
}
```

#### Dpl (dee-pee-ell)

* Plugin name: `dpl`
* Description: Dpl (dee-pee-ell) is a deploy tool made for continuous deployment.
* Requirements:
  * Dpl requires ruby with a version greater than 1.9.3
  * To install: `gem install dpl`
* Project links: [https://github.com/travis-ci/dpl](https://github.com/travis-ci/dpl) 

Options available (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "dpl",                    // [Required] Plugin Name
        "provider": "",                     // [Required] DPL provider (related to the DPL API Reference)

        "skipCleanup": false,               // Dpl will deploy by default from the latest commit. Use the --skip_cleanup flag to deploy from the current file state. Note that many providers deploy by git and could ignore this option.
        "removeNpmDevDependencies": true,   // Auto remove NPM Dev Dependencies before running the SLS function
        "restoreNpmDevDependencies": false, // Auto restore NPM Dev Dependencies after running the SLS function
        "resolveSymlinks": [],              // Resolve symlinks by copying true files as replacement before running the SLS function
        "restoreSymlinks": true,            // Restore symlinks after running the SLS function (only if resolveSymlinks is not empty)
        "customArgs": []                    // Custom list of argument (one argument per row)
      }
    ]
  }
}
```

#### Custom Command

* Plugin name: `custom-cmd`
* Description: A simple plugin to run any shell function.
* Requirements: Got installed the command you specify
* Supported languages: Shell

Options available (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "custom-cmd",     // [Required] Plugin Name

        "cmd": "",                  // The command to run
        "customArgs": []            // Custom list of argument (one argument per row)        
      }
    ]
  }
}
```

#### Symlink Resolver

* Plugin name: `symlink-resolver`
* Description: A plugin able to resolve symlinks (copy the true file at the symlink's place and backup the original symlink) and restore them.
* Requirements: Got `ln` installed in your OS (Available on natively Unix and Windows over cygwin)
* Supported languages: Shell
* Available functions: 
  * `default`: Resolve symlinks
  * `restore`: Restore symlinks if backuped symlink file exists

Options available for `default` function (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "symlink-resolver",       // [Required] Plugin Name

        "links": []                         // List of symlink to resolve        
      }
    ]
  }
}
```

Options available for `jenkins` function (with their default values):
```js
{
  "MyStack": {
    "tasks": [
      {
        "plugin": "symlink-resolver",       // [Required] Plugin Name
        "function": "restore",              // Plugin's function name

        "links": []                         // List of symlink to resolve        
      }
    ]
  }
}
```

## Roadmap

* Improve Verbosity
* Improve JS Doc
* Auto installer for plugin's commands
* Add third party plugin compatibility
* Use Dotbox plugin in a node plugin
* Use plugin references in config file (same plugin conf in multiple stack)
* Ability to run plugins with a specified tag name inside a stack
* Add more and more plugins...
* Add more unit tests :)
