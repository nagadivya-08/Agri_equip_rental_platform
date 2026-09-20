import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeAgriculturalBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0e1f15, 0.035);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 4.5, 9);
    camera.lookAt(0, 1.2, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xd4edda, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffdf88, 2.2);
    sunLight.position.set(12, 18, 10);
    scene.add(sunLight);

    const rimLight = new THREE.PointLight(0x48bb78, 1.5, 25);
    rimLight.position.set(-8, 6, -4);
    scene.add(rimLight);

    // 5. Rolling Agricultural Field (Terrain)
    const terrainGeo = new THREE.PlaneGeometry(60, 60, 64, 64);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const wave1 = Math.sin(x * 0.18 + z * 0.12) * 0.8;
      const wave2 = Math.cos(x * 0.08 - z * 0.15) * 1.1;
      const furrow = Math.sin(x * 1.5) * 0.15; // furrow crop rows
      pos.setY(i, wave1 + wave2 + furrow - 1.5);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshLambertMaterial({
      color: 0x194d33,
      wireframe: false,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrain);

    // Secondary wireframe overlay for tech/modern precision agricultural aesthetic
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x52b788,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const terrainWire = new THREE.Mesh(terrainGeo, wireMat);
    terrainWire.position.y += 0.02;
    scene.add(terrainWire);

    // 6. Agricultural Machinery (Combine / Tractor Model Group)
    const machineryGroup = new THREE.Group();

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.3,
      metalness: 0.4,
    });
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c, // Brand amber/gold accents
      roughness: 0.2,
      metalness: 0.6,
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1b2021,
      roughness: 0.7,
      metalness: 0.8,
    });

    // Main Body Block
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 3.8), bodyMat);
    mainBody.position.y = 1.8;
    machineryGroup.add(mainBody);

    // Cabin Glass & Top
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.5, 2.0), cabinMat);
    cabin.position.set(0, 2.8, -0.4);
    machineryGroup.add(cabin);

    const cabinRoof = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 2.3), darkSteelMat);
    cabinRoof.position.set(0, 3.65, -0.4);
    machineryGroup.add(cabinRoof);

    // Hood / Engine Front
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.8), bodyMat);
    hood.position.set(0, 1.7, 1.8);
    machineryGroup.add(hood);

    // Exhaust Stack
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 12), darkSteelMat);
    exhaust.position.set(0.7, 3.1, 1.2);
    machineryGroup.add(exhaust);

    // Heavy Tread Wheels
    const bigWheelGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.75, 20);
    bigWheelGeo.rotateZ(Math.PI / 2);
    const smallWheelGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 20);
    smallWheelGeo.rotateZ(Math.PI / 2);

    const rearLeft = new THREE.Mesh(bigWheelGeo, darkSteelMat);
    rearLeft.position.set(-1.45, 1.2, -1.2);
    const rearRight = new THREE.Mesh(bigWheelGeo, darkSteelMat);
    rearRight.position.set(1.45, 1.2, -1.2);

    const frontLeft = new THREE.Mesh(smallWheelGeo, darkSteelMat);
    frontLeft.position.set(-1.35, 0.8, 1.8);
    const frontRight = new THREE.Mesh(smallWheelGeo, darkSteelMat);
    frontRight.position.set(1.35, 0.8, 1.8);

    machineryGroup.add(rearLeft, rearRight, frontLeft, frontRight);

    // Front Heavy Equipment Blade / Reel
    const reelGeo = new THREE.CylinderGeometry(0.4, 0.4, 3.4, 16);
    reelGeo.rotateZ(Math.PI / 2);
    const reelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const frontReel = new THREE.Mesh(reelGeo, reelMat);
    frontReel.position.set(0, 0.6, 3.1);
    machineryGroup.add(frontReel);

    // Position tractor on the left side of the screen
    let machineryBaseX = (container.clientWidth || window.innerWidth) < 850 ? 0 : -3.3;
    machineryGroup.position.set(machineryBaseX, 0.4, 0.2);
    machineryGroup.rotation.y = machineryBaseX === 0 ? -Math.PI / 5 : -Math.PI / 6.5;
    scene.add(machineryGroup);

    // 7. Ambient Floating Wheat / Bio Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 25;
      particlePositions[i + 1] = Math.random() * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfcd34d,
      size: 0.14,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 8. Interactive Mouse / Touch Parallax
    let targetCameraX = 0;
    let targetCameraY = 4.5;

    const onPointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const mouseX = (clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (clientY / window.innerHeight - 0.5) * 2;
      targetCameraX = mouseX * 1.5;
      targetCameraY = 4.5 - mouseY * 0.8;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    // 9. Resize Handler
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      machineryBaseX = width < 850 ? 0 : -3.3;
    };

    window.addEventListener('resize', onResize);

    // 10. Animation Loop
    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Gentle floating and subtle slow rotation for machinery on the left
      const baseAngle = machineryBaseX === 0 ? -Math.PI / 5 : -Math.PI / 6.5;
      machineryGroup.rotation.y = baseAngle + Math.sin(time * 0.4) * 0.1;
      machineryGroup.position.x = machineryBaseX;
      machineryGroup.position.y = 0.4 + Math.sin(time * 0.8) * 0.08;
      frontReel.rotation.x += 0.025;

      // Particle gentle upward & lateral drift
      const pPos = particleGeo.attributes.position.array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pPos[i] += 0.012;
        if (pPos[i] > 9) pPos[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Smooth camera easing
      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY - camera.position.y) * 0.04;
      camera.lookAt(0, 1.4, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('resize', onResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Geometries & materials cleanup
      terrainGeo.dispose();
      terrainMat.dispose();
      wireMat.dispose();
      bodyMat.dispose();
      cabinMat.dispose();
      darkSteelMat.dispose();
      bigWheelGeo.dispose();
      smallWheelGeo.dispose();
      reelGeo.dispose();
      reelMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="three-bg-canvas-wrapper"
      aria-hidden="true"
    />
  );
};

export default ThreeAgriculturalBackground;
