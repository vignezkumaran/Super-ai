import React from 'react';
import { Alert, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppIcon } from './src/components/AppIcon';
import { useAuth } from './src/hooks/useAuth';
import { useChat } from './src/hooks/useChat';
import { useSettings } from './src/hooks/useSettings';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { LocalModelsScreen } from './src/screens/LocalModelsScreen';
import { ProvidersScreen } from './src/screens/ProvidersScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { getColors, ResolvedTheme } from './src/theme/colors';
import { CLOUD_PROVIDER_MODELS } from './src/utils/constants';

const Tabs = createBottomTabNavigator();

const buildScreenOptions = (
  colors: ReturnType<typeof getColors>,
  { route }: { route: { name: string } },
) => ({
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.tabBackground,
    borderTopColor: colors.tabBorder,
  },
  tabBarActiveTintColor: colors.tabActive,
  tabBarInactiveTintColor: colors.tabInactive,
  tabBarIcon: ({ color, size }: { color: string; size: number }) => {
    if (route.name === 'Chat') {
      return <AppIcon name="message-circle" color={color} size={size} strokeWidth={2.2} />;
    }

    if (route.name === 'Providers') {
      return <AppIcon name="cloud" color={color} size={size} strokeWidth={2.2} />;
    }

    if (route.name === 'Local Models') {
      return <AppIcon name="hard-drive" color={color} size={size} strokeWidth={2.2} />;
    }

    return <AppIcon name="settings" color={color} size={size} strokeWidth={2.2} />;
  },
});

function App() {
  const systemScheme = useColorScheme();
  const { user, authLoading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOutAuth } = useAuth();

  const {
    settings,
    updateSettings,
    localModels,
    pullModel,
    openSourceModels,
    catalogLoading,
    refreshOpenSourceCatalog,
    downloadStates,
    downloadOpenSourceModel,
    cancelOpenSourceDownload,
    isLocalAvailable,
    loading,
    settingsError,
  } = useSettings();

  const {
    messages,
    conversations,
    isTyping,
    error,
    sendMessage,
    loadConversation,
    renameConversation,
    deleteConversation,
    clearAllConversations,
    startNewConversation,
  } = useChat(settings, isLocalAvailable);

  if (loading || authLoading) {
    return null;
  }

  const resolvedTheme: ResolvedTheme =
    settings.themeMode === 'system'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : settings.themeMode;
  const colors = getColors(resolvedTheme);
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {!user ? (
        <AuthScreen
          resolvedTheme={resolvedTheme}
          onEmailLogin={signInWithEmail}
          onEmailSignup={signUpWithEmail}
          onGoogleLogin={signInWithGoogle}
        />
      ) : (
      <NavigationContainer
        theme={
          isDarkMode
            ? DarkTheme
            : {
                ...DefaultTheme,
                colors: {
                  ...DefaultTheme.colors,
                  background: colors.background,
                },
              }
        }
      >
        <Tabs.Navigator
          screenOptions={route => buildScreenOptions(colors, route)}
        >
          <Tabs.Screen name="Chat">
            {() => (
              <ChatScreen
                resolvedTheme={resolvedTheme}
                messages={messages}
                conversations={conversations}
                cloudProvider={settings.cloudProvider}
                cloudModel={settings.cloudModel}
                cloudModelOptions={CLOUD_PROVIDER_MODELS[settings.cloudProvider]}
                isTyping={isTyping}
                isLocalAvailable={isLocalAvailable}
                error={error}
                onCloudModelChange={async model => {
                  await updateSettings({ cloudModel: model });
                }}
                onSend={sendMessage}
                onNewChat={startNewConversation}
                onSelectConversation={loadConversation}
                onRenameConversation={renameConversation}
                onDeleteConversation={deleteConversation}
              />
            )}
          </Tabs.Screen>

          <Tabs.Screen name="Local Models">
            {() => (
              <LocalModelsScreen
                resolvedTheme={resolvedTheme}
                models={openSourceModels}
                downloadStates={downloadStates}
                catalogLoading={catalogLoading}
                onRefreshCatalog={refreshOpenSourceCatalog}
                onDownload={downloadOpenSourceModel}
                onCancelDownload={cancelOpenSourceDownload}
              />
            )}
          </Tabs.Screen>

          <Tabs.Screen name="Providers">
            {() => (
              <ProvidersScreen
                resolvedTheme={resolvedTheme}
                settings={settings}
                onUpdate={updateSettings}
                appUserEmail={user?.email ?? ''}
              />
            )}
          </Tabs.Screen>
          <Tabs.Screen name="Settings">
            {() => (
              <SettingsScreen
                resolvedTheme={resolvedTheme}
                settings={settings}
                localModels={localModels}
                isLocalAvailable={isLocalAvailable}
                settingsError={settingsError}
                onUpdate={updateSettings}
                onPullModel={pullModel}
                onClearHistory={async () => {
                  Alert.alert('Clear all history?', 'This action cannot be undone.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: async () => {
                        await clearAllConversations();
                      },
                    },
                  ]);
                }}
                onSignOut={async () => {
                  await signOutAuth();
                }}
              />
            )}
          </Tabs.Screen>
        </Tabs.Navigator>
      </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

export default App;
