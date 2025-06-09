import fs from 'fs'
import os from 'os'
import path from 'path'

function create(opts = {}) {
  var mnt = path.join(
    os.tmpdir(),
    'neofuse-bindings-' + process.pid + '-' + Date.now()
  )

  if (!opts.doNotCreate) {
    try {
      fs.mkdirSync(mnt)
    } catch (err) {
      // do nothing
    }
  }

  return mnt
}

export default create
