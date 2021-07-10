
FROM node:10-slim
RUN apk update
RUN apk add curl
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
CMD [ "npm", "start" ]
