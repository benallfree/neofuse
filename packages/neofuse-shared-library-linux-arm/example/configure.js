const { configure } = require('fuse-shared-library-linux')
console.log('Configuring FUSE...')
configure(() => {
  console.log('Configured FUSE.')
})
