FROM --platform=${TARGETPLATFORM:-linux/amd64} alpine as package
RUN apk upgrade --no-cache -U && apk add --no-cache jq
WORKDIR /src
COPY package*.json ./
WORKDIR /app
RUN cat /src/package.json | jq '.version = "0.0.0"' > /app/package.json
RUN cat /src/package-lock.json | jq '.version = "0.0.0"' | jq '.packages."".version = "0.0.0"' > /app/package-lock.json

FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine as builder
ARG VERSION
RUN apk upgrade --no-cache -U && apk add --no-cache openssl
WORKDIR /app
COPY --from=package /app/package*.json ./
RUN npm ci --no-optional --ignore-scripts
COPY . .
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
