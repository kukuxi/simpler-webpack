// 实现ES6语法转换到ESS5
const fs = require("fs");
const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const { transformFromAst } = require("babel-core");
module.exports = {
  getAST: path => {
    // 转换成AST
    const file = fs.readFileSync(path, "utf-8");
    return babylon.parse(file, {
      sourceType: "module"
    });
  },
  getDependencies: ast => {
    //分析依赖
    const dpendencies = [];
    traverse(ast, {
      ImportDeclaration: ({ node }) => {
        dpendencies.push(node.source.value);
      }
    });
    return dpendencies;
  },
  transform: ast => {
    const { code } = transformFromAst(ast, null, {
      presets: ["env"]
    });
    return code;
  }
};
