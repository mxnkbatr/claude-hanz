import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { chinaProgramsMeta } from "../data/content";
import { useI18n } from "../i18n/I18nContext";
import { SafeImage } from "./SafeImage";
import { ease } from "../lib/motion";

type CityId = (typeof chinaProgramsMeta)[number]["id"];

/** Map bounds covering Mongolia + China (rough equirectangular). */
const LON0 = 72;
const LON1 = 136;
const LAT0 = 17;
const LAT1 = 54;
const VB_W = 640;
const VB_H = 520;
const PAD = 16;

function project(lon: number, lat: number) {
  const x = PAD + ((lon - LON0) / (LON1 - LON0)) * (VB_W - PAD * 2);
  const y = PAD + ((LAT1 - lat) / (LAT1 - LAT0)) * (VB_H - PAD * 2);
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

function pathFrom(points: [number, number][]) {
  return points
    .map(([lon, lat], i) => {
      const { x, y } = project(lon, lat);
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ")
    .concat(" Z");
}

/** Recognizable simplified China mainland outline (lon, lat waypoints). */
const CHINA_OUTLINE: [number, number][] = [
  [122.5, 53.5], // Heilongjiang north
  [135.0, 48.5], // NE tip
  [131.0, 45.0],
  [125.0, 40.5], // Liaoning / Korea bay
  [122.0, 40.2],
  [121.0, 37.5], // Shandong tip
  [122.5, 31.2], // Jiangsu / Shanghai coast
  [121.5, 28.0],
  [120.0, 24.5], // Fujian
  [117.0, 23.0],
  [114.0, 22.2], // Guangdong
  [110.0, 21.5],
  [108.0, 21.8],
  [105.0, 22.5], // Guangxi / Vietnam border
  [102.0, 22.5],
  [98.0, 24.0], // Yunnan
  [97.5, 28.0],
  [92.0, 28.0], // Tibet south
  [88.0, 27.5],
  [80.0, 30.5],
  [78.5, 32.0],
  [75.0, 37.0], // Xinjiang west
  [74.0, 39.5],
  [76.0, 42.5],
  [80.0, 45.0],
  [87.0, 49.0], // NW
  [95.0, 48.5],
  [105.0, 46.5], // Inner Mongolia north edge
  [112.0, 45.5],
  [118.0, 47.5],
  [121.0, 50.5],
  [122.5, 53.5],
];

/** Simplified Mongolia outline. */
const MONGOLIA_OUTLINE: [number, number][] = [
  [88.0, 49.5],
  [92.0, 50.5],
  [100.0, 51.5],
  [108.0, 50.0],
  [116.0, 49.5],
  [119.5, 47.5],
  [116.0, 44.5],
  [110.0, 42.5],
  [104.0, 41.8],
  [96.0, 42.5],
  [90.0, 45.0],
  [88.0, 49.5],
];

const HAINAN: [number, number][] = [
  [108.6, 20.0],
  [111.0, 20.1],
  [111.0, 18.3],
  [109.0, 18.2],
  [108.6, 20.0],
];

const CITIES: Record<
  CityId | "ub",
  { lon: number; lat: number; label: "end" | "start" | "top" | "bottom" }
> = {
  ub: { lon: 106.92, lat: 47.92, label: "top" },
  bjfu: { lon: 116.4, lat: 39.9, label: "end" },
  nuaa: { lon: 118.8, lat: 32.06, label: "end" },
  cq: { lon: 106.55, lat: 29.56, label: "bottom" },
  sc: { lon: 104.07, lat: 30.57, label: "start" },
};

function labelAnchor(
  pt: { x: number; y: number },
  mode: "end" | "start" | "top" | "bottom",
) {
  switch (mode) {
    case "end":
      return { x: pt.x + 10, y: pt.y + 4, anchor: "start" as const };
    case "start":
      return { x: pt.x - 10, y: pt.y + 4, anchor: "end" as const };
    case "top":
      return { x: pt.x, y: pt.y - 12, anchor: "middle" as const };
    case "bottom":
      return { x: pt.x, y: pt.y + 18, anchor: "middle" as const };
  }
}

function flightPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mx = (from.x + to.x) / 2;
  const my = Math.min(from.y, to.y) - 28 - Math.abs(to.x - from.x) * 0.08;
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
}

export function ChinaMap() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<CityId>("bjfu");
  const program = chinaProgramsMeta.find((p) => p.id === active)!;

  const coords = useMemo(() => {
    const map = {} as Record<CityId | "ub", { x: number; y: number }>;
    (Object.keys(CITIES) as (CityId | "ub")[]).forEach((id) => {
      const c = CITIES[id];
      map[id] = project(c.lon, c.lat);
    });
    return map;
  }, []);

  const chinaPath = useMemo(() => pathFrom(CHINA_OUTLINE), []);
  const mongoliaPath = useMemo(() => pathFrom(MONGOLIA_OUTLINE), []);
  const hainanPath = useMemo(() => pathFrom(HAINAN), []);
  const ub = coords.ub;

  return (
    <section className="china-map">
      <div className="china-map-head">
        <p className="eyebrow">{t("map_eyebrow")}</p>
        <h2 className="h2">{t("map_title")}</h2>
        <p className="lead">{t("map_lead")}</p>
      </div>

      <div className="china-map-layout">
        <div className="china-map-svg-wrap">
          <svg
            className="china-map-svg"
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            role="img"
            aria-label={t("map_title")}
          >
            <defs>
              <linearGradient id="china-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff8f9" />
                <stop offset="100%" stopColor="#fde8eb" />
              </linearGradient>
              <linearGradient id="mn-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f3f1ec" />
                <stop offset="100%" stopColor="#e8e4dc" />
              </linearGradient>
              <filter id="map-soft" x="-8%" y="-8%" width="116%" height="116%">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="rgba(18,17,15,0.08)"
                />
              </filter>
            </defs>

            {/* Subtle grid */}
            <g className="china-map-grid" aria-hidden>
              {[0.2, 0.4, 0.6, 0.8].map((p) => (
                <line
                  key={`v${p}`}
                  x1={PAD + p * (VB_W - PAD * 2)}
                  y1={PAD}
                  x2={PAD + p * (VB_W - PAD * 2)}
                  y2={VB_H - PAD}
                />
              ))}
              {[0.25, 0.5, 0.75].map((p) => (
                <line
                  key={`h${p}`}
                  x1={PAD}
                  y1={PAD + p * (VB_H - PAD * 2)}
                  x2={VB_W - PAD}
                  y2={PAD + p * (VB_H - PAD * 2)}
                />
              ))}
            </g>

            <path
              className="china-map-mn"
              d={mongoliaPath}
              fill="url(#mn-fill)"
              filter="url(#map-soft)"
            />
            <path
              className="china-map-land"
              d={chinaPath}
              fill="url(#china-fill)"
              filter="url(#map-soft)"
            />
            <path className="china-map-island" d={hainanPath} fill="url(#china-fill)" />

            <text
              className="china-map-region"
              x={project(104, 46.2).x}
              y={project(104, 46.2).y}
              textAnchor="middle"
            >
              Mongolia
            </text>
            <text
              className="china-map-region china-map-region-cn"
              x={project(104, 35).x}
              y={project(104, 35).y}
              textAnchor="middle"
            >
              China
            </text>

            {chinaProgramsMeta.map((p) => {
              const to = coords[p.id];
              return (
                <motion.path
                  key={`line-${p.id}`}
                  d={flightPath(ub, to)}
                  className={`china-map-line${active === p.id ? " is-active" : ""}`}
                  fill="none"
                  initial={false}
                  animate={
                    reduce
                      ? { opacity: active === p.id ? 1 : 0.22 }
                      : {
                          pathLength: active === p.id ? 1 : 0.45,
                          opacity: active === p.id ? 1 : 0.22,
                        }
                  }
                  transition={{ duration: 0.55, ease }}
                />
              );
            })}

            <g className="china-map-ub">
              <circle cx={ub.x} cy={ub.y} r="5.5" className="china-map-ub-dot" />
              <text
                {...(() => {
                  const a = labelAnchor(ub, CITIES.ub.label);
                  return { x: a.x, y: a.y, textAnchor: a.anchor };
                })()}
                className="china-map-label"
              >
                {t("map_ub")}
              </text>
            </g>

            {chinaProgramsMeta.map((p) => {
              const c = coords[p.id];
              const lab = labelAnchor(c, CITIES[p.id].label);
              return (
                <g
                  key={p.id}
                  className={`china-map-city${active === p.id ? " is-active" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active === p.id}
                  aria-label={t(p.cityKey)}
                  onClick={() => setActive(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActive(p.id);
                    }
                  }}
                  onMouseEnter={() => {
                    if (window.matchMedia("(pointer: fine)").matches) {
                      setActive(p.id);
                    }
                  }}
                >
                  <circle cx={c.x} cy={c.y} r="18" className="china-map-pulse" />
                  <circle cx={c.x} cy={c.y} r="6.5" className="china-map-dot" />
                  <text
                    x={lab.x}
                    y={lab.y}
                    textAnchor={lab.anchor}
                    className="china-map-label"
                  >
                    {t(p.cityKey)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={program.id}
            className="china-map-card"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
          >
            <p className="eyebrow">{t(program.cityKey)}</p>
            <h3>
              {t(program.nameMnKey)}
              <span className="china-map-zh"> {t(program.nameZhKey)}</span>
            </h3>
            <p>{t(program.descKey)}</p>
            <span className="china-map-badge">{t("map_free_badge")}</span>
            <Link to="/contact" className="btn btn-seal china-map-cta">
              <span>{t("map_cta")}</span>
              <i aria-hidden>→</i>
            </Link>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="china-prog-grid">
        {chinaProgramsMeta.map((p) => (
          <article
            key={p.id}
            className={`china-prog-card${active === p.id ? " is-active" : ""}`}
            onMouseEnter={() => {
              if (window.matchMedia("(pointer: fine)").matches) setActive(p.id);
            }}
            onClick={() => setActive(p.id)}
          >
            <div className="china-prog-media">
              <SafeImage src={p.image} alt={t(p.nameMnKey)} />
            </div>
            <div className="china-prog-body">
              <p className="eyebrow">{t(p.cityKey)}</p>
              <h3>
                {t(p.nameMnKey)}
                <span className="china-map-zh"> {t(p.nameZhKey)}</span>
              </h3>
              <p>{t(p.descKey)}</p>
              <Link
                to="/contact"
                className="btn btn-seal"
                onClick={(e) => e.stopPropagation()}
              >
                <span>{t("view_detail")}</span>
                <i aria-hidden>→</i>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
