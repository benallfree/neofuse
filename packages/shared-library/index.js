const os = require('os')

const arch = os.arch()
const platform = os.platform() + (arch === 'arm' ? '-arm' : '')

switch (platform) {
  case 'darwin':
    module.exports = require('neofuse-shared-library-darwin')
    break
  case 'linux':
    module.exports = require('neofuse-shared-library-linux')
    break
  case 'linux-arm':
    module.exports = require('neofuse-shared-library-linux-arm')
    break
  default:
    throw new Error(
      `neofuse-shared-library is not currently supported on: ${platform}`
    )
}
