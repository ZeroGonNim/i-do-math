import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BottomNavBar } from '@/shared/components/BottomNavBar'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import { userProfileRepo } from '@/shared/db/userProfileRepo'
import { userItemRepo } from '@/shared/db/userItemRepo'
import { equippedItemsRepo } from '@/shared/db/equippedItemsRepo'
import { loadItems } from '@/shared/services/itemLoader'
import { AVATARS } from '@/types/avatar'
import type { AvatarId } from '@/types/avatar'
import type { Item, ItemSlot, UserItem } from '@/types/item'
import { MainTabHeader } from '@/shared/components/MainTabHeader'
import { StarIcon, HatIcon, SwordIcon, ShieldIcon, PawIcon, BoxIcon } from '@/shared/components/PixelIcons'
import { RARITY_COLOR, RARITY_LABEL, SLOT_LABEL } from '@/shared/constants/itemConstants'
import type { ReactNode } from 'react'

const SLOT_ICON: Record<ItemSlot, ReactNode> = {
  hat:    <HatIcon    color="currentColor" size={18} />,
  weapon: <SwordIcon  color="currentColor" size={18} />,
  armor:  <ShieldIcon color="currentColor" size={18} />,
  pet:    <PawIcon    color="currentColor" size={18} />,
}

type ItemTabKey = 'all' | ItemSlot
const ITEM_TABS: { key: ItemTabKey; label: string }[] = [
  { key: 'all',    label: '전체' },
  { key: 'hat',    label: '모자' },
  { key: 'weapon', label: '무기' },
  { key: 'armor',  label: '갑옷' },
  { key: 'pet',    label: '펫' },
]

export function SettingsRoute() {
  const profile = useUserProfile()
  const [nameValue, setNameValue] = useState<string | null>(null)
  
  // Item States
  const [itemTab, setItemTab] = useState<ItemTabKey>('all')
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
  const displayName = nameValue ?? profile.displayName
  const unlockedAvatars: AvatarId[] = profile.unlockedAvatars ?? ['warrior']
  const equippedAvatarId: AvatarId = profile.avatarId ?? 'warrior'
  const currentAvatar = AVATARS.find(a => a.id === equippedAvatarId) || AVATARS[0]
  const totalStars = profile.totalStars ?? 0

  // Filtered items
  const filteredItems = (userItems ?? []).filter(ui => {
    const item = itemMap[ui.itemId]
    if (!item) return false
    return itemTab === 'all' || item.slot === itemTab
  })

  const isItemEquipped = (userItemId: string) =>
    equipped && Object.values(equipped).includes(userItemId)

  async function handleNameBlur() {
    if (!profile) return
    const trimmed = (nameValue ?? '').trim()
    if (!trimmed || trimmed === profile.displayName) {
      setNameValue(null)
      return
    }
    await userProfileRepo.update({ displayName: trimmed })
    setNameValue(null)
  }

  async function handleAvatarEquip(id: AvatarId) {
    await userProfileRepo.update({ avatarId: id })
  }

  async function handleAvatarUnlock(id: AvatarId, cost: number) {
    if (totalStars < cost) return
    await userProfileRepo.update({
      totalStars: totalStars - cost,
      unlockedAvatars: [...unlockedAvatars, id],
      avatarId: id,
    })
  }

  async function handleToggleEquip(ui: UserItem) {
    if (!profile || !equipped) return
    const item = itemMap[ui.itemId]
    if (!item) return

    if (isItemEquipped(ui.id)) {
      await equippedItemsRepo.unequip(profile.userId, item.slot)
    } else {
      await equippedItemsRepo.equip(profile.userId, item.slot, ui.id)
    }
    setSelectedUi(null)
  }

  const ownedAvatars = AVATARS.filter(a => unlockedAvatars.includes(a.id))
  const shopAvatars = AVATARS.filter(a => !unlockedAvatars.includes(a.id))

  return (
    <div className="flex h-dvh flex-col" style={{ backgroundColor: '#0f172a' }}>
      <MainTabHeader title="나의 영웅" />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-28 space-y-12">
          
          {/* ── 1. 히어로 비주얼 & 이름 ── */}
          <div className="flex flex-col items-center py-6 border-4 border-[#23233f]" 
               style={{ backgroundColor: '#17172f', boxShadow: '0 6px 0 #000', background: `radial-gradient(circle at 50% 50%, ${currentAvatar.accentColor}15 0%, transparent 70%)` }}>
            
            <div className="grid grid-cols-3 gap-4 place-items-center mb-6">
              <EquipSlot slot="weapon" equipped={equipped} userItems={userItems} itemMap={itemMap} currentAvatar={currentAvatar} />
              
              <div className="flex flex-col items-center gap-2">
                <EquipSlot slot="hat" equipped={equipped} userItems={userItems} itemMap={itemMap} currentAvatar={currentAvatar} />
                <div className="w-24 h-24 flex items-center justify-center border-4" style={{ borderColor: currentAvatar.accentColor, backgroundColor: '#000' }}>
                  <img src={currentAvatar.imagePath} alt="히어로" className="w-full h-full object-contain" />
                </div>
                <EquipSlot slot="armor" equipped={equipped} userItems={userItems} itemMap={itemMap} currentAvatar={currentAvatar} />
              </div>

              <EquipSlot slot="pet" equipped={equipped} userItems={userItems} itemMap={itemMap} currentAvatar={currentAvatar} />
            </div>

            <div className="text-center w-full px-10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <input
                  className="bg-transparent text-xl font-bold text-center focus:outline-none border-b border-transparent focus:border-[#38bdf8] transition-all"
                  style={{ color: '#38bdf8', fontFamily: 'var(--font-game)' }}
                  value={displayName}
                  onChange={e => setNameValue(e.target.value)}
                  onBlur={handleNameBlur}
                  maxLength={8}
                />
                <span className="text-[10px] text-[#64748b]">✎</span>
              </div>
              <p className="text-[10px] font-medium text-[#64748b]">Lv.{profile.level} {profile.grade}학년 모험가</p>
            </div>
          </div>

          {/* ── 2. 아이템 인벤토리 ── */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-[#38bdf8]" />
              <span className="text-xl font-bold text-[#e5e3ff]">아이템 인벤토리</span>
            </div>

            <div className="flex gap-1 mb-4">
              {ITEM_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setItemTab(t.key)}
                  className="flex-1 py-2 text-[11px] font-bold border-2 transition-all"
                  style={{ 
                    backgroundColor: itemTab === t.key ? '#38bdf8' : '#1d1d37',
                    color: itemTab === t.key ? '#000' : '#aaa8c3',
                    borderColor: itemTab === t.key ? '#38bdf8' : '#23233f'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-10 flex flex-col items-center bg-[#17172f] border-2 border-dashed border-[#23233f]">
                <BoxIcon color="#64748b" size={32} />
                <p className="text-xs text-[#64748b] mt-2">아이템이 아직 없어요</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filteredItems.map(ui => {
                  const item = itemMap[ui.itemId]
                  if (!item) return null
                  const color = RARITY_COLOR[item.rarity]
                  const equippedNow = isItemEquipped(ui.id)
                  return (
                    <button key={ui.id} onClick={() => setSelectedUi(ui)} 
                            className="flex flex-col items-center p-2 border-2 relative transition-all active:scale-95"
                            style={{ backgroundColor: '#17172f', borderColor: equippedNow ? '#10b981' : color }}>
                      {equippedNow && <div className="absolute top-0 left-0 bg-[#10b981] text-[8px] px-1 font-bold text-black">EQUIPPED</div>}
                      <img src={item.imagePath} alt={item.name} className="w-10 h-10 object-contain mb-1" />
                      <p className="text-[9px] text-[#aaa8c3] truncate w-full text-center">{item.name}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── 3. 히어로 컬렉션 ── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#10b981]" />
                <span className="text-xl font-bold text-[#e5e3ff]">히어로 컬렉션</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#000] border-2 border-[#ffe792]">
                <StarIcon color="#ffe792" size={14} /><span className="text-sm font-bold text-[#ffe792]">{totalStars.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {ownedAvatars.map(a => {
                const isEquipped = equippedAvatarId === a.id
                return (
                  <div key={a.id} className="flex flex-col border-4" style={{ backgroundColor: '#17172f', borderColor: isEquipped ? '#10b981' : '#23233f' }}>
                    <div className="aspect-square p-2 flex items-center justify-center"><img src={a.imagePath} alt={a.name} className="w-full h-full object-contain" /></div>
                    <button onClick={() => handleAvatarEquip(a.id)} disabled={isEquipped} className="p-2 text-[10px] font-bold" style={{ backgroundColor: isEquipped ? '#000' : '#10b981', color: isEquipped ? '#64748b' : '#000' }}>
                      {isEquipped ? '사용 중' : '장착하기'}
                    </button>
                  </div>
                )
              })}
              {shopAvatars.map(a => (
                <div key={a.id} className="flex flex-col border-4 opacity-70" style={{ backgroundColor: '#17172f', borderColor: '#23233f' }}>
                  <div className="aspect-square p-2 flex items-center justify-center grayscale relative">
                    <img src={a.imagePath} alt={a.name} className="w-full h-full object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40"><span className="text-[10px] font-bold text-[#ffe792]">★ {a.starCost}</span></div>
                  </div>
                  <button onClick={() => handleAvatarUnlock(a.id, a.starCost)} disabled={totalStars < a.starCost} className="p-2 text-[10px] font-bold" style={{ backgroundColor: totalStars >= a.starCost ? '#ffe792' : '#23233f', color: '#000' }}>해금하기</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <BottomNavBar />

      {/* Item Detail Modal */}
      {selectedUi && (() => {
        const item = itemMap[selectedUi.itemId]
        if (!item) return null
        const color = RARITY_COLOR[item.rarity]
        const equippedNow = isItemEquipped(selectedUi.id)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedUi(null)}>
            <div className="w-full max-w-xs p-6 bg-[#1d1d37] border-4 flex flex-col items-center gap-4" style={{ borderColor: color }} onClick={e => e.stopPropagation()}>
              <div className="w-20 h-20 border-2" style={{ borderColor: color }}><img src={item.imagePath} alt={item.name} className="w-full h-full object-contain" /></div>
              <div className="text-center">
                <p className="text-xs font-bold" style={{ color }}>{RARITY_LABEL[item.rarity]}</p>
                <p className="text-lg font-bold text-[#e5e3ff]">{item.name}</p>
                <p className="text-[10px] text-[#64748b] mt-1">{item.description}</p>
              </div>
              <button onClick={() => handleToggleEquip(selectedUi)} className="w-full py-3 font-bold text-sm" style={{ backgroundColor: equippedNow ? '#ff716c' : color, color: '#000' }}>
                {equippedNow ? '장착 해제' : '장착하기'}
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

interface EquipSlotProps {
  slot: ItemSlot
  equipped: any
  userItems: UserItem[] | undefined
  itemMap: Record<string, Item>
  currentAvatar: any
}

function EquipSlot({ slot, equipped, userItems, itemMap, currentAvatar }: EquipSlotProps) {
  const equippedId = equipped?.[slot] ?? null
  const equippedUi = equippedId ? userItems?.find(u => u.id === equippedId) : null
  const equippedItem = equippedUi ? itemMap[equippedUi.itemId] : null
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-10 h-10 flex items-center justify-center border-2" 
           style={{ 
             backgroundColor: '#0c0c1f', 
             borderColor: equippedItem ? currentAvatar.accentColor : '#23233f',
             boxShadow: equippedItem ? `0 0 10px ${currentAvatar.accentColor}40` : 'none'
           }}>
        {equippedItem 
          ? <img src={equippedItem.imagePath} alt={slot} className="w-full h-full object-contain" />
          : <span className="text-[#23233f]">{SLOT_ICON[slot]}</span>}
      </div>
      <span className="text-[8px] font-bold" style={{ color: equippedItem ? currentAvatar.accentColor : '#64748b' }}>{SLOT_LABEL[slot]}</span>
    </div>
  )
}
