FROM node:10-alpine

RUN npm install -g nodemon

WORKDIR /usr/app

COPY package.json .
RUN npm install --quiet

COPY . .
EXPOSE 3001

CMD ["nodemon", "."]
