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

# build ansible-ui
FROM --platform=${TARGETPLATFORM:-linux/amd64} dependencies as builder
COPY . .
RUN DISCLAIMER=true npm run build

# build eda
FROM --platform=${TARGETPLATFORM:-linux/amd64} dependencies as eda-builder
COPY . .
RUN npm run build:eda

# bundle eda
FROM nginx:alpine as eda
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=eda-builder /ansible-ui/build/eda /usr/share/nginx/html

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
