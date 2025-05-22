FROM node:23-alpine3.20

# Create a non-root user with specific IDs
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 -G nodejs

WORKDIR /backend

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Remove .env file if it exists (since it will be provided by compose)
RUN rm -f .env

# Change ownership to non-root user
RUN chown -R backend:nodejs /backend

# Switch to non-root user
USER backend

EXPOSE 8186

CMD ["npm", "start"]