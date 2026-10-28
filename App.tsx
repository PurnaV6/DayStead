import { StatusBar } from 'expo-status-bar';
import { AppDataProvider } from './src/context/AppDataContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AppDataProvider>
      <RootNavigator />
      <StatusBar style="dark" />
    </AppDataProvider>
  );
}
