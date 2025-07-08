"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeJsCube() {
    const mountRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        // Configure renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // Transparent background
        mountRef.current.appendChild(renderer.domElement);

        // Create cube geometry with a colorful material
        const geometry = new THREE.BoxGeometry(2, 2, 2);

        // Create materials for each face with different colors
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0xff6b6b }), // Red
            new THREE.MeshBasicMaterial({ color: 0x4ecdc4 }), // Teal
            new THREE.MeshBasicMaterial({ color: 0x45b7d1 }), // Blue
            new THREE.MeshBasicMaterial({ color: 0xfeca57 }), // Yellow
            new THREE.MeshBasicMaterial({ color: 0xff9ff3 }), // Pink
            new THREE.MeshBasicMaterial({ color: 0x54a0ff }), // Light Blue
        ];

        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        // Add some ambient lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Add a directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Position camera
        camera.position.z = 5;

        // Animation loop
        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);

            // Rotate the cube
            cube.rotation.x += 0.1;
            cube.rotation.y += 0.1;

            renderer.render(scene, camera);
        };

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        animate();

        // Cleanup
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            materials.forEach(material => material.dispose());
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 z-10"
            style={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',

            }}
        />
    );
}
