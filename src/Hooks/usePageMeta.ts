import { useEffect } from "react";

const FAVICON_SELECTOR = 'link[rel="icon"]';

export function usePageMeta(title: string, faviconHref: string) {
    useEffect(() => {
        const previousTitle = document.title;
        const link = document.querySelector<HTMLLinkElement>(FAVICON_SELECTOR);
        const previousFavicon = link?.getAttribute("href") ?? null;

        document.title = title;
        if (link) link.setAttribute("href", faviconHref);

        return () => {
            document.title = previousTitle;
            if (link && previousFavicon) link.setAttribute("href", previousFavicon);
        };
    }, [title, faviconHref]);
}
