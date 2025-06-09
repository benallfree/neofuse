# neofuse

Multithreaded FUSE bindings for Node.js.

## Features

* N-API support means we ship prebuilds and work with new Node.js releases.
* Multithreading support means multiple calls to FUSE can run in parallel.
* Close to feature complete in terms of the FUSE API.
* Clean system dependency approach - uses your system's FUSE installation.

## Prerequisites

**neofuse requires FUSE to be installed on your system before installation.**

### macOS
```bash
brew install macfuse
```

### Ubuntu/Debian
```bash
sudo apt install libfuse-dev
```

### RHEL/CentOS/Fedora
```bash
sudo yum install fuse-devel
# or on newer versions:
sudo dnf install fuse-devel
```

### Other Linux distributions
Install the FUSE development package for your distribution (usually called `fuse-dev`, `libfuse-dev`, or `fuse-devel`).

## Installation

After installing FUSE on your system:

```bash
npm install neofuse --save
```

## Example
```js
import Fuse from 'neofuse'
import fs from 'fs'
import path from 'path'

function stat(options) {
  return {
    mtime: new Date(),
    atime: new Date(), 
    ctime: new Date(),
    nlink: 1,
    size: options.size || 0,
    mode: options.mode === 'dir' ? 16877 : 33188,
    uid: process.getuid ? process.getuid() : 0,
    gid: process.getgid ? process.getgid() : 0
  }
}

const ops = {
  readdir: function (path, cb) {
    if (path === '/') return cb(null, ['test'])
    return cb(Fuse.ENOENT)
  },
  getattr: function (path, cb) {
    if (path === '/') return cb(null, stat({ mode: 'dir', size: 4096 }))
    if (path === '/test') return cb(null, stat({ mode: 'file', size: 11 }))
    return cb(Fuse.ENOENT)
  },
  open: function (path, flags, cb) {
    return cb(0, 42)
  },
  release: function (path, fd, cb) {
    return cb(0)
  },
  read: function (path, fd, buf, len, pos, cb) {
    var str = 'hello world'.slice(pos, pos + len)
    if (!str) return cb(0)
    buf.write(str)
    return cb(str.length)
  }
}

const mnt = '/tmp/fuse-test'
const fuse = new Fuse(mnt, ops, { debug: true })

fuse.mount(function (err) {
  if (err) throw err
  console.log('Filesystem mounted at', mnt)
  
  fs.readFile(path.join(mnt, 'test'), function (err, buf) {
    if (err) throw err
    console.log('File contents:', buf.toString()) // Should be 'hello world'
    
    fuse.unmount(function (err) {
      if (err) throw err
      console.log('Filesystem unmounted')
    })
  })
})
```

## In-Memory Filesystem Provider

For testing and development purposes, neofuse includes a built-in in-memory filesystem provider that implements a fully functional filesystem in RAM.

### `createInMemoryFilesystem()`

Creates a complete FUSE operations object that implements a fully functional in-memory filesystem with support for:

- File operations: create, read, write, delete, truncate
- Directory operations: create, list, delete
- Metadata operations: permissions, timestamps, ownership
- All other standard filesystem operations

```js
import Fuse, { createInMemoryFilesystem } from 'neofuse'

const ops = createInMemoryFilesystem()
const fuse = new Fuse('./mnt', ops, { debug: true })

fuse.mount(err => {
  if (err) throw err
  console.log('In-memory filesystem mounted!')
  
  // Now you can use standard filesystem operations:
  // fs.writeFile('./mnt/test.txt', 'Hello World!')
  // fs.mkdir('./mnt/mydir') 
  // etc.
})
```

This provider is perfect for:
- **Testing**: Create isolated filesystem environments for your tests
- **Development**: Prototype filesystem applications without persistence
- **Demos**: Showcase FUSE functionality without complex setup

The in-memory filesystem starts empty (except for the root directory) and all data is lost when the filesystem is unmounted.

## API
In order to create a FUSE mountpoint, you first need to create a `Fuse` object that wraps a set of implemented FUSE syscall handlers:

#### `const fuse = new Fuse(mnt, handlers, opts = {})`
Create a new `Fuse` object.

`mnt` is the string path of your desired mountpoint.

`handlers` is an object mapping syscall names to implementations. The complete list of available syscalls is described below. As an example, if you wanted to implement a filesystem that only supports `getattr`, your handler object would look like:
```js
{
  getattr: function (path, cb) {
    if (path === '/') return process.nextTick(cb, null, stat({ mode: 'dir', size: 4096 }))
    if (path === '/test') return process.nextTick(cb, null, stat({ mode: 'file', size: 11 }))
    return process.nextTick(cb, Fuse.ENOENT)
  }
}
```

`opts` can include:
```js
{
  displayFolder: 'Folder Name', // Add a name/icon to the mount volume on macOS
  debug: false,  // Enable detailed tracing of operations
  force: false,  // Attempt to unmount the mountpoint before remounting
  mkdir: false   // Create the mountpoint before mounting
}
```
Additionally, all [FUSE-specific options](http://man7.org/linux/man-pages/man8/mount.fuse.8.html) will be passed to the underlying FUSE module (though we use camel casing instead of snake casing).

#### `fuse.mount(callback)`

Mount the filesystem.

#### `fuse.unmount(callback)` 

Unmount the filesystem.

#### `Fuse.unmount(mountpoint, callback)`

Static method to unmount a filesystem at the given mountpoint.

### FUSE API
Most of the [FUSE API](http://fuse.sourceforge.net/doxygen/structfuse__operations.html) is supported. In general the callback for each op should be called with `cb(returnCode, [value])` where the return code is a number (`0` for OK and `< 0` for errors). See below for a list of POSIX error codes.

#### `ops.init(cb)`

Called on filesystem init.

#### `ops.access(path, mode, cb)`

Called before the filesystem accessed a file

#### `ops.statfs(path, cb)`

Called when the filesystem is being stat'ed. Accepts a fs stat object after the return code in the callback.

``` js
ops.statfs = function (path, cb) {
  cb(0, {
    bsize: 1000000,
    frsize: 1000000,
    blocks: 1000000,
    bfree: 1000000,
    bavail: 1000000,
    files: 1000000,
    ffree: 1000000,
    favail: 1000000,
    fsid: 1000000,
    flag: 1000000,
    namemax: 1000000
  })
}
```

#### `ops.getattr(path, cb)`

Called when a path is being stat'ed. Accepts a stat object (similar to the one returned in `fs.stat(path, cb)`) after the return code in the callback.

``` js
ops.getattr = function (path, cb) {
  cb(0, {
    mtime: new Date(),
    atime: new Date(),
    ctime: new Date(),
    size: 100,
    mode: 16877,
    uid: process.getuid(),
    gid: process.getgid()
  })
}
```

#### `ops.fgetattr(path, fd, cb)`

Same as above but is called when someone stats a file descriptor

#### `ops.flush(path, fd, cb)`

Called when a file descriptor is being flushed

#### `ops.fsync(path, fd, datasync, cb)`

Called when a file descriptor is being fsync'ed.

#### `ops.fsyncdir(path, fd, datasync, cb)`

Same as above but on a directory

#### `ops.readdir(path, cb)`

Called when a directory is being listed. Accepts an array of file/directory names after the return code in the callback

``` js
ops.readdir = function (path, cb) {
  cb(0, ['file-1.txt', 'dir'])
}
```

#### `ops.truncate(path, size, cb)`

Called when a path is being truncated to a specific size

#### `ops.ftruncate(path, fd, size, cb)`

Same as above but on a file descriptor

#### `ops.readlink(path, cb)`

Called when a symlink is being resolved. Accepts a pathname (that the link should resolve to) after the return code in the callback

``` js
ops.readlink = function (path, cb) {
  cb(null, 'file.txt') // make link point to file.txt
}
```

#### `ops.chown(path, uid, gid, cb)`

Called when ownership of a path is being changed

#### `ops.chmod(path, mode, cb)`

Called when the mode of a path is being changed

#### `ops.mknod(path, mode, dev, cb)`

Called when the a new device file is being made.

#### `ops.setxattr(path, name, value, position, flags, cb)`

Called when extended attributes is being set (see the extended docs for your platform).

Copy the `value` buffer somewhere to store it.

The position argument is mostly a legacy argument only used on macOS but see the getxattr docs
on Mac for more on that (you probably don't need to use that).

#### `ops.getxattr(path, name, position, cb)`

Called when extended attributes is being read.

Return the extended attribute as the second argument to the callback (needs to be a buffer).
If no attribute is stored return `null` as the second argument.

The position argument is mostly a legacy argument only used on macOS but see the getxattr docs
on Mac for more on that (you probably don't need to use that).

#### `ops.listxattr(path, cb)`

Called when extended attributes of a path are being listed.

Return a list of strings of the names of the attributes you have stored as the second argument to the callback.

#### `ops.removexattr(path, name, cb)`

Called when an extended attribute is being removed.

#### `ops.open(path, flags, cb)`

Called when a path is being opened. `flags` in a number containing the permissions being requested. Accepts a file descriptor after the return code in the callback.

``` js
var toFlag = function(flags) {
  flags = flags & 3
  if (flags === 0) return 'r'
  if (flags === 1) return 'w'
  return 'r+'
}

ops.open = function (path, flags, cb) {
  var flag = toFlag(flags) // convert flags to a node style string
  ...
  cb(0, 42) // 42 is a file descriptor
}
```

#### `ops.opendir(path, flags, cb)`

Same as above but for directories

#### `ops.read(path, fd, buffer, length, position, cb)`

Called when contents of a file is being read. You should write the result of the read to the `buffer` and return the number of bytes written as the first argument in the callback.
If no bytes were written (read is complete) return 0 in the callback.

``` js
var data = new Buffer('hello world')

ops.read = function (path, fd, buffer, length, position, cb) {
  if (position >= data.length) return cb(0) // done
  var part = data.slice(position, position + length)
  part.copy(buffer) // write the result of the read to the result buffer
  cb(part.length) // return the number of bytes read
}
```

#### `ops.write(path, fd, buffer, length, position, cb)`

Called when a file is being written to. You can get the data being written in `buffer` and you should return the number of bytes written in the callback as the first argument.

``` js
ops.write = function (path, fd, buffer, length, position, cb) {
  console.log('writing', buffer.slice(0, length))
  cb(length) // we handled all the data
}
```

#### `ops.release(path, fd, cb)`

Called when a file descriptor is being released. Happens when a read/write is done etc.

#### `ops.releasedir(path, fd, cb)`

Same as above but for directories

#### `ops.create(path, mode, cb)`

Called when a new file is being opened.

#### `ops.utimens(path, atime, mtime, cb)`

Called when the atime/mtime of a file is being changed.

#### `ops.unlink(path, cb)`

Called when a file is being unlinked.

#### `ops.rename(src, dest, cb)`

Called when a file is being renamed.

#### `ops.link(src, dest, cb)`

Called when a new link is created.

#### `ops.symlink(src, dest, cb)`

Called when a new symlink is created

#### `ops.mkdir(path, mode, cb)`

Called when a new directory is being created

#### `ops.rmdir(path, cb)`

Called when a directory is being removed

## Error Codes

FUSE operations should return appropriate POSIX error codes. neofuse provides constants for common errors:

```js
Fuse.EPERM     // Operation not permitted
Fuse.ENOENT    // No such file or directory  
Fuse.EIO       // Input/output error
Fuse.EACCES    // Permission denied
Fuse.EEXIST    // File exists
Fuse.ENOTDIR   // Not a directory
Fuse.EISDIR    // Is a directory
Fuse.EINVAL    // Invalid argument
Fuse.ENOSYS    // Function not implemented
// ... and many more
```

## Troubleshooting

### "fuse.h not found" or similar compile errors

Make sure you have installed FUSE development headers:

- **macOS**: `brew install macfuse`
- **Ubuntu/Debian**: `sudo apt install libfuse-dev` 
- **RHEL/CentOS**: `sudo yum install fuse-devel`

### "Module not found" errors

If you get module loading errors, try rebuilding the native module:

```bash
npm rebuild neofuse
```

### Permission errors on macOS

On macOS, you may need to allow the macFUSE kernel extension in System Settings → Privacy & Security.

## License

MIT for these bindings.

See the [macFUSE](https://macfuse.github.io/) license for macOS and the [libfuse](https://github.com/libfuse/libfuse) license for Linux/BSD for the system FUSE library license.
