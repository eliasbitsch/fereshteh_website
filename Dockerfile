FROM oven/bun:1-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json bun.lock* ./
# Use --no-cache to reduce temp disk usage during install
RUN bun install --frozen-lockfile --no-cache

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# Production image - use slim Alpine for smallest size
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Alpine uses different commands for adding users/groups
RUN addgroup -g 1001 -S nodejs
RUN adduser -S -u 1001 -G nodejs nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create writable directories for CMS content
RUN mkdir -p /app/src/content/data && chown -R nextjs:nodejs /app/src
RUN chown -R nextjs:nodejs /app/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
