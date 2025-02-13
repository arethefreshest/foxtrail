FROM node:18-alpine

WORKDIR /app

# Clear npm cache and install dependencies
COPY package*.json ./
RUN npm cache clean --force
RUN npm install --legacy-peer-deps ajv
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "8080"]