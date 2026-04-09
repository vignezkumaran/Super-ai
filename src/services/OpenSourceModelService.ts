import axios from 'axios';
import RNFS from 'react-native-fs';
import { OpenSourceModel } from '../types';

export interface HuggingFaceDownloadTask {
  jobId: number;
  filePath: string;
  promise: Promise<string>;
}

const MODELS_DIR = `${RNFS.DocumentDirectoryPath}/models`;

const ensureModelsDir = async () => {
  const exists = await RNFS.exists(MODELS_DIR);
  if (!exists) {
    await RNFS.mkdir(MODELS_DIR);
  }
};

const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '_');

const resolveHfFilename = async (repoId: string): Promise<string> => {
  const { data } = await axios.get<{ siblings?: Array<{ rfilename: string }> }>(
    `https://huggingface.co/api/models/${repoId}`,
    { timeout: 10000 },
  );

  const candidate = data.siblings?.find(file => file.rfilename.toLowerCase().endsWith('.gguf'));
  if (!candidate?.rfilename) {
    throw new Error('No GGUF file found for this repository.');
  }

  return candidate.rfilename;
};

export const startHuggingFaceModelDownload = async (
  model: OpenSourceModel,
  onProgress?: (progress: number) => void,
): Promise<HuggingFaceDownloadTask> => {
  if (!model.hfRepoId) {
    throw new Error('Hugging Face model metadata is incomplete.');
  }

  await ensureModelsDir();

  const filename = model.hfFilename ?? (await resolveHfFilename(model.hfRepoId));

  const toFile = `${MODELS_DIR}/${sanitize(model.hfRepoId)}--${sanitize(filename)}`;
  const url = `https://huggingface.co/${model.hfRepoId}/resolve/main/${filename}?download=true`;

  const result = RNFS.downloadFile({
    fromUrl: url,
    toFile,
    discretionary: true,
    background: true,
    progressDivider: 5,
    begin: () => {
      onProgress?.(0);
    },
    progress: event => {
      if (event.contentLength > 0) {
        const progress = Math.round((event.bytesWritten / event.contentLength) * 100);
        onProgress?.(progress);
      }
    },
  });

  const promise = result.promise.then(output => {
    if (output.statusCode < 200 || output.statusCode >= 300) {
      throw new Error(`Download failed with status ${output.statusCode}.`);
    }

    onProgress?.(100);
    return toFile;
  });

  return {
    jobId: result.jobId,
    filePath: toFile,
    promise,
  };
};

export const cancelHuggingFaceModelDownload = async (jobId: number): Promise<void> => {
  RNFS.stopDownload(jobId);
};

export const downloadHuggingFaceModel = async (
  model: OpenSourceModel,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  const task = await startHuggingFaceModelDownload(model, onProgress);
  return task.promise;
};
