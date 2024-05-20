#!/bin/bash
set -e

echo "==> Making sure there is no old pid files..."
rm -f /var/run/docker.pid /run/docker.pid /run/docker/containerd/containerd.pid

echo "==> Launching the Docker daemon..."
CMD=$*
if [ "$CMD" == '' ]; then
  dind dockerd $DOCKER_EXTRA_OPTS
  check_docker
else
  dind dockerd $DOCKER_EXTRA_OPTS &
  while(! docker info > /dev/null 2>&1); do
      echo "==> Waiting for the Docker daemon to come online..."
      sleep 1
  done
  echo "==> Docker Daemon is up and running!"

  echo "==> Building gcc-build Docker image..."
  docker build -t gcc-build /app/util
  echo "==> Running CMD $CMD!"
  exec $CMD
fi
