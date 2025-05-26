import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Inline CSS styles
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a', // Fallback background color
  },
  canvas: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
};

const CubeField = ({ scaleFactor }) => {
  const groupRef = useRef();
  const cubeRefs = useRef([]);
  const cubeCount = Math.floor(40); // Keeping this for performance

  // Generate cube positions and properties
  const cubes = useMemo(() => {
    const positions = [];
    const radius = 4.5;
    for (let i = 0; i < cubeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = radius * (0.5 + Math.random() * 0.7);
      positions.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        scale: 0,
        opacity: 0,
        glow: 0.5,
        baseSize: 0.08 + Math.random() * 0.06, // Kept the increased size
        orbitSpeed: (Math.random() - 0.5) * 0.012,
        orbitRadius: Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 2 + Math.random() * 3,
        rotationSpeed: (Math.random() - 0.5) * 0.02, // Added rotation for cubes
        color: ['#facc15', '#60a5fa', '#f472b6', '#34d399'][Math.floor(Math.random() * 4)],
      });
    }
    return positions;
  }, [cubeCount]);

  // Material for cubes
  const cubeMaterial = useMemo(() => (
    <meshBasicMaterial
      color="#ffffff"
      transparent
      opacity={0}
      blending={THREE.AdditiveBlending}
    />
  ), []);

  // Animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }

    cubeRefs.current.forEach((cube, i) => {
      if (cube) {
        const cubeData = cubes[i];
        cubeData.scale = THREE.MathUtils.lerp(cubeData.scale, 1, 0.1);
        cubeData.opacity = THREE.MathUtils.lerp(cubeData.opacity, 0.9, 0.1);
        cubeData.glow = 0.6 + Math.sin(time * cubeData.twinkleSpeed + cubeData.phase) * 0.4;
        const angle = time * cubeData.orbitSpeed + cubeData.phase;
        cube.position.set(
          cubeData.x + Math.cos(angle) * cubeData.orbitRadius,
          cubeData.y + Math.sin(angle) * cubeData.orbitRadius,
          cubeData.z
        );
        const baseScale = cubeData.scale * cubeData.baseSize * (1 + cubeData.glow * 0.4) * 1.5;
        cube.scale.setScalar(baseScale);
        cube.material.opacity = cubeData.opacity * cubeData.glow;
        cube.material.color.set(cubeData.color);
        // Add rotation to cubes
        cube.rotation.x += cubeData.rotationSpeed * delta;
        cube.rotation.y += cubeData.rotationSpeed * delta;
        const flare = cube.children[0];
        if (flare) {
          flare.scale.setScalar(baseScale * 2.5 * (1 + Math.sin(time * 6 + cubeData.phase) * 0.3));
          flare.material.opacity = cubeData.opacity * 0.5 * cubeData.glow;
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
          <boxGeometry args={[0.2, 0.2, 0.2]} /> {/* Cube geometry, increased size */}
          {cubeMaterial}
          <mesh>
            <boxGeometry args={[0.48, 0.48, 0.48]} /> {/* Flare as a larger cube */}
            <meshBasicMaterial
              color={cube.color}
              transparent
              opacity={0}
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
    <mesh ref={meshRef} scale={[80, 80, 80]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial side={THREE.BackSide} color={new THREE.Color('#0f172a')} />
    </mesh>
  );
};

const SparklingStarfield = ({ height = '100vh', width = '100vw' }) => {
  const [scaleFactor, setScaleFactor] = useState(1);

  // Responsive scaling
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
        camera={{ position: [0, 0, 9], fov: 50 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          if (!gl) {
            console.error('WebGL context not available. Ensure WebGL is enabled in your browser.');
          } else {
            console.log('WebGL context initialized successfully.');
          }
        }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[7, 7, 7]} intensity={0.6} color="#facc15" />
        <pointLight position={[-7, -7, -7]} intensity={0.6} color="#60a5fa" />
        <Background />
        <CubeField scaleFactor={scaleFactor} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={6}
          maxDistance={14}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};

export default SparklingStarfield;  