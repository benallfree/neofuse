import { EventEmitter } from 'events'

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
  timeout?: number | false | { [key: string]: number; default?: number }
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

export interface FuseOperations {
  init?(cb: (err?: Error) => void): void
  error?(cb: (err?: Error) => void): void
  access?(path: string, mode: number, cb: (err?: Error) => void): void
  statfs?(path: string, cb: (err?: Error, statfs?: StatfsObject) => void): void
  getattr?(path: string, cb: (err?: Error, stat?: StatObject) => void): void
  fgetattr?(
    path: string,
    fd: number,
    cb: (err?: Error, stat?: StatObject) => void
  ): void
  flush?(path: string, fd: number, cb: (err?: Error) => void): void
  fsync?(
    path: string,
    datasync: boolean,
    fd: number,
    cb: (err?: Error) => void
  ): void
  fsyncdir?(
    path: string,
    datasync: boolean,
    fd: number,
    cb: (err?: Error) => void
  ): void
  readdir?(
    path: string,
    cb: (err?: Error, names?: string[], stats?: StatObject[]) => void
  ): void
  truncate?(path: string, size: number, cb: (err?: Error) => void): void
  ftruncate?(
    path: string,
    fd: number,
    size: number,
    cb: (err?: Error) => void
  ): void
  utimens?(
    path: string,
    atime: number,
    mtime: number,
    cb: (err?: Error) => void
  ): void
  readlink?(path: string, cb: (err?: Error, linkname?: string) => void): void
  chown?(
    path: string,
    uid: number,
    gid: number,
    cb: (err?: Error) => void
  ): void
  chmod?(path: string, mode: number, cb: (err?: Error) => void): void
  mknod?(
    path: string,
    mode: number,
    dev: number,
    cb: (err?: Error) => void
  ): void
  setxattr?(
    path: string,
    name: string,
    value: Buffer,
    position: number,
    flags: number,
    cb: (err?: Error) => void
  ): void
  getxattr?(
    path: string,
    name: string,
    position: number,
    cb: (err?: Error, value?: Buffer) => void
  ): void
  listxattr?(path: string, cb: (err?: Error, list?: string[]) => void): void
  removexattr?(path: string, name: string, cb: (err?: Error) => void): void
  open?(
    path: string,
    flags: number,
    cb: (err?: Error, fd?: number) => void
  ): void
  opendir?(
    path: string,
    flags: number,
    cb: (err?: Error, fd?: number) => void
  ): void
  read?(
    path: string,
    fd: number,
    buf: Buffer,
    len: number,
    offset: number,
    cb: (err?: Error, bytesRead?: number) => void
  ): void
  write?(
    path: string,
    fd: number,
    buf: Buffer,
    len: number,
    offset: number,
    cb: (err?: Error, bytesWritten?: number) => void
  ): void
  release?(path: string, fd: number, cb: (err?: Error) => void): void
  releasedir?(path: string, fd: number, cb: (err?: Error) => void): void
  create?(
    path: string,
    mode: number,
    cb: (err?: Error, fd?: number) => void
  ): void
  unlink?(path: string, cb: (err?: Error) => void): void
  rename?(src: string, dest: string, cb: (err?: Error) => void): void
  link?(src: string, dest: string, cb: (err?: Error) => void): void
  symlink?(src: string, dest: string, cb: (err?: Error) => void): void
  mkdir?(path: string, mode: number, cb: (err?: Error) => void): void
  rmdir?(path: string, cb: (err?: Error) => void): void
}

declare class Fuse extends EventEmitter {
  constructor(mnt: string, ops: FuseOperations, opts?: FuseOptions)

  readonly mnt: string
  readonly ops: FuseOperations
  readonly opts: FuseOptions

  mount(cb: (err?: Error) => void): void
  unmount(cb: (err?: Error) => void): void
  errno(code: string): number

  static unmount(mnt: string, cb: (err?: Error) => void): void

  // Error constants
  static readonly EPERM: number
  static readonly ENOENT: number
  static readonly ESRCH: number
  static readonly EINTR: number
  static readonly EIO: number
  static readonly ENXIO: number
  static readonly E2BIG: number
  static readonly ENOEXEC: number
  static readonly EBADF: number
  static readonly ECHILD: number
  static readonly EAGAIN: number
  static readonly ENOMEM: number
  static readonly EACCES: number
  static readonly EFAULT: number
  static readonly ENOTBLK: number
  static readonly EBUSY: number
  static readonly EEXIST: number
  static readonly EXDEV: number
  static readonly ENODEV: number
  static readonly ENOTDIR: number
  static readonly EISDIR: number
  static readonly EINVAL: number
  static readonly ENFILE: number
  static readonly EMFILE: number
  static readonly ENOTTY: number
  static readonly ETXTBSY: number
  static readonly EFBIG: number
  static readonly ENOSPC: number
  static readonly ESPIPE: number
  static readonly EROFS: number
  static readonly EMLINK: number
  static readonly EPIPE: number
  static readonly EDOM: number
  static readonly ERANGE: number
  static readonly EDEADLK: number
  static readonly ENAMETOOLONG: number
  static readonly ENOLCK: number
  static readonly ENOSYS: number
  static readonly ENOTEMPTY: number
  static readonly ELOOP: number
  static readonly EWOULDBLOCK: number
  static readonly ENOMSG: number
  static readonly EIDRM: number
  static readonly ECHRNG: number
  static readonly EL2NSYNC: number
  static readonly EL3HLT: number
  static readonly EL3RST: number
  static readonly ELNRNG: number
  static readonly EUNATCH: number
  static readonly ENOCSI: number
  static readonly EL2HLT: number
  static readonly EBADE: number
  static readonly EBADR: number
  static readonly EXFULL: number
  static readonly ENOANO: number
  static readonly EBADRQC: number
  static readonly EBADSLT: number
  static readonly EDEADLOCK: number
  static readonly EBFONT: number
  static readonly ENOSTR: number
  static readonly ENODATA: number
  static readonly ETIME: number
  static readonly ENOSR: number
  static readonly ENONET: number
  static readonly ENOPKG: number
  static readonly EREMOTE: number
  static readonly ENOLINK: number
  static readonly EADV: number
  static readonly ESRMNT: number
  static readonly ECOMM: number
  static readonly EPROTO: number
  static readonly EMULTIHOP: number
  static readonly EDOTDOT: number
  static readonly EBADMSG: number
  static readonly EOVERFLOW: number
  static readonly ENOTUNIQ: number
  static readonly EBADFD: number
  static readonly EREMCHG: number
  static readonly ELIBACC: number
  static readonly ELIBBAD: number
  static readonly ELIBSCN: number
  static readonly ELIBMAX: number
  static readonly ELIBEXEC: number
  static readonly EILSEQ: number
  static readonly ERESTART: number
  static readonly ESTRPIPE: number
  static readonly EUSERS: number
  static readonly ENOTSOCK: number
  static readonly EDESTADDRREQ: number
  static readonly EMSGSIZE: number
  static readonly EPROTOTYPE: number
  static readonly ENOPROTOOPT: number
  static readonly EPROTONOSUPPORT: number
  static readonly ESOCKTNOSUPPORT: number
  static readonly EOPNOTSUPP: number
  static readonly EPFNOSUPPORT: number
  static readonly EAFNOSUPPORT: number
  static readonly EADDRINUSE: number
  static readonly EADDRNOTAVAIL: number
  static readonly ENETDOWN: number
  static readonly ENETUNREACH: number
  static readonly ENETRESET: number
  static readonly ECONNABORTED: number
  static readonly ECONNRESET: number
  static readonly ENOBUFS: number
  static readonly EISCONN: number
  static readonly ENOTCONN: number
  static readonly ESHUTDOWN: number
  static readonly ETOOMANYREFS: number
  static readonly ETIMEDOUT: number
  static readonly ECONNREFUSED: number
  static readonly EHOSTDOWN: number
  static readonly EHOSTUNREACH: number
  static readonly EALREADY: number
  static readonly EINPROGRESS: number
  static readonly ESTALE: number
  static readonly EUCLEAN: number
  static readonly ENOTNAM: number
  static readonly ENAVAIL: number
  static readonly EISNAM: number
  static readonly EREMOTEIO: number
  static readonly EDQUOT: number
  static readonly ENOMEDIUM: number
  static readonly EMEDIUMTYPE: number
}

export default Fuse
