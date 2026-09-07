FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache wget
COPY package.json ./
COPY clean.js ./
EXPOSE 3002
CMD ["node", "clean.js"]
