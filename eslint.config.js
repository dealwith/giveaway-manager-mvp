import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname
});

const eslintConfig = [
	...compat.extends(
		"next/core-web-vitals",
		"next/typescript",
		"plugin:prettier/recommended"
	),
	{
		plugins: {
			"unused-imports": unusedImports
		},
		rules: {
			"sort-imports": [
				"error",
				{
					ignoreCase: false,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false,
					memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
					allowSeparatedGroups: true
				}
			],
			"import/order": [
				"error",
				{
					groups: [
						"builtin",
						"external",
						"internal",
						"parent",
						"sibling",
						"index"
					],
					"newlines-between": "always",
					alphabetize: {
						order: "asc",
						caseInsensitive: true
					}
				}
			],
			"no-unused-vars": "off",
			"unused-imports/no-unused-imports": "error",
			"unused-imports/no-unused-vars": [
				"warn",
				{
					vars: "all",
					varsIgnorePattern: "^_",
					args: "after-used",
					argsIgnorePattern: "^_"
				}
			],
			"no-empty": "error",
			quotes: ["error", "double"],
			semi: "error",
			"no-trailing-spaces": "error",
			"padding-line-between-statements": [
				"error",
				{ blankLine: "always", prev: "*", next: "return" },
				{ blankLine: "always", prev: "if", next: "*" },
				{
					blankLine: "always",
					prev: ["const", "let", "var"],
					next: ["function", "if"]
				}
			],
			"array-bracket-spacing": ["error", "never"]
		}
	}
];

export default eslintConfig;
