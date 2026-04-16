interface IconProps {
  color?: string
  size?: number
}

/** 지도 아이콘 */
export function MapIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="3" width="12" height="10" fill={color} />
      <rect x="5" y="3" width="1" height="10" fill="rgba(0,0,0,0.2)" />
      <rect x="10" y="3" width="1" height="10" fill="rgba(0,0,0,0.2)" />
      <path d="M2 3L5 5V15L2 13V3Z" fill="rgba(255,255,255,0.1)" transform="translate(0,-2)" />
    </svg>
  )
}

/** 지구본/월드 아이콘 */
export function GlobeIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="2" width="8" height="12" fill={color} />
      <rect x="2" y="4" width="12" height="8" fill={color} />
      <rect x="6" y="2" width="4" height="12" fill="rgba(0,0,0,0.15)" />
      <rect x="2" y="6" width="12" height="4" fill="rgba(0,0,0,0.15)" />
      <rect x="7" y="1" width="2" height="1" fill={color} />
      <rect x="7" y="14" width="2" height="1" fill={color} />
      <rect x="1" y="7" width="1" height="2" fill={color} />
      <rect x="14" y="7" width="1" height="2" fill={color} />
    </svg>
  )
}

/** 퀘스트 탭 — 픽셀 검 */
export function SwordIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="7" y="0" width="2" height="6" fill={color} />
      <rect x="2" y="6" width="12" height="2" fill={color} />
      <rect x="7" y="8" width="2" height="4" fill={color} />
      <rect x="5" y="12" width="6" height="3" fill={color} />
    </svg>
  )
}

/** 일기 탭 — 픽셀 책 */
export function BookIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="7" y="1" width="2" height="13" fill={color} />
      <rect x="1" y="2" width="6" height="11" fill={color} />
      <rect x="9" y="2" width="6" height="11" fill={color} />
      <rect x="0" y="13" width="16" height="2" fill={color} />
      <rect x="2" y="5" width="4" height="1" fill="rgba(0,0,0,0.25)" />
      <rect x="2" y="7" width="4" height="1" fill="rgba(0,0,0,0.25)" />
      <rect x="2" y="9" width="3" height="1" fill="rgba(0,0,0,0.25)" />
      <rect x="10" y="5" width="4" height="1" fill="rgba(0,0,0,0.25)" />
      <rect x="10" y="7" width="4" height="1" fill="rgba(0,0,0,0.25)" />
      <rect x="10" y="9" width="3" height="1" fill="rgba(0,0,0,0.25)" />
    </svg>
  )
}

/** 통계 탭 — 픽셀 막대그래프 */
export function ChartIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="0" y="14" width="16" height="2" fill={color} />
      <rect x="1" y="10" width="3" height="4" fill={color} />
      <rect x="6" y="4" width="4" height="10" fill={color} />
      <rect x="12" y="7" width="3" height="7" fill={color} />
    </svg>
  )
}

/** 설정 탭 — 픽셀 기어 */
export function GearIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="4" y="4" width="8" height="8" fill={color} />
      <rect x="6" y="1" width="4" height="3" fill={color} />
      <rect x="6" y="12" width="4" height="3" fill={color} />
      <rect x="1" y="6" width="3" height="4" fill={color} />
      <rect x="12" y="6" width="3" height="4" fill={color} />
      <rect x="6" y="6" width="4" height="4" fill="rgba(0,0,0,0.45)" />
    </svg>
  )
}

/** 스트릭 카드 — 픽셀 불꽃 */
export function FlameIcon({ color = '#ff8a3d', innerColor, size = 20 }: IconProps & { innerColor?: string }) {
  const inner = innerColor ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="7" y="0" width="2" height="2" fill={color} />
      <rect x="6" y="2" width="4" height="2" fill={color} />
      <rect x="5" y="4" width="6" height="2" fill={color} />
      <rect x="4" y="6" width="8" height="2" fill={color} />
      <rect x="3" y="8" width="10" height="2" fill={color} />
      <rect x="2" y="10" width="12" height="4" fill={color} />
      <rect x="6" y="6" width="4" height="2" fill={inner} opacity={0.6} />
      <rect x="5" y="8" width="6" height="4" fill={inner} opacity={0.4} />
    </svg>
  )
}

/** 보상 카드 — 픽셀 상자 */
export function BoxIcon({ color = '#ffe792', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="1" y="8" width="14" height="7" fill={color} />
      <rect x="0" y="5" width="16" height="4" fill={color} />
      <rect x="7" y="5" width="2" height="10" fill="rgba(0,0,0,0.28)" />
      <rect x="0" y="8" width="16" height="2" fill="rgba(0,0,0,0.28)" />
      <rect x="3" y="2" width="4" height="4" fill={color} />
      <rect x="9" y="2" width="4" height="4" fill={color} />
      <rect x="7" y="3" width="2" height="2" fill="rgba(0,0,0,0.28)" />
    </svg>
  )
}

/** 별 — 8방향 스파클 스타 (⭐ ★) */
export function StarIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* vertical */}
      <rect x="7" y="0" width="2" height="16" fill={color} />
      {/* horizontal */}
      <rect x="0" y="7" width="16" height="2" fill={color} />
      {/* diagonal dots */}
      <rect x="3" y="3" width="2" height="2" fill={color} />
      <rect x="11" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="11" width="2" height="2" fill={color} />
      <rect x="11" y="11" width="2" height="2" fill={color} />
      {/* center */}
      <rect x="5" y="5" width="6" height="6" fill={color} />
    </svg>
  )
}

/** 자물쇠 — 픽셀 패드락 (🔒) */
export function LockIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* shackle */}
      <rect x="5" y="0" width="6" height="2" fill={color} />
      <rect x="4" y="0" width="2" height="7" fill={color} />
      <rect x="10" y="0" width="2" height="7" fill={color} />
      {/* body */}
      <rect x="1" y="7" width="14" height="8" fill={color} />
      {/* keyhole */}
      <rect x="6" y="10" width="4" height="2" fill="rgba(0,0,0,0.45)" />
      <rect x="7" y="12" width="2" height="2" fill="rgba(0,0,0,0.45)" />
    </svg>
  )
}

/** 트로피 — 픽셀 컵 (🏆) */
export function TrophyIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* cup body */}
      <rect x="4" y="0" width="8" height="9" fill={color} />
      {/* handles */}
      <rect x="1" y="1" width="3" height="5" fill={color} />
      <rect x="12" y="1" width="3" height="5" fill={color} />
      {/* stem */}
      <rect x="6" y="9" width="4" height="3" fill={color} />
      {/* base */}
      <rect x="3" y="12" width="10" height="2" fill={color} />
      <rect x="2" y="14" width="12" height="2" fill={color} />
    </svg>
  )
}

/** 힌트 — 픽셀 전구 (💡) */
export function HintIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* bulb top */}
      <rect x="5" y="0" width="6" height="2" fill={color} />
      {/* bulb body */}
      <rect x="3" y="2" width="10" height="6" fill={color} />
      <rect x="4" y="8" width="8" height="2" fill={color} />
      {/* base (screw) */}
      <rect x="5" y="10" width="6" height="2" fill={color} />
      <rect x="6" y="12" width="4" height="2" fill={color} />
      <rect x="6" y="14" width="4" height="2" fill={color} />
    </svg>
  )
}

/** 재시도 — 픽셀 순환 화살표 (🔁) */
export function RetryIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* top arc */}
      <rect x="5" y="0" width="6" height="2" fill={color} />
      <rect x="3" y="2" width="2" height="2" fill={color} />
      <rect x="11" y="2" width="2" height="2" fill={color} />
      {/* sides */}
      <rect x="1" y="4" width="2" height="6" fill={color} />
      <rect x="13" y="4" width="2" height="6" fill={color} />
      {/* bottom arc */}
      <rect x="3" y="10" width="2" height="2" fill={color} />
      <rect x="5" y="12" width="6" height="2" fill={color} />
      {/* arrow head (right side pointing down) */}
      <rect x="11" y="10" width="5" height="2" fill={color} />
      <rect x="12" y="8" width="3" height="2" fill={color} />
    </svg>
  )
}

/** 노트/문서 — 픽셀 노트패드 (📝/📖) */
export function NoteIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* paper body */}
      <rect x="2" y="0" width="12" height="16" fill={color} />
      {/* text lines */}
      <rect x="4" y="4" width="8" height="1" fill="rgba(0,0,0,0.3)" />
      <rect x="4" y="7" width="8" height="1" fill="rgba(0,0,0,0.3)" />
      <rect x="4" y="10" width="8" height="1" fill="rgba(0,0,0,0.3)" />
      <rect x="4" y="13" width="5" height="1" fill="rgba(0,0,0,0.3)" />
      {/* folded corner */}
      <rect x="11" y="0" width="3" height="3" fill="rgba(0,0,0,0.25)" />
    </svg>
  )
}

/** 표적 — 픽셀 과녁 (🎯) */
export function TargetIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* outer ring edges */}
      <rect x="4" y="0" width="8" height="2" fill={color} />
      <rect x="4" y="14" width="8" height="2" fill={color} />
      <rect x="0" y="4" width="2" height="8" fill={color} />
      <rect x="14" y="4" width="2" height="8" fill={color} />
      {/* outer corners */}
      <rect x="2" y="2" width="2" height="2" fill={color} />
      <rect x="12" y="2" width="2" height="2" fill={color} />
      <rect x="2" y="12" width="2" height="2" fill={color} />
      <rect x="12" y="12" width="2" height="2" fill={color} />
      {/* crosshair bars */}
      <rect x="7" y="0" width="2" height="5" fill={color} />
      <rect x="7" y="11" width="2" height="5" fill={color} />
      <rect x="0" y="7" width="5" height="2" fill={color} />
      <rect x="11" y="7" width="5" height="2" fill={color} />
      {/* center dot */}
      <rect x="6" y="6" width="4" height="4" fill={color} />
    </svg>
  )
}

/** 게임패드 — 픽셀 컨트롤러 (🎮) */
export function GamepadIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* body */}
      <rect x="1" y="3" width="14" height="9" fill={color} />
      {/* left handle */}
      <rect x="0" y="8" width="3" height="5" fill={color} />
      {/* right handle */}
      <rect x="13" y="8" width="3" height="5" fill={color} />
      {/* d-pad horizontal */}
      <rect x="3" y="6" width="4" height="2" fill="rgba(0,0,0,0.4)" />
      {/* d-pad vertical */}
      <rect x="4" y="5" width="2" height="4" fill="rgba(0,0,0,0.4)" />
      {/* buttons */}
      <rect x="10" y="5" width="2" height="2" fill="rgba(0,0,0,0.4)" />
      <rect x="12" y="7" width="2" height="2" fill="rgba(0,0,0,0.4)" />
    </svg>
  )
}

/** 번개 — 픽셀 볼트 (⚡) */
export function LightningIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* upper right block */}
      <rect x="7" y="0" width="6" height="7" fill={color} />
      {/* wide middle */}
      <rect x="3" y="6" width="10" height="3" fill={color} />
      {/* lower left block */}
      <rect x="3" y="9" width="6" height="7" fill={color} />
    </svg>
  )
}

/** 방패 — 픽셀 실드 (🛡️) */
export function ShieldIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* top */}
      <rect x="2" y="0" width="12" height="9" fill={color} />
      {/* mid */}
      <rect x="3" y="9" width="10" height="3" fill={color} />
      {/* lower */}
      <rect x="5" y="12" width="6" height="2" fill={color} />
      {/* tip */}
      <rect x="7" y="14" width="2" height="2" fill={color} />
      {/* cross emblem */}
      <rect x="7" y="2" width="2" height="7" fill="rgba(0,0,0,0.25)" />
      <rect x="4" y="5" width="8" height="2" fill="rgba(0,0,0,0.25)" />
    </svg>
  )
}

/** 다이아몬드 — 픽셀 젬 (💎) */
export function DiamondIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* top facets */}
      <rect x="5" y="0" width="6" height="1" fill={color} />
      <rect x="3" y="1" width="10" height="1" fill={color} />
      <rect x="1" y="2" width="14" height="2" fill={color} />
      {/* widest */}
      <rect x="0" y="4" width="16" height="4" fill={color} />
      {/* lower taper */}
      <rect x="1" y="8" width="14" height="2" fill={color} />
      <rect x="3" y="10" width="10" height="2" fill={color} />
      <rect x="5" y="12" width="6" height="2" fill={color} />
      {/* tip */}
      <rect x="7" y="14" width="2" height="2" fill={color} />
      {/* highlight */}
      <rect x="3" y="4" width="3" height="3" fill="rgba(255,255,255,0.2)" />
    </svg>
  )
}

/** 스파클 — 4방향 빛 (✨) */
export function SparkleIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* main cross */}
      <rect x="7" y="0" width="2" height="16" fill={color} />
      <rect x="0" y="7" width="16" height="2" fill={color} />
      {/* diagonal sparkles */}
      <rect x="3" y="3" width="3" height="3" fill={color} />
      <rect x="10" y="3" width="3" height="3" fill={color} />
      <rect x="3" y="10" width="3" height="3" fill={color} />
      <rect x="10" y="10" width="3" height="3" fill={color} />
    </svg>
  )
}

/** 근육 — 픽셀 팔 (💪) */
export function MuscleIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* upper arm */}
      <rect x="8" y="1" width="5" height="6" fill={color} />
      {/* bicep bulge */}
      <rect x="7" y="0" width="7" height="4" fill={color} />
      {/* elbow/forearm */}
      <rect x="3" y="6" width="12" height="3" fill={color} />
      {/* fist */}
      <rect x="1" y="9" width="6" height="5" fill={color} />
      {/* thumb */}
      <rect x="1" y="7" width="3" height="3" fill={color} />
    </svg>
  )
}

/** 휴지통 — 픽셀 쓰레기통 (🗑️) */
export function TrashIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* lid */}
      <rect x="1" y="1" width="14" height="2" fill={color} />
      {/* handle on lid */}
      <rect x="6" y="0" width="4" height="2" fill={color} />
      {/* body */}
      <rect x="2" y="4" width="12" height="11" fill={color} />
      {/* slat lines */}
      <rect x="5" y="5" width="1" height="9" fill="rgba(0,0,0,0.3)" />
      <rect x="7" y="5" width="1" height="9" fill="rgba(0,0,0,0.3)" />
      <rect x="9" y="5" width="1" height="9" fill="rgba(0,0,0,0.3)" />
    </svg>
  )
}

/** 집 — 픽셀 하우스 (🏠) */
export function HomeIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* roof */}
      <rect x="7" y="0" width="2" height="1" fill={color} />
      <rect x="5" y="1" width="6" height="1" fill={color} />
      <rect x="3" y="2" width="10" height="1" fill={color} />
      <rect x="1" y="3" width="14" height="2" fill={color} />
      {/* walls */}
      <rect x="2" y="5" width="12" height="10" fill={color} />
      {/* door */}
      <rect x="5" y="9" width="6" height="6" fill="rgba(0,0,0,0.3)" />
      {/* window */}
      <rect x="9" y="6" width="3" height="3" fill="rgba(0,0,0,0.25)" />
    </svg>
  )
}

/** 경고 — 픽셀 경고 삼각형 (⚠️) */
export function WarningIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* triangle rows */}
      <rect x="7" y="0" width="2" height="1" fill={color} />
      <rect x="6" y="1" width="4" height="1" fill={color} />
      <rect x="5" y="2" width="6" height="1" fill={color} />
      <rect x="4" y="3" width="8" height="1" fill={color} />
      <rect x="3" y="4" width="10" height="1" fill={color} />
      <rect x="2" y="5" width="12" height="1" fill={color} />
      <rect x="1" y="6" width="14" height="1" fill={color} />
      <rect x="0" y="7" width="16" height="5" fill={color} />
      {/* ! shaft */}
      <rect x="7" y="3" width="2" height="5" fill="rgba(0,0,0,0.45)" />
      {/* ! dot */}
      <rect x="7" y="9" width="2" height="2" fill="rgba(0,0,0,0.45)" />
    </svg>
  )
}

/** 해골 — 픽셀 스컬 (💀) */
export function SkullIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* head */}
      <rect x="3" y="0" width="10" height="9" fill={color} />
      <rect x="2" y="2" width="12" height="6" fill={color} />
      {/* eye sockets */}
      <rect x="4" y="3" width="3" height="3" fill="rgba(0,0,0,0.55)" />
      <rect x="9" y="3" width="3" height="3" fill="rgba(0,0,0,0.55)" />
      {/* nose */}
      <rect x="7" y="7" width="2" height="2" fill="rgba(0,0,0,0.4)" />
      {/* jaw */}
      <rect x="2" y="9" width="12" height="5" fill={color} />
      {/* teeth gaps */}
      <rect x="4" y="11" width="2" height="4" fill="rgba(0,0,0,0.4)" />
      <rect x="7" y="11" width="2" height="4" fill="rgba(0,0,0,0.4)" />
      <rect x="10" y="11" width="2" height="4" fill="rgba(0,0,0,0.4)" />
    </svg>
  )
}

/** 사람 실루엣 — 픽셀 퍼슨 (👤) */
export function PersonIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* head */}
      <rect x="5" y="0" width="6" height="6" fill={color} />
      {/* neck */}
      <rect x="6" y="6" width="4" height="2" fill={color} />
      {/* body + shoulders */}
      <rect x="2" y="8" width="12" height="7" fill={color} />
    </svg>
  )
}

/** 연필 — 픽셀 펜슬 (✏️) */
export function PencilIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* body */}
      <rect x="1" y="5" width="12" height="5" fill={color} />
      {/* eraser */}
      <rect x="13" y="6" width="3" height="3" fill={color} />
      {/* eraser band */}
      <rect x="12" y="5" width="1" height="5" fill="rgba(0,0,0,0.35)" />
      {/* tip */}
      <rect x="0" y="7" width="1" height="2" fill={color} />
    </svg>
  )
}

/** 재생 — 픽셀 플레이 버튼 (▶) */
export function PlayIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      <rect x="2" y="0" width="3" height="16" fill={color} />
      <rect x="5" y="2" width="3" height="12" fill={color} />
      <rect x="8" y="4" width="3" height="8" fill={color} />
      <rect x="11" y="6" width="3" height="4" fill={color} />
    </svg>
  )
}

/** 메달 — 픽셀 어워드 메달 (🎖️) */
export function MedalIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* ribbon strips */}
      <rect x="5" y="0" width="3" height="8" fill={color} />
      <rect x="8" y="0" width="3" height="8" fill={color} />
      {/* medal circle */}
      <rect x="3" y="7" width="10" height="2" fill={color} />
      <rect x="2" y="9" width="12" height="5" fill={color} />
      <rect x="3" y="14" width="10" height="2" fill={color} />
      {/* star on medal */}
      <rect x="7" y="10" width="2" height="2" fill="rgba(0,0,0,0.35)" />
    </svg>
  )
}

/** 축하 — 픽셀 폭죽/파티 (🎉/🎊) */
export function CelebrationIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* party popper body */}
      <rect x="0" y="10" width="8" height="5" fill={color} />
      <rect x="1" y="8" width="6" height="3" fill={color} />
      {/* streamers */}
      <rect x="8" y="0" width="2" height="5" fill={color} />
      <rect x="11" y="2" width="2" height="4" fill={color} />
      <rect x="14" y="0" width="2" height="3" fill={color} />
      {/* confetti */}
      <rect x="9" y="6" width="2" height="2" fill={color} />
      <rect x="13" y="5" width="2" height="2" fill={color} />
      <rect x="11" y="9" width="2" height="2" fill={color} />
    </svg>
  )
}

/** 로켓 — 픽셀 로켓 (🚀) */
export function RocketIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* nose */}
      <rect x="6" y="0" width="4" height="2" fill={color} />
      <rect x="5" y="2" width="6" height="2" fill={color} />
      {/* body */}
      <rect x="4" y="4" width="8" height="7" fill={color} />
      {/* fins */}
      <rect x="2" y="8" width="2" height="4" fill={color} />
      <rect x="12" y="8" width="2" height="4" fill={color} />
      {/* thruster */}
      <rect x="6" y="11" width="4" height="3" fill={color} />
      {/* window */}
      <rect x="6" y="5" width="4" height="3" fill="rgba(0,0,0,0.35)" />
    </svg>
  )
}

/** 잎 — 픽셀 리프 (🌱/🌿) */
export function LeafIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* leaf shape */}
      <rect x="7" y="0" width="2" height="2" fill={color} />
      <rect x="5" y="2" width="6" height="2" fill={color} />
      <rect x="3" y="4" width="10" height="4" fill={color} />
      <rect x="5" y="8" width="6" height="2" fill={color} />
      {/* stem */}
      <rect x="7" y="10" width="2" height="5" fill={color} />
    </svg>
  )
}

/** 나무 — 픽셀 트리 (🌳) */
export function TreeIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* treetop layers */}
      <rect x="6" y="0" width="4" height="2" fill={color} />
      <rect x="4" y="2" width="8" height="3" fill={color} />
      <rect x="2" y="5" width="12" height="3" fill={color} />
      <rect x="1" y="8" width="14" height="3" fill={color} />
      {/* trunk */}
      <rect x="6" y="11" width="4" height="5" fill={color} />
    </svg>
  )
}

/** 사과 — 픽셀 애플 (🍎) */
export function AppleIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* stem */}
      <rect x="7" y="0" width="2" height="2" fill={color} />
      {/* leaf */}
      <rect x="9" y="1" width="3" height="2" fill={color} />
      {/* apple body */}
      <rect x="3" y="2" width="10" height="2" fill={color} />
      <rect x="2" y="4" width="12" height="7" fill={color} />
      <rect x="3" y="11" width="10" height="2" fill={color} />
      <rect x="5" y="13" width="6" height="2" fill={color} />
      {/* highlight */}
      <rect x="4" y="5" width="2" height="2" fill="rgba(255,255,255,0.25)" />
    </svg>
  )
}

/** 모자 — 픽셀 탑 햇 (🎩) */
export function HatIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* crown */}
      <rect x="4" y="1" width="8" height="9" fill={color} />
      {/* band */}
      <rect x="4" y="7" width="8" height="2" fill="rgba(0,0,0,0.35)" />
      {/* brim */}
      <rect x="0" y="10" width="16" height="3" fill={color} />
    </svg>
  )
}

/** 발자국 — 픽셀 팔 (🐾) */
export function PawIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* toe pads */}
      <rect x="1" y="3" width="4" height="4" fill={color} />
      <rect x="5" y="1" width="3" height="4" fill={color} />
      <rect x="8" y="1" width="3" height="4" fill={color} />
      <rect x="11" y="3" width="4" height="4" fill={color} />
      {/* main pad */}
      <rect x="3" y="7" width="10" height="8" fill={color} />
    </svg>
  )
}

/** 코인 — 픽셀 골드 코인 (💰) */
export function CoinIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* coin circle */}
      <rect x="4" y="0" width="8" height="2" fill={color} />
      <rect x="2" y="2" width="12" height="2" fill={color} />
      <rect x="1" y="4" width="14" height="7" fill={color} />
      <rect x="2" y="11" width="12" height="2" fill={color} />
      <rect x="4" y="13" width="8" height="2" fill={color} />
      {/* center symbol */}
      <rect x="7" y="4" width="2" height="7" fill="rgba(0,0,0,0.3)" />
      <rect x="5" y="6" width="6" height="1" fill="rgba(0,0,0,0.3)" />
      <rect x="5" y="8" width="6" height="1" fill="rgba(0,0,0,0.3)" />
    </svg>
  )
}

/** 뇌 — 픽셀 브레인 (🧠) */
export function BrainIcon({ color = 'currentColor', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', display: 'block' }}>
      {/* brain blob */}
      <rect x="4" y="0" width="4" height="2" fill={color} />
      <rect x="9" y="1" width="4" height="2" fill={color} />
      <rect x="2" y="2" width="12" height="9" fill={color} />
      <rect x="1" y="4" width="14" height="6" fill={color} />
      <rect x="3" y="11" width="10" height="2" fill={color} />
      <rect x="5" y="13" width="6" height="2" fill={color} />
      {/* wrinkle lines */}
      <rect x="5" y="3" width="1" height="4" fill="rgba(0,0,0,0.2)" />
      <rect x="8" y="2" width="1" height="5" fill="rgba(0,0,0,0.2)" />
      <rect x="11" y="3" width="1" height="4" fill="rgba(0,0,0,0.2)" />
      <rect x="4" y="8" width="8" height="1" fill="rgba(0,0,0,0.2)" />
    </svg>
  )
}
