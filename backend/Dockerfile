FROM okaeri/debian-dind:20.10.12-bullseye

RUN apt-get update

RUN apt-get install -y python3
RUN apt-get install -y make
RUN apt-get install -y g++
RUN apt-get install -y bash

RUN apt-get install -y expect
RUN apt-get install -y gcc
RUN apt-get install -y diffutils
RUN apt-get install -y grep
RUN apt-get install -y sed

RUN apt-get install -y libc6-dev
RUN apt-get install -y gcc-multilib
RUN apt-get install -y g++-multilib

RUN apt-get install -y gdb
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs

RUN apt-get clean

WORKDIR /app

COPY ./server .
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app/server

RUN npm install

EXPOSE 8000

CMD ["npm", "start"]
