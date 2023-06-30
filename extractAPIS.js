 function extractAPIInformation(nestJSProjectPath) {
    const fs = require('fs');
    const path = require('path');
    const glob = require('glob');
  
    const apiControllers = {};
    const controllersPath = path.join(nestJSProjectPath, 'src', '**/*.controller.ts');
  
    // Recursively find all .controller.ts files
    const controllerFiles = glob.sync(controllersPath, { ignore: '**/node_modules/**' });
  
    // Extract APIs from each controller file
    controllerFiles.forEach(controllerFile => {
      const controllerFileCode = fs.readFileSync(controllerFile, 'utf-8');
      const controllerAPIs = extractAPIsFromController(controllerFileCode);
  
      const controllerName = path.basename(controllerFile, '.controller.ts');
  
      if (!apiControllers[controllerName]) {
        apiControllers[controllerName] = [];
      }
  
      apiControllers[controllerName].push(...controllerAPIs);
    });
  
    return apiControllers;
  }
  
  function extractAPIsFromController(fileCode) {
    const apiPattern = /@(Get|Post|Put|Delete)\(\s*['"](.+)['"]/g;
    const apiMatches = [...fileCode.matchAll(apiPattern)];
  
    const apis = apiMatches.map(match => ({
      method: match[1],
      path: match[2]
    }));
  
    return apis;
  }
  
  module.exports = { extractAPIInformation };
