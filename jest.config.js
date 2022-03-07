module.exports = {
  testEnvironment: "node",
  transform: { "^.+\\.tsx?$": "ts-jest" },
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
