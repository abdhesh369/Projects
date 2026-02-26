FROM node:18-alpine
WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node package*.json ./
USER node
RUN npm_config_loglevel=warn npm ci --only=production
COPY --chown=node:node . .
EXPOSE 3008
CMD ["npm", "start"]
