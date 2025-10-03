'use client'

export default function InteractiveBall() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-80 h-80">
        {/* Main 3D Ball */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 shadow-2xl animate-pulse">
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
          
          {/* Highlight */}
          <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/30 blur-sm"></div>
          
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin" style={{ animationDuration: '8s' }}></div>
          
          {/* Floating particles */}
          <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute -top-4 right-8 w-3 h-3 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-4 -right-2 w-5 h-5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-2 left-12 w-2 h-2 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        {/* Orbiting elements */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s' }}>
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg"></div>
        </div>
        
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-teal-500 shadow-lg"></div>
        </div>
        
        {/* Pulsing base glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl animate-pulse" style={{ animationDuration: '3s' }}></div>
      </div>
    </div>
  )
}