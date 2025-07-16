'use client'

interface DoubtButtonProps {
  onClick: () => void
  disabled: boolean
}

export default function DoubtButton({ onClick, disabled }: DoubtButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-20 py-10 text-5xl font-black rounded-full doubt-button
        transition-all duration-300 transform relative overflow-hidden
        ${disabled 
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 shadow-lg' 
          : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 hover:scale-110 active:scale-95 shadow-2xl border-4 border-red-700 animate-pulse hover:animate-none'
        }
      `}
    >
      <span className="relative z-10 tracking-wider flex items-center gap-2">
        {!disabled && (
          <>
            <span className="text-yellow-300 animate-bounce">⚠️</span>
            <span>DOUBT!</span>
            <span className="text-yellow-300 animate-bounce">⚠️</span>
          </>
        )}
        {disabled && <span>DOUBT!</span>}
      </span>
      {!disabled && (
        <div className="absolute inset-0 bg-yellow-400 opacity-20 animate-ping" />
      )}
    </button>
  )
}