import axios from 'axios';
import { OpenSourceModel } from '../types';

interface HuggingFaceModelResponse {
  id: string;
  pipeline_tag?: string;
  siblings?: Array<{ rfilename: string }>;
  cardData?: { license?: string };
}

const extractBillionParams = (value: string): number | null => {
  const match = value.match(/(\d+(?:\.\d+)?)\s*b/i);
  if (!match?.[1]) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const estimateSizeGB = (paramsB: number | null, label: string): number | undefined => {
  if (!paramsB) {
    return undefined;
  }

  const lower = label.toLowerCase();
  const multiplier =
    lower.includes('q2') ? 0.35 :
    lower.includes('q3') ? 0.45 :
    lower.includes('q4') ? 0.58 :
    lower.includes('q5') ? 0.72 :
    lower.includes('q6') ? 0.86 :
    1.0;

  return Math.max(0.3, Number((paramsB * multiplier).toFixed(1)));
};

const estimateRamGB = (paramsB: number | null, label: string): number | undefined => {
  if (!paramsB) {
    return undefined;
  }

  const lower = label.toLowerCase();
  const base = lower.includes('q4') ? paramsB * 0.7 : paramsB * 0.9;
  return Math.max(3, Math.ceil(base));
};

const isLikelySupportedOnDevice = (repoId: string, filename: string): { ok: boolean; note: string } => {
  const compound = `${repoId} ${filename}`.toLowerCase();
  const paramsB = extractBillionParams(compound);

  if (paramsB && paramsB > 7) {
    return { ok: false, note: 'Likely too large for typical mobile memory budgets.' };
  }

  if (compound.includes('f16') || compound.includes('q8_0')) {
    return { ok: false, note: 'High precision variant, not ideal for mobile devices.' };
  }

  return { ok: true, note: 'Likely mobile-friendly quantized GGUF.' };
};

const pickFirstGguf = (siblings?: Array<{ rfilename: string }>): string | undefined => {
  return siblings?.find(file => file.rfilename.toLowerCase().endsWith('.gguf'))?.rfilename;
};

export const fetchHuggingFaceDeviceSupportedModels = async (
  limit = 150,
): Promise<OpenSourceModel[]> => {
  const { data } = await axios.get<HuggingFaceModelResponse[]>(
    'https://huggingface.co/api/models',
    {
      params: {
        search: 'gguf',
        sort: 'downloads',
        direction: -1,
        limit,
        full: true,
      },
      timeout: 15000,
    },
  );

  const mapped = data
    .map(model => {
      const gguf = pickFirstGguf(model.siblings);
      if (!gguf) {
        return null;
      }

      const support = isLikelySupportedOnDevice(model.id, gguf);
      if (!support.ok) {
        return null;
      }

      const paramsB = extractBillionParams(`${model.id} ${gguf}`);

      return {
        id: `hf-${model.id.replace(/\//g, '--')}`,
        title: `${model.id}`,
        source: 'huggingface' as const,
        description: `Task: ${model.pipeline_tag ?? 'text-generation'} | File: ${gguf}`,
        license: model.cardData?.license ?? 'unknown',
        hfRepoId: model.id,
        hfFilename: gguf,
        sourceUrl: `https://huggingface.co/${model.id}`,
        supportNote: support.note,
        estimatedSizeGB: estimateSizeGB(paramsB, gguf),
        recommendedMinRamGB: estimateRamGB(paramsB, gguf),
      };
    })
    .filter(item => item !== null) as OpenSourceModel[];

  const dedupe = new Map<string, OpenSourceModel>();
  mapped.forEach(model => {
    if (!dedupe.has(model.id)) {
      dedupe.set(model.id, model);
    }
  });

  return Array.from(dedupe.values());
};
