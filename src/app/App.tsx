import { useEffect, useState } from "react";
import { BigNumber } from "../core/numbers/BigNumber";
import { formatBigNumber } from "../core/numbers/format";
import { levelCost } from "../core/economy/Economy";
import { FarmScene } from "./FarmScene";
import { upgrades, useGameStore } from "./store";
import tomateIcon from "../assets/2d/tomate-SD.png";

export function App() {
  const [zoom, setZoom] = useState(62);
  const [purchaseQuantity, setPurchaseQuantity] = useState<1 | 10 | 25 | "max">(1);
  const game = useGameStore((state) => state.game);
  const farm = useGameStore((state) => state.farm);
  const selectedId = useGameStore((state) => state.selectedParcelId);
  const floatingTexts = useGameStore((state) => state.floatingTexts);
  const tick = useGameStore((state) => state.tick);
  const clearFloatingText = useGameStore((state) => state.clearFloatingText);
  const parcel = farm.parcels.find((item) => item.id === selectedId);
  const warehouseLevel = game.upgradeLevels.warehouse ?? 0;
  const truckCapacityLevel = game.upgradeLevels.truck_capacity ?? 0;
  const storageCapacity = Math.floor(40 * (1 + warehouseLevel * 0.25))
    + farm.shedLevel * 20 + farm.boxesLevel * 10;
  const truckCapacity = 20 + truckCapacityLevel * 10;
  const cropNames = { tomato: "Tomate", lettuce: "Lechuga", carrot: "Zanahoria", potato: "Patata" };
  const cropCosts = { tomato: "0.5", lettuce: "0.3", carrot: "0.4", potato: "1" };
  const workerCount = (role: "planting" | "watering" | "harvesting") =>
    farm.workers.filter((worker) => worker.role === role).length;

  useEffect(() => {
    const timer = window.setInterval(() => tick(0.1), 100);
    return () => window.clearInterval(timer);
  }, [tick]);

  useEffect(() => {
    const timers = floatingTexts.map((item) =>
      window.setTimeout(() => clearFloatingText(item.id), 1300),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [floatingTexts, clearFloatingText]);

  const money = formatBigNumber(BigNumber.from(game.money));
  const parcelTitle = !parcel
    ? "Granja"
    : parcel.stage === "blocked"
      ? "Parcela bloqueada"
      : parcel.stage === "empty"
        ? "Parcela vacía"
        : `${cropNames[farm.selectedCrop]} · ${parcel.stage}`;
  const nextUpgrade = upgrades
    .map((upgrade) => {
      const level = game.upgradeLevels[upgrade.id] ?? 0;
      return { upgrade, level, cost: levelCost(
        { baseCost: upgrade.baseCost, growth: upgrade.growth, maxLevel: upgrade.maxLevel },
        level,
      ) };
    })
    .sort((left, right) => left.cost.cmp(right.cost))[0];

  return (
    <main
      className="game"
      onWheel={(event) => setZoom((current) => Math.max(38, Math.min(82, current - event.deltaY * 0.02)))}
    >
      <header className="hud">
        <div className="brand"><img src={tomateIcon} alt="" width="20" height="20"/>   Idle Farm</div>
        <div className="stat"><span>Dinero</span><strong>{money}</strong></div>
        <div className="stat"><span>Almacén</span><strong>{farm.stock}/{storageCapacity}</strong></div>
        <div className="stat"><span>Camión</span><strong>{farm.truckStatus === "available" ? `${truckCapacity} máx.` : `${farm.truckCargo} · ${Math.ceil(farm.truckRemainingSeconds)}s`}</strong></div>
        <div className="stat"><span>Era</span><strong>{game.eraIndex} · {game.eraIndex === 1 ? "Manual" : "Pequeña granja"}</strong></div>
      </header>

      <section className="world">
        <FarmScene zoom={zoom} />
        <div className="zoom-controls">
          <button onClick={() => setZoom((value) => Math.max(38, value - 6))} aria-label="Alejar">−</button>
          <button onClick={() => setZoom((value) => Math.min(82, value + 6))} aria-label="Acercar">+</button>
        </div>
        {floatingTexts.map((item) => (
          <div className={`floating ${item.kind}`} key={item.id}>{item.text}</div>
        ))}
      </section>

      <aside className="context-panel">
        <h2>{parcelTitle}</h2>
        {parcel && (
          <>
            {parcel.stage === "blocked" && (
              <button onClick={() => useGameStore.getState().unlockParcel(parcel.id)}>
                Comprar parcela · {25 + parcel.id * 5} $
              </button>
            )}
            {parcel.stage === "empty" && (
              <button onClick={() => useGameStore.getState().plant(parcel.id)}>
                Sembrar {cropNames[farm.selectedCrop].toLowerCase()} · {cropCosts[farm.selectedCrop]} $
              </button>
            )}
            {(parcel.stage === "seed" || parcel.stage === "sprout") && (
              <button onClick={() => useGameStore.getState().water(parcel.id)}>Regar</button>
            )}
            {parcel.stage === "growing" && (
              <div className="progress">
                <span>Crecimiento</span>
                <div><i style={{ width: `${parcel.progress * 100}%` }} /></div>
              </div>
            )}
            {parcel.stage === "mature" && (
              <button onClick={() => useGameStore.getState().harvest(parcel.id)}>Cosechar</button>
            )}
          </>
        )}
        {!parcel && <p>Selecciona una parcela para verla.</p>}
        {farm.stock > 0 && (
          <button
            className="sell"
            disabled={farm.truckStatus !== "available"}
            onClick={() => useGameStore.getState().sendTruck()}
          >
            {farm.truckStatus === "available"
              ? `Enviar camión · ${Math.min(farm.stock, truckCapacity)} tomates`
              : `Camión en ruta · vuelve en ${Math.ceil(farm.truckRemainingSeconds)}s`}
          </button>
        )}
      </aside>

      <aside className="upgrades">
        <h2>Mejoras</h2>
        {game.eraIndex === 1 && (
          <button
            className="era-transition"
            disabled={BigNumber.from(game.money).cmp(BigNumber.from("500")) < 0}
            onClick={() => useGameStore.getState().enterEraTwo()}
          >
            Avanzar a Era 2 · 500 $
          </button>
        )}
        {game.eraIndex >= 2 && (
          <div className="era-automation">
            <h3>Pequeña granja</h3>
            <div className="crop-selector" aria-label="Cultivo activo">
              {(["tomato", "lettuce", "carrot", "potato"] as const).map((crop) => (
                <button
                  key={crop}
                  className={farm.selectedCrop === crop ? "active" : ""}
                  onClick={() => useGameStore.getState().setCrop(crop)}
                >
                  {cropNames[crop]}
                </button>
              ))}
            </div>
            <div className="automation-grid">
              <button onClick={() => useGameStore.getState().hireWorker("planting")}>
                Contratar siembra <b>{workerCount("planting")}</b>
              </button>
              <button onClick={() => useGameStore.getState().hireWorker("watering")}>
                Contratar riego <b>{workerCount("watering")}</b>
              </button>
              <button onClick={() => useGameStore.getState().hireWorker("harvesting")}>
                Contratar cosecha <b>{workerCount("harvesting")}</b>
              </button>
              <button onClick={() => useGameStore.getState().upgradeSprinkler()}>
                Aspersor <b>Lv. {farm.sprinklerLevel}</b>
              </button>
            </div>
            <div className="building-grid">
              <button onClick={() => useGameStore.getState().upgradeBuilding("shed")}>
                Cobertizo <b>Lv. {farm.shedLevel}</b>
              </button>
              <button onClick={() => useGameStore.getState().upgradeBuilding("boxes")}>
                Cajas <b>Lv. {farm.boxesLevel}</b>
              </button>
            </div>
          </div>
        )}
        {nextUpgrade && (
          <div className="next-objective">
            <span>Siguiente objetivo cercano</span>
            <strong>{nextUpgrade.upgrade.name} · {formatBigNumber(nextUpgrade.cost)} $</strong>
          </div>
        )}
        <div className="quantity-controls" aria-label="Cantidad de compra">
          {(["1", "10", "25", "max"] as const).map((quantity) => (
            <button
              key={quantity}
              className={purchaseQuantity === (quantity === "max" ? "max" : Number(quantity)) ? "active" : ""}
              onClick={() => setPurchaseQuantity(quantity === "max" ? "max" : Number(quantity) as 1 | 10 | 25)}
            >
              {quantity === "max" ? "Máx" : `x${quantity}`}
            </button>
          ))}
        </div>
        <div className="upgrade-list">
          {upgrades.map((upgrade) => {
            const level = game.upgradeLevels[upgrade.id] ?? 0;
            const cost = BigNumber.from(upgrade.baseCost).mul(BigNumber.from(upgrade.growth).pow(level));
            return (
              <button
                className="upgrade-card"
                key={upgrade.id}
                onClick={() => useGameStore.getState().buyUpgrade(upgrade.id, purchaseQuantity)}
              >
                <span>
                  <strong>{upgrade.name}</strong>
                  <small>{upgrade.description}</small>
                </span>
                <b>Lv. {level}</b>
                <em>{formatBigNumber(cost)} $</em>
              </button>
            );
          })}
        </div>
      </aside>
    </main>
  );
}
