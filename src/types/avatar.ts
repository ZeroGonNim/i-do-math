export type AvatarId = 'warrior' | 'mage' | 'assassin' | 'robot'

export interface AvatarDef {
  id: AvatarId
  name: string
  imagePath: string
  trait: string
  specialAbility: string
  accentColor: string
  starCost: number  // 0 = 기본 제공, >0 = 별로 해금
}

export const AVATARS: AvatarDef[] = [
  {
    id: 'warrior',
    name: '전사',
    imagePath: '/images/avatars/warrior.png',
    trait: '힘 & 방어',
    specialAbility: '전사는 오답을 해도 XP를 2 더 받아요!',
    accentColor: '#81ecff',
    starCost: 0,
  },
  {
    id: 'mage',
    name: '마법사',
    imagePath: '/images/avatars/mage.png',
    trait: '지혜 & 마법',
    specialAbility: '마법사는 힌트를 1개 더 받을 수 있어요!',
    accentColor: '#c180ff',
    starCost: 128,
  },
  {
    id: 'assassin',
    name: '암살자',
    imagePath: '/images/avatars/assassin.png',
    trait: '민첩 & 속도',
    specialAbility: '암살자는 연속 정답 시 XP가 2배예요!',
    accentColor: '#22c55e',
    starCost: 256,
  },
  {
    id: 'robot',
    name: '로봇',
    imagePath: '/images/avatars/robot.png',
    trait: '정확 & 분석',
    specialAbility: '로봇은 박스 드롭 확률이 5% 더 높아요!',
    accentColor: '#fbbf24',
    starCost: 512,
  },
]
