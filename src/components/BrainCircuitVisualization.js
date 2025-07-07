import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const NeuralHumanHead = () => {
  const mountRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('NeuralHumanHead: Starting initialization');

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

    // Create detailed human head geometry
    const createHumanHeadGeometry = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];

      // Enhanced head vertices with more anatomical detail
      const headVertices = [
        // Main head structure
        [0, 1.2, 0.3],      // 0 - top of head
        [-0.8, 1.0, 0.3],   // 1 - left temple
        [0.8, 1.0, 0.3],    // 2 - right temple
        [-0.9, 0.6, 0.3],   // 3 - left upper cheek
        [0.9, 0.6, 0.3],    // 4 - right upper cheek
        [-0.8, 0.2, 0.3],   // 5 - left mid cheek
        [0.8, 0.2, 0.3],    // 6 - right mid cheek
        [-0.7, -0.2, 0.3],  // 7 - left lower cheek
        [0.7, -0.2, 0.3],   // 8 - right lower cheek
        [-0.5, -0.6, 0.3],  // 9 - left jaw
        [0.5, -0.6, 0.3],   // 10 - right jaw
        [0, -0.8, 0.3],     // 11 - chin
        
        // Forehead details
        [-0.4, 0.9, 0.35],  // 12 - left forehead
        [0.4, 0.9, 0.35],   // 13 - right forehead
        [0, 1.0, 0.35],     // 14 - center forehead
        
        // Eye area
        [-0.3, 0.4, 0.4],   // 15 - left eye
        [0.3, 0.4, 0.4],    // 16 - right eye
        [-0.4, 0.5, 0.35],  // 17 - left brow
        [0.4, 0.5, 0.35],   // 18 - right brow
        
        // Nose structure
        [0, 0.2, 0.5],      // 19 - nose bridge
        [0, 0.0, 0.55],     // 20 - nose tip
        [-0.1, 0.0, 0.45],  // 21 - left nostril
        [0.1, 0.0, 0.45],   // 22 - right nostril
        
        // Mouth area
        [-0.2, -0.3, 0.4],  // 23 - left mouth
        [0.2, -0.3, 0.4],   // 24 - right mouth
        [0, -0.3, 0.45],    // 25 - center mouth
        [0, -0.4, 0.4],     // 26 - lower lip
        
        // Back of head
        [0, 1.2, -0.6],     // 27 - back top
        [-0.8, 1.0, -0.6],  // 28 - back left temple
        [0.8, 1.0, -0.6],   // 29 - back right temple
        [-0.9, 0.2, -0.5],  // 30 - back left
        [0.9, 0.2, -0.5],   // 31 - back right
        [0, -0.8, -0.5],    // 32 - back bottom
        
        // Side connections
        [-1.0, 0.4, 0.0],   // 33 - left ear area
        [1.0, 0.4, 0.0],    // 34 - right ear area
        
        // Additional detail points for smoother geometry
        [-0.6, 0.8, 0.4],   // 35 - left temple detail
        [0.6, 0.8, 0.4],    // 36 - right temple detail
        [-0.5, 0.0, 0.45],  // 37 - left cheek detail
        [0.5, 0.0, 0.45],   // 38 - right cheek detail
        [0, 0.6, 0.4],      // 39 - center face
        [0, -0.1, 0.5],     // 40 - nose base
        
        // Neck area
        [-0.3, -1.0, 0.2],  // 41 - left neck
        [0.3, -1.0, 0.2],   // 42 - right neck
        [0, -1.2, 0.1],     // 43 - neck bottom
      ];

      // Add vertices to array
      headVertices.forEach(vertex => {
        vertices.push(...vertex);
      });

      // Create triangular faces for the head
      const faceIndices = [
        // Top and forehead
        [0, 12, 14], [0, 14, 13], [0, 13, 2], [0, 1, 12],
        [12, 17, 35], [13, 36, 18], [14, 39, 19], [17, 15, 39],
        [18, 39, 16], [35, 3, 17], [36, 18, 4],
        
        // Eye and nose area
        [15, 19, 39], [16, 39, 19], [19, 20, 40], [20, 21, 22],
        [21, 23, 40], [22, 40, 24], [15, 37, 5], [16, 6, 38],
        
        // Mouth and jaw
        [23, 25, 26], [24, 26, 25], [25, 40, 26], [23, 7, 37],
        [24, 38, 8], [7, 9, 23], [8, 24, 10], [9, 11, 26],
        [10, 26, 11],
        
        // Side face
        [3, 5, 37], [4, 38, 6], [5, 7, 37], [6, 37, 8],
        [1, 33, 3], [2, 4, 34], [33, 30, 5], [34, 6, 31],
        
        // Back connections
        [0, 27, 28], [0, 28, 1], [0, 2, 29], [0, 29, 27],
        [33, 30, 28], [34, 29, 31], [9, 41, 11], [10, 11, 42],
        [11, 43, 41], [11, 42, 43],
        
        // Neck
        [41, 43, 42], [32, 30, 31], [30, 41, 9], [31, 10, 42],
        
        // Additional smoothing triangles
        [35, 39, 17], [36, 18, 39], [37, 40, 23], [38, 24, 40],
        [3, 33, 5], [4, 6, 34], [27, 32, 28], [29, 32, 27],
      
        [163, 165, 176], [164, 177, 166], [165, 167, 174], [166, 175, 168],
        [167, 169, 172], [168, 172, 170], [171, 172, 174], [171, 175, 172],
        
        // Complex facial feature connections
        [46, 47, 53], [47, 48, 49], [47, 50, 48], [49, 51, 57], [50, 58, 52],
        [60, 76, 78], [61, 79, 77], [68, 74, 57], [69, 58, 75], [72, 78, 95],
        [73, 96, 79], [83, 93, 91], [84, 92, 94], [85, 93, 95], [86, 94, 96],
        
        // Detailed orbital connections
        [28, 30, 38], [29, 39, 31], [30, 34, 44], [31, 45, 35], [34, 44, 36],
        [35, 37, 45], [38, 66, 40], [39, 41, 67], [40, 42, 91], [41, 92, 43],
        
        // Enhanced nasal bridge
        [27, 54, 26], [26, 53, 46], [54, 55, 53], [53, 56, 55], [55, 49, 57],
        [56, 58, 50], [57, 60, 93], [58, 94, 61], [59, 81, 80], [80, 82, 91],
        
        // Detailed mouth structure
        [81, 97, 87], [87, 88, 98], [87, 99, 89], [88, 95, 98], [89, 96, 99],
        [90, 111, 118], [98, 112, 108], [99, 109, 113], [111, 112, 113],
        
        // Enhanced cheekbone structure
        [62, 64, 66], [63, 67, 65], [64, 70, 68], [65, 69, 71], [66, 68, 74],
        [67, 75, 69], [70, 72, 100], [71, 101, 73], [100, 102, 72], [101, 73, 103],
        
        // Detailed mandible
        [102, 104, 116], [103, 117, 105], [104, 106, 114], [105, 115, 107],
        [114, 116, 108], [115, 109, 117], [106, 108, 112], [107, 113, 109],
        [110, 111, 119], [111, 118, 119], [112, 110, 119], [113, 119, 110],
        
        // Complex ear anatomy
        [120, 138, 122], [121, 123, 139], [122, 126, 124], [123, 125, 127],
        [124, 130, 136], [125, 137, 131], [126, 132, 128], [127, 129, 133],
        [128, 134, 130], [129, 131, 135], [132, 134, 133], [134, 135, 132],
        
        // Neck musculature
        [140, 149, 159], [141, 159, 150], [142, 151, 149], [143, 150, 152],
        [144, 153, 151], [145, 152, 154], [146, 155, 159], [147, 147, 156],
        [148, 158, 156], [153, 158, 179], [154, 179, 158], [156, 157, 179],
        
        // Additional anatomical details
        [169, 173, 172], [170, 172, 173], [174, 176, 163], [175, 164, 177],
        [176, 165, 167], [177, 166, 168], [178, 179, 173], [172, 173, 178],
        
        // Connecting complex regions
        [5, 62, 22], [6, 23, 63], [22, 64, 100], [23, 101, 65], [100, 120, 102],
        [101, 103, 121], [120, 140, 149], [121, 150, 141], [140, 144, 178],
        [141, 178, 145], [178, 179, 158], [179, 148, 158],
        
        // Fine detail connections for smooth topology
        [12, 16, 7], [13, 8, 17], [16, 18, 24], [17, 25, 19], [18, 22, 30],
        [19, 31, 23], [24, 28, 32], [25, 33, 29], [30, 38, 34], [31, 35, 39],
        [32, 36, 40], [33, 41, 37], [34, 42, 38], [35, 39, 43], [36, 44, 40],
        [37, 41, 45], [42, 36, 44], [43, 45, 37], [44, 97, 42], [45, 43, 97],
      ];

      // Add indices to array
      faceIndices.forEach(face => {
        indices.push(...face);
      });

      geometry.setIndex(indices);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();

      return geometry;
    };

    // Create head wireframe (removed - no visible wireframe)
    // const headGeometry = createHumanHeadGeometry();
    // const headMaterial = new THREE.MeshBasicMaterial({
    //   color: 0x00aaff,
    //   wireframe: true,
    //   transparent: true,
    //   opacity: 0.4
    // });
    // const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    // scene.add(headMesh);

    // Create invisible reference for rotation (no visual wireframe)
    const headMesh = { rotation: { y: 0 } }; // Create a simple object for rotation reference

    // Create particles distributed around the head shape
    const particleCount = 2500; // Increased from 1500 to 2500
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Create anatomically accurate head-shaped distribution
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      
      // Complex head shape with anatomical variations
      let radius = 0.7 + Math.random() * 0.5;
      
      // Anatomical head shape adjustments
      const y = Math.cos(phi);
      const x_norm = Math.sin(phi) * Math.cos(theta);
      const z_norm = Math.sin(phi) * Math.sin(theta);
      
      // Forehead area (wider, protruding)
      if (y > 0.4 && Math.abs(x_norm) < 0.7) {
        radius *= 1.1;
      }
      
      // Temple area (narrower)
      if (y > 0.2 && y < 0.6 && Math.abs(x_norm) > 0.6) {
        radius *= 0.85;
      }
      
      // Eye socket area (recessed)
      if (y > 0.0 && y < 0.4 && Math.abs(x_norm) < 0.5 && z_norm > 0.3) {
        radius *= 0.9;
      }
      
      // Cheekbone area (prominent)
      if (y > -0.2 && y < 0.2 && Math.abs(x_norm) > 0.4 && Math.abs(x_norm) < 0.8) {
        radius *= 1.05;
      }
      
      // Jaw area (strong definition)
      if (y > -0.6 && y < -0.2 && Math.abs(x_norm) > 0.3) {
        radius *= 0.95;
      }
      
      // Chin area (narrow and protruding)
      if (y < -0.4) {
        const chinFactor = 1 - Math.abs(x_norm) * 1.2;
        radius *= Math.max(0.6, chinFactor);
        if (Math.abs(x_norm) < 0.3) {
          radius *= 1.1; // Chin protrusion
        }
      }
      
      // Calculate final positions
      const x = radius * x_norm;
      const y_pos = radius * y;
      let z = radius * z_norm;
      
      // Face area enhancement (nose, mouth region)
      if (Math.abs(x) < 0.4 && y_pos > -0.5 && y_pos < 0.4 && z > 0) {
        // Nose protrusion
        if (Math.abs(x) < 0.15 && y_pos > -0.1 && y_pos < 0.3) {
          z += 0.3 + Math.random() * 0.2;
        }
        // General face protrusion
        else {
          z += 0.15 + Math.random() * 0.15;
        }
      }
      
      // Ear area
      if (Math.abs(x) > 0.8 && Math.abs(y_pos) < 0.3) {
        z *= 0.3; // Flatten ear area
        radius *= 0.9;
      }
      
      // Back of head (flatter)
      if (z < -0.2) {
        z *= 0.8;
      }
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y_pos;
      positions[i * 3 + 2] = z;
      
      // Enhanced neural colors with anatomical zones
      const brainActivity = Math.random();
      if (y_pos > 0.3) {
        // Frontal lobe - logic, reasoning (blue-cyan)
        colors[i * 3] = 0.1 + brainActivity * 0.2;     // R
        colors[i * 3 + 1] = 0.6 + brainActivity * 0.4; // G  
        colors[i * 3 + 2] = 1.0;                       // B
      } else if (Math.abs(x) > 0.6) {
        // Temporal lobe - memory, language (purple-blue)
        colors[i * 3] = 0.3 + brainActivity * 0.3;     // R
        colors[i * 3 + 1] = 0.2 + brainActivity * 0.3; // G
        colors[i * 3 + 2] = 1.0;                       // B
      } else if (y_pos < -0.2) {
        // Motor/sensory areas (green-blue)
        colors[i * 3] = 0.1;                           // R
        colors[i * 3 + 1] = 0.4 + brainActivity * 0.6; // G
        colors[i * 3 + 2] = 0.8 + brainActivity * 0.2; // B
      } else {
        // Parietal/occipital (cyan-white)
        colors[i * 3] = 0.2 + brainActivity * 0.3;     // R
        colors[i * 3 + 1] = 0.7 + brainActivity * 0.3; // G
        colors[i * 3 + 2] = 1.0;                       // B
      }
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.02, // Smaller for ultra-dense appearance
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
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

        if (distance < 0.3) { // Further reduced for performance with more particles
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
          
          const intensity = 1 - (distance / 0.3);
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
        opacity: 0.3,
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

    // Create moving neural orbs
    const orbCount = 30; // Increased from 20 to 30
    const orbs = [];
    for (let i = 0; i < orbCount; i++) {
      const orbGeometry = new THREE.SphereGeometry(0.01, 6, 6); // Smaller for more orbs
      const orbMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.5 + Math.random() * 0.3, 1, 0.8),
        transparent: true,
        opacity: 0.8
      });
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      
      // Position around head shape with more variety
      const angle = (i / orbCount) * Math.PI * 2 + Math.random() * 0.5;
      const height = -0.7 + Math.random() * 1.8; // Wider height range
      const radius = 1.0 + Math.random() * 0.4;
      
      orb.position.x = radius * Math.cos(angle) + (Math.random() - 0.5) * 0.2;
      orb.position.y = height + (Math.random() - 0.5) * 0.1;
      orb.position.z = radius * Math.sin(angle) * 0.7 + (Math.random() - 0.5) * 0.3;
      
      orb.userData = { 
        originalPos: orb.position.clone(),
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        orbitRadius: 0.08 + Math.random() * 0.12,
        verticalSpeed: 0.1 + Math.random() * 0.2
      };
      
      orbs.push(orb);
      scene.add(orb);
    }

    console.log('Scene objects created, starting animation');

    // Animation loop
    const animate = (time) => {
      try {
        // Rotate main objects
        if (headMesh) {
          headMesh.rotation.y = time * 0.0002;
        }
        particles.rotation.y = time * 0.0002;
        if (lines) {
          lines.rotation.y = time * 0.0002;
        }

        // Animate particle colors with neural activity
        const particleColors = particles.geometry.attributes.color.array;
        for (let i = 0; i < particleCount; i++) {
          const pulse = Math.sin(time * 0.003 + i * 0.1) * 0.3 + 0.7;
          const neuralActivity = Math.sin(time * 0.001 + i * 0.05) * 0.2 + 0.8;
          particleColors[i * 3] = 0.1 + Math.sin(time * 0.002 + i) * 0.1; // R
          particleColors[i * 3 + 1] = (0.5 + Math.random() * 0.3) * pulse * neuralActivity; // G
          particleColors[i * 3 + 2] = 1.0 * neuralActivity; // B
        }
        particles.geometry.attributes.color.needsUpdate = true;

        // Animate neural orbs with more complex motion
        orbs.forEach((orb, index) => {
          const { originalPos, speed, phase, orbitRadius, verticalSpeed } = orb.userData;
          
          // Create more complex orbital motion
          const orbitTime = time * 0.0005 * speed;
          const verticalTime = time * 0.0003 * verticalSpeed;
          
          orb.position.x = originalPos.x + Math.cos(orbitTime + phase) * orbitRadius;
          orb.position.y = originalPos.y + Math.sin(verticalTime + phase) * orbitRadius * 0.8;
          orb.position.z = originalPos.z + Math.sin(orbitTime + phase) * orbitRadius * 0.6;
          
          // Enhanced pulsing opacity
          orb.material.opacity = 0.5 + Math.sin(time * 0.005 + index * 0.2) * 0.3;
          
          // More dynamic color changes
          const hue = (0.5 + Math.sin(time * 0.0008 + index * 0.3) * 0.2) % 1;
          orb.material.color.setHSL(hue, 0.9 + Math.sin(time * 0.002 + index) * 0.1, 0.8);
        });

        // Optimize neural connection calculations for ultra-dense network
        if (lines) {
          const lineColorsArray = lines.geometry.attributes.color.array;
          const updateStep = 18; // Update every 18th connection for better performance
          for (let i = 0; i < lineColorsArray.length; i += updateStep) {
            const pulse = Math.sin(time * 0.003 + i * 0.008) * 0.4 + 0.5;
            const wave = Math.sin(time * 0.0015 + i * 0.015) * 0.3 + 0.4;
            const neural = Math.sin(time * 0.001 + i * 0.02) * 0.2 + 0.6;
            
            if (i + 1 < lineColorsArray.length) lineColorsArray[i + 1] = 0.7 * pulse * wave;     // G component
            if (i + 4 < lineColorsArray.length) lineColorsArray[i + 4] = 0.7 * pulse * wave;     // G component
            if (i + 2 < lineColorsArray.length) lineColorsArray[i + 2] = 1.0 * neural;           // B component
            if (i + 5 < lineColorsArray.length) lineColorsArray[i + 5] = 1.0 * neural;           // B component
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
      console.log('Cleaning up NeuralHumanHead');
      
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
      
      {/* Info overlay */}
      {/* <div 
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: '#00aaff',
          fontFamily: 'monospace',
          fontSize: '14px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '15px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 170, 255, 0.3)'
        }}
      >
        <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>ULTRA-DENSE NEURAL NETWORK</div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          • 2,500 neural particles<br/>
          • 30 orbital neural orbs<br/>
          • Brain region mapping<br/>
          • Ultra-dense synaptic networks<br/>
          • Real-time neural activity<br/>
          • Enhanced connectivity patterns<br/>
          • Maximum density visualization
        </div>
      </div>
       */}
      {/* Subtle overlay effect */}
      {/* <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(0deg, transparent 0%, rgba(0, 170, 255, 0.02) 50%, transparent 100%)',
          animation: 'pulse 6s ease-in-out infinite'
        }}
      /> */}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default NeuralHumanHead;