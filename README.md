# DevOps Toolbox

This project helps Developpers, SysAdmin, DevOps, TechOps, NoOps to build DevOps pipelines for any project in any languages.

## Install

```bash
  # Dev Install
  $ npm i --save-dev devops-toolbox
  # Prod Install
  $ npm i --save devops-toolbox
  # Global Install
  $ npm i -g devops-toolbox
```

## Technical stack

This project is developed in nodeJS.
The main running process is based on plugins, internaly included and externally (tier plugins cooming soon).

All you need to do is to create a `.dotbox.json` file in your project root and fill it with all your CI CD tools.

Note: to use a plugin (tool) you need to install it before inside your project (or globally).
DevOps-Toolbox come without any embedded plugin.

## Usage

```
  Usage: devops-toolbox [options] <stackName> [category]
  OR
  Usage: dotbox [options] <stackName> [category]

  DevOps Toolbox is a tool to help developers to run CI and CD commands.
  <stackName>    The stack name provided in config file.
  <category>     Plugin category (leave it empty to run all defined categories): lint, utest, doc, misc...

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

A Stack is list of categorized plugins to execute.
You can execute defined stack by passing the stack name as first argument.

For exemple, if your `.dotbox.json` contains:

```js
{
  "ci": { // Stack Name
    "lint": { // Category Name
      "eslint" : {}, // Plugin Name
      "jslint" : {} // Plugin Name
    }
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
    "lint": {
      "eslint" : {},
      "jslint" : {}
    }
  }
}
```

You can define as many Stack as you want:

```js
{
  // First stack
  "lintAndTests": { 
    "async": false,
    "lint": { 
      "eslint" : {}, 
      "jslint" : {}
    },
    "test": {
      "mocha": {}
    }
  },
  
  // Second stack
  "docAndAnalysis": {
    "async": true,
    "doc": {
      "jsdoc": {}
    },
    "analysis": { 
      "plato" : {}
    }   
  }  
}
```

### Category and Plugin

Current list of category (no third part at the moment but coming soon):
* analysis : Source code visualization, static analysis, and complexity tools
* doc : Documentation generators
* lint : Linters
* security : Security tools
* test : Test suite tools

A plugin must be define in a category:
```js
{
  "myStack": {       // Stack Name
    "lint": {        // Categoy Name
      "eslint" : {}, // Plugin Name
      "jslint" : {}  // Plugin Name
    }
  }
}
```

You can specify a category in CLI to only execute one category of plugins:
```bash
  $ dotbox myStack lint
```

A plugin is an object with defined options and all plugins have common options :

* blocking : (Default to `true`) If set to false, dotbox will not fail the global execution and just emit a warning in case of failure. If set to `true` and stack `async` (the default) dotbox will stop the process at the first plugin failure.
* verbose : (Default to `false`) Define verbosity. (This will get some improvements soon)
* function : (Default to `default`) Define witch plugin function to execute. A plugin function is define by a plugin itself.

For example, if I want a stack with a non blocking linter and blocking tester: 
```json
{
  "myStack": {
    "lint": {
      "eslint" : {
        "blocking": false
      }
    },
    "test": {
      "mocha": {}
    }
  }
}
```

Now if you want to execute a same plugin with multiple configurations in a category inside a stack, just switch to an array of object:
```json
{
  "myStack": {
    "async": true,
    "lint": {
      "eslint" : [
        {
          "blocking": false
        },
        {
          "blocking": false,
          "checkstyleExport": true
        }
      ]
    }
  }
}
```
This stack will execute asynchronously two times the eslint plugin with a standard eslint execution that displays all the result in the terminal and a non verbose execution that export the result in an XML file.

To learn more about plugin options and functions step out to the Plugin API Reference.

## Plugin API Reference

### List of plugins by category

#### --- analysis ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| plato      | JavaScript source code visualization, static analysis, and complexity tool | Javascript | [Github Project](https://github.com/es-analysis/plato)|

#### --- doc ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| jsdoc      | API documentation generator for JavaScript, similar to Javadoc or phpDocumentor | Javascript | [usejsdoc.org](http://usejsdoc.org/)|

#### --- lint ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| eslint      | The pluggable linting utility for JavaScript and JSX | Javascript | [eslint.org](http://eslint.org/)|
| jshint      | JSHint is a tool that helps to detect errors and potential problems in your JavaScript code | Javascript | [jshint.com](http://jshint.com/)|
| xo          | JavaScript happiness style linter based on EsLint | Javascript | [Github Project](https://github.com/sindresorhus/xo)|

#### --- security ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| nsp      | nsp is the main command line interface to the Node Security Platform. It allows for auditing a package.json or npm-shrinkwrap.json file against the API. | Javascript, NodeJS | [Github Project](https://github.com/nodesecurity/nsp)|

#### --- test ---

| Plugins       | Description   | Languages| Link |
| ------------- |-------------| -----| -----|
| mocha      | Mocha is a feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun | Javascript, NodeJS | [mochajs.org](https://mochajs.org/)|


### Plugin Reference

#### Plato

* Plugin name: plato
* Category name: analysis
* Description: JavaScript source code visualization, static analysis, and complexity tool
* Requirements: Install Plato using NPM
* Supported languages: Javascript, NodeJs
* Project link: [https://github.com/es-analysis/plato](https://github.com/es-analysis/plato)

Options available (with there default values):
```js
{
  "MyStack": {
  
    "analysis": {
      "plato": {
        "blocking": true,                 // Whether the execution is blocking or not
        "outputDir": "artifacts/plato",   // The output directory
        "eslintrcPath": "",               // Specify a eslintrc file for ESLint linting
        "jshintrcPath": "",               // Specify a jshintrc file for JSHint linting
        "title": "",                      // Title of the report
        "autoTitle": true,                // Try to load the project name inside package.json (only if title option is empty or undefined)
        "recurse": true,                  // Recursively search directories
        "targets": [],                    // List of target files/directories to process
        "customArgs": []                  // Custom list of argument (one argument per row)
      }
    }
    
  }
}
```

#### JsDoc

* Plugin name: jsdoc
* Category name: doc
* Description: API documentation generator for JavaScript, similar to Javadoc or phpDocumentor
* Requirements: Install JsDoc using NPM
* Supported languages: Javascript, NodeJs
* Project link: [http://usejsdoc.org/](http://usejsdoc.org/)

Options available (with there default values):
```js
{
  "MyStack": {
  
    "doc": {
      "jsdoc": {
        "blocking": true,                 // Whether the execution is blocking or not
        "outputDir": "artifacts/jsdoc",   // The path to the output folder for the generated documentation
        "configFilePath": "",             // The path to a JSDoc configuration file
        "templatePath": "",               // The path to the template to use for generating output
        "packagePath": "",                // The package.json file that contains the project name, version, and other details
        "readmePath": "",                 // The README.md file to include in the generated documentation
        "targets": [],                    // List of target files/directories to process       
        "customArgs": []                  // Custom list of argument (one argument per row)
      }
    }
    
  }
}
```

#### EsLint

* Plugin name: eslint
* Category name: lint
* Description: The pluggable linting utility for JavaScript and JSX
* Requirements: Install EsLint using NPM
* Supported languages: Javascript, NodeJs
* Project links: [http://eslint.org/](http://eslint.org/) | [https://github.com/eslint/eslint](https://github.com/eslint/eslint)

Options available (with there default values):
```js
{
  "MyStack": {
  
    "lint": {
      "eslint": {
        "blocking": true,                 // Whether the execution is blocking or not
        "eslintrcPath": "",               // Use configuration from this file or shareable config
        "checkstyleExport": false,        // Activate or not the checkstyle export in [checkstyleExportPath]
        "checkstyleExportPath": "artifacts/eslint/eslint.xml", // Checkstyle export file
        "targets": ['.'],                    // List of target files/directories to process       
        "customArgs": []                  // Custom list of argument (one argument per row)        
      }
    }
    
  }
}
```

#### JsHint

* Plugin name: jshint
* Category name: lint
* Description: JSHint is a tool that helps to detect errors and potential problems in your JavaScript code
* Requirements: Install JsHint using NPM
* Supported languages: Javascript, NodeJs
* Project links: [http://jshint.com/](http://jshint.com/) 

Options available (with there default values):
```js
{
  "MyStack": {
  
    "lint": {
      "jshint": {
        "blocking": true,                 // Whether the execution is blocking or not
        "checkstyleExport": false,        // Activate or not the checkstyle export in [checkstyleExportPath]
        "checkstyleExportPath": "artifacts/jshint/jshint.xml", // Checkstyle export file
        "targets": ['.'],                    // List of target files/directories to process       
        "customArgs": []                  // Custom list of argument (one argument per row)        
      }
    }
    
  }
}
```

#### XO

* Plugin name: xo
* Category name: lint
* Description: JavaScript happiness style linter based on EsLint
* Requirements: Install XO using NPM
* Supported languages: Javascript, NodeJs
* Project links: [https://github.com/sindresorhus/xo](https://github.com/sindresorhus/xo) 

Options available (with there default values):
```js
{
  "MyStack": {
  
    "lint": {
      "xo": {
        "blocking": true,                 // Whether the execution is blocking or not
        "targets": [],                    // List of target files/directories to process
        "customArgs": []                  // Custom list of argument (one argument per row)        
      }
    }
    
  }
}
```

#### NSP

* Plugin name: nsp
* Category name: security
* Description: nsp is the main command line interface to the Node Security Platform. It allows for auditing a package.json or npm-shrinkwrap.json file against the API.
* Requirements: Install NSP using NPM
* Supported languages: Javascript, NodeJs
* Project links: [https://github.com/nodesecurity/nsp](https://github.com/nodesecurity/nsp) 

Options available (with there default values):
```js
{
  "MyStack": {
  
    "security": {
      "nsp": {
        "blocking": true,                 // Whether the execution is blocking or not
        "output": "default",              // Adjust the client outputs (default, summary, json, codeclimate, none)
        "customArgs": []                  // Custom list of argument (one argument per row)        
      }
    }
    
  }
}
```

#### MochaJS

* Plugin name: `nsp`
* Category name: `security`
* Description: Mocha is a feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple and fun.
* Supported languages: Javascript, NodeJs
* Project links: [https://github.com/nodesecurity/nsp](https://github.com/nodesecurity/nsp)
* Available functions: 
  * `default`: Execute the standard mocha CLI 
    * Requirements: Install `mocha` using NPM
  * `jenkins`: Run your Mocha unit tests with both XUnit and LCov output (for Jenkins).
    * Requirements: Install `jenkins-mocha` using NPM

Options available for `default` function (with there default values):
```js
{
  "MyStack": {
  
    "test": {
      "mocha": {
        "blocking": true,                 // Whether the execution is blocking or not
        "useNyc": false,                  // Execute mocha over NYC (require nyc to be installed)
        "colors": true,                   // Force enabling of colors
        "recursive": true,                // Include sub directories
        "timeout": 0,                     // Set test-case timeout in milliseconds [0 | undefined = 2000]
        "targets": [],                    // List of target files/directories to process                
        "customArgs": []                  // Custom list of argument (one argument per row)        
      }
    }
    
  }
}
```

Options available for `jenkins` function (with there default values):
```js
{
  "MyStack": {
  
    "test": {
      "mocha": {
        "blocking": true,                 // Whether the execution is blocking or not
        "useNyc": false,                  // Execute mocha over NYC (require nyc to be installed)
        "colors": true,                   // Force enabling of colors
        "recursive": true,                // Include sub directories
        "timeout": 0,                     // Set test-case timeout in milliseconds [0 | undefined = 2000]
        "targets": [],                    // List of target files/directories to process                
        "customArgs": []                  // Custom list of argument (one argument per row)
        
        "cobertura": true,                // To have nyc use the cobertura reporter
        "noCoverage": false              // Turn coverage reporting off entirely
      }
    }
    
  }
}
```
