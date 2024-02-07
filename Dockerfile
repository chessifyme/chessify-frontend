FROM node:16.3.0-alpine

RUN apk update && apk add python2 python3 make g++ gcc vim
COPY . /app
#RUN cd /app/new-webview && npm install &&  npm run build -- --dist="/app/public/assets/board/"
RUN cd /app && npm install --legacy-peer-deps && sed -i -e 's/setTimeout(() => f(...args), 1);/f(...args);/g' node_modules/chessground/board.js && npm run build && npm install -g serve