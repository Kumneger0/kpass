import type { Config } from "tailwindcss"

const config: Config = {
	mode: "jit",
	darkMode: "class",
	content: [
    "./**/*.tsx", 
     "!./src/contentComponent/*"
  ],
	plugins: []
}

module.exports = config
