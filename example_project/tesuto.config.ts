
export default defineTesutoConfig({
    testFiles: {
        include: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
        exclude: ["node_modules", ".git", ".vscode", "dist", "build", "coverage"]
    }
})
