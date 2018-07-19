# logger
Generic logging utility focused around a plugin-architecture to be used in projects and APIs.

<br>

# Features: #
- Plugin architecture allows it to be hooked up to external logging services, databases, files, etc
- Plugin can provide optional config (with sane defaults)
- User can overwrite config options
- Plugins receive a `sender` identifier object to point to code paths, plugins, functions, etc

<br>

## Install: ##
    npm install @expressivejs/logger

<br>

## Use in project: ##
    const logger = require('@expressivejs/logger')
    logger.load([ 'examplePlugin' ])

    // Somewhere else in project
    const logAPI = logger.API()
    logAPI.log('I am Logging')

#### Output: ####
    $ I am a Logging
    
<br><br>

## Example user config: ##
    const exampleUserConfig = {
      examplePlugin: { 
        someProp: true,
      },
    }

    logger.load([ 'examplePlugin' ], exampleUserConfig)
    
<br>

## Path to loggers: ##
Uses `path.resolve()` behind the scenes.

    logger.load([ 'examplePlugin' ], null, './loggers')

<br>

## Example Plugin: ##
    module.exports = {
      extends: ['log'],
      
      init: function(config) {
        // Every logger must impement an init function.
      },
    
      log: function(sender, message) {
        if (sender.name)
          console.log(`[${sender.name} in ${sender.type}] ${message}`)
        else
          console.log(`[${sender.type}] ${message}`)
      }
    }

<br>

## Example Plugin Config: ##
    module.exports = {
      someProp: false,
      otherProp: true,
    }

<br>

#### Merged Config Output: ####
     { someProp: true, otherProp: true }
     
Given the above examples, a Plugin provides default config options - however, the user overwrites props provided to `exampleUserConfig`. 

1. In this case, `someProp` is defined `false` by the plugin
2. The user config (`exampleUserConfig`) says they want `someProp` to be `true`
3. Other default config options defined by the Plugin are untouched.

<br><br>

# Sender identifier params: ##
Sender can be an object if you require more properties or string.
If Sender is a string, an additional param can be used for more information.

<br>

## Sender identifier Example Use: ##
    const logAPI = logger.API('someModule')
    logAPI.log('I am a Logging')

#### Output: ####
    $ [someModule] I am a Logging
    
<br>

## Sender identifier Extra Param: ##
    const logAPI = logger.API('someModule', 'someFunction')
    logAPI.log('I am a Logging')

#### Output: ####
    $ [someFunction in someModule] I am a Logging
    
<br>


## Sender as object: ##
    const logAPI = logger.API({ functionName: 'someFunction', line: 11 })
    logAPI.log('I am a Logging')
    
<br>
