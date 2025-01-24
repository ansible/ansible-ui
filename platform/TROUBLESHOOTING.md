# Troubleshooting Platform-UI

## How to Retrieve Logs from Jenkins Build

1. Visit the inventory file of the Jenkins build
   1. From the details page of the Jenkins job, click on the Inventory file to view the associated machines.
2. Copy all host URLs from the following components and paste them somewhere
   1. automationcontroller (2)
   2. automationedacontroller (2)
   3. automationhub (2)
   4. automationgateway (2)
3. Notes
   1. Gateway logs are in ```/var/log/ansible-automation-platform/<component>```
   2. HUB logs are in ```/var/log/ansible-automation-platform/<component>```
   3. EDA logs are in ```/var/log/ansible-automation-platform/<component>```
   4. Controller logs are in ```/var/log/tower```
4. Verify that your SSH keys are present in Jenkins
   1. In order to ssh into the box, your ssh keys should be present into that machine, and we are leveraging ssh keys store in the github
      1. The link for your ssh keys should be added [here](https://gitlab.cee.redhat.com/aap-ci/aapqa-provisioner/-/blob/devel/ansible_collections/aapqa/core/roles/auth_keys/defaults/main.yml)
      2. If your keys are not present, you will need to create a one-time pull request to have your SSH keys added to Jenkins
      3. This one time PR has to merged before the instance is created. Then the instance will have your ssh keys.
5. Follow these steps for each host URL one by one
   1. SSH into the machine: ```ssh ec2-user@<hostUrl>```
   2. Navigate to the appropriate directory based on the filepaths provided in step 3, depending on which component URL you have SSH’d into
   3. Move the logs from their current location to a logs directory in the ec2-user directory: ```sudo cp -R /var/log/ansible-automation-platform /home/ec2-user/logs```
   4. Still inside the ec2 machine, navigate to ```/home/ec2-user/logs``` to verify that the logs are present
   5. If at any point you do not have the proper permissions, you can run these commands (it is not recommended to run these commands from inside the ```/var``` directory, but you can do it once the logs are moved to the ```/home/ec2-user/logs directory```):
      1. ```sudo chmod o+r logs/hub/*```
      2. ```sudo chmod -R o+r logs```
      3. ```sudo chmod -R 777 /tmp/tower_logs```
   6. Exit the ec2 machine using CTRL + D
   7. From your local machine, copy the logs from inside the ec2 machine to a directory on your local machine using this command (do not keep the brackets around the hostUrl when you enter it in) ```scp -r ec2-user@<hostUrl>:/home/ec2-user/logs </some/dir/on/your/machine>```
   8. You should now see the logs from that one machine in the directory you designated on your local computer
   9. Repeat these steps for each hostUrl

## How to Retrieve Logs from a Kubernetes Deployment

1. SSH into the Kubernetes host: ```ssh <your-kubernetes-host>```
   Example: ```ssh test-galaxy-20240805.gcp.testing.ansible.com```
2. Get the list of all resources in the desired namespace: ```kubectl get all -n <namespace>```
   Example: ```kubectl get all -n test-galaxy-20240805```
3. Find the pod running the API: Look for the pod name that is running your API service from the output of the previous command.
4. View the logs of the API pod in real-time: ```kubectl logs -f <api-pod-name> -n <namespace>```
   Example: ```kubectl logs -f galaxy-api-7c7cc888fb-7h9mk -n test-galaxy-20240807```
5. Filter the logs for 500 errors in real-time: ```kubectl logs -f <api-pod-name> -n <namespace> | grep "500"```
   Example: ```kubectl logs -f galaxy-api-56dd94c4b7-8kh7t -n test-galaxy-20240805 | grep "500"```
6. Include 20 lines after each 500 error to capture the traceback: ```kubectl logs -f <api-pod-name> -n <namespace> | grep -A 20 "500"```
   Example: ```kubectl logs -f galaxy-api-56dd94c4b7-8kh7t -n test-galaxy-20240805 | grep -A 20 "500"```
