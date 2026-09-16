FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache wget
COPY package.json ./
RUN npm install --omit=dev
COPY worker.js ./
EXPOSE 3001
CMD ["node", "worker.js"]
