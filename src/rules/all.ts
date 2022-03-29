import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { createEslintRule } from "../utils/create-eslint-rule";
import {
  getConstrainedTypeAtLocation,
  isNullableType,
  isTypeAnyType,
} from "@typescript-eslint/type-utils";

export const RULE_NAME = "all";
export type MessageIds =
  | "safeMemberAccess"
  | "safeDeclaration"
  | "safeFunctionArguments";
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
        "Accessing member of nullable variable should be done using chain expression (?.)",
      safeDeclaration:
        "Assigning nullable value to non nullable variable (you may use ?? for default value)",
      safeFunctionArguments:
        "Passing nullable argument to function that expects non nullable",
    },
  },
  defaultOptions: [],
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    return {
      MemberExpression(node) {
        const objectOrgNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.object
        );
        const objectType = getConstrainedTypeAtLocation(checker, objectOrgNode);
        if (isNullableType(objectType) && !node.optional) {
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
        if (
          !isNullableType(idType) &&
          !node.init &&
          node.parent?.parent?.type !== "ForOfStatement"
        ) {
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

        if (isNullableType(initType) && !(isNullableType(idType) || isTypeAnyType(idType))) {
          context.report({
            messageId: "safeDeclaration",
            loc: node.id.loc,
          });
        }
      },
      CallExpression(node) {
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const expressionType = getConstrainedTypeAtLocation(
          checker,
          originalNode.expression
        );
        const signatures = expressionType.getCallSignatures();
        if (signatures.length !== 1) return;

        const paramsInSig = signatures[0].getParameters();

        const nullableSig = paramsInSig.map((p) => {
          const declaration = p.declarations?.[0];
          if (!declaration) return false; // if cannot get declaration, assume it is not nullable

          const paramType = getConstrainedTypeAtLocation(checker, declaration);
          return isNullableType(paramType) || isTypeAnyType(paramType);
        });

        const argTypes = originalNode.arguments.map((arg) =>
          getConstrainedTypeAtLocation(checker, arg)
        );
        const nullableParam = argTypes.map((arg) => isNullableType(arg));

        nullableSig.forEach((ns, i) => {
          if (!ns && nullableParam[i]) {
            context.report({
              messageId: "safeFunctionArguments",
              loc: node.arguments[i].loc,
            });
          }
        });
      },
    };
  },
});
