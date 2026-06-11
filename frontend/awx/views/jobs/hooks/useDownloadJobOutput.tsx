import { downloadTextFile } from '@ansible/ansible-ui-framework/utils/download-file';
import { requestCommon } from '@ansible/common-ui/crud/requestCommon';
import { createRequestError } from '@ansible/common-ui/crud/RequestError';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';

export function useDownloadJobOutput() {
  const downloadJobOutput = async (job: UnifiedJob) => {
    const url = `${job.related.stdout}?format=txt_download`;
    const result = await requestCommon({ url: url, method: 'GET' });
    if (!result.ok) {
      throw await createRequestError(result);
    }
    const content = await result.text();
    downloadTextFile(job.name, content);
  };

  return downloadJobOutput;
}
