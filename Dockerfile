
FROM node:10-alpine
RUN apk --no-cache add curl
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
CMD [ "npm", "start" ]
