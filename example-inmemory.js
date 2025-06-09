import Fuse, { createInMemoryFilesystem } from './index.js'

const ops = createInMemoryFilesystem()

const fuse = new Fuse('./mnt', ops, { debug: true, displayFolder: true })
fuse.mount(err => {
  if (err) throw err
  console.log('filesystem mounted on ' + fuse.mnt)
})

process.once('SIGINT', function () {
  fuse.unmount(err => {
    if (err) {
      console.log('filesystem at ' + fuse.mnt + ' not unmounted', err)
    } else {
      console.log('filesystem at ' + fuse.mnt + ' unmounted')
    }
  })
})
