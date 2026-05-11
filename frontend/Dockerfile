FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Vite runs on
EXPOSE 3000

# Start the dev server
CMD ["npm", "run", "dev", "--", "--host"]
