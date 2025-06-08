#! /bin/sh
set -e

PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
MOUNTPOINT=/sys/fs/fuse/connections

# Gracefully exit if the package has been removed.
which fusermount &>/dev/null || exit 5

if ! grep -qw fuse /proc/filesystems; then
  echo -n "Loading fuse module"
  if ! modprobe fuse >/dev/null 2>&1; then
    echo " failed!"
    exit 1
  else
    echo "."
  fi
else
  echo "Fuse filesystem already available."
fi

if grep -qw fusectl /proc/filesystems && \
   ! grep -qw $MOUNTPOINT /proc/mounts; then
  echo -n "Mounting fuse control filesystem"
  if ! mount -t fusectl fusectl $MOUNTPOINT >/dev/null 2>&1; then
    echo " failed!"
    exit 1
  else
    echo "."
  fi
else
  echo "Fuse control filesystem already available."
fi

exit 0
