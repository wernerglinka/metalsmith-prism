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

## Release Configuration Notes

- Keep `"npm": { "publish": false }` in .release-it.json - this project is manually published to npm
- The GitHub asset naming pattern should be: `metalsmith-mdn-${version}.tgz`