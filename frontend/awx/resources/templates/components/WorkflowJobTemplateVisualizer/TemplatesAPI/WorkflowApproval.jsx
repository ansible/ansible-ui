/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Base from './Base.jsx';

class WorkflowApprovals extends Base {
  constructor(http) {
    super(http);
    this.baseUrl = 'api/v2/workflow_approvals/';
  }

  approve(id) {
    return this.http.post(`${this.baseUrl}${id}/approve/`);
  }

  deny(id) {
    return this.http.post(`${this.baseUrl}${id}/deny/`);
  }
}

export default WorkflowApprovals;
