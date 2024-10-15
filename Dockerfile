FROM node:20.15.1-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

CMD ["npm", "run", "start:prod"]