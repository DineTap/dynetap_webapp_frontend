import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import CardTableImage from "~/assets/card-table.png";
import Image from "next/image";
import { type PrintCreatorFormValues } from "../../MenuPrintCreator.schema";
import { useCallback, useEffect, useRef, useState } from "react";
import { MenuCard } from "~/components/MenuCard/MenuCard";
import { stringify } from "querystring";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";

import { MenuCardPdfDocument } from "./MenuCardPdfDocument";

const MENU_SCALE = 0.4;

export const MenuPdfGenerator = (
  menuProps: PrintCreatorFormValues & {
    qrCodeUrl: string;
  },
) => {
  const plateRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const initialSizeSet = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { t } = useTranslation();

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const qrCodeDataUri = await QRCode.toDataURL(menuProps.qrCodeUrl, {
        width: 400,
        margin: 0,
        errorCorrectionLevel: "M",
      });

      const blob = await pdf(
        <MenuCardPdfDocument
          {...menuProps}
          qrCodeDataUri={qrCodeDataUri}
          translations={{
            menuOnline: "Menu Online", // Fallback or use translation keys if needed but logic is inside component
            followUs: "Follow us on social media!",
            scanQr: "Scan the QR code to check our online menu!",
            wifiPassword: t("menuPrintCreator.wifiPasswordLabel") + ":", // Using label as approximation or literal
          }}
        // We need simple strings for translation from t() if available, but hardcoded in MenuCard.tsx
        // Let's match MenuCard.tsx as closely as possible.
        // MenuCard.tsx uses hardcoded English strings for "Follow us..." and "Scan..." except mostly.
        // Actually MenuCard.tsx has:
        // "Menu Online" (Hardcoded)
        // "Follow us on social media!" (Hardcoded)
        // "Scan the QR code to check our online menu!" (Hardcoded)
        // "WiFi Password:" (Hardcoded)
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `menu-cards-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };



  const updateCardSize = useCallback(() => {
    if (!cardRef.current) return;
    const cardHeight = cardRef.current.clientHeight;

    const rects = plateRef.current?.getClientRects();
    const plateHeight = rects?.[0]?.height || 0;
    const newCardHeight = plateHeight * MENU_SCALE;
    const scale = newCardHeight / cardHeight;

    cardRef.current.style.cssText = `--tw-scale-x: ${scale}; --tw-scale-y: ${scale}`;
  }, []);

  useEffect(() => {
    if (!plateRef.current) return;
    if (!initialSizeSet.current) {
      updateCardSize();

      initialSizeSet.current = true;
    }

    window.addEventListener("resize", updateCardSize);

    return () => {
      window.removeEventListener("resize", updateCardSize);
    };
  }, [updateCardSize]);

  return (
    <div className="flex h-full w-full grow flex-col  items-center justify-center gap-4">
      <div className="relative " ref={plateRef}>
        <Image
          src={CardTableImage}
          alt="Plate"
          className="h-full w-full select-none  "
          onLoadingComplete={updateCardSize}
        />
        <div
          ref={cardRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.40]  shadow-2xl"
        >
          <MenuCard {...menuProps} />
        </div>
      </div>
      <div className="flex w-full gap-4">
        <Button
          onClick={handleDownloadImage}
          loading={isGenerating}
          className="flex-1"
        >
          {t("menuPdfGenerator.generatePDFToPrint")}
        </Button>
      </div>
    </div>
  );
};
