#!/bin/sh
set -e

sysconfdir=/etc
udevrulesdir=/etc/udev/rules.d
bindir=/usr/local/bin

FUSE_ROOT="$1"
DESTDIR=""

chown root:root "${DESTDIR}${bindir}/fusermount"
chmod u+s "${DESTDIR}${bindir}/fusermount"

if test ! -e "${DESTDIR}/dev/fuse"; then
    mkdir -p "${DESTDIR}/dev"
    mknod "${DESTDIR}/dev/fuse" -m 0666 c 10 229
fi

install -D -m 644 "${FUSE_ROOT}/udev.rules" \
        "${DESTDIR}${udevrulesdir}/99-fuse.rules"
