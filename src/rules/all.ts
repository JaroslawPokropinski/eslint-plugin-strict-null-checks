import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { createEslintRule } from "../utils/create-eslint-rule";
import {
  getConstrainedTypeAtLocation,
  isNullableType,
  isTypeAnyType,
} from "@typescript-eslint/type-utils";
import { SyntaxKind } from "typescript";
import { compareTypeObjects } from "../utils/compare";

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
      description: "Enforce strict null checks",
      recommended: "warn",
    },
    schema: [],
    messages: {
      safeMemberAccess:
          "Member is possibly nullish and should be checked. Consider accessing the member using the optional chaining operator (?.)",
      safeDeclaration:
          "A nullish value shouldn't be assigned to a non-nullish type.",
      safeFunctionArguments:
          "Don't pass nullish arguments to a function that expects a non-nullish type.",
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
      VariableDeclarator(astNode) {
        const tsnode = parserServices.esTreeNodeToTSNodeMap.get(astNode);
        const identifier = tsnode.name;
        const initializer = tsnode.initializer;
        const idType = getConstrainedTypeAtLocation(checker, identifier);

        // if variable is not nullable and not initialized and not in for each statement
        if (
          !isNullableType(idType) &&
          !initializer &&
          ![SyntaxKind.ForInStatement, SyntaxKind.ForOfStatement].includes(
            tsnode.parent?.parent?.kind ?? ""
          )
        ) {
          return context.report({
            messageId: "safeDeclaration",
            loc: astNode.id.loc,
          });
        }
        if (!initializer) return;
        const initType = getConstrainedTypeAtLocation(checker, initializer);

        // if variable is initialized by null (unless it is nullable or any)
        if (
          isNullableType(initType) &&
          !(isNullableType(idType) || isTypeAnyType(idType))
        ) {
          return context.report({
            messageId: "safeDeclaration",
            loc: astNode.id.loc,
          });
        }

        // handle declaration of objects
        if (!compareTypeObjects(idType, initType, checker)) {
          return context.report({
            messageId: "safeDeclaration",
            loc: astNode.init?.loc ?? astNode.id.loc,
          });
        }
      },
      CallExpression(node) {
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const signature = checker.getResolvedSignature(originalNode);
        if (!signature) return;

        const paramsInSig = signature.getParameters();

        const nullableSig = paramsInSig.map((p) => {
          const declaration = p.declarations?.[0];
          if (!declaration) return false; // if cannot get declaration, assume it is not nullable

          const paramType = checker.getTypeOfSymbolAtLocation(p, declaration);
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
