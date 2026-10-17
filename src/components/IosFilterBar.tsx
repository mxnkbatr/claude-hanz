import { LayoutGroup, motion } from "framer-motion";
import { hapticLight } from "../lib/native";
import { navSpring } from "../lib/motion";

export type IosFilterOption = {
  id: string;
  label: string;
  count?: number;
};

type Props = {
  options: IosFilterOption[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  layoutId?: string;
  showClear?: boolean;
  clearLabel?: string;
  onClear?: () => void;
};

export function IosFilterBar({
  options,
  value,
  onChange,
  ariaLabel,
  layoutId = "ios26-filter-pill",
  showClear = false,
  clearLabel,
  onClear,
}: Props) {
  return (
    <div className="ios26-filter">
      <LayoutGroup id={layoutId}>
        <div
          className="ios26-filter-track"
          role="tablist"
          aria-label={ariaLabel}
        >
          {options.map((opt) => {
            const active = value === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`ios26-filter-chip${active ? " is-active" : ""}`}
                onClick={() => {
                  onChange(opt.id);
                  void hapticLight();
                }}
              >
                {active && (
                  <motion.span
                    className="ios26-filter-pill"
                    layoutId={layoutId}
                    transition={navSpring}
                  />
                )}
                <span className="ios26-filter-label">{opt.label}</span>
                {typeof opt.count === "number" && (
                  <em className="ios26-filter-count">{opt.count}</em>
                )}
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {showClear && onClear && clearLabel && (
        <button
          type="button"
          className="ios26-filter-clear"
          onClick={() => {
            onClear();
            void hapticLight();
          }}
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
