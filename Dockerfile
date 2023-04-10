# package
#   package gets the package.json and package-lock.json with the version set to 0.0.0
#   this is so that future steps can optimize the docker layers and reuse layers from the docker cache
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine as package
WORKDIR /ansible-ui
COPY package*.json .
RUN npm version 0.0.0 --no-git-tag-version || true

# dependencies
#   docker should be able to cache this step unless package-lock.json changes
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine as dependencies
WORKDIR /ansible-ui
COPY --from=package /ansible-ui/package*.json ./
RUN npm ci --omit=dev --omit=optional --ignore-scripts

# eda-ui-builder
FROM dependencies as eda-ui-builder
COPY . .
RUN npm run build:eda

# eda-ui
FROM nginx:alpine as eda-ui
ARG NGINX_CONF=./nginx.conf
ARG NGINX_CONFIGURATION_PATH=/etc/nginx/nginx.conf
ENV DIST_UI="/opt/app-root/ui/eda"
COPY ${NGINX_CONF} ${NGINX_CONFIGURATION_PATH}
RUN mkdir -p ${DIST_UI}/
COPY --from=eda-ui-builder /ansible-ui/build/eda/ ${DIST_UI}

# ansible-ui-builder
FROM --platform=${TARGETPLATFORM:-linux/amd64} dependencies as ansible-ui-builder
COPY . .
ARG VERSION
RUN VERSION=$VERSION DISCLAIMER=true npm run build

# ansible-ui
FROM --platform=${TARGETPLATFORM:-linux/amd64} alpine as ansible-ui
ARG VERSION
COPY --from=ansible-ui-builder /usr/local/bin/node /usr/local/bin/node
RUN apk upgrade --no-cache -U && apk add --no-cache libstdc++
RUN addgroup -g 1000 -S node && adduser -u 1000 -S node -G node
USER node
WORKDIR /home/node
ENV NODE_ENV production
ENV VERSION $VERSION
COPY --from=ansible-ui-builder --chown=node /ansible-ui/build ./
CMD ["node", "proxy.mjs"]