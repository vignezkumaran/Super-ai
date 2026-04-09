import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/AppIcon';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { ModelDownloadStatus, OpenSourceModel, OpenSourceModelSource } from '../types';
import { getColors, ResolvedTheme } from '../theme/colors';

type DeviceFilterMode = 'fit' | 'all';

interface Props {
  resolvedTheme: ResolvedTheme;
  models: OpenSourceModel[];
  downloadStates: Record<string, ModelDownloadStatus>;
  catalogLoading: boolean;
  onRefreshCatalog: () => Promise<void>;
  onDownload: (model: OpenSourceModel) => Promise<void>;
  onCancelDownload: (modelId: string) => Promise<void>;
}

const SOURCE_FILTERS: Array<'all' | OpenSourceModelSource> = ['all', 'ollama', 'huggingface'];

export const LocalModelsScreen = ({
  resolvedTheme,
  models,
  downloadStates,
  catalogLoading,
  onRefreshCatalog,
  onDownload,
  onCancelDownload,
}: Props) => {
  const colors = getColors(resolvedTheme);
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const [sourceFilter, setSourceFilter] = useState<'all' | OpenSourceModelSource>('all');
  const [deviceFilter, setDeviceFilter] = useState<DeviceFilterMode>('fit');

  const ramGB = Number((DeviceInfo.getTotalMemorySync() / (1024 ** 3)).toFixed(1));
  const [freeStorageGB, setFreeStorageGB] = useState<number>(0);

  React.useEffect(() => {
    RNFS.getFSInfo()
      .then(info => {
        setFreeStorageGB(Number((info.freeSpace / (1024 ** 3)).toFixed(1)));
      })
      .catch(() => {
        setFreeStorageGB(0);
      });
  }, []);

  const isDeviceFit = useCallback(
    (model: OpenSourceModel) => {
      const ramOk = model.recommendedMinRamGB ? ramGB >= model.recommendedMinRamGB : true;
      const sizeOk = model.estimatedSizeGB ? freeStorageGB >= model.estimatedSizeGB + 1 : true;
      return ramOk && sizeOk;
    },
    [freeStorageGB, ramGB],
  );

  const filtered = useMemo(() => {
    return models.filter(model => {
      const sourceOk = sourceFilter === 'all' || model.source === sourceFilter;
      const fitOk = deviceFilter === 'all' || isDeviceFit(model);
      return sourceOk && fitOk;
    });
  }, [models, sourceFilter, deviceFilter, isDeviceFit]);

  const handleDownload = async (model: OpenSourceModel) => {
    try {
      await onDownload(model);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Model download failed.';
      Alert.alert('Download failed', message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 12),
        paddingBottom: Math.max(insets.bottom + 24, 20),
      }}
    >
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <AppIcon name="database" size={18} color={colors.textPrimary} strokeWidth={2.2} />
          <Text style={styles.heading}>Local Model Hub</Text>
        </View>
        <Text style={styles.subheading}>Discover open-source models with device compatibility filtering.</Text>

        <View style={styles.statRow}>
          <Text style={styles.stat}>RAM: {ramGB} GB</Text>
          <Text style={styles.stat}>Free storage: {freeStorageGB} GB</Text>
        </View>

        <Text style={styles.section}>Provider Filter</Text>
        <View style={styles.chipsRow}>
          {SOURCE_FILTERS.map(item => {
            const active = sourceFilter === item;
            return (
              <Pressable
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSourceFilter(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.toUpperCase()}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>Device Filter</Text>
        <View style={styles.chipsRow}>
          {(['fit', 'all'] as DeviceFilterMode[]).map(item => {
            const active = deviceFilter === item;
            return (
              <Pressable
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setDeviceFilter(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item === 'fit' ? 'FIT THIS DEVICE' : 'SHOW ALL'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={onRefreshCatalog}
          style={[styles.refreshButton, catalogLoading && styles.disabledButton]}
          disabled={catalogLoading}
        >
          <View style={styles.buttonRow}>
            <AppIcon name="refresh-cw" size={14} color={colors.primaryButtonText} strokeWidth={2.2} />
            <Text style={styles.refreshText}>{catalogLoading ? 'Refreshing Catalog...' : 'Refresh Catalog'}</Text>
          </View>
        </Pressable>

        <Text style={styles.section}>Models ({filtered.length})</Text>

        {filtered.map(model => {
          const status = downloadStates[model.id];
          const downloading = status?.state === 'downloading';

          return (
            <View key={model.id} style={styles.card}>
              <Text style={styles.title}>{model.title}</Text>
              <Text style={styles.meta}>Source: {model.source.toUpperCase()} | License: {model.license}</Text>
              <Text style={styles.desc}>{model.description}</Text>
              <Text style={styles.req}>
                Requirements: {model.recommendedMinRamGB ?? '?'} GB RAM | {model.estimatedSizeGB ?? '?'} GB free storage
              </Text>
              {!!model.supportNote && <Text style={styles.note}>{model.supportNote}</Text>}

              {!!status?.message && (
                <Text style={styles.statusText}>
                  {status.message}
                  {status.state === 'downloading' ? ` (${status.progress}%)` : ''}
                </Text>
              )}

              <Pressable
                onPress={() => handleDownload(model)}
                style={[styles.downloadButton, downloading && styles.disabledButton]}
                disabled={downloading}
              >
                <View style={styles.buttonRow}>
                  <AppIcon name="download" size={14} color={colors.primaryButtonText} strokeWidth={2.2} />
                  <Text style={styles.downloadButtonText}>{downloading ? 'Downloading...' : 'Download'}</Text>
                </View>
              </Pressable>

              {downloading && (
                <Pressable
                  onPress={() => {
                    onCancelDownload(model.id).catch(() => undefined);
                  }}
                  style={styles.stopButton}
                >
                  <View style={styles.buttonRow}>
                    <AppIcon name="square" size={12} color={colors.dangerText} strokeWidth={2.2} />
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </View>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  inner: {
    paddingHorizontal: 12,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subheading: {
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stat: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  section: {
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chipBackground,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.chipActiveBackground,
    borderColor: colors.chipActiveBackground,
  },
  chipText: {
    color: colors.chipText,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.chipActiveText,
  },
  refreshButton: {
    marginTop: 12,
    backgroundColor: colors.primaryButtonBackground,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  refreshText: {
    color: colors.primaryButtonText,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  card: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    marginTop: 3,
    fontSize: 12,
  },
  desc: {
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  req: {
    color: colors.infoText,
    marginTop: 8,
    fontSize: 12,
  },
  note: {
    color: colors.successText,
    marginTop: 4,
    fontSize: 12,
  },
  statusText: {
    color: colors.infoText,
    marginTop: 6,
    fontSize: 12,
  },
  downloadButton: {
    marginTop: 10,
    backgroundColor: colors.primaryButtonBackground,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: colors.primaryButtonText,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  stopButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  stopButtonText: {
    color: colors.dangerText,
    fontWeight: '700',
  },
});
