import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { userItemRepo } from '@/shared/db/userItemRepo'
import { equippedItemsRepo } from '@/shared/db/equippedItemsRepo'
import { loadItems } from '@/shared/services/itemLoader'
import { AppHeader } from '@/shared/components/AppHeader'
import { RARITY_COLOR, RARITY_LABEL, SLOT_LABEL } from '@/shared/constants/itemConstants'
import { AVATARS } from '@/types/avatar'
import type { Item, ItemSlot, UserItem } from '@/types/item'

const SLOT_EMOJI: Record<ItemSlot, string> = {
  hat:    '🎩',
  weapon: '⚔️',
  armor:  '🛡️',
  pet:    '🐾',
}

type TabKey = 'all' | ItemSlot
const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',    label: '전체' },
  { key: 'hat',    label: '모자' },
  { key: 'weapon', label: '무기' },
  { key: 'armor',  label: '갑옷' },
  { key: 'pet',    label: '펫' },
]

export function InventoryRoute() {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const [tab, setTab] = useState<TabKey>('all')
  const [allItems, setAllItems] = useState<Item[]>([])
  const [selectedUi, setSelectedUi] = useState<UserItem | null>(null)

  const userItems = useLiveQuery(
    () => profile ? userItemRepo.getAll(profile.userId) : [],
    [profile?.userId],
    [] as UserItem[]
  )

  const equipped = useLiveQuery(
    () => profile ? equippedItemsRepo.get(profile.userId) : null,
    [profile?.userId],
    null
  )

  useEffect(() => {
    loadItems().then(setAllItems)
  }, [])

  if (!profile) return null

  const itemMap = Object.fromEntries(allItems.map(i => [i.id, i]))
  const avatar = AVATARS.find(a => a.id === (profile.avatarId ?? 'warrior')) ?? AVATARS[0]

  const filtered = (userItems ?? []).filter(ui => {
    const item = itemMap[ui.itemId]
    if (!item) return false
    return tab === 'all' || item.slot === tab
  })

  const isEquipped = (userItemId: string) =>
    equipped && Object.values(equipped).includes(userItemId)

  async function handleToggleEquip(ui: UserItem) {
    if (!profile || !equipped) return
    const item = itemMap[ui.itemId]
    if (!item) return

    if (isEquipped(ui.id)) {
      await equippedItemsRepo.unequip(profile.userId, item.slot)
    } else {
      await equippedItemsRepo.equip(profile.userId, item.slot, ui.id)
    }
    setSelectedUi(null)
  }

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0c0c1f' }}>
      <AppHeader title="인벤토리" onBack={() => navigate('/home', { replace: true })} />

      {/* 캐릭터 + 장착 슬롯 영역 — 3×3 grid로 겹침 완전 방지 */}
      <div className="px-4 py-4 shrink-0"
           style={{
             background: `radial-gradient(ellipse at 50% 50%, ${avatar.accentColor}0d 0%, #1d1d37 65%)`,
             borderBottom: '1px solid #23233f',
           }}>
        <div className="grid grid-cols-3 gap-3 place-items-center w-full max-w-[300px] mx-auto">

          {/* 행1: 빈칸 / 모자 / 빈칸 */}
          <div />
          {(() => {
            const equippedId = equipped?.hat ?? null
            const equippedUi = equippedId ? userItems?.find(u => u.id === equippedId) : null
            const equippedItem = equippedUi ? itemMap[equippedUi.itemId] : null
            return (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold" style={{ color: equippedItem ? avatar.accentColor : '#aaa8c3' }}>
                  {SLOT_LABEL.hat}
                </span>
                <div className="w-12 h-12 flex items-center justify-center text-2xl border-2"
                     style={{
                       backgroundColor: '#23233f',
                       borderColor: equippedItem ? avatar.accentColor : '#46465c',
                       boxShadow: equippedItem ? `0 0 12px ${avatar.accentColor}50` : 'none',
                     }}>
                  {equippedItem
                    ? <img src={equippedItem.imagePath} alt={equippedItem.name} className="w-full h-full object-cover" />
                    : <span className="opacity-20">{SLOT_EMOJI.hat}</span>}
                </div>
              </div>
            )
          })()}
          <div />

          {/* 행2: 무기 / 캐릭터 / 펫 */}
          {(['weapon', 'pet'] as const).map((slot, i) => {
            if (i === 1) return null // pet은 뒤에서 렌더
            const equippedId = equipped?.[slot] ?? null
            const equippedUi = equippedId ? userItems?.find(u => u.id === equippedId) : null
            const equippedItem = equippedUi ? itemMap[equippedUi.itemId] : null
            return (
              <div key={slot} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold" style={{ color: equippedItem ? avatar.accentColor : '#aaa8c3' }}>
                  {SLOT_LABEL[slot]}
                </span>
                <div className="w-12 h-12 flex items-center justify-center text-2xl border-2"
                     style={{
                       backgroundColor: '#23233f',
                       borderColor: equippedItem ? avatar.accentColor : '#46465c',
                       boxShadow: equippedItem ? `0 0 12px ${avatar.accentColor}50` : 'none',
                     }}>
                  {equippedItem
                    ? <img src={equippedItem.imagePath} alt={equippedItem.name} className="w-full h-full object-cover" />
                    : <span className="opacity-20">{SLOT_EMOJI[slot]}</span>}
                </div>
              </div>
            )
          })}
          {/* 중앙 아바타 */}
          <div className="char-float w-20 h-20 overflow-hidden"
               style={{
                 border: `3px solid ${avatar.accentColor}`,
                 boxShadow: `0 0 24px ${avatar.accentColor}40`,
               }}>
            <img src={avatar.imagePath} alt={avatar.name} className="w-full h-full object-cover" />
          </div>
          {/* 펫 */}
          {(() => {
            const equippedId = equipped?.pet ?? null
            const equippedUi = equippedId ? userItems?.find(u => u.id === equippedId) : null
            const equippedItem = equippedUi ? itemMap[equippedUi.itemId] : null
            return (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold" style={{ color: equippedItem ? avatar.accentColor : '#aaa8c3' }}>
                  {SLOT_LABEL.pet}
                </span>
                <div className="w-12 h-12 flex items-center justify-center text-2xl border-2"
                     style={{
                       backgroundColor: '#23233f',
                       borderColor: equippedItem ? avatar.accentColor : '#46465c',
                       boxShadow: equippedItem ? `0 0 12px ${avatar.accentColor}50` : 'none',
                     }}>
                  {equippedItem
                    ? <img src={equippedItem.imagePath} alt={equippedItem.name} className="w-full h-full object-cover" />
                    : <span className="opacity-20">{SLOT_EMOJI.pet}</span>}
                </div>
              </div>
            )
          })()}

          {/* 행3: 빈칸 / 갑옷 / 빈칸 */}
          <div />
          {(() => {
            const equippedId = equipped?.armor ?? null
            const equippedUi = equippedId ? userItems?.find(u => u.id === equippedId) : null
            const equippedItem = equippedUi ? itemMap[equippedUi.itemId] : null
            return (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold" style={{ color: equippedItem ? avatar.accentColor : '#aaa8c3' }}>
                  {SLOT_LABEL.armor}
                </span>
                <div className="w-12 h-12 flex items-center justify-center text-2xl border-2"
                     style={{
                       backgroundColor: '#23233f',
                       borderColor: equippedItem ? avatar.accentColor : '#46465c',
                       boxShadow: equippedItem ? `0 0 12px ${avatar.accentColor}50` : 'none',
                     }}>
                  {equippedItem
                    ? <img src={equippedItem.imagePath} alt={equippedItem.name} className="w-full h-full object-cover" />
                    : <span className="opacity-20">{SLOT_EMOJI.armor}</span>}
                </div>
              </div>
            )
          })()}
          <div />

        </div>
      </div>

      {/* 탭바 */}
      <div className="flex shrink-0" style={{ backgroundColor: '#17172f', borderBottom: '1px solid #000' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-3.5 text-sm font-bold transition-colors relative"
            style={{ color: tab === t.key ? '#81ecff' : '#aaa8c3', fontFamily: 'var(--font-game)' }}
          >
            {t.label}
            {tab === t.key && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5"
                   style={{ backgroundColor: '#81ecff' }} />
            )}
          </button>
        ))}
      </div>

      {/* 아이템 그리드 */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-6xl mb-2">📦</span>
            <p className="text-sm font-bold" style={{ color: '#aaa8c3' }}>아이템이 없어요</p>
            <p className="text-xs" style={{ color: '#46465c' }}>문제를 풀고 보물상자를 열어보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 pb-10">
            {filtered.map(ui => {
              const item = itemMap[ui.itemId]
              if (!item) return null
              const color = RARITY_COLOR[item.rarity]
              const equippedNow = isEquipped(ui.id)
              return (
                <button
                  key={ui.id}
                  onClick={() => setSelectedUi(ui)}
                  className="relative flex flex-col items-center gap-1.5 py-4 px-2 transition-all active:scale-95 border-2"
                  style={{
                    backgroundColor: '#1d1d37',
                    borderColor: equippedNow ? '#22c55e' : color,
                    boxShadow: equippedNow ? `0 0 12px rgba(34,197,94,0.2)` : `0 0 8px ${color}20`,
                  }}
                >
                  {equippedNow && (
                    <div
                      className="absolute top-0 left-0 px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ backgroundColor: '#22c55e', color: '#000', fontFamily: 'var(--font-sans)' }}
                    >
                      장착 중
                    </div>
                  )}
                  <div className="w-14 h-14 overflow-hidden mb-1 mt-3">
                    <img src={item.imagePath} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] font-bold text-center leading-tight line-clamp-1"
                     style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)' }}>
                    {item.name}
                  </p>
                  <p className="text-[9px] font-bold" style={{ color }}>
                    {RARITY_LABEL[item.rarity]}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 아이템 상세 모달 */}
      {selectedUi && (() => {
        const item = itemMap[selectedUi.itemId]
        if (!item) return null
        const color = RARITY_COLOR[item.rarity]
        const equippedNow = isEquipped(selectedUi.id)
        return (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedUi(null)}
          >
            <div
              className="w-full max-w-sm p-6 flex flex-col items-center gap-5"
              style={{
                backgroundColor: '#1d1d37',
                border: `2px solid ${color}`,
                boxShadow: `0 0 48px ${color}40`,
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* 희귀도 top strip */}
              <div className="w-full h-1" style={{ backgroundColor: color, marginTop: -24, marginLeft: -24, width: 'calc(100% + 48px)' }} />

              <div className="w-28 h-28 overflow-hidden"
                   style={{ border: `2px solid ${color}`, boxShadow: `0 0 20px ${color}40` }}>
                <img src={item.imagePath} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="text-center space-y-1">
                <span className="px-3 py-0.5 text-[10px] font-black tracking-widest"
                      style={{ color: '#000', backgroundColor: color }}>
                  ✦ {RARITY_LABEL[item.rarity]}
                </span>
                <p className="text-2xl font-bold pt-2" style={{ color: '#e5e3ff', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px' }}>
                  {item.name}
                </p>
                <p className="text-sm" style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}>
                  {SLOT_LABEL[item.slot]} 슬롯{item.description ? ` · ${item.description}` : ''}
                </p>
              </div>

              <div className="w-full pt-2 flex flex-col gap-2">
                <div style={{ backgroundColor: equippedNow ? '#5a0000' : `${color}60`, marginTop: 4 }}>
                  <button
                    onClick={() => handleToggleEquip(selectedUi)}
                    className="w-full flex items-center justify-center text-xl font-bold transition-opacity active:opacity-80 -translate-y-1"
                    style={{
                      height: '60px',
                      backgroundColor: equippedNow ? '#ff716c' : color,
                      color: equippedNow ? '#fff' : '#000',
                      fontFamily: 'var(--font-sans)',
                      letterSpacing: '-0.5px',
                      border: `2px solid ${equippedNow ? '#5a0000' : `${color}80`}`,
                      display: 'flex',
                    }}
                  >
                    {equippedNow ? '장착 해제' : '장착하기'}
                  </button>
                </div>
                <button
                  onClick={() => setSelectedUi(null)}
                  className="w-full py-3 text-sm font-medium text-center"
                  style={{ color: '#aaa8c3', fontFamily: 'var(--font-sans)' }}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
