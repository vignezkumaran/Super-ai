import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getLocalModels, isOllamaReachable, pullLocalModel } from '../services/LocalService';
import { fetchHuggingFaceDeviceSupportedModels } from '../services/ModelCatalogService';
import {
  cancelHuggingFaceModelDownload,
  startHuggingFaceModelDownload,
} from '../services/OpenSourceModelService';
import { ModelDownloadStatus, OpenSourceModel, Settings } from '../types';
import { DEFAULT_SETTINGS, OPEN_SOURCE_MODELS } from '../utils/constants';
import { getSettings, saveSettings } from '../utils/storage';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Something went wrong while updating settings.';
};

const requiresLocalRefresh = (patch: Partial<Settings>): boolean =>
  Object.prototype.hasOwnProperty.call(patch, 'ollama') ||
  Object.prototype.hasOwnProperty.call(patch, 'localModel');

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocalAvailable, setIsLocalAvailable] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [openSourceModels, setOpenSourceModels] = useState<OpenSourceModel[]>(OPEN_SOURCE_MODELS);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [downloadStates, setDownloadStates] = useState<Record<string, ModelDownloadStatus>>({});
  const activeDownloadJobs = useRef<Record<string, number>>({});

  const refreshLocalState = useCallback(async (nextSettings: Settings) => {
    try {
      const reachable = await isOllamaReachable(nextSettings.ollama.host, nextSettings.ollama.port);
      setIsLocalAvailable(reachable);

      if (!reachable) {
        setLocalModels([]);
        return;
      }

      const models = await getLocalModels(nextSettings.ollama.host, nextSettings.ollama.port);
      setLocalModels(models);

      if (models.length > 0 && !models.includes(nextSettings.localModel)) {
        const patched = { ...nextSettings, localModel: models[0] };
        setSettings(patched);
        await saveSettings(patched);
      }
      setSettingsError(null);
    } catch {
      setIsLocalAvailable(false);
      setLocalModels([]);
      setSettingsError('Could not connect to Ollama. Check host and port.');
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
      await refreshLocalState(data);
    } finally {
      setLoading(false);
    }
  }, [refreshLocalState]);

  const refreshOpenSourceCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);

    try {
      const remote = await fetchHuggingFaceDeviceSupportedModels();
      const merged = [...OPEN_SOURCE_MODELS, ...remote];
      const deduped = new Map<string, OpenSourceModel>();

      merged.forEach(model => {
        if (!deduped.has(model.id)) {
          deduped.set(model.id, model);
        }
      });

      setOpenSourceModels(Array.from(deduped.values()));
    } catch (error) {
      setCatalogError(getErrorMessage(error));
      setOpenSourceModels(OPEN_SOURCE_MODELS);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    refreshOpenSourceCatalog();
  }, [loadSettings, refreshOpenSourceCatalog]);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);

      try {
        await saveSettings(next);
        if (requiresLocalRefresh(patch)) {
          await refreshLocalState(next);
        } else {
          setSettingsError(null);
        }
      } catch (error) {
        setSettingsError(getErrorMessage(error));
      }
    },
    [refreshLocalState, settings],
  );

  const pullModel = useCallback(
    async (modelName: string) => {
      try {
        await pullLocalModel(modelName, settings.ollama.host, settings.ollama.port);
        await refreshLocalState(settings);
      } catch (error) {
        setSettingsError(getErrorMessage(error));
        throw error;
      }
    },
    [refreshLocalState, settings],
  );

  const downloadOpenSourceModel = useCallback(
    async (model: OpenSourceModel) => {
      setDownloadStates(prev => ({
        ...prev,
        [model.id]: { state: 'downloading', progress: 0, message: 'Starting download...' },
      }));

      try {
        if (model.source === 'ollama') {
          if (!model.ollamaName) {
            throw new Error('Ollama model name is missing.');
          }

          await pullLocalModel(model.ollamaName, settings.ollama.host, settings.ollama.port);
          await refreshLocalState(settings);
          setDownloadStates(prev => ({
            ...prev,
            [model.id]: {
              state: 'completed',
              progress: 100,
              message: `${model.ollamaName} pulled successfully from Ollama.`,
            },
          }));
          return;
        }

        const task = await startHuggingFaceModelDownload(model, progress => {
          setDownloadStates(prev => ({
            ...prev,
            [model.id]: {
              state: 'downloading',
              progress,
              message: `Downloading... ${progress}%`,
            },
          }));
        });
        activeDownloadJobs.current[model.id] = task.jobId;

        const filePath = await task.promise;
        delete activeDownloadJobs.current[model.id];

        setDownloadStates(prev => ({
          ...prev,
          [model.id]: {
            state: 'completed',
            progress: 100,
            message: 'Model file downloaded to local storage.',
            filePath,
          },
        }));
      } catch (error) {
        const message = getErrorMessage(error);
        setDownloadStates(prev => ({
          ...prev,
          [model.id]: { state: 'failed', progress: 0, message },
        }));
        setSettingsError(message);
        throw error;
      }
    },
    [refreshLocalState, settings],
  );

  const cancelOpenSourceDownload = useCallback(async (modelId: string) => {
    const jobId = activeDownloadJobs.current[modelId];
    if (!jobId) {
      return;
    }

    await cancelHuggingFaceModelDownload(jobId);
    delete activeDownloadJobs.current[modelId];

    setDownloadStates(prev => ({
      ...prev,
      [modelId]: {
        state: 'failed',
        progress: 0,
        message: 'Download stopped by user.',
      },
    }));
  }, []);

  return useMemo(
    () => ({
      settings,
      updateSettings,
      localModels,
      openSourceModels,
      catalogLoading,
      catalogError,
      refreshOpenSourceCatalog,
      downloadStates,
      downloadOpenSourceModel,
      cancelOpenSourceDownload,
      pullModel,
      loading,
      isLocalAvailable,
      settingsError,
      reloadSettings: loadSettings,
    }),
    [
      settings,
      updateSettings,
      localModels,
      openSourceModels,
      catalogLoading,
      catalogError,
      refreshOpenSourceCatalog,
      downloadStates,
      downloadOpenSourceModel,
      cancelOpenSourceDownload,
      pullModel,
      loading,
      isLocalAvailable,
      settingsError,
      loadSettings,
    ],
  );
};
