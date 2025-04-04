# Stage 1: Build TypeScript application with Bun and Vite
FROM oven/bun:1.2.7 AS ts-builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb* ./
RUN bun install

# Copy the rest of the application
COPY . .

# Build the application using Vite
RUN bun build src/main.tsx \
                --target=browser \
                --outdir=public \
                --minify

# Stage 2: Build Go application
FROM golang:1.23-alpine AS go-builder
WORKDIR /app
COPY go.* /app/
RUN go mod download
COPY . /app
RUN CGO_ENABLED=0 go build -o victor

# Stage 3: Final image
FROM alpine:3.19
RUN apk add --no-cache ca-certificates

WORKDIR /app
# Copy built artifacts from previous stages
COPY --from=go-builder /app/victor /usr/bin/victor
COPY --from=ts-builder /app/public /app

# Set environment variables and entrypoint
ENV PATH=/usr/bin:$PATH
ENTRYPOINT ["victor"]
