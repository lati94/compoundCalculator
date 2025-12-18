FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

ENV PATH /app/node_modules/.bin:$PATH

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]
