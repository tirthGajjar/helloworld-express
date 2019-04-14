#!/usr/bin/env bash
set -xeo pipefail

TARGET=$1

if [ -z "$TARGET" ] || [ ! -d "$TARGET" ] ; then
  exit 1
fi

cd $TARGET
docker-compose pull
docker-compose up -d
