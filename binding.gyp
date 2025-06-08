{
  "targets": [
    {
      "target_name": "fuse",
      "sources": [ "neofuse.c" ],
      "include_dirs": [
        "<!(node -e \"require('napi-macros')\")"
      ],
      "conditions": [
        ['OS=="mac"', {
          "libraries": ["-lfuse"],
          "include_dirs": [
            "/usr/local/include/fuse",
            "/usr/local/include/osxfuse/fuse", 
            "/usr/local/include",
            "/opt/homebrew/include/fuse",
            "/opt/homebrew/include/osxfuse/fuse",
            "/opt/homebrew/include"
          ],
          "library_dirs": [
            "/usr/local/lib",
            "/opt/homebrew/lib"
          ]
        }],
        ['OS=="linux"', {
          "libraries": ["-lfuse"],
          "cflags": ["-D_FILE_OFFSET_BITS=64"],
          "include_dirs": [
            "/usr/include/fuse"
          ]
        }]
      ],
      "xcode_settings": {
        "OTHER_CFLAGS": [
          "-g",
          "-O3", 
          "-Wall"
        ]
      },
      "cflags": [
        "-g",
        "-O3",
        "-Wall"
      ]
    }
  ]
}
