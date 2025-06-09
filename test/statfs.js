import { exec } from 'child_process'
import tape from 'tape'
import { unmount } from './helpers/index.js'

import Fuse from '../index.js'
import createMountpoint from './fixtures/mnt.js'

const mnt = createMountpoint()

tape('statfs', function (t) {
  const ops = {
    force: true,
    statfs: function (path, cb) {
      return cb(0, {
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
        namemax: 1000000,
      })
    },
  }
  const fuse = new Fuse(mnt, ops, { debug: true })
  fuse.mount(function (err) {
    t.error(err, 'no error')
    exec(`df ${mnt}`, err => {
      t.error(err, 'no error')
      unmount(fuse, function () {
        t.end()
      })
    })
  })
})
