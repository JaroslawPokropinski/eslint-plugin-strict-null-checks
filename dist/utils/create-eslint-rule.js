"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEslintRule = void 0;
const utils_1 = require("@typescript-eslint/utils");
exports.createEslintRule = utils_1.ESLintUtils.RuleCreator((ruleName) => ruleName);
