# Use a lightweight Node image
FROM node:20-alpine AS builder
WORKDIR /app

# Install only production dependencies (skip dev)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build step (if you have any build scripts – optional)
# RUN npm run build

# Runtime image
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/index.js"]
