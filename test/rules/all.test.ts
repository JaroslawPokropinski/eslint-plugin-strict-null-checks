import { RuleTester } from "@typescript-eslint/utils/dist/ts-eslint";
import path from "path";
import rule, { MessageIds, RULE_NAME } from "../../src/rules/all";

const root = path.resolve(path.join(__dirname, "../"));

const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: root,
  },
});
const valid = [
  `
  function foo() {
    const a = 1 as number | undefined;
  }
  `,
  `
  function foo() {
    const a: {x: number} | undefined = undefined;
    const b = a?.x;
  }
  `,
  `
  function foo() {
    const a: {x: () => number} | undefined = undefined;
    const b = a?.x();
  }
  `,
  `
  function foo(a?: number, b?: number) {
  }
  foo(undefined, undefined);
  `,
];

const invalidStatemetsMemberAccess = [
  `
  function foo() {
    const a: {x: number} | undefined = undefined;
    const b: number = a.x;
  }
  `,
];

const invalidStatemetsDeclaration = [
  `
  function foo() {
    const a: {x: number} | undefined = undefined;
    const b: {x: number} = a;
  }
  `,
];

const invalidFunctionArguments = [
  `
  function foo(a: number) {
  }
  foo(undefined);
  `,
];

const invalid = [
  ...invalidStatemetsMemberAccess.map((st) => ({
    code: st,
    errors: [{ messageId: "safeMemberAccess" as MessageIds }],
  })),
  ...invalidStatemetsDeclaration.map((st) => ({
    code: st,
    errors: [{ messageId: "safeDeclaration" as MessageIds }],
  })),
  ...invalidFunctionArguments.map((st) => ({
    code: st,
    errors: [{ messageId: "safeFunctionArguments" as MessageIds }],
  })),
];

ruleTester.run(RULE_NAME, rule, {
  valid,
  invalid,
});
