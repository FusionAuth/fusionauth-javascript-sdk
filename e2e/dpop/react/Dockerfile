FROM node:24.15.0-alpine AS sdk-build
WORKDIR /repo
ENV HUSKY=0
COPY package.json yarn.lock tsconfig.json ./
COPY packages ./packages
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
RUN yarn install --frozen-lockfile --ignore-engines --non-interactive
RUN yarn build:sdk-react

FROM node:24.15.0-alpine AS app-build
WORKDIR /app
ARG CLIENT_ID
ENV VITE_CLIENT_ID=$CLIENT_ID
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY e2e/dpop/react/package.json ./
COPY --from=sdk-build /repo/packages/sdk-react/package.json ./vendor/react-sdk/package.json
COPY --from=sdk-build /repo/packages/sdk-react/dist ./vendor/react-sdk/dist
RUN yarn install --non-interactive
COPY e2e/dpop/react/index.html e2e/dpop/react/tsconfig.json e2e/dpop/react/vite.config.ts ./
COPY e2e/dpop/react/src ./src
RUN yarn build

FROM nginx:1.29-alpine
COPY e2e/dpop/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=app-build /app/dist /usr/share/nginx/html
