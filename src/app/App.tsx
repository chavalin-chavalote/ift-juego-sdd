import { useEffect, useState } from "react";
import { BigNumber } from "../core/numbers/BigNumber";
import { formatBigNumber } from "../core/numbers/format";
import { FarmScene } from "./FarmScene";
import { upgrades, useGameStore } from "./store";

export function App() {
  const [zoom, setZoom] = useState(62);
  const game = useGameStore((state) => state.game);
  const farm = useGameStore((state) => state.farm);
  const selectedId = useGameStore((state) => state.selectedParcelId);
  const floatingTexts = useGameStore((state) => state.floatingTexts);
  const tick = useGameStore((state) => state.tick);
  const clearFloatingText = useGameStore((state) => state.clearFloatingText);
  const parcel = farm.parcels.find((item) => item.id === selectedId);

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
  const parcelTitle = parcel?.stage === "blocked"
    ? "Parcela bloqueada"
    : parcel?.stage === "empty"
      ? "Parcela vacía"
      : `Tomate · ${parcel?.stage}`;

  return (
    <main
      className="game"
      onWheel={(event) => setZoom((current) => Math.max(38, Math.min(82, current - event.deltaY * 0.02)))}
    >
      <header className="hud">
        <div className="brand">Idle Farm</div>
        <div className="stat"><span>Dinero</span><strong>{money}</strong></div>
        <div className="stat"><span>Stock</span><strong>{farm.stock}</strong></div>
        <div className="stat"><span>Era</span><strong>1 · Manual</strong></div>
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
              <button onClick={() => useGameStore.getState().plant(parcel.id)}>Sembrar tomate · 0.5 $</button>
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
          <button className="sell" onClick={() => useGameStore.getState().sellStock()}>
            Transportar y vender · {farm.stock}
          </button>
        )}
      </aside>

      <aside className="upgrades">
        <h2>Mejoras</h2>
        <div className="upgrade-list">
          {upgrades.map((upgrade) => {
            const level = game.upgradeLevels[upgrade.id] ?? 0;
            const cost = BigNumber.from(upgrade.baseCost).mul(BigNumber.from(upgrade.growth).pow(level));
            return (
              <button
                className="upgrade-card"
                key={upgrade.id}
                onClick={() => useGameStore.getState().buyUpgrade(upgrade.id, 1)}
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
