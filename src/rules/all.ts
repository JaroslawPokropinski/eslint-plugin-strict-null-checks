import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { createEslintRule } from "../utils/create-eslint-rule";
import {
  getConstrainedTypeAtLocation,
  isNullableType,
} from "@typescript-eslint/type-utils";

export const RULE_NAME = "strict-null-check";
export type MessageIds = "safeMemberAccess" | "safeDeclaration";
export type Options = [];

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "force strict null checks",
      recommended: "warn",
    },
    schema: [],
    messages: {
      safeMemberAccess:
        "Accessing member of possibly nullable variable should be done using chain expression (?.)",
      safeDeclaration:
        "Assigning possibly nullable value to non nullable variable (you may use ?? for default value)",
    },
  },
  defaultOptions: [],
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    return {
      MemberExpression(node) {
        console.log("MemberExpression");
        const objectOrgNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.object
        );
        const objectType = getConstrainedTypeAtLocation(checker, objectOrgNode);
        if (
          isNullableType(objectType) &&
          node.parent?.type !== "ChainExpression"
        ) {
          context.report({
            messageId: "safeMemberAccess",
            loc: node.object.loc,
          });
        }
      },
      VariableDeclarator(node) {
        const originalIdNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.id
        );
        const idType = getConstrainedTypeAtLocation(checker, originalIdNode);
        if (!isNullableType(idType) && !node.init) {
          return context.report({
            messageId: "safeDeclaration",
            loc: node.id.loc,
          });
        }
        if (!node.init) return;
        const originalInitNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.init
        );
        const initType = getConstrainedTypeAtLocation(
          checker,
          originalInitNode
        );

        if (isNullableType(initType) && !isNullableType(idType)) {
          context.report({
            messageId: "safeDeclaration",
            loc: node.id.loc,
          });
        }
      },
    };
  },
});
