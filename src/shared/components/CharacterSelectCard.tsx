import { AVATARS } from '@/types/avatar'
import type { AvatarDef, AvatarId } from '@/types/avatar'
import { LockIcon, StarIcon } from '@/shared/components/PixelIcons'

export { AVATARS }
export type { AvatarDef }

interface Props {
  avatar: AvatarDef
  selected: boolean
  onSelect: (id: AvatarId) => void
  locked?: boolean
  isDefault?: boolean
}

export function CharacterSelectCard({ avatar, selected, onSelect, locked = false, isDefault = false }: Props) {
  return (
    <button
      onClick={() => !locked && onSelect(avatar.id)}
      disabled={locked}
      className="relative flex flex-col items-center overflow-hidden border-2 transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed"
      style={selected
        ? {
            borderColor: avatar.accentColor,
            boxShadow: `0 0 16px ${avatar.accentColor}50`,
            transform: 'scale(1.03)',
          }
        : {
            backgroundColor: '#17172f',
            borderColor: '#23233f',
          }
      }
    >
      {/* 기본 캐릭터 뱃지 */}
      {isDefault && !selected && (
        <span
          className="absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 z-10"
          style={{ backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}
        >
          기본
        </span>
      )}

      {/* 선택 체크 뱃지 */}
      {selected && (
        <span
          className="absolute top-2 right-2 w-6 h-6 text-xs flex items-center justify-center font-bold z-10"
          style={{ backgroundColor: avatar.accentColor, color: '#0f172a' }}
        >
          ✓
        </span>
      )}

      {/* 아바타 이미지 */}
      <div
        className="w-full aspect-square relative"
        style={{
          background: selected
            ? `radial-gradient(circle, ${avatar.accentColor}20 0%, #111127 100%)`
            : '#111127',
        }}
      >
        <img
          src={avatar.imagePath}
          alt={avatar.name}
          className="w-full h-full object-cover"
          style={{ filter: locked ? 'grayscale(80%) brightness(0.4)' : selected ? 'none' : 'grayscale(40%) brightness(0.8)' }}
        />
        {/* 잠금 오버레이 */}
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <LockIcon color="#ffe792" size={22} />
            <div className="flex items-center gap-0.5">
              <StarIcon color="#ffe792" size={10} />
              <span className="text-[10px] font-bold" style={{ color: '#ffe792' }}>{avatar.starCost}</span>
            </div>
          </div>
        )}
      </div>

      {/* 이름 + 특성 */}
      <div className="w-full px-2 py-2 text-center" style={{ backgroundColor: '#1d1d37' }}>
        <p
          className="text-sm font-bold"
          style={{ color: locked ? '#aaa8c3' : selected ? avatar.accentColor : '#e5e3ff' }}
        >
          {avatar.name}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: locked ? '#23233f' : '#38bdf8' }}>
          {avatar.trait}
        </p>
      </div>
    </button>
  )
}
