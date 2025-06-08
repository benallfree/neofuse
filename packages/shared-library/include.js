const os = require('os')

const arch = os.arch()
const platform = os.platform() + (arch === 'arm' ? '-arm' : '')

switch (platform) {
  case 'linux':
    require('neofuse-shared-library-linux/include')
    break
  case 'darwin':
    require('neofuse-shared-library-darwin/include')
    break
  case 'linux-arm':
    require('neofuse-shared-library-linux-arm/include')
    break
  default:
    throw new Error(
      `neofuse-shared-library is not currently supported on: ${platform}`
    )
}
