
import React from "react";
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Image,
    Svg,
    Path,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        flexWrap: "wrap",
    },
    cardContainer: {
        width: "50%",
        height: "50%",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: "100%",
        height: "100%",
        backgroundColor: "#F1F5F9",
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#E2E8F0",
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
        gap: 32,
    },
    topSection: {
        width: "100%",
        alignItems: "center",
        gap: 12,
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    qrWrapper: {
        position: "relative",
        width: 160,
        height: 160,
    },
    qrImage: {
        width: "100%",
        height: "100%",
    },
    logoImage: {
        position: "absolute",
        top: 61,
        left: 61,
        width: 38,
        height: 38,
        objectFit: "contain",
    },
    socialsContainer: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#000000",
        paddingBottom: 4,
        marginBottom: 8,
        width: "100%",
    },
    socialItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    socialIcon: {
        width: 16,
        height: 16,
    },
    socialText: {
        fontSize: 12,
    },
    socialLabel: {
        fontSize: 12,
        textAlign: "center",
    },
    bottomSection: {
        alignItems: "center",
        gap: 8,
    },
    scanText: {
        fontSize: 12,
        textAlign: "center",
    },
    wifiContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
        alignItems: "center",
    },
    wifiText: {
        fontSize: 12,
    },
    wifiPassword: {
        fontSize: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#000000",
    },
});

interface MenuCardPdfDocumentProps {
    qrCodeDataUri: string;
    menuLogoImageUrl?: string | null;
    qrCodeEnabled: boolean;
    restaurantNameEnabled: boolean;
    restaurantName: string;
    instagramEnabled: boolean;
    instagramHandle?: string | null;
    facebookEnabled: boolean;
    facebookName?: string | null;
    tiktokEnabled: boolean;
    tiktokHandle?: string | null;
    wifiPasswordEnabled: boolean;
    wifiPassword?: string;
    translations: {
        menuOnline: string;
        followUs: string;
        scanQr: string;
        wifiPassword: string;
    };
}

const Icons = {
    instagram:
        "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z M17.5 6.5h.01",
    facebook:
        "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    tiktok: "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5",
    wifi: "M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01",
};

export const MenuCardPdfDocument = ({
    qrCodeDataUri,
    menuLogoImageUrl,
    qrCodeEnabled,
    restaurantNameEnabled,
    restaurantName,
    instagramEnabled,
    instagramHandle,
    facebookEnabled,
    facebookName,
    tiktokEnabled,
    tiktokHandle,
    wifiPasswordEnabled,
    wifiPassword,
    translations,
}: MenuCardPdfDocumentProps) => {
    const Card = () => (
        <View style={styles.card}>
            <View style={styles.topSection}>
                <Text style={styles.restaurantName}>
                    {restaurantNameEnabled ? restaurantName : translations.menuOnline}
                </Text>
                <View style={styles.qrWrapper}>
                    {qrCodeDataUri && (
                        <Image src={qrCodeDataUri} style={styles.qrImage} />
                    )}
                    {qrCodeEnabled && menuLogoImageUrl && (
                        <Image src={menuLogoImageUrl} style={styles.logoImage} />
                    )}
                </View>
                {(() => {
                    const socialItems = [
                        instagramEnabled && instagramHandle && { icon: Icons.instagram, text: instagramHandle },
                        facebookEnabled && facebookName && { icon: Icons.facebook, text: facebookName },
                        tiktokEnabled && tiktokHandle && { icon: Icons.tiktok, text: tiktokHandle },
                    ].filter((item): item is { icon: string; text: string } => Boolean(item));

                    return (
                        <View style={styles.socialsContainer}>
                            {socialItems.map((item, index) => (
                                <View key={index} style={styles.socialItem}>
                                    <Svg style={styles.socialIcon} viewBox="0 0 24 24">
                                        <Path
                                            d={item.icon}
                                            fill="none"
                                            stroke="black"
                                            strokeWidth={2}
                                        />
                                    </Svg>
                                    <Text style={styles.socialText}>{item.text}</Text>
                                </View>
                            ))}
                        </View>
                    );
                })()}
            </View>
            <View style={styles.bottomSection}>
                <Text style={styles.scanText}>{translations.scanQr}</Text>
                {wifiPasswordEnabled && (
                    <View style={styles.wifiContainer}>
                        <Svg style={styles.socialIcon} viewBox="0 0 24 24">
                            <Path
                                d={Icons.wifi}
                                fill="none"
                                stroke="black"
                                strokeWidth={2}
                            />
                        </Svg>
                        <Text style={styles.wifiText}>{translations.wifiPassword}</Text>
                        <Text style={styles.wifiPassword}>{wifiPassword}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {Array(4)
                    .fill(0)
                    .map((_, i) => (
                        <View key={i} style={styles.cardContainer}>
                            <Card />
                        </View>
                    ))}
            </Page>
        </Document>
    );
};
