#!/bin/bash

# Go to app folder
echo "Entering into project directory"
cd /var/www/ftv-api

# stop all running process
echo "stop all services"
pm2 stop all

echo "Remove old source"
# sudo rm -rf node_modules/ yarn.lock
