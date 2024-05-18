FROM node:22

RUN apt-get update

RUN apt-get install -y python3
RUN apt-get install -y make
RUN apt-get install -y g++
RUN apt-get install -y bash
RUN apt-get install -y docker.io

RUN apt-get install -y expect
RUN apt-get install -y gcc
RUN apt-get install -y diffutils
RUN apt-get install -y grep
RUN apt-get install -y sed

RUN apt-get install -y libc6-dev
RUN apt-get install -y gcc-multilib
RUN apt-get install -y g++-multilib

RUN apt-get install -y gdb

RUN apt-get clean

WORKDIR /app

COPY ./server .

WORKDIR /app/server

RUN npm install

EXPOSE 8000

RUN mkdir /var/lib/docker
VOLUME /var/lib/docker


CMD ["sh", "-c", "service docker start && npm start"]
