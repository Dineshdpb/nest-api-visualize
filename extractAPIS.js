function extractAPIInformation(nestJSProjectPath) {
  const fs = require("fs");
  const path = require("path");
  const glob = require("glob");

  const apiControllers = {};
  const controllersPath = path.join(
    nestJSProjectPath,
    "src",
    "**/*.controller.ts"
  );

  // Recursively find all .controller.ts files
  const controllerFiles = glob.sync(controllersPath, {
    ignore: "**/node_modules/**",
  });
  const mainFilePath = path.join(nestJSProjectPath, "src", "main.ts");
  const mainFileCode = fs.readFileSync(mainFilePath, "utf-8");
  const globalPrefixMatches = mainFileCode.match(
    /app\.setGlobalPrefix\(['"](.+)['"]\)/
  );
  const globalPrefix = globalPrefixMatches ? globalPrefixMatches[1] : "";

  const packageJsonPath = path.join(nestJSProjectPath, "package.json");
  const packageJsonData = fs.readFileSync(packageJsonPath, "utf-8");
  const parsesPackageJsonData=JSON.parse(packageJsonData)
  const projectName = parsesPackageJsonData?.name;

  const nestJsVersion = parsesPackageJsonData.dependencies["@nestjs/core"];
  const nodeJsVersion = process.versions.node;

  // Extract APIs from each controller file
  controllerFiles.forEach((controllerFile) => {
    const controllerFileCode = fs.readFileSync(controllerFile, "utf-8");
    const controllerAPIs = extractAPIsFromController(controllerFileCode);

    const controllerName = path.basename(controllerFile, ".controller.ts");

    if (!apiControllers[controllerName]) {
      apiControllers[controllerName] = [];
    }

    apiControllers[controllerName].push(...controllerAPIs);
  });

  return {
    api: apiControllers,
    globalPrefix: globalPrefix,
    projectName: projectName,
    nestJsVersion: nestJsVersion,
    nodeJsVersion: nodeJsVersion,
  };
}

function extractAPIsFromController(fileCode) {
  const apiPattern =
    /@(Get|Post|Put|Delete)\(['"](.+)['"]\)(?:[\r\n\s]+(?!@(Get|Post|Put|Delete))@(\w+)(?:\(([^)]*)\))?[^@]*)*/g;
  const apiMatches = [...fileCode.matchAll(apiPattern)];

  const apis = apiMatches.map((match) => {
    const method = match[1];
    const path = match[2];
    const decoratorsBlock = match[0]
      .replace(/@(Get|Post|Put|Delete)\(['"](.+)['"]\)/g, "")
      .trim();
    const decoratorPattern = /@(\w+)(?:\(([^)]*)\))?/g;
    const decorators = [];
// if(decoratorsBlock){}
    let decoratorMatch;
    while ((decoratorMatch = decoratorPattern.exec(decoratorsBlock)) !== null) {
      const decoratorName = decoratorMatch[1];
      const decoratorParams = decoratorMatch[2]
        ? decoratorMatch[2].split(",").map((param) => param.trim())
        : [];

      decorators.push({
        name: decoratorName,
        params: decoratorParams,
      });
    }

    return {
      method,
      path,
      decorators,
    };
  });

  return apis;
}


module.exports = { extractAPIInformation };
