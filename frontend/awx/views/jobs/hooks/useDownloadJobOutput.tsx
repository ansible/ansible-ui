import { downloadTextFile } from '../../../../../framework/utils/download-file';
import { requestCommon } from '../../../../common/crud/requestCommon';
import { createRequestError } from '../../../../common/crud/RequestError';
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
