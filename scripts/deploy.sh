#!/usr/bin/env bash
set -xeo pipefail

if [ -z "$DEPLOY_PATH" ] || [ ! -d "$DEPLOY_PATH" ] ; then
  exit 1
fi

cd $DEPLOY_PATH
docker login -u gitlab-ci-token -p $CI_BUILD_TOKEN $CI_REGISTRY
docker-compose pull
docker-compose up -d
