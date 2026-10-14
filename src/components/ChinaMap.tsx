import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { ease } from "../lib/motion";

type City = {
  id: string;
  cityKey: "map_beijing" | "map_chongqing" | "map_nanjing" | "map_chengdu";
  titleKey: "prog_bjfu_t" | "prog_cq_t" | "prog_nuaa_t" | "prog_sc_t";
  descKey: "prog_bjfu_d" | "prog_cq_d" | "prog_nuaa_d" | "prog_sc_d";
  x: number;
  y: number;
};

const UB = { x: 118, y: 52 };

const CITIES: City[] = [
  { id: "bjfu", cityKey: "map_beijing", titleKey: "prog_bjfu_t", descKey: "prog_bjfu_d", x: 168, y: 98 },
  { id: "cq", cityKey: "map_chongqing", titleKey: "prog_cq_t", descKey: "prog_cq_d", x: 148, y: 148 },
  { id: "nuaa", cityKey: "map_nanjing", titleKey: "prog_nuaa_t", descKey: "prog_nuaa_d", x: 188, y: 138 },
  { id: "sc", cityKey: "map_chengdu", titleKey: "prog_sc_t", descKey: "prog_sc_d", x: 128, y: 152 },
];

function curve(to: { x: number; y: number }) {
  const mx = (UB.x + to.x) / 2;
  const my = Math.min(UB.y, to.y) - 28;
  return `M${UB.x} ${UB.y} Q ${mx} ${my} ${to.x} ${to.y}`;
}

export function ChinaMap() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(CITIES[0].id);
  const city = CITIES.find((c) => c.id === active) ?? CITIES[0];

  return (
    <section className="china-map section">
      <div className="china-map-head">
        <p className="eyebrow">{t("map_eyebrow")}</p>
        <h2 className="h2">{t("map_title")}</h2>
        <p className="lead">{t("map_lead")}</p>
      </div>

      <div className="china-map-layout">
        <div className="china-map-svg-wrap">
          <svg
            className="china-map-svg"
            viewBox="0 0 280 220"
            role="img"
            aria-label={t("map_title")}
          >
            <defs>
              <linearGradient id="map-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="100%" stopColor="#fde8eb" />
              </linearGradient>
            </defs>

            {/* Simplified China outline */}
            <path
              className="china-map-land"
              d="M70 70 C90 40 140 35 175 45 C210 55 235 75 245 105 C255 140 240 170 210 185 C175 200 140 195 110 180 C80 165 55 140 50 110 C48 90 55 78 70 70 Z"
              fill="url(#map-fill)"
            />
            {/* Mongolia / UB region hint */}
            <path
              className="china-map-mn"
              d="M95 35 C120 22 150 25 165 40 C150 48 125 52 100 48 C92 42 92 38 95 35 Z"
            />

            {CITIES.map((c) => (
              <g key={c.id}>
                <motion.path
                  d={curve(c)}
                  className={`china-map-line${active === c.id ? " is-active" : ""}`}
                  fill="none"
                  initial={reduce ? false : { pathLength: 0, opacity: 0.2 }}
                  animate={
                    active === c.id
                      ? { pathLength: 1, opacity: 0.9 }
                      : { pathLength: 0.35, opacity: 0.25 }
                  }
                  transition={{ duration: 0.7, ease }}
                />
              </g>
            ))}

            <g className="china-map-ub">
              <circle cx={UB.x} cy={UB.y} r="5" className="china-map-ub-dot" />
              <text x={UB.x + 8} y={UB.y + 4} className="china-map-label">
                {t("map_ub")}
              </text>
            </g>

            {CITIES.map((c) => (
              <g
                key={c.id}
                className={`china-map-city${active === c.id ? " is-active" : ""}`}
                role="button"
                tabIndex={0}
                aria-pressed={active === c.id}
                aria-label={t(c.cityKey)}
                onClick={() => setActive(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(c.id);
                  }
                }}
                onMouseEnter={() => {
                  if (window.matchMedia("(pointer: fine)").matches) setActive(c.id);
                }}
                style={{ cursor: "pointer" }}
              >
                <circle cx={c.x} cy={c.y} r="14" className="china-map-pulse" />
                <circle cx={c.x} cy={c.y} r="5.5" className="china-map-dot" />
                <text x={c.x + 10} y={c.y + 4} className="china-map-label">
                  {t(c.cityKey)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={city.id}
            className="china-map-card"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
          >
            <p className="eyebrow">{t(city.cityKey)}</p>
            <h3>{t(city.titleKey)}</h3>
            <p>{t(city.descKey)}</p>
            <span className="china-map-badge">{t("map_free_badge")}</span>
            <Link to="/contact" className="btn btn-seal china-map-cta">
              <span>{t("map_cta")}</span>
              <i aria-hidden>→</i>
            </Link>
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
}
