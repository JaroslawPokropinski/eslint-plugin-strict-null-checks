"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RULE_NAME = void 0;
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const create_eslint_rule_1 = require("../utils/create-eslint-rule");
const type_utils_1 = require("@typescript-eslint/type-utils");
exports.RULE_NAME = 'null-safe';
exports.default = (0, create_eslint_rule_1.createEslintRule)({
    name: exports.RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description: 'force class injectables to be readonly if they are private/public/protected',
            recommended: 'error',
        },
        schema: [],
        messages: {
            safeMemberAccess: 'Accessing member of possibly nullable variable should be done using chain expression (?.)',
            safeDeclaration: '',
        },
    },
    defaultOptions: [],
    create: (context) => {
        const parserServices = experimental_utils_1.ESLintUtils.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        return {
            MemberExpression(node) {
                var _a;
                console.log('MemberExpression');
                const objectOrgNode = parserServices.esTreeNodeToTSNodeMap.get(node.object);
                const objectType = (0, type_utils_1.getConstrainedTypeAtLocation)(checker, objectOrgNode);
                if ((0, type_utils_1.isNullableType)(objectType) &&
                    ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) !== 'ChainExpression') {
                    context.report({
                        messageId: 'safeMemberAccess',
                        loc: node.object.loc,
                    });
                }
            },
            VariableDeclarator(node) {
                const originalIdNode = parserServices.esTreeNodeToTSNodeMap.get(node.id);
                const idType = (0, type_utils_1.getConstrainedTypeAtLocation)(checker, originalIdNode);
                if (!(0, type_utils_1.isNullableType)(idType) && !node.init) {
                    return context.report({
                        messageId: 'safeDeclaration',
                        loc: node.id.loc,
                    });
                }
                if (!node.init)
                    return;
                const originalInitNode = parserServices.esTreeNodeToTSNodeMap.get(node.init);
                const initType = (0, type_utils_1.getConstrainedTypeAtLocation)(checker, originalInitNode);
                if ((0, type_utils_1.isNullableType)(initType) && !(0, type_utils_1.isNullableType)(idType)) {
                    context.report({
                        messageId: 'safeDeclaration',
                        loc: node.id.loc,
                    });
                }
            },
        };
    },
});
