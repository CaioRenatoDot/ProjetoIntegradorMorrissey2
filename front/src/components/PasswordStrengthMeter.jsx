import { motion } from "motion/react";
import {
  evaluatePassword,
  getMissingRequirement,
  getStrengthLabel,
} from "../utils/passwordStrength";

const SEGMENT_COLORS = {
  1: "bg-red-500",
  2: "bg-amber-500",
  3: "bg-yellow-400",
  4: "bg-[#00c030]",
};

const LABEL_COLORS = {
  1: "text-red-300",
  2: "text-amber-300",
  3: "text-yellow-200",
  4: "text-[#7ee895]",
};

export default function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const { checks, score } = evaluatePassword(password);
  const missing = getMissingRequirement(checks);

  return (
    <div className="mt-2">
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <div
            className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800"
            key={segment}
          >
            <motion.div
              animate={{ scaleX: segment <= score ? 1 : 0 }}
              className={`h-full origin-left ${SEGMENT_COLORS[score] || "bg-zinc-700"}`}
              initial={false}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>

      <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <p
          aria-live="polite"
          className={`text-xs font-bold ${LABEL_COLORS[score] || "text-slate-400"}`}
        >
          Password strength: {getStrengthLabel(score)}
        </p>
        {missing && <p className="text-xs text-slate-500">{missing}</p>}
      </div>
    </div>
  );
}
