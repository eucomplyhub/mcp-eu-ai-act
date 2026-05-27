FROM node:20-alpine

WORKDIR /app

# Install dependencies (cache layer)
COPY package*.json ./
RUN npm ci --omit=dev && npm install typescript --no-save

# Copy source + config
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript → dist/
RUN npx tsc

# MCP server stdio entrypoint
CMD ["node", "dist/index.js"]
