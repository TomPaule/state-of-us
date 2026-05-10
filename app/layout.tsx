import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/ui/Nav'

export const metadata: Metadata = {
  title: 'The State of Us — Societal Health Index',
  description:
    'A civic intelligence platform tracking twelve vital signs of societal health. ' +
    'Understand where we are, what keeps us stuck, and what you can do about it.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900">
        <Nav />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-stone-200 py-12 mt-24">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6 text-sm text-stone-500">
            <div>
              <span className="font-display font-medium text-stone-700">The State of Us</span>
              <span className="mx-2">·</span>
              Prototype · US national focus · Placeholder data
            </div>
            <div className="flex gap-6">
              <a href="/methodology" className="hover:text-stone-900 transition-colors">Methodology</a>
              <a href="/about" className="hover:text-stone-900 transition-colors">About</a>
              <a href="/tracker" className="hover:text-stone-900 transition-colors">Policy tracker</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}