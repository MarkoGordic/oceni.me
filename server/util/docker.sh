#!/bin/sh

cp /autotest/task/* /src
cp /autotest/conf/* /src

chmod +x ./run.sh
./run.sh