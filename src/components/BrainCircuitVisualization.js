import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Inline CSS styles
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    backgroundColor: '#0e152a', // Slightly darker for contrast
  },
  canvas: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
};

const AIHelixNetwork = ({ scaleFactor }) => {
  const groupRef = useRef();
  const nodeRefs = useRef([]);
  const lineRefs = useRef([]);
  const nodeCount = 50; // Increased for denser helix
  const connectionCount = 100; // Increased for more connections

  // Generate refined helix node positions with slight randomness
  const nodes = useMemo(() => {
    const positions = [];
    const radius = 2.7; // Slightly larger radius for better visibility
    const height = 7;
    for (let i = 0; i < nodeCount; i++) {
      const t = (i / (nodeCount - 1)) * Math.PI * 4.5; // Tighter helix
      const x = radius * Math.cos(t) * (1 + Math.random() * 0.1); // Slight random offset
      const y = (i / (nodeCount - 1)) * height - height / 2;
      const z = radius * Math.sin(t) * (1 + Math.random() * 0.1);
      positions.push({
        x: x,
        y: y,
        z: z,
        scale: 0.06 + Math.random() * 0.03, // Even smaller, refined dots
        glow: 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return positions;
  }, [nodeCount]);

  // Generate connections along the helix (end to end and some random)
  const connections = useMemo(() => {
    const conn = [];
    for (let i = 0; i < nodeCount - 1; i++) {
      conn.push({ start: [nodes[i].x, nodes[i].y, nodes[i].z], end: [nodes[i + 1].x, nodes[i + 1].y, nodes[i + 1].z], offset: i / nodeCount });
    }
    for (let i = 0; i < connectionCount - (nodeCount - 1); i++) {
      const node1 = nodes[Math.floor(Math.random() * nodeCount)];
      const node2 = nodes[Math.floor(Math.random() * nodeCount)];
      conn.push({ start: [node1.x, node1.y, node1.z], end: [node2.x, node2.y, node2.z], offset: Math.random() });
    }
    return conn;
  }, [nodeCount, connectionCount]);

  // Create material instances with refined properties
  const nodeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00cc99',
    transparent: true,
    opacity: 0.85,
    emissive: '#00cc99',
    emissiveIntensity: 0.6,
    metalness: 0.3, // Added for a subtle metallic sheen
    roughness: 0.7,
  }), []);

  const lineMaterial = useMemo(() => {
    const material = new THREE.LineDashedMaterial({
      color: '#00cc99',
      transparent: true,
      opacity: 0.65,
      dashSize: 0.1, // Finer dashes for smaller dots
      gapSize: 0.1,
      linewidth: 1.2, // Slightly thicker for visibility
      blending: THREE.AdditiveBlending,
    });
    return material;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004; // Smoother rotation speed
    }

    nodeRefs.current.forEach((node, i) => {
      if (node) {
        const nodeData = nodes[i];
        node.material.emissiveIntensity = 0.6 + Math.sin(time * 0.8 + nodeData.phase) * 0.25; // Smoother pulsing
      }
    });

    lineRefs.current.forEach((line, i) => {
      if (line) {
        const connData = connections[i];
        const dashOffset = (time * 0.35 + connData.offset) % 1; // Smoother end-to-end animation
        line.material.dashOffset = dashOffset;
        line.material.opacity = 0.65 + Math.sin(time * 0.7 + i * 0.15) * 0.15; // Smoother pulsing
        line.computeLineDistances();
      }
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh
          key={`node-${i}`}
          ref={(el) => (nodeRefs.current[i] = el)}
          position={[node.x, node.y, node.z]}
        >
          <sphereGeometry args={[node.scale, 16, 16]} />
          <primitive object={nodeMaterial.clone()} attach="material" />
        </mesh>
      ))}
      {connections.map((conn, i) => (
        <line
          key={`line-${i}`}
          ref={(el) => (lineRefs.current[i] = el)}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...conn.start, ...conn.end])}
              itemSize={3}
            />
          </bufferGeometry>
          <primitive object={lineMaterial.clone()} attach="material" />
        </line>
      ))}
    </group>
  );
};

const Background = () => {
  const meshRef = useRef();
  return (
    <mesh ref={meshRef} scale={[80, 80, 80]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        side={THREE.BackSide}
        color={new THREE.Color('#0e152a')}
      />
    </mesh>
  );
};

const AIHelixVisualization = ({ height = '100vh', width = '100vw' }) => {
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
        camera={{ position: [0, 0, 10], fov: 65 }} // Slightly wider field of view
        gl={{ antialias: true, alpha: true }} // Improved antialiasing
      >
        <ambientLight intensity={0.35} />
        <pointLight position={[5, 5, 5]} intensity={0.7} color="#00cc99" />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#00cc99" /> {/* Added second light for depth */}
        <Background />
        <AIHelixNetwork scaleFactor={scaleFactor} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={8}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={0.18} // Smoother rotation
        />
      </Canvas>
    </div>
  );
};

export default AIHelixVisualization;