# package gets the package.json and package-lock.json with the version set to 0.0.0
# this is so that future steps can optimize the docker layers and reuse layers from the docker cache
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine as package
WORKDIR /ansible-ui
COPY package*.json ./
RUN npm version 0.0.0 --no-git-tag-version

# dependencies installs dependencies
# docker should be able to cache this step unless package-lock.json changes
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine as dependencies
WORKDIR /ansible-ui
COPY --from=package /ansible-ui/package*.json ./
RUN npm ci --omit=dev --omit=optional --ignore-scripts

# build the product
FROM --platform=${TARGETPLATFORM:-linux/amd64} dependencies as builder
COPY . .
ARG VERSION
RUN VERSION=$VERSION DISCLAIMER=true npm run build

# final output image uses alpine with minimal dependencies installed 
FROM --platform=${TARGETPLATFORM:-linux/amd64} alpine
ARG VERSION
COPY --from=builder /usr/local/bin/node /usr/local/bin/node
RUN apk upgrade --no-cache -U && apk add --no-cache libstdc++
RUN addgroup -g 1000 -S node && adduser -u 1000 -S node -G node
USER node
WORKDIR /home/node
ENV NODE_ENV production
ENV VERSION $VERSION
COPY --from=builder --chown=node /ansible-ui/build ./
CMD ["node", "proxy.mjs"]

# Build standalone eda-ui
FROM docker.io/node:16-alpine AS eda-standalone-builder

WORKDIR /app/ansible-ui

COPY package-*.json /app/ansible-ui/
RUN npm ci --omit=dev --omit=optional --ignore-scripts

COPY . /app/ansible-ui
RUN cd /app/ansible-ui && npm run build:eda

# Bundle standalone eda-ui static files in nginx config
FROM docker.io/nginx AS eda-standalone
ARG NGINX_CONF=standalone/eda/nginx/default.conf
ARG NGINX_CONFIGURATION_PATH=/etc/nginx/conf.d/

ENV DIST_UI="/opt/app-root/ui/eda"

ADD ${NGINX_CONF} ${NGINX_CONFIGURATION_PATH}

# Copy dist dir to final location
RUN mkdir -p ${DIST_UI}/
COPY --from=eda-standalone-builder /app/ansible-ui/build/eda/ ${DIST_UI}