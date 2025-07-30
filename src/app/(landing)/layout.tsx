import ClientProviders from '@/context/reduxProviderContext'
import '../globals.css'

export const metadata = {
  title: 'Cashbook Assist',
  description: 'Effortless Cashbook Management for Your Business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
