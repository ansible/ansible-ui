#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

export SERVER=''
export TOKEN='token'

OUT="../frontend/event-driven/interfaces"
mkdir -p $OUT

./api2ts.sh EdaProject /api/projects . $OUT/EdaProject.ts
./api2ts.sh EdaRulebookActivation /api/activation_instances . $OUT/EdaRulebookActivation.ts
./api2ts.sh EdaJob /api/job_instances/ . $OUT/EdaJob.ts
./api2ts.sh EdaRulebook /api/rulebooks . $OUT/EdaRulebook.ts
./api2ts.sh EdaRuleSet /api/rulesets . $OUT/EdaRuleSet.ts
./api2ts.sh EdaRule /api/rules . $OUT/EdaRule.ts
./api2ts.sh EdaInventory /api/inventories/ . $OUT/EdaInventory.ts
./api2ts.sh EdaPlaybook /api/playbooks/ . $OUT/EdaPlaybook.ts
./api2ts.sh EdaExtraVars /api/extra_vars/ . $OUT/EdaExtraVars.ts
