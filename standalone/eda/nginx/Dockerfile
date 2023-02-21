# Build eda-frontend
FROM docker.io/node:16-alpine AS ui-builder

WORKDIR /ansible-ui
COPY ansible-ui/package-*.json ./
RUN npm ci --omit=dev --omit=optional --ignore-scripts
COPY ansible-ui/. .
RUN npm run build:eda

#---------------------------
FROM docker.io/nginx
ARG NGINX_CONF=eda/nginx/default.conf
ARG NGINX_CONFIGURATION_PATH=/etc/nginx/conf.d/

ENV DIST_UI="/opt/app-root/ui/eda"

ADD ${NGINX_CONF} ${NGINX_CONFIGURATION_PATH}

# Copy dist dir to final location
RUN mkdir -p ${DIST_UI}/
COPY --from=ui-builder /ansible-ui/build/eda/ ${DIST_UI}