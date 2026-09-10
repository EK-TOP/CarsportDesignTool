import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ArcRotateCamera, Color4, Engine, HemisphericLight, Scene, SceneLoader, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF/index.js';
import { getModelAssetUrl } from '../catalog/catalogApi.js';

const cameraPresets = {
  front: { alpha: Math.PI / 2, beta: Math.PI / 2.5, radius: 8 },
  side: { alpha: 0, beta: Math.PI / 2.5, radius: 8 },
  top: { alpha: Math.PI / 2, beta: 0.35, radius: 9 }
};

export function VehicleViewer({ vehicle }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelContainerRef = useRef(null);
  const [error, setError] = useState(null);
  const [viewerState, setViewerState] = useState('idle');

  useEffect(() => {
    let engine;
    let scene;

    try {
      engine = new Engine(canvasRef.current, true);
      scene = new Scene(engine);
      scene.clearColor = new Color4(0.04, 0.06, 0.1, 1);

      const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 8, Vector3.Zero(), scene);
      camera.attachControl(canvasRef.current, true);
      new HemisphericLight('ambient-light', new Vector3(0, 1, 0), scene);
      sceneRef.current = scene;
      cameraRef.current = camera;

      engine.runRenderLoop(() => scene.render());
    } catch {
      setError('The 3D viewer requires WebGL support from your browser and graphics device.');
    }
    const resize = () => engine.resize();
    if (engine) window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      scene?.dispose();
      engine?.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, []);

  const modelAssetId = vehicle?.assets?.find((asset) => asset.type === 'model')?.id;
  const modelAssetUri = modelAssetId ? getModelAssetUrl(modelAssetId) : null;

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;

    let cancelled = false;
    modelContainerRef.current?.dispose();
    modelContainerRef.current = null;

    if (!modelAssetUri) {
      setViewerState('idle');
      return undefined;
    }

    setError(null);
    setViewerState('loading');
    SceneLoader.LoadAssetContainerAsync('', modelAssetUri, scene)
      .then((container) => {
        if (cancelled) return container.dispose();

        container.addAllToScene();
        modelContainerRef.current = container;
        setViewerState('ready');
      })
      .catch((loadError) => {
        if (!cancelled) {
          console.error('Unable to load the selected vehicle model.', loadError);
          setError(`The vehicle model could not be loaded: ${loadError.message}`);
          setViewerState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [modelAssetUri]);

  function setCameraPreset(preset) {
    const camera = cameraRef.current;
    if (!camera) return;

    const target = cameraPresets[preset];
    camera.alpha = target.alpha;
    camera.beta = target.beta;
    camera.radius = target.radius;
    camera.target = Vector3.Zero();
  }

  return (
    <div className="viewer-container">
      <canvas ref={canvasRef} className="vehicle-viewer" aria-label="3D vehicle viewer" />
      {viewerState === 'idle' && !error && <p className="viewer-message">Select a vehicle to load its 3D model.</p>}
      {viewerState === 'loading' && <p className="viewer-message">Loading 3D vehicle model...</p>}
      {error && <p className="viewer-message viewer-error" role="alert">{error}</p>}
      {viewerState === 'ready' && <div className="camera-controls" aria-label="Camera presets"><button type="button" onClick={() => setCameraPreset('front')}>Front</button><button type="button" onClick={() => setCameraPreset('side')}>Side</button><button type="button" onClick={() => setCameraPreset('top')}>Top</button></div>}
    </div>
  );
}

VehicleViewer.propTypes = {
  vehicle: PropTypes.shape({
    assets: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      uri: PropTypes.string.isRequired
    })).isRequired
  })
};
