#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

export SERVER=''
export TOKEN=''

OUT="../frontend/controller/interfaces"
mkdir -p $OUT
# ./api2ts.sh User /api/v2/users/ .results $OUT/User.ts
# ./api2ts.sh Organization /api/v2/organizations/ .results $OUT/Organization.ts
# ./api2ts.sh Team /api/v2/teams/ .results $OUT/Team.ts
# ./api2ts.sh Instance /api/v2/instances/ .results $OUT/Instance.ts
./api2ts.sh InstanceGroup /api/v2/instance_group/ .results $OUT/InstanceGroup.ts
./api2ts.sh ExecutionEnvironment /api/v2/execution_environment/ .results $OUT/ExecutionEnvironment.ts
# ./api2ts.sh Project /api/v2/projects/ .results $OUT/Project.ts
# ./api2ts.sh Credential /api/v2/credentials/ .results $OUT/Credential.ts
./api2ts.sh CredentialType /api/v2/credential_types/ .results $OUT/CredentialType.ts
./api2ts.sh Application /api/v2/applications/ .results $OUT/Application.ts
./api2ts.sh Inventory /api/v2/inventory/ .results $OUT/Inventory.ts
./api2ts.sh Group /api/v2/groups/ .results $OUT/Group.ts
# ./api2ts.sh Host /api/v2/hosts/ .results $OUT/Host.ts
./api2ts.sh JobTemplate /api/v2/job_tempaltes/ .results $OUT/JobTemplate.ts
# ./api2ts.sh Job /api/v2/jobs/ .results $OUT/Job.ts
./api2ts.sh UnifiedJob /api/v2/unified_jobs/ .results $OUT/UnifiedJob.ts
