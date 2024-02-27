import { ExecutionEnvironmentImage } from '../../execution-environments/ExecutionEnvironmentPage/ExecutionEnvironmentImage';

export const isManifestList = (image: ExecutionEnvironmentImage): boolean =>
  !!image.media_type.match('manifest.list');
