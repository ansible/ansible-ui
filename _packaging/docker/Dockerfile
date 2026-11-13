# Product UI images — UBI 9 nginx base (replaces public.ecr.aws/nginx/nginx:alpine).

ARG NGINX_IMAGE=registry.access.redhat.com/ubi9/nginx-126@sha256:11a2b25b7326356e8d5dccf8223fbf32f9c1509763fae5bf71cd8c38d6b6f60a
ARG UBI_MINIMAL_IMAGE=registry.access.redhat.com/ubi9/ubi-minimal@sha256:a21d19f72557aa893a0f6ca1177bb1ffd91df6015e60470a116c50a6a05efcd9

FROM ${UBI_MINIMAL_IMAGE} AS certificate
USER 0
RUN microdnf -y install openssl && microdnf clean all
RUN mkdir -p /certs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /certs/cert.key -out /certs/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

FROM ${NGINX_IMAGE} AS base
USER 0
COPY --from=certificate /certs/cert.pem /certs/cert.pem
COPY --from=certificate /certs/cert.key /certs/cert.key
COPY --from=certificate /certs/cert.pem /certs/CA.pem
RUN mkdir -p /certs /etc/nginx/snippets /etc/nginx/templates /var/cache/nginx && \
    chmod -R g+rwx /etc/nginx/nginx.conf /etc/nginx/conf.d /var/cache/nginx /run /var/log/nginx /etc/ssl /certs /etc/nginx/snippets /etc/nginx/templates
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY _packaging/docker/scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 443
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

FROM base AS awx-ui
COPY nginx/awx.conf /etc/nginx/templates/default.conf.template
COPY frontend/awx/dist /usr/share/nginx/html

FROM base AS hub-ui
COPY nginx/hub.conf /etc/nginx/templates/default.conf.template
COPY frontend/hub/dist /usr/share/nginx/html

FROM base AS eda-ui
COPY nginx/eda.conf /etc/nginx/templates/default.conf.template
COPY frontend/eda/dist /usr/share/nginx/html

# ui-e2e
FROM cypress/base AS ui-e2e
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
