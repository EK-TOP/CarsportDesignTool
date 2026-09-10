import { VehicleViewer } from './features/vehicle-viewer/VehicleViewer.jsx';
import { useDesignerStore } from './store/designerStore.js';

export function App() {
  const { selectedVehicle, setSelectedVehicle } = useDesignerStore();

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
          <select id="vehicle" value={selectedVehicle ?? ''} onChange={(event) => setSelectedVehicle(event.target.value || null)}>
            <option value="">Select a vehicle</option>
            <option value="demo-sport">Demo Sport</option>
          </select>
          <p>{selectedVehicle ? 'Ready to configure components.' : 'Choose a vehicle to begin.'}</p>
        </aside>
      </section>
    </main>
  );
}
