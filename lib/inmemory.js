import Fuse from '../index.js'

export function createInMemoryFilesystem() {
  // In-memory filesystem state
  const filesystem = {
    '/': {
      type: 'directory',
      mode: 16877,
      children: new Map(),
      mtime: new Date(),
      atime: new Date(),
      ctime: new Date(),
      nlink: 1,
      size: 0,
      uid: process.getuid ? process.getuid() : 0,
      gid: process.getgid ? process.getgid() : 0,
    },
  }

  // Helper functions
  function getNode(path) {
    if (path === '/') return filesystem['/']
    const parts = path.split('/').filter(Boolean)
    let current = filesystem['/']
    for (const part of parts) {
      if (!current.children.has(part)) return null
      current = current.children.get(part)
    }
    return current
  }

  function getParentNode(path) {
    if (path === '/') return null
    const parts = path.split('/').filter(Boolean)
    const parentPath = '/' + parts.slice(0, -1).join('/')
    return getNode(parentPath || '/')
  }

  return {
    readdir: function (path, cb) {
      const node = getNode(path)
      if (!node || node.type !== 'directory') {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      const entries = Array.from(node.children.keys())
      const stats = entries.map(name => {
        const child = node.children.get(name)
        return {
          mtime: child.mtime,
          atime: child.atime,
          ctime: child.ctime,
          nlink: child.nlink,
          size: child.size,
          mode: child.mode,
          uid: child.uid,
          gid: child.gid,
        }
      })
      return process.nextTick(cb, 0, entries, stats)
    },

    getattr: function (path, cb) {
      const node = getNode(path)
      if (!node) {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      return process.nextTick(cb, 0, {
        mtime: node.mtime,
        atime: node.atime,
        ctime: node.ctime,
        nlink: node.nlink,
        size: node.size,
        mode: node.mode,
        uid: node.uid,
        gid: node.gid,
      })
    },

    mkdir: function (path, mode, cb) {
      const parent = getParentNode(path)
      if (!parent || parent.type !== 'directory') {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      const name = path.split('/').pop()
      if (parent.children.has(name)) {
        return process.nextTick(cb, Fuse.EEXIST)
      }
      parent.children.set(name, {
        type: 'directory',
        mode: mode || 16877,
        children: new Map(),
        mtime: new Date(),
        atime: new Date(),
        ctime: new Date(),
        nlink: 1,
        size: 0,
        uid: process.getuid ? process.getuid() : 0,
        gid: process.getgid ? process.getgid() : 0,
      })
      return process.nextTick(cb, 0)
    },

    create: function (path, mode, cb) {
      const parent = getParentNode(path)
      if (!parent || parent.type !== 'directory') {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      const name = path.split('/').pop()
      if (parent.children.has(name)) {
        return process.nextTick(cb, Fuse.EEXIST)
      }
      const node = {
        type: 'file',
        mode: mode || 33188,
        content: Buffer.alloc(0),
        mtime: new Date(),
        atime: new Date(),
        ctime: new Date(),
        nlink: 1,
        size: 0,
        uid: process.getuid ? process.getuid() : 0,
        gid: process.getgid ? process.getgid() : 0,
      }
      parent.children.set(name, node)
      return process.nextTick(cb, 0, 42) // 42 is an fd
    },

    open: function (path, flags, cb) {
      const node = getNode(path)
      if (!node || node.type !== 'file') {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      return process.nextTick(cb, 0, 42) // 42 is an fd
    },

    read: function (path, fd, buf, len, pos, cb) {
      const node = getNode(path)
      if (!node || node.type !== 'file') {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      const data = node.content.slice(pos, pos + len)
      data.copy(buf)
      return process.nextTick(cb, data.length)
    },

    write: function (path, fd, buf, len, pos, cb) {
      const node = getNode(path)
      if (!node || node.type !== 'file') {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      const newContent = Buffer.alloc(Math.max(pos + len, node.content.length))
      node.content.copy(newContent)
      buf.copy(newContent, pos, 0, len)
      node.content = newContent
      node.size = newContent.length
      node.mtime = new Date()
      return process.nextTick(cb, len)
    },

    unlink: function (path, cb) {
      const parent = getParentNode(path)
      if (!parent || parent.type !== 'directory') {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      const name = path.split('/').pop()
      if (!parent.children.has(name)) {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      parent.children.delete(name)
      return process.nextTick(cb, 0)
    },

    rmdir: function (path, cb) {
      const parent = getParentNode(path)
      if (!parent || parent.type !== 'directory') {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      const name = path.split('/').pop()
      const node = parent.children.get(name)
      if (!node || node.type !== 'directory') {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      if (node.children.size > 0) {
        return process.nextTick(cb, Fuse.ENOTEMPTY)
      }
      parent.children.delete(name)
      return process.nextTick(cb, 0)
    },

    rename: function (oldPath, newPath, cb) {
      const oldParent = getParentNode(oldPath)
      const newParent = getParentNode(newPath)
      if (
        !oldParent ||
        !newParent ||
        oldParent.type !== 'directory' ||
        newParent.type !== 'directory'
      ) {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      const oldName = oldPath.split('/').pop()
      const newName = newPath.split('/').pop()
      if (!oldParent.children.has(oldName)) {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      const node = oldParent.children.get(oldName)
      oldParent.children.delete(oldName)
      newParent.children.set(newName, node)
      return process.nextTick(cb, 0)
    },

    chmod: function (path, mode, cb) {
      const node = getNode(path)
      if (!node) {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      node.mode = mode
      return process.nextTick(cb, 0)
    },

    truncate: function (path, size, cb) {
      const node = getNode(path)
      if (!node || node.type !== 'file') {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      if (size < node.content.length) {
        node.content = node.content.slice(0, size)
      } else if (size > node.content.length) {
        const newContent = Buffer.alloc(size)
        node.content.copy(newContent)
        node.content = newContent
      }
      node.size = size
      node.mtime = new Date()
      return process.nextTick(cb, 0)
    },

    flush: function (path, fd, cb) {
      return process.nextTick(cb, 0)
    },

    release: function (path, fd, cb) {
      return process.nextTick(cb, 0)
    },

    fsync: function (path, fd, datasync, cb) {
      return process.nextTick(cb, 0)
    },

    utimens: function (path, atime, mtime, cb) {
      const node = getNode(path)
      if (!node) {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      node.atime = new Date(atime)
      node.mtime = new Date(mtime)
      return process.nextTick(cb, 0)
    },

    chown: function (path, uid, gid, cb) {
      const node = getNode(path)
      if (!node) {
        return process.nextTick(cb, Fuse.ENOENT)
      }
      node.uid = uid
      node.gid = gid
      return process.nextTick(cb, 0)
    },
  }
}
