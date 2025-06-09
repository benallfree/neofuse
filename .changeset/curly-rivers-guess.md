---
'neofuse': minor
---

Add in-memory filesystem provider

Added `createInMemoryFilesystem()` function that creates a fully functional in-memory FUSE filesystem. This provider implements all standard filesystem operations (read, write, mkdir, rmdir, etc.) with data stored entirely in RAM. Perfect for testing, development, and demos where you need a working filesystem without persistence.
