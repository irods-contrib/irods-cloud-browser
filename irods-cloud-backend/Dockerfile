FROM tomcat:jre8-alpine
LABEL organization="RENCI"
LABEL maintainer="michael_conway@unc.edu"
LABEL description="iRODS Cloud Browser."
ADD irods-cloud-backend.war /usr/local/tomcat/webapps/
ADD runit.sh /
CMD ["/runit.sh"]
#CMD ["sh"]
# build: docker build -t diceunc/cloudbrowser:4.1.10.0-RC1 .

# run:  docker run -i -t --rm -p 8080:8080 -v /etc/irods-ext:/etc/irods-ext  --add-host irods419.irodslocal:172.16.250.100 diceunc/cloudbrowser:4.1.10.0-RC1

# run:  docker run -i -t --rm -p 8080:8080 -v /c/Users/Mike/etc/irods-ext:/etc/irods-ext -v /c/Users/Mike/Documents/certs:/tmp/cert  --add-host irods421.irodslocal:172.16.250.101 diceunc/cloudbrowser:latest
