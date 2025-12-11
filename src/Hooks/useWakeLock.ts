import { useEffect, useRef } from "react";

export function useWakeLock(active: boolean) {
    const wakeLockRef = useRef<any>(null);
    const intervalRef = useRef<number | null>(null);

    async function requestLock() {
        try {
            // @ts-ignore
            const lock = await navigator.wakeLock.request("screen");
            wakeLockRef.current = lock;

            lock.addEventListener("release", () => {
                console.log("Wake lock was released by OS");
                if (active) {
                    requestLock(); // Re-request automatically
                }
            });

            console.log("Wake lock acquired");
        } catch (err: any) {
            console.warn("Wake lock request failed:", err.message);
        }
    }

    function releaseLock() {
        if (wakeLockRef.current) {
            wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    }

    useEffect(() => {
        if (active) {
            requestLock();

            // Ping every 30 seconds to keep Android from dropping the lock
            intervalRef.current = window.setInterval(() => {
                if (document.visibilityState === "visible" && active) {
                    requestLock();
                }
            }, 30000);
        } else {
            releaseLock();
        }

        return () => {
            releaseLock();
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [active]);
}
