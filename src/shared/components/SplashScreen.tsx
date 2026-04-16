import { useEffect, useState } from 'react'
import { AVATARS } from '@/types/avatar'
import { useUserProfile } from '@/shared/hooks/useUserProfile'

/**
 * Figma 디자인(137:467) 기반 스플래시 화면
 */
export function SplashScreen() {
  const profile = useUserProfile()
  const [progress, setProgress] = useState(0)
  
  const avatar = AVATARS.find(a => a.id === (profile?.avatarId ?? 'warrior')) ?? AVATARS[0]

  // 진행바 애니메이션 효과
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 5
      })
    }, 100)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between py-20 overflow-hidden"
         style={{ backgroundColor: '#0f172a' }}>
      
      {/* Decorative Corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-[#23233f]" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-[#23233f]" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-[#23233f]" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-[#23233f]" />

      {/* Header Area */}
      <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="px-8 py-4 border-4 border-[#ffe792] bg-[#17172f]" style={{ boxShadow: '0 8px 0 #000' }}>
          <h1 className="text-3xl text-[#ffe792]" style={{ fontFamily: 'var(--font-title)' }}>
            I DO MATH
          </h1>
        </div>
        <div className="px-4 py-1 bg-black/40">
          <p className="text-[12px] font-bold tracking-[0.2em] text-[#8b5cf6]" style={{ fontFamily: 'var(--font-accent)' }}>
            방정식의 영역으로 입장하십시오
          </p>
        </div>
      </div>

      {/* Center Character Area */}
      <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000 delay-300">
        {/* Floating background squares */}
        <div className="absolute -top-10 -left-10 w-8 h-8 bg-[#38bdf8]/20 border-2 border-black animate-bounce" />
        <div className="absolute top-20 -right-12 w-6 h-6 bg-[#8b5cf6]/20 border-2 border-black animate-pulse" />
        
        <div className="w-56 h-56 border-4 border-[#23233f] bg-[#17172f] flex items-center justify-center p-4"
             style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
          <img 
            src={avatar.imagePath} 
            alt="Hero" 
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{ imageRendering: 'pixelated', animation: 'float-y 3s ease-in-out infinite' }}
          />
        </div>
        {/* Ground shadow */}
        <div className="w-48 h-4 bg-black/40 blur-md mt-6 rounded-full transform scale-x-110" />
      </div>

      {/* Bottom Progress Area */}
      <div className="w-full max-w-xs flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 px-6">
        <div className="flex justify-between items-end px-1">
          <span className="text-xl text-[#38bdf8] font-bold" style={{ fontFamily: 'var(--font-accent)' }}>
            퀘스트 로딩 중...
          </span>
          <span className="text-[12px] text-[#38bdf8]" style={{ fontFamily: 'var(--font-title)' }}>
            {progress}%
          </span>
        </div>
        
        {/* 8-Bit Block Progress Bar */}
        <div className="h-10 border-4 border-[#23233f] bg-black flex p-1 gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i}
              className="flex-1 transition-all duration-300"
              style={{ 
                backgroundColor: (i * 10 < progress) ? '#10b981' : 'transparent',
                border: (i * 10 < progress) ? '1px solid #000' : 'none'
              }}
            />
          ))}
        </div>

        <p className="text-center text-[10px] text-[#64748b] mt-2" style={{ fontFamily: 'var(--font-title)' }}>
          VER 4.0.2 - BLOCK ADVENTURE ENGINE
        </p>
      </div>

      <style>{`
        @keyframes float-y {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  )
}
