
import js from "@eslint/js";

export default [
  {
    ignores: ["dist/**/*", "node_modules/**/*", "android/**/*", "public/sw.js"]
  },
  js.configs.recommended
];
