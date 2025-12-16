# Use the official httpd image
FROM httpd:2.4-alpine

# Copy httpd config (file is in the build context `apache/`)
COPY httpd.conf /usr/local/apache2/conf/httpd.conf

# Note: the public static files are mounted at runtime via docker-compose
# (volume: ./backend/src/public:/usr/local/apache2/htdocs), so we avoid
# copying backend files during build which would require a repo-root
# build context. This keeps the Apache image self-contained and faster to build.

# Copy entrypoint for runtime variable substitution
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["httpd-foreground"]
