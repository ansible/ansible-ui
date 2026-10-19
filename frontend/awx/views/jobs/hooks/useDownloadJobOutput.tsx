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
    // Name the file after the job it came from. Without the id, downloading
    // several logs leaves the browser to disambiguate them as job(1).txt,
    // job(2).txt and so on. The type prefix matches the filename the API
    // already sends in Content-Disposition ("{type}_{id}.txt").
    downloadTextFile(`${job.type}_${job.name}_${job.id}`, content);
  };

  return downloadJobOutput;
}
