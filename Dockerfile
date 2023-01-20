FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine as package
WORKDIR /app
COPY package*.json ./
RUN npm version 0.0.0 --no-git-tag-version

FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine as dependencies
RUN apk upgrade --no-cache -U && apk add --no-cache openssl
WORKDIR /app
COPY --from=package /app/package*.json ./
RUN npm ci --omit=optional --ignore-scripts

FROM --platform=${TARGETPLATFORM:-linux/amd64} dependencies as builder
COPY . .
ARG VERSION
RUN VERSION=$VERSION DISCLAIMER=true npm run build

FROM --platform=${TARGETPLATFORM:-linux/amd64} alpine
ARG VERSION
COPY --from=builder /usr/local/bin/node /usr/local/bin/node
RUN apk upgrade --no-cache -U && apk add --no-cache libstdc++
RUN addgroup -g 1000 -S node && adduser -u 1000 -S node -G node
USER node
WORKDIR /home/node
ENV NODE_ENV production
ENV VERSION $VERSION
COPY --from=builder --chown=node /app/build ./
CMD ["node", "proxy.mjs"]
