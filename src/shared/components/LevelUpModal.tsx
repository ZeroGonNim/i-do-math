import { LEVEL_TITLES } from '@/types/user'

interface Props {
  newLevel: number
  onClose: () => void
}

export function LevelUpModal({ newLevel, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-xl">
        <div className="text-6xl mb-3">🎊</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">레벨 업!</h2>
        <p className="text-4xl font-black text-indigo-600 my-4">
          Lv.{newLevel}
        </p>
        <p className="text-lg font-bold text-indigo-500 mb-6">
          {LEVEL_TITLES[newLevel] ?? `레벨 ${newLevel}`}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          꾸준히 풀어서 레벨이 올랐어요! 계속 도전해봐요 💪
        </p>
        <button
          onClick={onClose}
          className="w-full min-h-[48px] rounded-2xl bg-indigo-500 text-white text-lg font-bold"
        >
          계속하기
        </button>
      </div>
    </div>
  )
}
