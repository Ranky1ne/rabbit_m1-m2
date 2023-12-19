FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

VOLUME [ "/app/node_modules" ]

CMD ["node", "app.js"] 