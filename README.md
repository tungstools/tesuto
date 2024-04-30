# tesuto
A TypeScript/JavaScript testing framework that doesn't require 200+ dependencies to run.
> actually only esbuild now. long live esbuild!

> [!WARNING]
> * This project is still in early development, and is not ready for production use.
> * This project supports only ES Module but not CommonJS, and requires latest Node.js version.

## Features
- Simple and familiar API
- Out-of-box TypeScript support
- A "labeled test block" grammar, makes it easier to pair tests with their targets
- Assertion and ~~mocking~~ (not yet implemented)
- Runs parallelly using Workers, or not if you don't wish
- VSCode integration (working on it)

## License

Public Domain CC-0, or MIT (c) Tung Leen if you perfer. 