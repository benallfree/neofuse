# neofuse

## 0.0.1-rc.3

### Minor Changes

- 52080a7: Add in-memory filesystem provider

  Added `createInMemoryFilesystem()` function that creates a fully functional in-memory FUSE filesystem. This provider implements all standard filesystem operations (read, write, mkdir, rmdir, etc.) with data stored entirely in RAM. Perfect for testing, development, and demos where you need a working filesystem without persistence.

## 0.0.1-rc.2

### Patch Changes

- fe769f2: update package.json to include files for prebuilds and typings

## 0.0.1-rc.1

### Patch Changes

- Add TS typings

## 0.0.1-rc.0

### Patch Changes

- Initial release supporting macfuse
