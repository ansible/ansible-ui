# Test Server Setup

Goto the Jenkins YOLO Provisioner
[https://main-jenkins-csb-aap.apps.ocp-c1.prod.psi.redhat.com/job/AAPQA/job/AAPQA%20Provisioner/job/AAPQA-Provisioner-Yolo/](https://main-jenkins-csb-aap.apps.ocp-c1.prod.psi.redhat.com/job/AAPQA/job/AAPQA%20Provisioner/job/AAPQA-Provisioner-Yolo/)  
Note: VPN Needed

## On the left navigation click **Build with Parameters**

1. PROVISION\_PREFIX  
   Prefix with: aap-ui \+ dev or e2e \+ date in format MM-DD-YY  
   Example: aap-ui-dev-08-28-24  
2. PROVISION\_TOPOLOGY  
   DEV: input/aap\_scenarios/reference\_topology/rpm\_a.yml  
   E2E: input/aap\_scenarios/reference\_topology/rpm\_b.yml  
3. IS\_PERMANENT\_DEPLOY  
   Enabled  
4. CLEANUP\_DEPLOYMENT  
   Disabled  
5. RUN\_INTEGRATION\_TESTS  
   Disabled  
6. SLACK\_USERNAME  
   \#aap-ui-ci

## Once the build completes

1. Click on build artifacts  
2. Click on inventory  
3. Look for variable: gateway\_base\_url  
4. Setup users  
   dev \- nomeetingsfriday  
   e2e \- TBD  
5. Update the \#aap-ui canvas with the new IP Address

## Updating the AAP\_UI E2E Test Server

1. Goto: [https://github.com/ansible/aap-ui/actions/workflows/ds-platform-update-server.yml](https://github.com/ansible/aap-ui/actions/workflows/ds-platform-update-server.yml)
2. Enter E2E server name  
3. Enable update server on success  
4. Click run workflow

## Cleaning up servers

1. Goto AWS **aworks** account  
   [https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1\#Instances:search=aap-ui](https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1\#Instances:search=aap-ui)  
2. Turn off termination protection for instances  
3. Terminate the instances
