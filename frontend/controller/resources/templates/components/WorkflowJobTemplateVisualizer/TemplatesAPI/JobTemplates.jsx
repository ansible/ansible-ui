/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Base from './Base.jsx';

class JobTemplates extends Base {
  constructor(http) {
    super(http);
    this.baseUrl = 'api/v2/job_templates/';

    // this.createSchedule = this.createSchedule.bind(this);
    this.launch = this.launch.bind(this);
    this.readLaunch = this.readLaunch.bind(this);
    // this.associateLabel = this.associateLabel.bind(this);
    // this.disassociateLabel = this.disassociateLabel.bind(this);
    this.readCredentials = this.readCredentials.bind(this);
    this.readAccessList = this.readAccessList.bind(this);
    this.readAccessOptions = this.readAccessOptions.bind(this);
    this.readWebhookKey = this.readWebhookKey.bind(this);
  }

  launch(id, data) {
    return this.http.post(`${this.baseUrl}${id}/launch/`, data);
  }

  readTemplateOptions(id) {
    return this.http.options(`${this.baseUrl}${id}/`);
  }

  readLaunch(id) {
    return this.http.get(`${this.baseUrl}${id}/launch/`);
  }

  readCredentials(id, params) {
    return this.http.get(`${this.baseUrl}${id}/credentials/`, {
      params,
    });
  }

  associateCredentials(id, credentialId) {
    return this.http.post(`${this.baseUrl}${id}/credentials/`, {
      id: credentialId,
    });
  }

  disassociateCredentials(id, credentialId) {
    return this.http.post(`${this.baseUrl}${id}/credentials/`, {
      id: credentialId,
      disassociate: true,
    });
  }

  readAccessList(id, params) {
    return this.http.get(`${this.baseUrl}${id}/access_list/`, {
      params,
    });
  }

  readAccessOptions(id) {
    return this.http.options(`${this.baseUrl}${id}/access_list/`);
  }

  readScheduleList(id, params) {
    return this.http.get(`${this.baseUrl}${id}/schedules/`, {
      params,
    });
  }

  readSurvey(id) {
    return this.http.get(`${this.baseUrl}${id}/survey_spec/`);
  }

  updateSurvey(id, survey) {
    return this.http.post(`${this.baseUrl}${id}/survey_spec/`, survey);
  }

  destroySurvey(id) {
    return this.http.delete(`${this.baseUrl}${id}/survey_spec/`);
  }

  readWebhookKey(id) {
    return this.http.get(`${this.baseUrl}${id}/webhook_key/`);
  }

  updateWebhookKey(id) {
    return this.http.post(`${this.baseUrl}${id}/webhook_key/`);
  }
}

export default JobTemplates;
