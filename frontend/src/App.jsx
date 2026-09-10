import { useEffect, useState } from 'react';
import { fetchVehicle, fetchVehicles } from './features/catalog/catalogApi.js';
import { VehicleViewer } from './features/vehicle-viewer/VehicleViewer.jsx';
import { useDesignerStore } from './store/designerStore.js';

export function App() {
  const { selectedVehicle, setSelectedVehicle } = useDesignerStore();
  const [vehicles, setVehicles] = useState([]);
  const [catalogState, setCatalogState] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [selectedVehicleDetail, setSelectedVehicleDetail] = useState(null);
  const [vehicleState, setVehicleState] = useState('idle');

  useEffect(() => {
    const controller = new AbortController();
    setCatalogState('loading');
    fetchVehicles(controller.signal)
      .then((items) => {
        setVehicles(items);
        setCatalogState('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setCatalogState('error');
      });

    return () => controller.abort();
  }, [retryCount]);

  useEffect(() => {
    if (!selectedVehicle) {
      setSelectedVehicleDetail(null);
      setVehicleState('idle');
      return undefined;
    }

    const controller = new AbortController();
    setVehicleState('loading');
    fetchVehicle(selectedVehicle, controller.signal)
      .then((vehicle) => {
        setSelectedVehicleDetail(vehicle);
        setVehicleState('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setVehicleState('error');
      });

    return () => controller.abort();
  }, [selectedVehicle]);

  return (
    <main className="designer-shell">
      <header>
        <p className="eyebrow">CARSPORT</p>
        <h1>Vehicle designer</h1>
        <p>Start a configuration and place compatible parts on your vehicle.</p>
      </header>
      <section className="workspace">
        <VehicleViewer vehicle={selectedVehicleDetail} />
        <aside className="panel">
          <h2>Configuration</h2>
          <label htmlFor="vehicle">Vehicle</label>
          <select id="vehicle" value={selectedVehicle ?? ''} onChange={(event) => setSelectedVehicle(event.target.value || null)} disabled={catalogState !== 'ready'}>
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
          </select>
          <p>{catalogState === 'loading' && 'Loading vehicle catalog...'}</p>
          {catalogState === 'error' && <><p>Vehicle catalog is unavailable. Try again shortly.</p><button type="button" onClick={() => setRetryCount((count) => count + 1)}>Retry catalog</button></>}
          <p>{catalogState === 'ready' && (selectedVehicle ? 'Ready to configure components.' : 'Choose a vehicle to begin.')}</p>
          <p>{vehicleState === 'loading' && 'Loading vehicle details...'}</p>
          <p>{vehicleState === 'error' && 'Vehicle details are unavailable. Select the vehicle again to retry.'}</p>
          {selectedVehicleDetail && <><h3>{selectedVehicleDetail.name}</h3><p>{selectedVehicleDetail.parts.length} compatible parts available.</p></>}
        </aside>
      </section>
    </main>
  );
}
