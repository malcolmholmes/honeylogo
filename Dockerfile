# Stage 1: Build TypeScript application with Bun and Vite
FROM oven/bun:1.2.7 AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb* ./
RUN bun install

# Copy the rest of the application
COPY . .

# Build the application using Vite
RUN bun run build

# Stage 2: Serve the application with a lightweight server
FROM oven/bun:1.2.7-alpine AS runner
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist /app
# Copy package.json for script commands
COPY --from=builder /app/package.json /app/package.json

# Expose port for the web server
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the server using the preview command from package.json
CMD ["bun", "run", "preview", "--host", "0.0.0.0"]
