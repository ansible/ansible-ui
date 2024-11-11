# Deployment Types

Visiting the Jenkins build links and looking at individual jobs will provide the inventory data, which will show the deployment URL and admin password. Default username is always 'admin'.

## RPM-B Deployment: Enterprise RPM Build of AAP

- [Jenkins build link](https://main-jenkins-csb-aap.apps.ocp-c1.prod.psi.redhat.com/job/AAPQA/job/Nightly/job/devel_tier1/job/aapqaprov-integ-aap-2.5_unreleased_next-rpm-b.env-a.ui.tier1/)
- 2 VMs for AAP Gateway / Unified UI
- 2 VMs for Automation Controller
- 2 VMs for Private Automation Hub
- 2 VMs for Event Driven Ansible - hybrid nodes
- 1 VM for Automation Mesh Hop Node
- 2 VM for Automation Mesh Execution Node
- External unmanaged database service
- HAProxy load balancer in front of AAP Gateway

## CONT-B Deployment: Enterprise Containerized Build of AAP

- [Jenkins build link](https://main-jenkins-csb-aap.apps.ocp-c1.prod.psi.redhat.com/job/AAPQA/job/Product_Build_CI/job/2.5-next/job/tier1/job/cont-b.env-a.fresh-install.ui.tier1/)
- 2 VMs for AAP Gateway / Unified UI - with redis
- 2 VMs for Automation Controller
- 2 VMs for Private Automation Hub - with redis
- 2 VMs for Event Driven Ansible - with redis - hybrid nodes
- 1 VM for Automation Mesh Hop Node
- 2 VM for Automation Mesh Execution Node
- External unmanaged database service
- HAProxy load balancer in front of AAP Gateway

## Managed-B Deployment: Enterprise Managed Azure Build of AAP

- [Jenkins build link](https://main-jenkins-csb-aap.apps.ocp-c1.prod.psi.redhat.com/job/AAPQA/job/Product_Build_CI/job/2.5-next/job/tier1/job/man-b.env-a.fresh-install.ui.tier1/)
- 1 VM for Hop Node (traditional mesh)
- 1 VM for Execution Node (traditional mesh)
- 1 VM for Execution Node (mesh ingress)

## OCP-B Deployment: SaaS Deployment of AAP

- [Jenkins build link](https://main-jenkins-csb-aap.apps.ocp-c1.prod.psi.redhat.com/job/AAPQA/job/Product_Build_CI/job/2.5-next/job/tier1/job/ocp-b.env-a.fresh-install.ui.tier1/)
- 1 pod for AAP Gateway / Unified UI
- 2 pods for Automation Controller
- 5 pods for Private Automation Hub
- x pods for Event Driven Ansible
- 2 pods for mesh ingress
- Each pod has 1 replica set configured by default  
- External managed redis service
- External managed database service