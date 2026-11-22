import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useGameStore } from "./store";

interface ParcelMeshProps {
  readonly id: number;
  readonly x: number;
  readonly z: number;
}

function Tomato({ stage }: { readonly stage: "seed" | "sprout" | "growing" | "mature" }) {
  const sizes = stage === "seed" ? 0.08 : stage === "sprout" ? 0.16 : stage === "growing" ? 0.28 : 0.38;
  const fruit = stage === "mature";
  return (
    <group position={[0, sizes * 0.5 + 0.12, 0]}>
      <mesh castShadow>
        <coneGeometry args={[sizes, sizes * 1.8, 6]} />
        <meshStandardMaterial color={stage === "seed" ? "#9a6a3e" : "#5e9c45"} roughness={0.85} />
      </mesh>
      {fruit && (
        <>
          <mesh position={[0.14, sizes * 0.65, 0]} castShadow>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial color="#df3b2f" roughness={0.65} />
          </mesh>
          <mesh position={[-0.12, sizes * 0.55, 0.05]} castShadow>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial color="#e84a32" roughness={0.65} />
          </mesh>
        </>
      )}
    </group>
  );
}

function ParcelMesh({ id, x, z }: ParcelMeshProps) {
  const parcel = useGameStore((state) => state.farm.parcels.find((item) => item.id === id));
  const selected = useGameStore((state) => state.selectedParcelId === id);
  const selectParcel = useGameStore((state) => state.selectParcel);
  if (!parcel) return null;

  const soil = parcel.stage === "blocked" ? "#6a6a69" : selected ? "#8e5c35" : "#76503a";
  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectParcel(id);
  };

  return (
    <group position={[x, 0, z]}>
      <mesh receiveShadow onClick={onClick} position={[0, 0, 0]}>
        <boxGeometry args={[0.82, parcel.stage === "blocked" ? 0.08 : 0.14, 0.82]} />
        <meshStandardMaterial color={soil} roughness={1} />
      </mesh>
      {parcel.stage !== "blocked" && parcel.stage !== "empty" && (
        <Tomato stage={parcel.stage as "seed" | "sprout" | "growing" | "mature"} />
      )}
      {parcel.stage === "seed" && (
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial color="#c29b62" />
        </mesh>
      )}
      {selected && (
        <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.43, 24]} />
          <meshBasicMaterial color="#ffd75a" />
        </mesh>
      )}
    </group>
  );
}

function DeliveryTruck() {
  const truckStatus = useGameStore((state) => state.farm.truckStatus);
  const remaining = useGameStore((state) => state.farm.truckRemainingSeconds);
  const trip = useGameStore((state) => state.farm.truckTripSeconds);
  const progress = truckStatus === "in_transit" && trip > 0
    ? 1 - remaining / trip
    : 0;
  const position: [number, number, number] = truckStatus === "in_transit"
    ? [2.8 - progress * 5.6, 0.32, 3.15]
    : [3.05, 0.32, 3.15];

  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[0.62, 0.38, 0.88]} />
        <meshStandardMaterial color={truckStatus === "in_transit" ? "#e58a32" : "#4d8238"} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.27, 0.5]}>
        <boxGeometry args={[0.62, 0.32, 0.28]} />
        <meshStandardMaterial color="#bcd4d6" roughness={0.4} />
      </mesh>
      {[-0.36, 0.36].map((x) => (
        <mesh key={x} position={[x, -0.05, 0.25]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.08, 12]} />
          <meshStandardMaterial color="#30302f" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function FarmScene({ zoom }: { readonly zoom: number }) {
  const parcels = useGameStore((state) => state.farm.parcels);
  const positions = useMemo(() => parcels.map((parcel) => ({ id: parcel.id, x: parcel.x, z: parcel.z })), [parcels]);

  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [7, 7, 7], zoom, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#98b879"]} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[5, 10, 6]} intensity={2.2} castShadow />
      <mesh receiveShadow position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#75a84d" />
      </mesh>
      {positions.map((position) => (
        <ParcelMesh key={position.id} {...position} />
      ))}
      <DeliveryTruck />
    </Canvas>
  );
}
