
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Decal, useTexture, Center, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { ProductType } from '../types';

interface ThreeDViewerProps {
  logo: string;
  product: ProductType;
}

const ProductModel: React.FC<ThreeDViewerProps> = ({ logo, product }) => {
  const texture = useTexture(logo);

  const geometry = useMemo(() => {
    switch (product) {
      case 'mug':
        return new THREE.CylinderGeometry(1.2, 1.2, 2.8, 32);
      case 't-shirt':
      case 'hoodie':
        return new THREE.BoxGeometry(3, 4, 0.4);
      case 'poster':
        return new THREE.PlaneGeometry(3, 4);
      case 'tote-bag':
        return new THREE.BoxGeometry(2.5, 3, 0.2);
      case 'phone-case':
        return new THREE.BoxGeometry(1.5, 3, 0.3);
      case 'sticker':
        return new THREE.CylinderGeometry(1, 1, 0.05, 32);
      case 'cap':
      case 'hat':
        return new THREE.SphereGeometry(1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5);
      default:
        return new THREE.BoxGeometry(2, 2, 2);
    }
  }, [product]);

  const decalPosition: [number, number, number] = useMemo(() => {
    switch (product) {
      case 'mug': return [0, 0, 1.2];
      case 't-shirt': return [0, 0.5, 0.2];
      case 'hoodie': return [0, 0.2, 0.2];
      case 'cap':
      case 'hat': return [0, 0.8, 0.8];
      case 'poster': return [0, 0, 0.01];
      case 'tote-bag': return [0, 0, 0.1];
      case 'phone-case': return [0, 0, 0.16];
      case 'sticker': return [0, 0.03, 0];
      default: return [0, 0, 1];
    }
  }, [product]);

  const decalScale: [number, number, number] = useMemo(() => {
    switch (product) {
      case 'mug': return [1.2, 1.2, 1.2];
      case 'cap':
      case 'hat': return [0.8, 0.8, 0.8];
      case 'tote-bag': return [1.5, 1.5, 1.5];
      case 'phone-case': return [1, 1.5, 1];
      case 'sticker': return [1.5, 1.5, 1.5];
      default: return [2, 2, 2];
    }
  }, [product]);

  const materialProps = useMemo(() => {
    switch (product) {
      case 'mug':
      case 'phone-case':
        return { roughness: 0.1, metalness: 0.2, color: '#ffffff' };
      case 't-shirt':
      case 'hoodie':
      case 'tote-bag':
      case 'cap':
      case 'hat':
        return { roughness: 0.8, metalness: 0, color: '#f0f0f0' };
      case 'poster':
        return { roughness: 0.5, metalness: 0, color: '#ffffff' };
      case 'sticker':
        return { roughness: 0.2, metalness: 0.1, color: '#ffffff' };
      default:
        return { roughness: 0.5, metalness: 0.1, color: '#ffffff' };
    }
  }, [product]);

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh geometry={geometry}>
        <meshStandardMaterial {...materialProps} />
        <Decal
          position={decalPosition}
          rotation={[0, 0, 0]}
          scale={decalScale}
          map={texture}
        />
      </mesh>
    </Float>
  );
};

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ logo, product }) => {
  return (
    <div className="w-full h-full relative cursor-move">
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 25 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffd700" />
        
        <Suspense fallback={null}>
          <Center top>
            <ProductModel logo={logo} product={product} />
          </Center>
          <Environment preset="city" />
          <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={5} 
          maxDistance={15} 
          autoRotate 
          autoRotateSpeed={1}
        />
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live 3D Preview</span>
        </div>
      </div>
    </div>
  );
};

export default ThreeDViewer;
