const { getAST, getDependencies, transform } = require("./parser");
const path = require("path");

const filePath = path.join(__dirname, "../src/index.js");
const ast = getAST(filePath);
const dependencies = getDependencies(ast);
console.log(transform(ast));
