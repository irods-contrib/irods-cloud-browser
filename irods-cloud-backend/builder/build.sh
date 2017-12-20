#!/bin/sh

docker build -t diceunc/cbbbuilder:latest .

docker run -it \
-v /Users/conwaymc/temp:/opt/cb-build \
diceunc/cbbuilder:latest
