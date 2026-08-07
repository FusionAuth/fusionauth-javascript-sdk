FROM node:24.15.0-alpine AS sdk-build
WORKDIR /repo
ENV HUSKY=0
COPY package.json yarn.lock tsconfig.json ./
COPY packages ./packages
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
RUN yarn install --frozen-lockfile --ignore-engines --non-interactive
RUN yarn build:sdk-angular

FROM node:24.15.0-alpine AS app-build
WORKDIR /app
ARG CLIENT_ID
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY e2e/dpop/angular/package.json ./
COPY --from=sdk-build /repo/packages/sdk-angular/dist/fusionauth-angular-sdk ./vendor/angular-sdk
RUN yarn install --non-interactive
COPY e2e/dpop/angular/angular.json e2e/dpop/angular/tsconfig.json ./
COPY e2e/dpop/angular/src ./src
RUN test -n "$CLIENT_ID" && sed -i "s|__CLIENT_ID__|$CLIENT_ID|" src/main.ts
RUN yarn build

FROM nginx:1.29-alpine
COPY e2e/dpop/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=app-build /app/dist/angular/browser /usr/share/nginx/html
