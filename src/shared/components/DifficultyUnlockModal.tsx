interface Props {
  onClose: () => void
}

export function DifficultyUnlockModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-xl">
        <div className="text-6xl mb-3">🔓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">난이도 해금!</h2>
        <p className="text-4xl font-black text-purple-600 my-4">응용 문제</p>
        <p className="text-sm text-gray-500 mb-6">
          꾸준히 풀어서 응용 문제를 풀 수 있게 됐어요!<br />
          이제 더 어려운 문제에 도전해봐요 💪
        </p>
        <button
          onClick={onClose}
          className="w-full min-h-[48px] rounded-2xl bg-purple-500 text-white text-lg font-bold"
        >
          도전하기
        </button>
      </div>
    </div>
  )
}
