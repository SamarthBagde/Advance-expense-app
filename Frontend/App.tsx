import { StatusBar } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import Home from './src/screen/Home';

function App() {

  return (
    <SafeAreaProvider>
      <StatusBar />
      <Home />
    </SafeAreaProvider>
  );
}

export default App;
