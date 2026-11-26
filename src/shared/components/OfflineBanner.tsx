export function OfflineBanner() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 text-xs font-bold"
      style={{ backgroundColor: '#ff716c', color: '#fff' }}
    >
      <span>📡</span>
      <span>인터넷 연결이 끊어졌어요. 기록은 재연결 후 저장됩니다.</span>
    </div>
  )
}
