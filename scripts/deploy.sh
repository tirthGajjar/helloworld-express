#!/usr/bin/env bash
set -xeo pipefail

cd /app/helloworld-express/
docker-compose pull
docker-compose up -d
