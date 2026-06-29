import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { AuthProvider } from '@/context/AuthContext'
import { CountryProvider } from '@/context/CountryContext'
import { HtmlLocale } from '@/components/ui/HtmlLocale'
import { routing } from '@/i18n/routing'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'de' | 'ar')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <CountryProvider locale={locale}>
        <HtmlLocale />
        <NextTopLoader color="#C9A84C" height={2} showSpinner={false} />
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
      </CountryProvider>
    </NextIntlClientProvider>
  )
}
