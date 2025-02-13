FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "8080"]