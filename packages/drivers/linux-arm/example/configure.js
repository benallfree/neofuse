const { configure } = require('neofuse-shared-library-linux')
console.log('Configuring FUSE...')
configure(() => {
  console.log('Configured FUSE.')
})
