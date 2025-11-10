import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeDBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 50;

    // Create animated objects
    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.1, 8, 8);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 1, 0.5),
        emissive: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 1, 0.3),
        metalness: 0.5,
        roughness: 0.5,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (Math.random() - 0.5) * 100;
      mesh.position.y = (Math.random() - 0.5) * 100;
      mesh.position.z = (Math.random() - 0.5) * 100;

      mesh.velocity = {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5,
      };

      scene.add(mesh);
      particles.push(mesh);
    }

    // Add lights
    const light1 = new THREE.PointLight(0x0088ff, 100, 300);
    light1.position.set(50, 50, 50);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xff0088, 80, 300);
    light2.position.set(-50, -50, 50);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      particles.forEach((particle) => {
        particle.position.x += particle.velocity.x;
        particle.position.y += particle.velocity.y;
        particle.position.z += particle.velocity.z;

        particle.rotation.x += 0.01;
        particle.rotation.y += 0.01;

        // Wrap around
        if (particle.position.x > 60) particle.position.x = -60;
        if (particle.position.x < -60) particle.position.x = 60;
        if (particle.position.y > 60) particle.position.y = -60;
        if (particle.position.y < -60) particle.position.y = 60;
        if (particle.position.z > 60) particle.position.z = -60;
        if (particle.position.z < -60) particle.position.z = 60;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
};

export default ThreeDBackground;
