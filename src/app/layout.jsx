import './globals.css'
import { Inter } from 'next/font/google'
import MaintenanceOverlay from '@/components/MaintenanceOverlay'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ATRA Platform',
  description: 'Advanced Threat Response & Analysis Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <MaintenanceOverlay />
      </body>
    </html>
  )
} 