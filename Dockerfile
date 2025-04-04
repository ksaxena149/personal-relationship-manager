# Use Node.js ARM64 image
FROM --platform=linux/arm64 node:20-slim

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Set up standalone output
RUN mkdir -p .next/standalone/.next/static && \
    cp -r .next/static/* .next/standalone/.next/static/ && \
    mkdir -p .next/standalone/public && \
    cp -r public/* .next/standalone/public/

# Expose the port the app runs on
EXPOSE 3000

# Start the application using standalone server
CMD ["node", ".next/standalone/server.js"] 