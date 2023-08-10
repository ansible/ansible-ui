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
