import antfu from "@antfu/eslint-config";

export default antfu(
  {
    stylistic: {
      quotes: "double",
      semi: true,
    },
    ignores: [
      "dist",
      "node_modules",
      "public/**",
      "**/*.md",
    ],
  },
  {
    files: ["**/*.json", "**/*.jsonc"],
    rules: {
      "jsonc/sort-keys": "off",
    },
  },
  {
    files: ["src/**/*.ts", "mysql/**/*.ts"],
    rules: {
      // "eqeqeq": "off",
      // "jsdoc/require-returns-description": "off",
      "no-console": "off",
      "node/prefer-global/buffer": "off",
      "node/prefer-global/process": "off",
      "prefer-arrow-callback": "off",
      "prefer-const": "off",
      "ts/no-namespace": "off",
      "ts/no-unsafe-assignment": "off",
      "ts/no-unsafe-call": "off",
      "ts/no-unsafe-function-type": "off",
      "ts/no-unsafe-member-access": "off",
      "ts/promise-function-async": "off",
      "ts/strict-boolean-expressions": "off",
      "unused-imports/no-unused-vars": ["error", {
        args: "after-used",
        argsIgnorePattern: "^(_|next)$",
        vars: "all",
        // varsIgnorePattern: "^(_|origin|publicIp|privateIp)$",
      }],
    },
  },
);
