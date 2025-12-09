import { TailwindIndicator } from "~/components/TailwindIndicator";
import { detectLanguage, useServerTranslation } from "~/i18n";
import { Providers } from "~/providers";
import "~/styles/globals.css";
import { cn } from "~/utils/cn";
import { Roboto } from "next/font/google";
import { Toaster } from "~/components/ui/toaster";
import { ReactQueryProvider } from "~/providers/ReactQueryProvider/ReactQueryProvider";
import { getServerUser } from "~/utils/auth";
import { AuthProvider } from "~/providers/AuthProvider/AuthProvider";
import { type Metadata } from "next";
import { Navbar } from "~/components/Navbar/Navbar";
import { Footer } from "~/pageComponents/LandingPage/molecules/Footer";

export async function generateMetadata() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = await useServerTranslation();

  return {
    title: t("globalMetadata.title"),
    description: t("globalMetadata.title"),
    keywords: (t("globalMetadata.keywords") as string).split(","),
    category: "restaurant menu builder",
    metadataBase: new URL("https://www.dynetap.com/"),
    openGraph: {
      type: "website",
      locale: t("globalMetadata.openGraph.locale"),
      title: t("globalMetadata.openGraph.title"),
      url: "https://www.dynetap.com/",
      description: t("globalMetadata.openGraph.description"),
      siteName: t("globalMetadata.openGraph.siteName"),
    },
    robots: {
      follow: true,
      index: true,
    },
    twitter: {
      card: "summary_large_image",
      title: t("globalMetadata.twitter.title"),
      description: t("globalMetadata.twitter.description"),
      site: "@dynetap",
    },
  } satisfies Metadata;
}

const font = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialLanguage = await detectLanguage(); // Detect on server, pass to client

  const user = await getServerUser();


  return (
    <>
      <html lang={initialLanguage} suppressHydrationWarning>
        <head />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <body
          className={cn(
            "min-h-screen bg-background antialiased",
            font.className,
          )}
        >
          <ReactQueryProvider>
            <AuthProvider {...user}>
              <Providers initialLanugage={initialLanguage}>

                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  {children}
                  <TailwindIndicator />
                  <Footer />
                </div>
                <Toaster />
              </Providers>
            </AuthProvider>
          </ReactQueryProvider>
        </body>
      </html>
    </>
  );
}

export default RootLayout;
