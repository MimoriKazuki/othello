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
        px-16 py-8 text-4xl font-black rounded-3xl doubt-button
        transition-all duration-300 transform relative overflow-hidden
        ${disabled 
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60 shadow-lg' 
          : 'bg-white text-black hover:bg-gray-200 hover:scale-110 active:scale-95 shadow-2xl border-4 border-gray-400'
        }
      `}
    >
      <span className="relative z-10 tracking-wider">
        DOUBT!
      </span>
    </button>
  )
}