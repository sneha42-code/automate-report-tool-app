import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    backgroundColor: '#080c1a',
  },
  canvas: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
};

const HelixField = ({ scaleFactor }) => {
  const groupRef = useRef();
  const cubeRefs = useRef([]);
  const cubeCount = 100;

  const cubes = useMemo(() => {
    const positions = [];
    const radius = 3;
    const heightFactor = 0.15;
    const thetaMax = 8 * Math.PI;
    for (let i = 0; i < cubeCount; i++) {
      const t = i / (cubeCount - 1);
      const theta = t * thetaMax;
      const r = radius * (0.9 + Math.random() * 0.2);
      const x = r * Math.cos(theta) + (Math.random() - 0.5) * 0.15;
      const y = r * Math.sin(theta) + (Math.random() - 0.5) * 0.15;
      const z = theta * heightFactor + (Math.random() - 0.5) * 0.3;
      positions.push({
        x,
        y,
        z,
        scale: 0,
        opacity: 0,
        glow: 0.7,
        baseSize: 0.06 + Math.random() * 0.03,
        orbitSpeed: (Math.random() - 0.5) * 0.006,
        orbitRadius: Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.5 + Math.random() * 1.5,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        color: ['#facc15', '#60a5fa', '#f472b6', '#34d399'][Math.floor(Math.random() * 4)],
      });
    }
    return positions;
  }, [cubeCount]);

  const cubeMaterial = useMemo(() => (
    <meshBasicMaterial
      color="#ffffff"
      transparent
      opacity={0.2}
      blending={THREE.AdditiveBlending}
    />
  ), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.001;
      groupRef.current.rotation.y += 0.0005;
    }

    cubeRefs.current.forEach((cube, i) => {
      if (cube) {
        const cubeData = cubes[i];
        cubeData.scale = THREE.MathUtils.lerp(cubeData.scale, 1, 0.1);
        cubeData.opacity = THREE.MathUtils.lerp(cubeData.opacity, 1, 0.1);
        cubeData.glow = 0.8 + Math.sin(time * cubeData.twinkleSpeed + cubeData.phase) * 0.5;
        const angle = time * cubeData.orbitSpeed + cubeData.phase;
        cube.position.set(
          cubeData.x + Math.cos(angle) * cubeData.orbitRadius,
          cubeData.y + Math.sin(angle) * cubeData.orbitRadius,
          cubeData.z
        );
        const baseScale = cubeData.scale * cubeData.baseSize * (1 + cubeData.glow * 0.5) * scaleFactor;
        cube.scale.setScalar(baseScale);
        cube.material.opacity = cubeData.opacity * cubeData.glow;
        cube.material.color.set(cubeData.color);
        cube.rotation.x += cubeData.rotationSpeed * delta;
        cube.rotation.y += cubeData.rotationSpeed * delta;
        const flare = cube.children[0];
        if (flare) {
          flare.scale.setScalar(baseScale * 2.5 * (1 + Math.sin(time * 5 + cubeData.phase) * 0.3));
          flare.material.opacity = cubeData.opacity * 0.6 * cubeData.glow;
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {cubes.map((cube, i) => (
        <mesh
          key={i}
          ref={(el) => (cubeRefs.current[i] = el)}
          position={[cube.x, cube.y, cube.z]}
        >
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          {cubeMaterial}
          <mesh>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshBasicMaterial
              color={cube.color}
              transparent
              opacity={0.2}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </mesh>
      ))}
    </group>
  );
};

const Background = () => {
  const meshRef = useRef();
  return (
    <mesh ref={meshRef} scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial side={THREE.BackSide} color={new THREE.color('#080c1a')} />
    </mesh>
  );
};

const HelixGalaxy = ({ height = '100vh', width = '100vw' }) => {
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      setScaleFactor(width < 640 ? 0.6 : width < 1024 ? 0.8 : 1);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div style={{ ...styles.container, width, height }}>
      <Canvas
        style={styles.canvas}
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          if (!gl) {
            console.error('WebGL context not available.');
          } else {
            console.log('WebGL context initialized.');
          }
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#facc15" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#60a5fa" />
        <pointLight position={[0, 10, -10]} intensity={0.6} color="#f472b6" />
        <Background />
        <HelixField scaleFactor={scaleFactor} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={0.15}
        />
      </Canvas>
    </div>
  );
};

export default HelixGalaxy;