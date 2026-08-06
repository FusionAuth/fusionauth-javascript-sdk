FROM node:24.15.0-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY e2e/dpop/api/package.json ./
RUN yarn install --production --non-interactive
COPY e2e/dpop/api/server.mjs ./
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]

