import { ThemeToggle } from '@/components/theme-toggle'

export default function PublicTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 border-2 border-primary/30">
          <ThemeToggle />
        </div>
      </div>
      {children}
    </>
  )
}
