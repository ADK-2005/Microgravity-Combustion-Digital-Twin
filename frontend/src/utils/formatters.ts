/**
 * ZeroG Flames — Numerical & Physical Units Formatters
 */

export function formatGravity(g: number): { gStr: string; ms2Str: string } {
  return {
    gStr: `${g.toFixed(2)} g`,
    ms2Str: `${(g * 9.80665).toFixed(2)} m/s²`,
  };
}

export function formatTemperature(k: number): string {
  return `${k.toFixed(1)} K`;
}

export function formatVelocity(ms: number): string {
  return `${ms.toFixed(3)} m/s`;
}

export function formatPressure(kpa: number): string {
  return `${kpa.toFixed(1)} kPa`;
}
