FROM node:20-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 4000

RUN npm run build

CMD ["node", "dist/main.js"]