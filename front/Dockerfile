FROM node:20-alpine AS build

WORKDIR /app

ARG NODE_ENV=production

COPY package*.json ./
RUN npm ci --include=dev

COPY . .

RUN npm run build

FROM nginx:alpine AS production

ENV NODE_ENV=production

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
