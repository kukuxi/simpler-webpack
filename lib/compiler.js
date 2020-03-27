// 模块构建和文件输出
const path = require("path");
const { getAST, getDependencies, transform } = require("./parser");
const fs = require("fs");

module.exports = class Compile {
  constructor(options) {
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;
    this.modules = [];
  }

  run() {
    const entryModule = this.buildModule(this.entry, true);
    this.modules.push(entryModule);

    this.modules.map(module => {
      module.dependencies.map(dependency => {
        const dependencyModule = this.buildModule(dependency);
        this.modules.push(dependencyModule);
      });
    });
    console.log(this.entry);
    this.emitFiles();
  }

  buildModule(filename, isEntry) {
    let ast;

    if (isEntry) {
      ast = getAST(filename);
    } else {
      const absolutePath = path.join(process.cwd(), "./src", filename);
      ast = getAST(absolutePath);
    }

    return {
      filename,
      dependencies: getDependencies(ast),
      transformCode: transform(ast)
    };
  }
  emitFiles() {
    let modules = "";

    this.modules.forEach(module => {
      const { filename, transformCode } = module;
      modules += `'${filename}': function(module, exports, require) {
        ${transformCode}
      },`;
    });

    let bundle = `(function(modules){
      function require(moduleId) {
        var module = { exports: {} };

        modules[moduleId].call(
          module.exports,
          module,
          module.exports,
          require
        );

        return module.exports;
      }
      return require('${this.entry}')
    })({${modules}})`;

    const outputPath = path.join(this.output.path, this.output.filename);

    // console.log("outputPath :", outputPath);
    // console.log("bundle :", bundle);
    fs.writeFileSync(outputPath, bundle, "utf-8");
  }
};
