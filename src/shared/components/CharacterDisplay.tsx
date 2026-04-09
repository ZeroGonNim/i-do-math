import { AVATARS } from '@/types/avatar'
import type { AvatarId } from '@/types/avatar'

interface EquippedSlots {
  hat?: string      // item imagePath
  weapon?: string   // item imagePath
  armor?: string    // item imagePath
  pet?: string      // item imagePath
}

interface CharacterDisplayProps {
  avatarId: AvatarId
  accentColor: string
  equippedSlots?: EquippedSlots
  boxCount?: number
  onClick?: () => void
  showHint?: boolean
}

function SlotImage({ src, label }: { src: string; label: string }) {
  return (
    <div
      className="w-9 h-9 overflow-hidden border-2"
      style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: '#111127' }}
      title={label}
    >
      <img src={src} alt={label} className="w-full h-full object-cover" />
    </div>
  )
}

export function CharacterDisplay({
  avatarId,
  accentColor,
  equippedSlots = {},
  boxCount = 0,
  onClick,
  showHint = false,
}: CharacterDisplayProps) {
  const avatar = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0]

  const inner = (
    <div
      className="relative w-full py-6 flex items-center justify-center overflow-hidden"
      style={{
        border: `1.5px solid ${accentColor}60`,
        background: `radial-gradient(ellipse at 50% 60%, ${accentColor}18 0%, #1d1d37 68%)`,
        boxShadow: `0 4px 20px ${accentColor}18`,
      }}
    >
      {/* 박스 뱃지 */}
      {boxCount > 0 && (
        <span
          className="absolute top-2.5 right-3 text-xs font-bold px-2 py-0.5"
          style={{
            backgroundColor: '#c180ff',
            color: '#fff',
            boxShadow: '0 0 12px rgba(193,128,255,0.5)',
          }}
        >
          📦 {boxCount}
        </span>
      )}

      {/* 모자 슬롯 — 상단 */}
      {equippedSlots.hat && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2">
          <SlotImage src={equippedSlots.hat} label="모자" />
        </div>
      )}

      {/* 무기 슬롯 — 좌측 */}
      {equippedSlots.weapon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <SlotImage src={equippedSlots.weapon} label="무기" />
        </div>
      )}

      {/* 아바타 이미지 — 중앙 */}
      <div
        className="char-float w-28 h-28 overflow-hidden"
        style={{
          border: `2px solid ${accentColor}80`,
          boxShadow: `0 0 20px ${accentColor}30`,
        }}
      >
        <img src={avatar.imagePath} alt={avatar.name} className="w-full h-full object-cover" />
      </div>

      {/* 펫 슬롯 — 우측 */}
      {equippedSlots.pet && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <SlotImage src={equippedSlots.pet} label="펫" />
        </div>
      )}

      {/* 갑옷 슬롯 — 하단 */}
      {equippedSlots.armor && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <SlotImage src={equippedSlots.armor} label="갑옷" />
        </div>
      )}

      {/* 인벤토리 힌트 */}
      {showHint && (
        <p
          className="absolute bottom-2 right-3 text-[10px] font-medium"
          style={{ color: '#46465c' }}
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
