export const getBaseUrl = () => {
    // 1. Client-Side Check: This runs in the browser.
    // window.location.origin reliably gives the current domain
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // 2. Server-Side Check: This runs during SSR on Vercel.
    // process.env.VERCEL_URL is defined by Vercel's build environment.
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // 3. Fallback for Local SSR (Should rarely be needed now)
    return `http://localhost:${process.env.PORT ?? 3000}`;
};  