FROM node:18.16.0-alpine

WORKDIR /app

# HTTPS certs
# Genera un certificado autofirmado para HTTPS
RUN apk update && apk add openssl
RUN openssl req -x509 -newkey rsa:4096 -nodes -sha256 -subj '/CN=localhost' -keyout /etc/ssl/private/key.pem -out /etc/ssl/certs/cert.pem -days 365
ENV HTTPS=true

COPY ./ /app/

RUN npm install && \
    npm install -D postcss-cli


EXPOSE 3000

CMD ["npm", "start"]
