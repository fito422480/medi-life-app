module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "react",
    "react-hooks",
    "jsx-a11y",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
    browser: true,
    es2021: true,
  },
  ignorePatterns: [".eslintrc.js", "next.config.js", "tailwind.config.js"],
  rules: {
    // TypeScript specific rules
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",

    // React specific rules
    "react/prop-types": "off", // Disable prop-types as we use TypeScript
    "react/react-in-jsx-scope": "off", // Not needed in Next.js/React 17+
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // General ESLint rules
    "no-console": "warn",
    "no-unused-vars": "off", // Turn off the base rule as it can report incorrect errors
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
        args: "after-used",
      },
    ],

    // Reduce severity of explicit any for now to get builds working
    "@typescript-eslint/no-explicit-any": "warn",

    // Accessibility rules (can be gradually implemented)
    "jsx-a11y/anchor-is-valid": [
      "warn",
      {
        components: ["Link"],
        specialLink: ["hrefLeft", "hrefRight"],
        aspects: ["invalidHref", "preferButton"],
      },
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
