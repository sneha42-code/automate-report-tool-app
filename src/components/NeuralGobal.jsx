import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const NeuralGobal = () => {
  const mountRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('NeuralGobal: Starting initialization');

    // Get container dimensions
    const container = mountRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 600;

    console.log('Container dimensions:', width, 'x', height);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a15);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Add canvas to container
    container.appendChild(renderer.domElement);
    console.log('Canvas added to container');

    // Create head wireframe
    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const headMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(headMesh);

    // Create particles
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute points around sphere
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const radius = 0.9 + Math.random() * 0.3;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Blue colors
      colors[i * 3] = 0.1 + Math.random() * 0.3;     // R
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.5; // G
      colors[i * 3 + 2] = 1.0;                       // B
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Create connection lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    const lineColors = [];

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const distance = Math.sqrt(
          Math.pow(positions[i * 3] - positions[j * 3], 2) +
          Math.pow(positions[i * 3 + 1] - positions[j * 3 + 1], 2) +
          Math.pow(positions[i * 3 + 2] - positions[j * 3 + 2], 2)
        );

        if (distance < 0.5) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
          
          const intensity = 1 - (distance / 0.5);
          lineColors.push(
            0.2 * intensity, 0.6 * intensity, 1.0 * intensity,
            0.2 * intensity, 0.6 * intensity, 1.0 * intensity
          );
        }
      }
    }

    let lines = null;
    if (linePositions.length > 0) {
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });

      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00aaff, 1, 100);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // Create moving orbs
    const orbCount = 8;
    const orbs = [];
    for (let i = 0; i < orbCount; i++) {
      const orbGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const orbMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
      });
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      
      // Random position on sphere surface
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      orb.position.x = 1.1 * Math.sin(theta) * Math.cos(phi);
      orb.position.y = 1.1 * Math.sin(theta) * Math.sin(phi);
      orb.position.z = 1.1 * Math.cos(theta);
      
      orb.userData = { 
        originalPos: orb.position.clone(),
        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
      };
      
      orbs.push(orb);
      scene.add(orb);
    }

    console.log('Scene objects created, starting animation');

    // Animation loop
    const animate = (time) => {
      try {
        // Rotate main objects
        headMesh.rotation.y = time * 0.0003;
        particles.rotation.y = time * 0.0003;
        if (lines) {
          lines.rotation.y = time * 0.0003;
        }

        // Animate particle colors
        const particleColors = particles.geometry.attributes.color.array;
        for (let i = 0; i < particleCount; i++) {
          const pulse = Math.sin(time * 0.002 + i * 0.1) * 0.3 + 0.7;
          particleColors[i * 3 + 1] = (0.5 + Math.random() * 0.5) * pulse;
        }
        particles.geometry.attributes.color.needsUpdate = true;

        // Animate orbs
        orbs.forEach((orb, index) => {
          const { originalPos, speed, phase } = orb.userData;
          const offset = Math.sin(time * 0.001 * speed + phase) * 0.1;
          orb.position.copy(originalPos).multiplyScalar(1 + offset);
          orb.material.opacity = 0.5 + Math.sin(time * 0.003 + index) * 0.3;
        });

        // Animate lines
        if (lines) {
          const lineColorsArray = lines.geometry.attributes.color.array;
          for (let i = 0; i < lineColorsArray.length; i += 6) {
            const pulse = Math.sin(time * 0.001 + i * 0.01) * 0.2 + 0.3;
            lineColorsArray[i + 1] = 0.6 * pulse;
            lineColorsArray[i + 4] = 0.6 * pulse;
          }
          lines.geometry.attributes.color.needsUpdate = true;
        }

        renderer.render(scene, camera);
        frameRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Animation error:', error);
      }
    };

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      
      const newWidth = container.clientWidth || 500;
      const newHeight = container.clientHeight || 600;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    animate(0);
    console.log('Animation started');

    // Cleanup function
    return () => {
      console.log('Cleaning up NeuralGobal');
      
      window.removeEventListener('resize', handleResize);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      // Dispose of Three.js resources
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
      
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // Empty dependency array

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, #0a0a15 0%, #1a1a2e 50%, #16213e 100%)',
        boxSizing: 'border-box'
      }}
    >
      <div 
        ref={mountRef} 
        style={{
          width: '100%',
          height: '100%',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          cursor: 'grab',
          boxSizing: 'border-box'
        }}
      />
      
      {/* Subtle overlay effect */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(0deg, transparent 0%, rgba(0, 170, 255, 0.03) 50%, transparent 100%)',
          animation: 'pulse 4s ease-in-out infinite'
        }}
      />
    </div>
  );
};

export default NeuralGobal;