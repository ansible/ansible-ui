# awx-ui
FROM --platform=${TARGETPLATFORM:-linux/amd64} nginx:alpine as awx-ui
COPY /nginx/awx.conf /etc/nginx/templates/default.conf.template
COPY /build/awx /usr/share/nginx/html

# hub-ui
FROM --platform=${TARGETPLATFORM:-linux/amd64} nginx:alpine as hub-ui
COPY /nginx/hub.conf /etc/nginx/templates/default.conf.template
COPY /build/hub /usr/share/nginx/html

# eda-ui
FROM --platform=${TARGETPLATFORM:-linux/amd64} nginx:alpine as eda-ui
COPY /nginx/eda.conf /etc/nginx/templates/default.conf.template
COPY /build/eda /usr/share/nginx/html

# ansible-ui
FROM --platform=${TARGETPLATFORM:-linux/amd64} alpine as ansible-ui
ARG VERSION
COPY --from=node:18-alpine /usr/local/bin/node /usr/local/bin/node
RUN apk upgrade --no-cache -U && apk add --no-cache libstdc++
RUN addgroup -g 1000 -S node && adduser -u 1000 -S node -G node
USER node
WORKDIR /home/node
ENV NODE_ENV production
ENV VERSION $VERSION
COPY --chown=node /build/ ./
CMD ["node", "proxy.mjs"]