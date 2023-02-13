/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Base from './Base.jsx';

class InventorySources extends Base {
  constructor(http) {
    super(http);
    this.baseUrl = 'api/v2/inventory_sources/';

    // this.createSchedule = this.createSchedule.bind(this);
    this.createSyncStart = this.createSyncStart.bind(this);
    this.destroyGroups = this.destroyGroups.bind(this);
    this.destroyHosts = this.destroyHosts.bind(this);
  }

  createSyncStart(sourceId, extraVars) {
    return this.http.post(`${this.baseUrl}${sourceId}/update/`, {
      extra_vars: extraVars,
    });
  }

  readGroups(id) {
    return this.http.get(`${this.baseUrl}${id}/groups/`);
  }

  readHosts(id) {
    return this.http.get(`${this.baseUrl}${id}/hosts/`);
  }

  destroyGroups(id) {
    return this.http.delete(`${this.baseUrl}${id}/groups/`);
  }

  destroyHosts(id) {
    return this.http.delete(`${this.baseUrl}${id}/hosts/`);
  }
}
export default InventorySources;
