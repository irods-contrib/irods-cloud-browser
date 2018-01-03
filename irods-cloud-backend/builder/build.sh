#!/bin/sh

docker build -t diceunc/cbbuilder:latest .

docker run -it \
-v /Users/conwaymc/temp:/opt/cb-build \
diceunc/cbbuilder:latest
