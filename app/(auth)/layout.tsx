export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Metrik */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold tracking-tight text-neutral-900">Metrik</span>
        </div>
        {children}
      </div>
    </div>
  )
}
