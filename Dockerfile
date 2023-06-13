# eda-ui
FROM --platform=${TARGETPLATFORM:-linux/amd64} nginx:alpine as eda-ui
ARG NGINX_CONF=./nginx.conf
ARG NGINX_CONFIGURATION_PATH=/etc/nginx/nginx.conf
ENV DIST_UI="/opt/app-root/ui/eda"
COPY ${NGINX_CONF} ${NGINX_CONFIGURATION_PATH}
RUN mkdir -p ${DIST_UI}/
COPY /dist/eda/ ${DIST_UI}
ARG USER_ID=${USER_ID:-1001}
RUN adduser -S eda -u "$USER_ID" -G root
USER 0
RUN for dir in \
      ${DIST_UI}/ \
      ${NGINX_CONF} \
      ${NGINX_CONFIGURATION_PATH} \
      /var/cache/nginx \
      /var/log/nginx \
      /var/lib/nginx ; \
    do mkdir -m 0775 -p $dir ; chmod g+rwx $dir ; chgrp root $dir ; done && \
    for file in \
      /var/run/nginx.pid ; \
    do touch $file ; chmod g+rw $file ; done
USER "$USER_ID"

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
COPY --chown=node /dist/ ./public
COPY --chown=node /locales/ ./public/locales
CMD ["node", "proxy.mjs"]