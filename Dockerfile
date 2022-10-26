FROM --platform=${TARGETPLATFORM:-linux/amd64} node:18-alpine as builder
RUN apk upgrade --no-cache -U && apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-optional
COPY . .
RUN npm run build

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
CMD ["node", "backend.mjs"]
