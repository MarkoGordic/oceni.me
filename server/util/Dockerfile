FROM debian:buster-slim

RUN apt-get update
RUN apt-get install -y gcc-multilib 
RUN apt-get install -y g++-multilib
RUN apt-get install -y make
RUN apt-get install -y gdb
RUN rm -rf /var/lib/apt/lists/*

RUN mkdir /src
COPY docker.sh /src/
WORKDIR /src

RUN chmod +x docker.sh
CMD ["./docker.sh"]