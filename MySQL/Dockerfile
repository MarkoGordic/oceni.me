FROM mysql:lates

ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=ocenime

EXPOSE 3306

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD mysqladmin ping -h 127.0.0.1 -uroot -p$MYSQL_ROOT_PASSWORD || exit 1

ADD init.sql /docker-entrypoint-initdb.d
