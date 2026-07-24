FROM node:22-alpine
RUN npm install -g npm@latest
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3001
EXPOSE 2525
CMD ["node", "src/index.js"]