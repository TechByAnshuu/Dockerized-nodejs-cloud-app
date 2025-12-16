#!/bin/sh
set -e

# Default BACKEND_URL for local development
: ${BACKEND_URL:=http://backend:3001}

# Replace placeholder in httpd.conf with actual BACKEND_URL
if [ -f "/usr/local/apache2/conf/httpd.conf" ]; then
  echo "Replacing __BACKEND_URL__ with $BACKEND_URL in httpd.conf"
  sed -i "s|__BACKEND_URL__|$BACKEND_URL|g" /usr/local/apache2/conf/httpd.conf
fi

# Exec the original command
exec "$@"
