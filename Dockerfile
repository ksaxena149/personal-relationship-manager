FROM --platform=linux/arm64 node:20-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

RUN mkdir -p .next/standalone/.next/static && \
    cp -r .next/static/* .next/standalone/.next/static/ && \
    mkdir -p .next/standalone/public && \
    cp -r public/* .next/standalone/public/

RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"] 
