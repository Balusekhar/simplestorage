FROM node:22-alpine

WORKDIR /simplestorage

COPY package* .
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]