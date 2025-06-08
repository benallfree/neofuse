# fuse-shared-library-linux
A module containing the .so file and configuration scripts necessary for FUSE on Linux.

```
npm install fuse-shared-library-linux
```

Includes programmatic access to setup the FUSE device and kernel extension as part of a configuration step.

## Usage

``` js
const libfuse = require('fuse-shared-library-linux')

console.log(libfuse.lib) // path to the shared library
console.log(libfuse.include) // path to the include folder

// tells you if libfuse has been configured on this machine
libfuse.isConfigured(function (err, yes) { })

// configure libfuse on this machine (requires root access)
// but only needs to run once
libfuse.configure(function (err) { })

// unconfigures libfuse on this machine
libfuse.unconfigure(function (err) { })
```

You should configure libfuse using the above API before using the
shared library, otherwise the program using fuse will error.

You can remove the folder manually if you want to remove fuse or use the
`unconfigure` api listed above.

The shared library itself is contained within the module and not copied
or installed anywhere. You should move the shared library next to your
program after linking it as that is where your binary will try and load it from.

Using a GYP file this can be done like this:

```
{
  "targets": [{
    "target_name": "fuse_example",
    "include_dirs": [
      # include it like this
      "<!(node -e \"require('fuse-shared-library-linux/include')\")"
    ],
    "libraries": [
      # link it like this
      "<!(node -e \"require('fuse-shared-library-linux/lib')\")"
    ],
    "sources": [
      "your_program.cc"
    ]
  }, {
    # setup a postinstall target that copies the shared library
    # next to the produces node library
    "target_name": "postinstall",
    "type": "none",
    "dependencies": ["fuse_example"],
    "copies": [{
      "destination": "build/Release",
      "files": [ "<!(node -e \"require('fuse-shared-library-linux/lib')\")" ],
    }]
  }]
}
```

## License

MIT
