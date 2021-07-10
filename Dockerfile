
FROM node:10-alpine
RUN apt-get update
RUN apt-get install curl
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
CMD [ "npm", "start" ]
