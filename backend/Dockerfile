FROM node:20-alpine

WORKDIR /app

# install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --production

# copy source
COPY . ./

ENV NODE_ENV=production
EXPOSE 5500

CMD ["node", "server.js"]
