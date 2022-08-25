docker build --tag ansible .
docker save ansible -o ansible.tar
scp ansible.tar root@137.184.52.198:~
rm -f *.tar
ssh root@137.184.52.198 "docker load -i ansible.tar; docker rm -f ansible || true; docker run --name ansible -d -e PORT=443 -p 443:443 -v /root/certs:/home/node/certs ansible"