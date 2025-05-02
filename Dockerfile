FROM node:23-alpine3.20

WORKDIR /backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8186

CMD ["npm", "start"]