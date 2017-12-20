FROM ubuntu:xenial

ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64

RUN apt-get update

RUN apt-get install -y curl unzip bzip2 zip git tig openjdk-8-jdk build-essential
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN git clone https://github.com/dice-unc/irods-cloud-browser
RUN curl -s get.sdkman.io | bash
RUN /bin/bash -c "source /root/.sdkman/bin/sdkman-init.sh && \
    sdk install grails 2.5.0 && \
    sdk install groovy 2.4.3 && \
    cd irods-cloud-browser/irods-cloud-frontend && \
    npm install gulp && \
    npm install -g gulp-cli && \
    npm install && \
    gulp backend-build && \
    cd ../irods-cloud-backend && \
    sh"
