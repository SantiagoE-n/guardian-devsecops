FROM node:20-alpine

WORKDIR /app

# Instalamos wget para el healthcheck
RUN apk add --no-cache wget

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./

EXPOSE 3000
CMD ["node", "server.js"]
