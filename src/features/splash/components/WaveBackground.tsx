import styles from './WaveBackground.module.css';

/** Width of one tile of the wave in SVG units; the tile is drawn twice and slid by one tile per loop. */
const TILE_WIDTH = 1200;
const WAVE_HEIGHT = 100;
const AMPLITUDE = 20;
const BASELINE = 40;
/** Three full periods per tile (≈ the app's `width / 1.5` wavelength) so the loop is seamless. */
const PERIODS_PER_TILE = 3;
const STEP = 10;

function buildWavePath(): string {
  const width = TILE_WIDTH * 2;
  const points: string[] = [];
  for (let x = 0; x <= width; x += STEP) {
    const y = BASELINE + Math.sin((x / TILE_WIDTH) * PERIODS_PER_TILE * 2 * Math.PI) * AMPLITUDE;
    points.push(`${String(x)},${y.toFixed(1)}`);
  }
  return `M0,${String(WAVE_HEIGHT)} L${points.join(' L')} L${String(width)},${String(WAVE_HEIGHT)} Z`;
}

const WAVE_PATH = buildWavePath();

/** The splash screen's slow white sine wave (opacity .08, 4s loop) across the lower part of the screen. */
export function WaveBackground() {
  return (
    <div className={styles.wave} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox={`0 0 ${String(TILE_WIDTH * 2)} ${String(WAVE_HEIGHT)}`}
        preserveAspectRatio="none"
      >
        <path d={WAVE_PATH} />
      </svg>
      <div className={styles.fill} />
    </div>
  );
}
