# Claude Memory File

## Environment Setup

When starting a new session, run this to ensure the correct Node.js version is used:

```bash
source ~/.nvm/nvm.sh && nvm use
```

This will load NVM and automatically use the Node.js version specified in the project's .nvmrc file (18.20.4).

## Common Commands

Build the project:
```bash
npm run build
```

Run tests with coverage:
```bash
npm test
```

## Release Process

Check if the release will work correctly:
```bash
npm run release:check
```

Create an actual release:
```bash
npm run release
```

The release process:
1. Loads environment variables from .env file
2. Runs linting and tests
3. Updates the version in package.json
4. Generates a changelog with auto-changelog
5. Creates a git tag
6. Creates a GitHub release with the changelog
7. Creates an npm package (.tgz file) but does not publish it to npm

Required environment variables in .env file:
- `GITHUB_TOKEN` - A GitHub personal access token with repo scope

Note: The release.js script explicitly loads the .env file and checks that GITHUB_TOKEN is set before running release-it.

## Metalsmith Plugin Best Practices

### Project Structure
- `/src/` - Source code
- `/lib/` - Built code (ESM and CommonJS versions)
- `/test/` - Test files

### Dual Module Support (ESM and CommonJS)
- Configure package.json for dual module support:
  ```json
  "type": "module",
  "main": "./lib/index.cjs",
  "module": "./lib/index.modern.js",
  "exports": {
    "import": "./lib/index.modern.js",
    "require": "./lib/index.cjs"
  }
  ```
- Use microbundle to build both formats:
  ```json
  "build": "microbundle --entry src/index.js --output lib/index.js --target node -f esm,cjs --strict --generateTypes=false"
  ```

### Code Quality
- Add `debug` module for better debugging
- Use robust error handling
- Track loaded resources to prevent duplicates
- Add thorough documentation with JSDoc
- Add a Set to track loaded resources (like languages) to avoid duplicates
- Only run setup code conditionally when needed
- Use exact matching for conditionals instead of regex when possible

### Testing Strategy
Organize tests in multiple files:
- `test/index.mjs` - Basic functionality tests
- `test/additional.mjs` - Error handling and edge cases
- `test/comprehensive.mjs` - Real-world usage scenarios

Include tests for:
1. **Basic functionality** - Core features
2. **Error handling** - Graceful handling of failures
3. **Edge cases** - Malformed input, missing data, etc.
4. **Multiple inputs** - Processing various inputs in one run
5. **Combined options** - Multiple options working together
6. **Performance** - Handling large inputs efficiently
7. **Context sensitivity** - Processing in correct contexts only
8. **Real-world examples** - Complex, realistic code

Test using direct plugin invocation for speed:
```javascript
const plugin = metalsmithPluginName(options);
plugin(files, metalsmith, done);
```

## Release Configuration Notes

- Keep `"npm": { "publish": false }` in .release-it.json - this project is manually published to npm
- The GitHub asset naming pattern should be: `metalsmith-<plugin-name>-${version}.tgz`
