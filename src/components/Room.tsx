import { useStore } from '../store/useStore';
import * as THREE from 'three';

export default function Room() {
  const { color, mapTheme } = useStore();

  if (mapTheme === 'minimal') {
    return (
      <group>
        {/* Soft, distraction-free lighting for pro training */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 10, 5]} intensity={0.5} />
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          {/* Flat matte gray, zero reflections */}
          <meshStandardMaterial color="#888888" roughness={1.0} metalness={0.0} />
        </mesh>
        <gridHelper args={[100, 100, '#666666', '#777777']} position={[0, -0.09, 0]} />
      </group>
    );
  }

  if (mapTheme === 'galaxy') {
    return (
      <group>
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#050010" roughness={0.2} metalness={0.8} />
        </mesh>
        <gridHelper args={[200, 40, '#221144', '#110022']} position={[0, -0.09, 0]} />
      </group>
    );
  }

  if (mapTheme === 'night') {
    return (
      <group>
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#050812" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  // DEFAULT: Cyber Arena (Aimlabs Style Neon Grid)
  return (
    <group>
      {/* Subtle ambient light matching your custom color */}
      <ambientLight color={color} intensity={0.2} />
      
      {/* Glowing wall cage */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[40, 20, 40]} />
        <meshBasicMaterial color={color} wireframe={true} transparent={true} opacity={0.15} side={THREE.BackSide} />
      </mesh>
      
      {/* Super dark glossy floor */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#020202" roughness={0.05} metalness={0.5} />
      </mesh>

      {/* Neon Floor Grid matched to user color */}
      <gridHelper args={[60, 30, color, '#111111']} position={[0, -0.09, 0]} />
    </group>
  );
}