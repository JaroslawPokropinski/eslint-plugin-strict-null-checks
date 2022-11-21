import { RuleTester } from "@typescript-eslint/utils/dist/ts-eslint";
import path from "path";
import rule, { MessageIds, RULE_NAME } from "../../src/rules/all";

const root = path.resolve(path.join(__dirname, "../"));

const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    project: "./tsconfig.strict.json",
    tsconfigRootDir: root,
  },
});
const validStatements = [
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
  `
  function foo() {
    const a: {x: () => number} | undefined = undefined;
    const b = a?.x();
  }
  `,
  `
  const a = new Array<number>();
  for (const x of a) {
  }
  `,
  `
  const foo = (arg1?: string[]): string[] => 
    Array.isArray(arg1) 
        ? arg1.map((field) => \`field: \${field}\`) 
        : [];
  `,
  `
  const x: any = undefined; 
  `,
  `
  const t = {
    a: 'a'
  };
  for (const key in t) {
  }
  `,
  `
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
  function useState<S>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
    throw new Error();
  }

  const [st, setSt] = useState<number>();
  setSt(undefined);
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
  `
  type Foo = {
    NonNullableString: string
  }
  
  const t: {x: string} | undefined = undefined;

  const data: Foo = {
    NonNullableString: t?.x, // even though we have optional chaining, undefined will still be set, the compiler/linter should know this
  }
  `,
  `
  type Foo = {
    NonNullableString: string
  }
  
  const t = {NonNullableString: undefined};

  const data: Foo = t;
  `,
  `
  type Foo = {
    NullableString?: string
    NonNullableString: string
    NonNullableStringTwo: string
  }
  
  const bar = {
    NullableProperty: undefined,
  }
  
  const data: Foo = {
    NullableString: '',
    NonNullableString: bar.NullableProperty?.bla, // even though we have optional chaining, undefined will still be set, the compiler/linter should know this
    NonNullableStringTwo: bar.NullableProperty ?? '',
  }
  `,
];

const invalidFunctionArguments = [
  `
  function foo(a: number) {
  }
  foo(undefined);
  `,
  `
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
  function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
    throw new Error();
  }

  useState<number>(null);
  `,
  `
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
  function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
    throw new Error();
  }

  const [st, setSt] = useState<number>(1);
  setSt(null);
  `,
];

const valid = validStatements.map((st) => ({
  code: st,
}));

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
