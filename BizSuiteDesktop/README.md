# BizSuite Desktop

Electron wrapper for the BizSuite offline-first business management software.

## Development

```bash
# Install dependencies
npm install

# Run in development (with DevTools)
npm run start:debug

# Run in production mode
npm start
```

## Building Installers

Before building, ensure you have the latest web build copied to the `dist` folder.

### Quick Build (from project root)

```bash
# From the main project root, run:
npm run desktop:dist
```

This will:
1. Build the web app
2. Copy dist to BizSuiteDesktop
3. Build the Windows installer

### Manual Build

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Folder Structure

```
BizSuiteDesktop/
├── main.js          # Electron main process
├── package.json     # Electron dependencies
├── dist/            # Web build (copied from root dist)
│   ├── index.html
│   ├── assets/
│   └── ...
└── release/         # Built installers
```

## Debug Mode

Pass `--debug` flag to open DevTools:

```bash
npm run start:debug
# or
electron . --debug
```

## Troubleshooting

### Blank White Screen

1. Check that `dist/index.html` exists
2. Run with `--debug` flag to see console errors
3. Verify the web build uses `base: "./"` in vite.config.ts
4. Ensure HashRouter is used (for file:// protocol)

### Assets Not Loading

Ensure vite.config.ts has `base: "./"` for relative paths.
