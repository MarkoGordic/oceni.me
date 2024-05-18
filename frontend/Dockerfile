FROM node:22-alpine

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash

WORKDIR /app

COPY ./client .

WORKDIR /app/client

RUN npm install --force

EXPOSE 3000
