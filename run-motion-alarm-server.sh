#!/bin/bash

until /usr/bin/node ./server.js; do
    echo "Server 'server.sh' crashed with exit code $?.  Respawning.." >&2
    sleep 1
done
