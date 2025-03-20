export default function UnderDevelopment() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-200">Under Development</h1>
        <p className="text-gray-400 max-w-md">
          This feature is currently under development. Please check back later for updates.
        </p>
        <div className="mt-8">
          <svg 
            className="w-16 h-16 mx-auto text-cyan-500/30" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
} 