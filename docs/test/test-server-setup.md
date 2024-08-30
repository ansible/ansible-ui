# Test Server Setup

Goto the [Jenkins YOLO Provisioner](https://main-jenkins-csb-aap.apps.ocp-c1.prod.psi.redhat.com/job/AAPQA/job/AAPQA%20Provisioner/job/AAPQA-Provisioner-Yolo/)

> Note: VPN Needed

## Build with Parameters

This is in the left navigation

1. PROVISION_PREFIX  
   Prefix with: aap-ui \+ dev or e2e \+ date in format MM-DD-YY  
   Example: aap-ui-dev-08-28-24
2. PROVISION_TOPOLOGY  
   DEV: input/aap_scenarios/reference_topology/rpm_a.yml  
   E2E: input/aap_scenarios/reference_topology/rpm_b.yml
3. IS_PERMANENT_DEPLOY  
   Enabled
4. CLEANUP_DEPLOYMENT  
   Disabled
5. RUN_INTEGRATION_TESTS  
   Disabled
6. SLACK_USERNAME  
   \#aap-ui-ci

## Once the build completes

1. Click on build artifacts
2. Click on inventory
3. Look for variable: gateway_base_url
4. Setup users  
   dev \- nomeetingsfriday  
   e2e \- TBD
5. Update the \#aap-ui canvas with the new IP Address

## Updating the AAP_UI E2E Test Server

1. Goto: [https://github.com/ansible/aap-ui/actions/workflows/ds-platform-update-server.yml](https://github.com/ansible/aap-ui/actions/workflows/ds-platform-update-server.yml)
2. Enter E2E server name
3. Enable update server on success
4. Click run workflow

## Cleaning up servers

1. Goto AWS **aworks** account  
   [https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1\#Instances:search=aap-ui](https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#Instances:search=aap-ui)
2. Turn off termination protection for instances
3. Terminate the instances
