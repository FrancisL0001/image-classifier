/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterFramework: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "ts-jest",
      { tsconfig: "./tsconfig.test.json" },
    ],
  },
  moduleNameMapper: {
    // CSS modules → identity proxy so imports don't crash in Jest
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // Static assets
    "\\.(png|jpg|jpeg|gif|svg|ico|webp)$": "<rootDir>/__mocks__/fileMock.js",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
};
