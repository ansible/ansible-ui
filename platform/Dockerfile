FROM nginx:alpine as certificate
RUN apk add --no-cache openssl
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/nginx-selfsigned.key -out /etc/ssl/nginx-selfsigned.crt -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

FROM --platform=${TARGETPLATFORM:-linux/amd64} nginx:alpine as base
COPY --from=certificate /etc/ssl/nginx-selfsigned.crt /etc/ssl/nginx-selfsigned.crt
COPY --from=certificate /etc/ssl/nginx-selfsigned.key /etc/ssl/nginx-selfsigned.key
RUN chmod g+rwx /etc/nginx/nginx.conf /etc/nginx/conf.d /etc/nginx/conf.d/default.conf /var/cache/nginx /var/run /var/log/nginx /etc/ssl
COPY /nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"] 

FROM base as platform-ui
COPY /platform/platform.conf /etc/nginx/templates/default.conf.template
COPY /build/platform /usr/share/nginx/html