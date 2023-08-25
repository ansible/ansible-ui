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
FROM --platform=${TARGETPLATFORM:-linux/amd64} nginx:alpine as base
RUN chmod g+rwx /etc/nginx/nginx.conf /etc/nginx/conf.d /etc/nginx/conf.d/default.conf /var/cache/nginx /var/run /var/log/nginx 
COPY /nginx/nginx.conf /etc/nginx/nginx.conf

# awx-ui
FROM base as awx-ui
COPY /nginx/awx.conf /etc/nginx/templates/default.conf.template
COPY /build/awx /usr/share/nginx/html

# hub-ui
FROM base as hub-ui
COPY /nginx/hub.conf /etc/nginx/templates/default.conf.template
COPY /build/hub /usr/share/nginx/html

# eda-ui
FROM base as eda-ui
COPY /nginx/eda.conf /etc/nginx/templates/default.conf.template
COPY /build/eda /usr/share/nginx/html
