FROM node:18-alpine
WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node package*.json ./
USER node
RUN npm ci --only=production
COPY --chown=node:node . .
EXPOSE 3006
CMD ["npm", "start"]
