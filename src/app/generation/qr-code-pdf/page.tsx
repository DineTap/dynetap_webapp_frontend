import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";
import "../qr-menu-pdf/styles.css";

const validationSchema = z.object({
    qrCodeUrl: z.string(),
    menuLogoImageUrl: z.string().nullable().optional(),
    qrCodeEnabled: z.coerce.boolean().optional(),
});

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    // Parse with fallback for optional fields to avoid validation errors if they aren't passed
    const validatedValues = validationSchema.parse(params);
    const { qrCodeUrl, menuLogoImageUrl, qrCodeEnabled } = validatedValues;

    return (
        <div className="absolute bottom-0 left-0 right-0 top-0 w-screen bg-white">
            <div className="grid w-full grid-cols-3 gap-8 p-8">
                {Array(12)
                    .fill(0)
                    .map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center border border-dashed border-gray-300 p-8 rounded-lg aspect-square"
                        >
                            <QRCodeSVG
                                size={200}
                                value={qrCodeUrl}
                                level="M"
                                {...(menuLogoImageUrl &&
                                    qrCodeEnabled && {
                                    imageSettings: {
                                        src: menuLogoImageUrl,
                                        height: 48,
                                        width: 48,
                                        excavate: false,
                                    },
                                })}
                            />
                            <p className="mt-4 text-sm font-medium text-gray-500">Scan for Menu</p>
                        </div>
                    ))}
            </div>
        </div>
    );
}
