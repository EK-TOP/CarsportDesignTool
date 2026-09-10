import { useEffect, useState } from 'react';
import { fetchVehicles } from './features/catalog/catalogApi.js';
import { VehicleViewer } from './features/vehicle-viewer/VehicleViewer.jsx';
import { useDesignerStore } from './store/designerStore.js';

export function App() {
  const { selectedVehicle, setSelectedVehicle } = useDesignerStore();
  const [vehicles, setVehicles] = useState([]);
  const [catalogState, setCatalogState] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();
    fetchVehicles(controller.signal)
      .then((items) => {
        setVehicles(items);
        setCatalogState('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setCatalogState('error');
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="designer-shell">
      <header>
        <p className="eyebrow">CARSPORT</p>
        <h1>Vehicle designer</h1>
        <p>Start a configuration and place compatible parts on your vehicle.</p>
      </header>
      <section className="workspace">
        <VehicleViewer />
        <aside className="panel">
          <h2>Configuration</h2>
          <label htmlFor="vehicle">Vehicle</label>
          <select id="vehicle" value={selectedVehicle ?? ''} onChange={(event) => setSelectedVehicle(event.target.value || null)} disabled={catalogState !== 'ready'}>
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
          </select>
          <p>{catalogState === 'loading' && 'Loading vehicle catalog...'}</p>
          <p>{catalogState === 'error' && 'Vehicle catalog is unavailable. Try again shortly.'}</p>
          <p>{catalogState === 'ready' && (selectedVehicle ? 'Ready to configure components.' : 'Choose a vehicle to begin.')}</p>
        </aside>
      </section>
    </main>
  );
}
