import { useEffect, useRef } from 'react';
import { ArcRotateCamera, Color4, Engine, HemisphericLight, Scene, Vector3 } from '@babylonjs/core';

export function VehicleViewer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.04, 0.06, 0.1, 1);

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 8, Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);
    new HemisphericLight('ambient-light', new Vector3(0, 1, 0), scene);

    engine.runRenderLoop(() => scene.render());
    const resize = () => engine.resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="vehicle-viewer" aria-label="3D vehicle viewer" />;
}
