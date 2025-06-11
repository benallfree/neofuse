# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

neofuse is a Node.js library providing multithreaded FUSE bindings for creating custom filesystems. It combines:

- **TypeScript source** (`src/`) compiled to ES modules in `dist/`
- **Native C++ bindings** (`neofuse.c`) compiled to prebuilt binaries in `prebuilds/`
- **In-memory filesystem provider** (`src/lib/inmemory.ts`) for testing and development

## Development Commands

**Build the project:**
```bash
bun run build
```

**Run tests:**
```bash
bun run test
```

**Clean build artifacts:**
```bash
bun run clean
```

**Build TypeScript only:**
```bash
bun run build:ts
```

**Build native binaries for specific platforms:**
```bash
bun run build:darwin-x64
bun run build:darwin-arm64
bun run build:linux-x64
bun run build:linux-arm64
```

## Architecture

### Core Components

- **Main FUSE class** (`src/index.ts`): Wraps native FUSE bindings with TypeScript interfaces
- **Native bindings** (`neofuse.c`): C code implementing FUSE operations using N-API
- **In-memory provider** (`src/lib/inmemory.ts`): Complete filesystem implementation for testing

### Key Design Patterns

- **Operation handlers**: FUSE operations are mapped to JavaScript callbacks via `OpcodesAndDefaults` Map
- **Error handling**: Uses POSIX error codes exported as `FuseErrno` enum
- **Memory management**: Native buffers are tracked in `_threads` Set and freed automatically
- **Multithreading**: Native operations run on background threads, callbacks execute on main thread

### Testing Structure

- Tests use `tape` testing framework
- Test fixtures in `test/fixtures/` provide reusable filesystem implementations
- `simple-fs.js` fixture implements basic read-only filesystem for testing
- Tests mount real FUSE filesystems and verify behavior with Node.js `fs` module

## Platform Requirements

This library requires FUSE to be installed on the system:
- **macOS**: `brew install macfuse`
- **Ubuntu/Debian**: `sudo apt install libfuse-dev`
- **RHEL/CentOS/Fedora**: `sudo yum install fuse-devel`

## Important Notes

- The project exports ES modules only (`"type": "module"`)
- TypeScript builds to `dist/` directory with both `.js` and `.d.ts` files
- Native prebuilds are copied to `dist/prebuilds/` during TypeScript compilation
- FUSE operations should return appropriate POSIX error codes or 0 for success
- All file operations use absolute paths starting from filesystem root