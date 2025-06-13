import { exec } from 'child_process'
import fs from 'fs'
import Nanoresource from 'nanoresource'
import nodeGypBuild from 'node-gyp-build'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// recursively find the project root
let projectRoot = __dirname
while (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
  projectRoot = path.resolve(projectRoot, '..')
}

const binding = nodeGypBuild(projectRoot)

const IS_OSX = os.platform() === 'darwin'
const OSX_FOLDER_ICON =
  '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericFolderIcon.icns'
const HAS_FOLDER_ICON = IS_OSX && fs.existsSync(OSX_FOLDER_ICON)
const DEFAULT_TIMEOUT = 15 * 1000
const TIMEOUT_ERRNO = IS_OSX ? -60 : -110
const ENOTCONN = IS_OSX ? -57 : -107

export interface FuseOperations {
  init?(cb: (err?: number) => void): void
  error?(cb: (err?: number) => void): void
  access?(path: string, mode: number, cb: (err?: number) => void): void
  statfs?(path: string, cb: (err?: number, statfs?: StatfsObject) => void): void
  getattr?(path: string, cb: (err?: number, stat?: StatObject) => void): void
  fgetattr?(
    path: string,
    fd: number,
    cb: (err?: number, stat?: StatObject) => void
  ): void
  flush?(path: string, fd: number, cb: (err?: number) => void): void
  fsync?(
    path: string,
    datasync: boolean,
    fd: number,
    cb: (err?: number) => void
  ): void
  fsyncdir?(
    path: string,
    datasync: boolean,
    fd: number,
    cb: (err?: number) => void
  ): void
  readdir?(
    path: string,
    cb: (err?: number, names?: string[], stats?: StatObject[]) => void
  ): void
  truncate?(path: string, size: number, cb: (err?: number) => void): void
  ftruncate?(
    path: string,
    fd: number,
    size: number,
    cb: (err?: number) => void
  ): void
  utimens?(
    path: string,
    atime: number,
    mtime: number,
    cb: (err?: number) => void
  ): void
  readlink?(path: string, cb: (err?: number, linkname?: string) => void): void
  chown?(
    path: string,
    uid: number,
    gid: number,
    cb: (err?: number) => void
  ): void
  chmod?(path: string, mode: number, cb: (err?: number) => void): void
  mknod?(
    path: string,
    mode: number,
    dev: number,
    cb: (err?: number) => void
  ): void
  setxattr?(
    path: string,
    name: string,
    value: Buffer,
    position: number,
    flags: number,
    cb: (err?: number) => void
  ): void
  getxattr?(
    path: string,
    name: string,
    position: number,
    cb: (err?: number, value?: Buffer) => void
  ): void
  listxattr?(path: string, cb: (err?: number, list?: string[]) => void): void
  removexattr?(path: string, name: string, cb: (err?: number) => void): void
  open?(
    path: string,
    flags: number,
    cb: (err?: number, fd?: number) => void
  ): void
  opendir?(
    path: string,
    flags: number,
    cb: (err?: number, fd?: number) => void
  ): void
  read?(
    path: string,
    fd: number,
    buf: Buffer,
    len: number,
    offset: number,
    cb: (err?: number, bytesRead?: number) => void
  ): void
  write?(
    path: string,
    fd: number,
    buf: Buffer,
    len: number,
    offset: number,
    cb: (err?: number, bytesWritten?: number) => void
  ): void
  release?(path: string, fd: number, cb: (err?: number) => void): void
  releasedir?(path: string, fd: number, cb: (err?: number) => void): void
  create?(
    path: string,
    mode: number,
    cb: (err?: number, fd?: number) => void
  ): void
  unlink?(path: string, cb: (err?: number) => void): void
  rename?(src: string, dest: string, cb: (err?: number) => void): void
  link?(src: string, dest: string, cb: (err?: number) => void): void
  symlink?(src: string, dest: string, cb: (err?: number) => void): void
  mkdir?(path: string, mode: number, cb: (err?: number) => void): void
  rmdir?(path: string, cb: (err?: number) => void): void
}

export interface FuseOptions {
  debug?: boolean
  allowOther?: boolean
  allowRoot?: boolean
  autoUnmount?: boolean
  defaultPermissions?: boolean
  blkdev?: boolean
  blksize?: number
  maxRead?: number
  fd?: number
  userId?: number
  fsname?: string
  subtype?: string
  kernelCache?: boolean
  autoCache?: boolean
  umask?: number
  uid?: number
  gid?: number
  entryTimeout?: number
  attrTimeout?: number
  acAttrTimeout?: number
  noforget?: boolean
  remember?: number
  modules?: string
  displayFolder?: boolean
  name?: string
  force?: boolean
  mkdir?: boolean
  timeout?: number | false | Record<string, number>
}

export interface StatObject {
  mode?: number
  uid?: number
  gid?: number
  size?: number
  dev?: number
  nlink?: number
  ino?: number
  rdev?: number
  blksize?: number
  blocks?: number
  atime?: Date | number
  mtime?: Date | number
  ctime?: Date | number
}

export interface StatfsObject {
  bsize?: number
  frsize?: number
  blocks?: number
  bfree?: number
  bavail?: number
  files?: number
  ffree?: number
  favail?: number
  fsid?: number
  flag?: number
  namemax?: number
}

const OpcodesAndDefaults = new Map([
  [
    'init',
    {
      op: binding.op_init,
    },
  ],
  [
    'error',
    {
      op: binding.op_error,
    },
  ],
  [
    'access',
    {
      op: binding.op_access,
      defaults: [0],
    },
  ],
  [
    'statfs',
    {
      op: binding.op_statfs,
      defaults: [getStatfsArray()],
    },
  ],
  [
    'fgetattr',
    {
      op: binding.op_fgetattr,
      defaults: [getStatArray()],
    },
  ],
  [
    'getattr',
    {
      op: binding.op_getattr,
      defaults: [getStatArray()],
    },
  ],
  [
    'flush',
    {
      op: binding.op_flush,
    },
  ],
  [
    'fsync',
    {
      op: binding.op_fsync,
    },
  ],
  [
    'fsyncdir',
    {
      op: binding.op_fsyncdir,
    },
  ],
  [
    'readdir',
    {
      op: binding.op_readdir,
      defaults: [[], []],
    },
  ],
  [
    'truncate',
    {
      op: binding.op_truncate,
    },
  ],
  [
    'ftruncate',
    {
      op: binding.op_ftruncate,
    },
  ],
  [
    'utimens',
    {
      op: binding.op_utimens,
    },
  ],
  [
    'readlink',
    {
      op: binding.op_readlink,
      defaults: [''],
    },
  ],
  [
    'chown',
    {
      op: binding.op_chown,
    },
  ],
  [
    'chmod',
    {
      op: binding.op_chmod,
    },
  ],
  [
    'mknod',
    {
      op: binding.op_mknod,
    },
  ],
  [
    'setxattr',
    {
      op: binding.op_setxattr,
    },
  ],
  [
    'getxattr',
    {
      op: binding.op_getxattr,
    },
  ],
  [
    'listxattr',
    {
      op: binding.op_listxattr,
    },
  ],
  [
    'removexattr',
    {
      op: binding.op_removexattr,
    },
  ],
  [
    'open',
    {
      op: binding.op_open,
      defaults: [0],
    },
  ],
  [
    'opendir',
    {
      op: binding.op_opendir,
      defaults: [0],
    },
  ],
  [
    'read',
    {
      op: binding.op_read,
      defaults: [0],
    },
  ],
  [
    'write',
    {
      op: binding.op_write,
      defaults: [0],
    },
  ],
  [
    'release',
    {
      op: binding.op_release,
    },
  ],
  [
    'releasedir',
    {
      op: binding.op_releasedir,
    },
  ],
  [
    'create',
    {
      op: binding.op_create,
      defaults: [0],
    },
  ],
  [
    'unlink',
    {
      op: binding.op_unlink,
    },
  ],
  [
    'rename',
    {
      op: binding.op_rename,
    },
  ],
  [
    'link',
    {
      op: binding.op_link,
    },
  ],
  [
    'symlink',
    {
      op: binding.op_symlink,
    },
  ],
  [
    'mkdir',
    {
      op: binding.op_mkdir,
    },
  ],
  [
    'rmdir',
    {
      op: binding.op_rmdir,
    },
  ],
])

class Fuse extends Nanoresource {
  opts: FuseOptions
  mnt: string
  ops: FuseOperations
  timeout: number | Record<string, number>

  private _force: boolean
  private _mkdir: boolean
  private _thread: Buffer | null
  private _handlers: any[]
  private _threads: Set<Buffer>
  private _implemented: Set<number>
  private _sync: boolean
  private _openCallback: ((err?: Error | null) => void) | null = null

  constructor(mnt: string, ops: FuseOperations, opts: FuseOptions = {}) {
    super()

    this.opts = opts
    this.mnt = path.resolve(mnt)
    this.ops = ops
    this.timeout = opts.timeout === false ? 0 : opts.timeout || DEFAULT_TIMEOUT

    this._force = !!opts.force
    this._mkdir = !!opts.mkdir
    this._thread = null
    this._handlers = this._makeHandlerArray()
    this._threads = new Set()

    const implemented = [binding.op_init, binding.op_error, binding.op_getattr]
    if (ops) {
      for (const [name, { op }] of OpcodesAndDefaults) {
        if (ops[name as keyof FuseOperations]) implemented.push(op)
      }
    }
    this._implemented = new Set(implemented)

    // Used to determine if the user-defined callback needs to be nextTick'd.
    this._sync = true
  }

  _getImplementedArray() {
    const implemented = new Uint32Array(35)
    for (const impl of this._implemented) {
      implemented[impl] = 1
    }
    return implemented
  }

  _fuseOptions() {
    const options: string[] = []

    if (
      /\*|(^,)neofuse-bindings(,$)/.test(process.env.DEBUG || '') ||
      this.opts.debug
    )
      options.push('debug')
    if (this.opts.allowOther) options.push('allow_other')
    if (this.opts.allowRoot) options.push('allow_root')
    if (this.opts.autoUnmount) options.push('auto_unmount')
    if (this.opts.defaultPermissions) options.push('default_permissions')
    if (this.opts.blkdev) options.push('blkdev')
    if (this.opts.blksize) options.push('blksize=' + this.opts.blksize)
    if (this.opts.maxRead) options.push('max_read=' + this.opts.maxRead)
    if (this.opts.fd) options.push('fd=' + this.opts.fd)
    if (this.opts.userId) options.push('user_id=' + this.opts.userId)
    if (this.opts.fsname) options.push('fsname=' + this.opts.fsname)
    if (this.opts.subtype) options.push('subtype=' + this.opts.subtype)
    if (this.opts.kernelCache) options.push('kernel_cache')
    if (this.opts.autoCache) options.push('auto_cache')
    if (this.opts.umask) options.push('umask=' + this.opts.umask)
    if (this.opts.uid) options.push('uid=' + this.opts.uid)
    if (this.opts.gid) options.push('gid=' + this.opts.gid)
    if (this.opts.entryTimeout)
      options.push('entry_timeout=' + this.opts.entryTimeout)
    if (this.opts.attrTimeout)
      options.push('attr_timeout=' + this.opts.attrTimeout)
    if (this.opts.acAttrTimeout)
      options.push('ac_attr_timeout=' + this.opts.acAttrTimeout)
    if (this.opts.noforget) options.push('noforget')
    if (this.opts.remember) options.push('remember=' + this.opts.remember)
    if (this.opts.modules) options.push('modules=' + this.opts.modules)

    if (this.opts.displayFolder && IS_OSX) {
      // only works on osx
      options.push('volname=' + path.basename(this.opts.name || this.mnt))
      if (HAS_FOLDER_ICON) options.push('volicon=' + OSX_FOLDER_ICON)
    }

    return options.length ? '-o' + options.join(',') : ''
  }

  _malloc(size) {
    const buf = Buffer.alloc(size)
    this._threads.add(buf)
    return buf
  }

  _makeHandlerArray() {
    const self = this
    const handlers = new Array(OpcodesAndDefaults.size)

    for (const [name, { op, defaults }] of OpcodesAndDefaults) {
      const nativeSignal = binding[`fuse_native_signal_${name}`]
      if (!nativeSignal) continue

      handlers[op] = makeHandler(name, op, defaults, nativeSignal)
    }

    return handlers

    function makeHandler(name, op, defaults, nativeSignal) {
      let to: number | false
      if (typeof self.timeout === 'object' && self.timeout) {
        const defaultTimeout = self.timeout.default || DEFAULT_TIMEOUT
        const timeoutForName = self.timeout[name]
        to = timeoutForName !== undefined ? timeoutForName : defaultTimeout
      } else {
        to = self.timeout as number | false
      }

      return function (nativeHandler, opCode, ...args) {
        const sig = signal.bind(null, nativeHandler)
        const input = [...args]
        const boundSignal = to ? autoTimeout(sig, input) : sig
        const funcName = `_op_${name}`
        if (!self[funcName] || !self._implemented.has(op))
          return boundSignal(-1, ...defaults)
        return self[funcName].apply(self, [boundSignal, ...args])
      }

      function signal(nativeHandler, err, ...args) {
        var arr = [nativeHandler, err, ...args]

        if (defaults) {
          while (arr.length > 2 && arr[arr.length - 1] === undefined) arr.pop()
          if (arr.length === 2) arr = arr.concat(defaults)
        }

        return process.nextTick(nativeSignal, ...arr)
      }

      function autoTimeout(cb, input) {
        let called = false
        const timeout = setTimeout(timeoutWrap, to as number, TIMEOUT_ERRNO)
        return timeoutWrap

        function timeoutWrap(err, ...args) {
          if (called) return
          called = true

          clearTimeout(timeout)

          if (err === TIMEOUT_ERRNO) {
            switch (name) {
              case 'write':
              case 'read':
                return cb(TIMEOUT_ERRNO, 0, input[2].buffer)
              case 'setxattr':
                return cb(TIMEOUT_ERRNO, input[2].buffer)
              case 'getxattr':
                return cb(TIMEOUT_ERRNO, input[2].buffer)
              case 'listxattr':
                return cb(TIMEOUT_ERRNO, input[1].buffer)
            }
          }

          cb(err, ...args)
        }
      }
    }
  }

  // Static methods

  static unmount(mnt, cb) {
    mnt = JSON.stringify(mnt)
    const cmd = IS_OSX
      ? `diskutil unmount force ${mnt}`
      : `fusermount -uz ${mnt}`
    exec(cmd, err => {
      if (err) return cb(err)
      return cb(null)
    })
  }

  // Debugging methods

  // Lifecycle methods

  // @ts-expect-error
  _open(cb) {
    const self = this

    if (this._force) {
      return fs.stat(path.join(this.mnt, 'test'), (err, st) => {
        if (err && (err.errno === ENOTCONN || err.errno === FuseErrno.ENXIO))
          return Fuse.unmount(this.mnt, open)
        return open()
      })
    }
    return open()

    function open() {
      // If there was an unmount error, continue attempting to mount (this is the best we can do)
      self._thread = Buffer.alloc(binding.sizeof_fuse_thread_t)
      self._openCallback = cb

      const opts = self._fuseOptions()
      const implemented = self._getImplementedArray()

      return fs.stat(self.mnt, (err, stat) => {
        if (err && err.errno !== -2) return cb(err)
        if (err) {
          if (!self._mkdir) return cb(new Error('Mountpoint does not exist'))
          return fs.mkdir(self.mnt, { recursive: true }, err => {
            if (err) return cb(err)
            fs.stat(self.mnt, (err, stat) => {
              if (err) return cb(err)
              return onexists(stat)
            })
          })
        }
        if (!stat.isDirectory())
          return cb(new Error('Mountpoint is not a directory'))
        return onexists(stat)
      })

      function onexists(stat) {
        fs.stat(path.join(self.mnt, '..'), (_, parent) => {
          if (parent && parent.dev !== stat.dev)
            return cb(new Error('Mountpoint in use'))
          try {
            // TODO: asyncify
            binding.fuse_native_mount(
              self.mnt,
              opts,
              self._thread,
              self,
              self._malloc,
              self._handlers,
              implemented
            )
          } catch (err) {
            return cb(err)
          }
        })
      }
    }
  }

  // @ts-expect-error
  _close(cb) {
    const self = this

    Fuse.unmount(this.mnt, err => {
      if (err) {
        err.unmountFailure = true
        return cb(err)
      }
      nativeUnmount()
    })

    function nativeUnmount() {
      try {
        binding.fuse_native_unmount(self.mnt, self._thread)
      } catch (err) {
        return cb(err)
      }
      return cb(null)
    }
  }

  // Handlers

  _op_init(signal) {
    if (this._openCallback) {
      process.nextTick(this._openCallback, null)
      this._openCallback = null
    }
    if (!this.ops.init) {
      signal(0)
      return
    }
    this.ops.init(err => {
      return signal(err)
    })
  }

  _op_error(signal) {
    if (!this.ops.error) {
      signal(0)
      return
    }
    this.ops.error(err => {
      return signal(err)
    })
  }

  _op_statfs(signal, path) {
    if (!this.ops.statfs) return signal(-1)
    this.ops.statfs(path, (err, statfs) => {
      if (err) return signal(err)
      const arr = getStatfsArray(statfs)
      return signal(0, arr)
    })
  }

  _op_getattr(signal, path) {
    if (!this.ops.getattr) {
      if (path !== '/') {
        signal(FuseErrno.EPERM)
      } else {
        signal(
          0,
          getStatArray({
            mtime: new Date(0),
            atime: new Date(0),
            ctime: new Date(0),
            mode: 16877,
            size: 4096,
          })
        )
      }
      return
    }

    this.ops.getattr(path, (err, stat) => {
      if (err) return signal(err, getStatArray())
      return signal(0, getStatArray(stat))
    })
  }

  _op_fgetattr(signal, path, fd) {
    if (!this.ops.fgetattr) {
      if (path !== '/') {
        signal(FuseErrno.EPERM)
      } else {
        signal(
          0,
          getStatArray({
            mtime: new Date(0),
            atime: new Date(0),
            ctime: new Date(0),
            mode: 16877,
            size: 4096,
          })
        )
      }
      return
    }
    if (!this.ops.getattr) return signal(-1)
    this.ops.getattr(path, (err, stat) => {
      if (err) return signal(err)
      return signal(0, getStatArray(stat))
    })
  }

  _op_access(signal, path, mode) {
    if (!this.ops.access) return signal(-1)
    this.ops.access(path, mode, err => {
      return signal(err)
    })
  }

  _op_open(signal, path, flags) {
    if (!this.ops.open) return signal(-1)
    this.ops.open(path, flags, (err, fd) => {
      return signal(err, fd)
    })
  }

  _op_opendir(signal, path, flags) {
    if (!this.ops.opendir) return signal(-1)
    this.ops.opendir(path, flags, (err, fd) => {
      return signal(err, fd)
    })
  }

  _op_create(signal, path, mode) {
    if (!this.ops.create) return signal(-1)
    this.ops.create(path, mode, (err, fd) => {
      return signal(err, fd)
    })
  }

  _op_utimens(signal, path, atimeLow, atimeHigh, mtimeLow, mtimeHigh) {
    if (!this.ops.utimens) return signal(-1)
    const atime = getDoubleArg(atimeLow, atimeHigh)
    const mtime = getDoubleArg(mtimeLow, mtimeHigh)
    this.ops.utimens(path, atime, mtime, err => {
      return signal(err)
    })
  }

  _op_release(signal, path, fd) {
    if (!this.ops.release) return signal(-1)
    this.ops.release(path, fd, err => {
      return signal(err)
    })
  }

  _op_releasedir(signal, path, fd) {
    if (!this.ops.releasedir) return signal(-1)
    this.ops.releasedir(path, fd, err => {
      return signal(err)
    })
  }

  _op_read(signal, path, fd, buf, len, offsetLow, offsetHigh) {
    if (!this.ops.read) return signal(-1)
    this.ops.read(
      path,
      fd,
      buf,
      len,
      getDoubleArg(offsetLow, offsetHigh),
      (err, bytesRead) => {
        return signal(err, bytesRead || 0, buf.buffer)
      }
    )
  }

  _op_write(signal, path, fd, buf, len, offsetLow, offsetHigh) {
    if (!this.ops.write) return signal(-1)
    this.ops.write(
      path,
      fd,
      buf,
      len,
      getDoubleArg(offsetLow, offsetHigh),
      (err, bytesWritten) => {
        return signal(err, bytesWritten || 0, buf.buffer)
      }
    )
  }

  _op_readdir(signal, path) {
    if (!this.ops.readdir) return signal(-1)
    this.ops.readdir(path, (err, names, stats) => {
      if (err) return signal(err)
      if (stats) {
        const statsArrays = stats.map(getStatArray)
        return signal(0, names, statsArrays)
      }
      return signal(0, names, [])
    })
  }

  _op_setxattr(signal, path, name, value, position, flags) {
    if (!this.ops.setxattr) return signal(-1)
    this.ops.setxattr(path, name, value, position, flags, err => {
      return signal(err, value.buffer)
    })
  }

  _op_getxattr(signal, path, name, valueBuf, position) {
    if (!this.ops.getxattr) return signal(-1)
    this.ops.getxattr(path, name, position, (err, value) => {
      if (!err) {
        if (!value) return signal(IS_OSX ? -93 : -61, valueBuf.buffer)
        value.copy(valueBuf)
        return signal(value.length, valueBuf.buffer)
      }
      return signal(err, valueBuf.buffer)
    })
  }

  _op_listxattr(signal, path, listBuf) {
    if (!this.ops.listxattr) return signal(-1)
    this.ops.listxattr(path, (err, list) => {
      if (list && !err) {
        if (!listBuf.length) {
          let size = 0
          for (const name of list) size += Buffer.byteLength(name) + 1
          size += 128 // fuse yells if we do not signal room for some mac stuff also
          return signal(size, listBuf.buffer)
        }

        let ptr = 0
        for (const name of list) {
          listBuf.write(name, ptr)
          ptr += Buffer.byteLength(name)
          listBuf[ptr++] = 0
        }

        return signal(ptr, listBuf.buffer)
      }
      return signal(err, listBuf.buffer)
    })
  }

  _op_removexattr(signal, path, name) {
    if (!this.ops.removexattr) return signal(-1)
    this.ops.removexattr(path, name, err => {
      return signal(err)
    })
  }

  _op_flush(signal, path, fd) {
    if (!this.ops.flush) return signal(-1)
    this.ops.flush(path, fd, err => {
      return signal(err)
    })
  }

  _op_fsync(signal, path, datasync, fd) {
    if (!this.ops.fsync) return signal(-1)
    this.ops.fsync(path, datasync, fd, err => {
      return signal(err)
    })
  }

  _op_fsyncdir(signal, path, datasync, fd) {
    if (!this.ops.fsyncdir) return signal(-1)
    this.ops.fsyncdir(path, datasync, fd, err => {
      return signal(err)
    })
  }

  _op_truncate(signal, path, sizeLow, sizeHigh) {
    if (!this.ops.truncate) return signal(-1)
    const size = getDoubleArg(sizeLow, sizeHigh)
    this.ops.truncate(path, size, err => {
      return signal(err)
    })
  }

  _op_ftruncate(signal, path, fd, sizeLow, sizeHigh) {
    if (!this.ops.ftruncate) return signal(-1)
    const size = getDoubleArg(sizeLow, sizeHigh)
    this.ops.ftruncate(path, fd, size, err => {
      return signal(err)
    })
  }

  _op_readlink(signal, path) {
    if (!this.ops.readlink) return signal(-1)
    this.ops.readlink(path, (err, linkname) => {
      return signal(err, linkname)
    })
  }

  _op_chown(signal, path, uid, gid) {
    if (!this.ops.chown) return signal(-1)
    this.ops.chown(path, uid, gid, err => {
      return signal(err)
    })
  }

  _op_chmod(signal, path, mode) {
    if (!this.ops.chmod) return signal(-1)
    this.ops.chmod(path, mode, err => {
      return signal(err)
    })
  }

  _op_mknod(signal, path, mode, dev) {
    if (!this.ops.mknod) return signal(-1)
    this.ops.mknod(path, mode, dev, err => {
      return signal(err)
    })
  }

  _op_unlink(signal, path) {
    if (!this.ops.unlink) return signal(-1)
    this.ops.unlink(path, err => {
      return signal(err)
    })
  }

  _op_rename(signal, src, dest) {
    if (!this.ops.rename) return signal(-1)
    this.ops.rename(src, dest, err => {
      return signal(err)
    })
  }

  _op_link(signal, src, dest) {
    if (!this.ops.link) return signal(-1)
    this.ops.link(src, dest, err => {
      return signal(err)
    })
  }

  _op_symlink(signal, src, dest) {
    if (!this.ops.symlink) return signal(-1)
    this.ops.symlink(src, dest, err => {
      return signal(err)
    })
  }

  _op_mkdir(signal, path, mode) {
    if (!this.ops.mkdir) return signal(-1)
    this.ops.mkdir(path, mode, err => {
      return signal(err)
    })
  }

  _op_rmdir(signal, path) {
    if (!this.ops.rmdir) return signal(-1)
    this.ops.rmdir(path, err => {
      return signal(err)
    })
  }

  // Public API

  mount(cb) {
    return this.open(cb)
  }

  unmount(cb) {
    return this.close(cb)
  }

  errno(code) {
    return (code && Fuse[code.toUpperCase()]) || -1
  }
}

export enum FuseErrno {
  EPERM = -1,
  ENOENT = -2,
  ESRCH = -3,
  EINTR = -4,
  EIO = -5,
  ENXIO = -6,
  E2BIG = -7,
  ENOEXEC = -8,
  EBADF = -9,
  ECHILD = -10,
  EAGAIN = -11,
  ENOMEM = -12,
  EACCES = -13,
  EFAULT = -14,
  ENOTBLK = -15,
  EBUSY = -16,
  EEXIST = -17,
  EXDEV = -18,
  ENODEV = -19,
  ENOTDIR = -20,
  EISDIR = -21,
  EINVAL = -22,
  ENFILE = -23,
  EMFILE = -24,
  ENOTTY = -25,
  ETXTBSY = -26,
  EFBIG = -27,
  ENOSPC = -28,
  ESPIPE = -29,
  EROFS = -30,
  EMLINK = -31,
  EPIPE = -32,
  EDOM = -33,
  ERANGE = -34,
  EDEADLK = -35,
  ENAMETOOLONG = -36,
  ENOLCK = -37,
  ENOSYS = -38,
  ENOTEMPTY = -39,
  ELOOP = -40,
  EWOULDBLOCK = -11,
  ENOMSG = -42,
  EIDRM = -43,
  ECHRNG = -44,
  EL2NSYNC = -45,
  EL3HLT = -46,
  EL3RST = -47,
  ELNRNG = -48,
  EUNATCH = -49,
  ENOCSI = -50,
  EL2HLT = -51,
  EBADE = -52,
  EBADR = -53,
  EXFULL = -54,
  ENOANO = -55,
  EBADRQC = -56,
  EBADSLT = -57,
  EDEADLOCK = -35,
  EBFONT = -59,
  ENOSTR = -60,
  ENODATA = -61,
  ETIME = -62,
  ENOSR = -63,
  ENONET = -64,
  ENOPKG = -65,
  EREMOTE = -66,
  ENOLINK = -67,
  EADV = -68,
  ESRMNT = -69,
  ECOMM = -70,
  EPROTO = -71,
  EMULTIHOP = -72,
  EDOTDOT = -73,
  EBADMSG = -74,
  EOVERFLOW = -75,
  ENOTUNIQ = -76,
  EBADFD = -77,
  EREMCHG = -78,
  ELIBACC = -79,
  ELIBBAD = -80,
  ELIBSCN = -81,
  ELIBMAX = -82,
  ELIBEXEC = -83,
  EILSEQ = -84,
  ERESTART = -85,
  ESTRPIPE = -86,
  EUSERS = -87,
  ENOTSOCK = -88,
  EDESTADDRREQ = -89,
  EMSGSIZE = -90,
  EPROTOTYPE = -91,
  ENOPROTOOPT = -92,
  EPROTONOSUPPORT = -93,
  ESOCKTNOSUPPORT = -94,
  EOPNOTSUPP = -95,
  EPFNOSUPPORT = -96,
  EAFNOSUPPORT = -97,
  EADDRINUSE = -98,
  EADDRNOTAVAIL = -99,
  ENETDOWN = -100,
  ENETUNREACH = -101,
  ENETRESET = -102,
  ECONNABORTED = -103,
  ECONNRESET = -104,
  ENOBUFS = -105,
  EISCONN = -106,
  ENOTCONN = -107,
  ESHUTDOWN = -108,
  ETOOMANYREFS = -109,
  ETIMEDOUT = -110,
  ECONNREFUSED = -111,
  EHOSTDOWN = -112,
  EHOSTUNREACH = -113,
  EALREADY = -114,
  EINPROGRESS = -115,
  ESTALE = -116,
  EUCLEAN = -117,
  ENOTNAM = -118,
  ENAVAIL = -119,
  EISNAM = -120,
  EREMOTEIO = -121,
  EDQUOT = -122,
  ENOMEDIUM = -123,
  EMEDIUMTYPE = -124,
}

export default Fuse
export { createInMemoryFilesystem } from './lib/inmemory.js'

function setDoubleInt(arr, idx, num) {
  const bigNum = BigInt(num)
  arr[idx] = Number(bigNum & 0xffffffffn) // Lower 32 bits
  arr[idx + 1] = Number(bigNum >> 32n) // Upper 32 bits
}

function getDoubleArg(a, b) {
  return Number(BigInt(a) + (BigInt(b) << 32n))
}

function toDateMS(st) {
  if (typeof st === 'number') return st
  if (!st) return Date.now()
  return st.getTime()
}

function getStatArray(stat?: StatObject) {
  const ints = new Uint32Array(18)

  ints[0] = (stat && stat.mode) || 0
  ints[1] = (stat && stat.uid) || 0
  ints[2] = (stat && stat.gid) || 0
  setDoubleInt(ints, 3, (stat && stat.size) || 0)
  ints[5] = (stat && stat.dev) || 0
  ints[6] = (stat && stat.nlink) || 1
  ints[7] = (stat && stat.ino) || 0
  ints[8] = (stat && stat.rdev) || 0
  ints[9] = (stat && stat.blksize) || 0
  setDoubleInt(ints, 10, (stat && stat.blocks) || 0)
  setDoubleInt(ints, 12, toDateMS(stat && stat.atime))
  setDoubleInt(ints, 14, toDateMS(stat && stat.mtime))
  setDoubleInt(ints, 16, toDateMS(stat && stat.ctime))

  return ints
}

function getStatfsArray(statfs?: StatfsObject) {
  const ints = new Uint32Array(11)

  ints[0] = (statfs && statfs.bsize) || 0
  ints[1] = (statfs && statfs.frsize) || 0
  ints[2] = (statfs && statfs.blocks) || 0
  ints[3] = (statfs && statfs.bfree) || 0
  ints[4] = (statfs && statfs.bavail) || 0
  ints[5] = (statfs && statfs.files) || 0
  ints[6] = (statfs && statfs.ffree) || 0
  ints[7] = (statfs && statfs.favail) || 0
  ints[8] = (statfs && statfs.fsid) || 0
  ints[9] = (statfs && statfs.flag) || 0
  ints[10] = (statfs && statfs.namemax) || 0

  return ints
}
