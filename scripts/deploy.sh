#!/usr/bin/env bash
set -xeo pipefail

DESTINATION=$1

if [ -z "$DESTINATION" ] || [ ! -d "$DESTINATION" ] ; then
  exit 1
fi

cd $DESTINATION
docker-compose pull
docker-compose up -d
