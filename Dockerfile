FROM node:10

RUN npm install -g pm2

ENV NODE_ICU_DATA=node_modules/full-icu

RUN mkdir /app
COPY ./ /app

WORKDIR /app

RUN npm install --production --unsafe-perm

ENV PORT=5000
EXPOSE $PORT

CMD pm2-runtime app-api.js
