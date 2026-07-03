import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import NextTopLoader from 'nextjs-toploader'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { AuthProvider } from '@/context/AuthContext'
import { CountryProvider } from '@/context/CountryContext'
import { HtmlLocale } from '@/components/ui/HtmlLocale'
import { routing } from '@/i18n/routing'
import { getPublicSettings } from '@/lib/api'

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
  const settings = await getPublicSettings()

  return (
    <NextIntlClientProvider messages={messages}>
      <CountryProvider locale={locale}>
        <HtmlLocale />
        <NextTopLoader color="#C9A84C" height={2} showSpinner={false} />
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton number={settings.contact_whatsapp} />
          {settings.google_analytics_id && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`} strategy="afterInteractive" />
              <Script id="ga4-init" strategy="afterInteractive">{`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.google_analytics_id}');
              `}</Script>
            </>
          )}
        </AuthProvider>
      </CountryProvider>
    </NextIntlClientProvider>
  )
}
