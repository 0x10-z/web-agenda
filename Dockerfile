FROM node:18.16.0-alpine

WORKDIR /app

COPY ./ /app/

RUN npm install && \
    npm install -D postcss-cli

EXPOSE 3000

CMD ["npm", "run", "dev"]
