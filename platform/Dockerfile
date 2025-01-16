FROM public.ecr.aws/nginx/nginx:alpine AS certificate
RUN apk add --no-cache openssl
RUN mkdir -p /certs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/cert.key -out /certs/cert.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# base - nginx + openshift
#
# https://docs.openshift.com/container-platform/4.13/openshift_images/create-images.html#use-uid_create-images
#
# By default, OpenShift Container Platform runs containers using an arbitrarily assigned user ID.
# This provides additional security against processes escaping the container due to a container engine vulnerability 
# and thereby achieving escalated permissions on the host node.
#
# For an image to support running as an arbitrary user, 
# directories and files that are written to by processes in the image must be owned by the root group
# and be read/writable by that group. Files to be executed must also have group execute permissions.
#
FROM public.ecr.aws/nginx/nginx:alpine AS base
COPY --from=certificate /certs/cert.pem /certs/cert.pem
COPY --from=certificate /certs/cert.key /certs/cert.key
COPY --from=certificate /certs/cert.pem /certs/CA.pem
RUN chmod g+rwx /etc/nginx/nginx.conf /etc/nginx/conf.d /etc/nginx/conf.d/default.conf /var/cache/nginx /var/run /var/log/nginx /etc/ssl /certs
COPY /nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]

FROM base AS platform-ui
COPY /nginx/templates/default.conf.template /etc/nginx/templates/default.conf.template
COPY /dist /usr/share/nginx/html
