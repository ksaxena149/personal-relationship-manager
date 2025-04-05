#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! npx prisma db push --skip-generate; do
  echo "Database not ready yet, retrying in 5 seconds..."
  sleep 5
done

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
node .next/standalone/server.js 