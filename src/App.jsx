//   src/App.jsx

// ----- Imports -----
import { TilesProvider } from './context/TilesContext';
import Dashboard from './pages/Dashboard/Dashboard';

// ----- Main -----
function App() {
  return (
    <TilesProvider>
      <Dashboard />
    </TilesProvider>
  );
}

export default App;