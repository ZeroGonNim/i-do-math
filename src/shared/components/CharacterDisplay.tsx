interface EquippedSlots {
  hat?: string    // emoji
  weapon?: string
  armor?: string
  pet?: string
}

interface CharacterDisplayProps {
  /** 캐릭터 이모지 및 액센트 컬러 */
  characterEmoji: string
  accentColor: string
  /** 장착 슬롯 이모지 (없으면 슬롯 미표시) */
  equippedSlots?: EquippedSlots
  /** 미오픈 박스 수 — 0이면 뱃지 미표시 */
  boxCount?: number
  /** 탭 핸들러 — undefined면 non-interactive */
  onClick?: () => void
  /** "인벤토리 →" 힌트 텍스트 표시 여부 */
  showHint?: boolean
}

/**
 * 캐릭터 이모지 + 장착 아이템 슬롯 디스플레이.
 *
 * 스펙 §2: 캐릭터 이모지 레이어링 방식.
 * 슬롯을 캐릭터에 직접 오버레이하지 않고 주변 고정 좌표에 배치하여
 * iOS/Android/Windows 이모지 렌더 차이를 회피한다.
 *
 * Layout (96×96 컨테이너 기준):
 *   [모자]          top-2, center-x
 *   [무기] [캐릭터] [펫]
 *          [갑옷]   bottom-2, center-x
 */
export function CharacterDisplay({
  characterEmoji,
  accentColor,
  equippedSlots = {},
  boxCount = 0,
  onClick,
  showHint = false,
}: CharacterDisplayProps) {
  const inner = (
    <div
      className="relative w-full rounded-2xl py-9 flex items-center justify-center overflow-hidden"
      style={{
        border: `1.5px solid ${accentColor}60`,
        background: `radial-gradient(ellipse at 50% 60%, ${accentColor}18 0%, var(--color-bg-card) 68%)`,
        boxShadow: `0 4px 20px ${accentColor}18, var(--shadow-card)`,
      }}
    >
      {/* 박스 뱃지 */}
      {boxCount > 0 && (
        <span
          className="absolute top-2.5 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: 'var(--color-purple)',
            color: '#fff',
            boxShadow: 'var(--shadow-glow-purple)',
          }}
        >
          📦 {boxCount}
        </span>
      )}

      {/* 모자 슬롯 — 상단 */}
      {equippedSlots.hat && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xl leading-none">
          {equippedSlots.hat}
        </div>
      )}

      {/* 무기 슬롯 — 좌측 */}
      {equippedSlots.weapon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl leading-none">
          {equippedSlots.weapon}
        </div>
      )}

      {/* 캐릭터 — 중앙, float 애니메이션 */}
      <span className="char-float text-7xl">{characterEmoji}</span>

      {/* 펫 슬롯 — 우측 */}
      {equippedSlots.pet && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xl leading-none">
          {equippedSlots.pet}
        </div>
      )}

      {/* 갑옷 슬롯 — 하단 */}
      {equippedSlots.armor && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xl leading-none">
          {equippedSlots.armor}
        </div>
      )}

      {/* 인벤토리 힌트 */}
      {showHint && (
        <p
          className="absolute bottom-2 right-3 text-[10px] font-medium"
          style={{ color: 'var(--color-text-muted)' }}
        >
          인벤토리 →
        </p>
      )}
    </div>
  )

  if (!onClick) return inner

  return (
    <button
      onClick={onClick}
      className="w-full transition-all active:opacity-70 active:scale-[0.98]"
    >
      {inner}
    </button>
  )
}
