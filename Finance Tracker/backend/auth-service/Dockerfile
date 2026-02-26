FROM node:18-alpine

WORKDIR /app

# Set non-root user 'node' as the owner of /app
RUN chown -R node:node /app

COPY --chown=node:node package*.json ./

# Switch to non-root user
USER node

# Use npm ci for a cleaner, faster, and more secure install
RUN npm ci --only=production

COPY --chown=node:node . .

EXPOSE 3001

CMD ["npm", "start"]
