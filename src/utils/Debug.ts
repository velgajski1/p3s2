export function isTopbarDebugEnabled(): boolean {
    return typeof window !== 'undefined'
        && (new URLSearchParams(window.location.search).has('debugTopbar') || (window as any).topbarDebug === true);
}

export function topbarDebugLog(message: string, data?: Record<string, unknown>): void {
    if (!isTopbarDebugEnabled()) return;
    console.log(`[topbar-debug] ${message}`, data || {});
}

export function claimTopbarOwner(ownerId: string, reason: string): void {
    if (typeof window === 'undefined') return;
    (window as any).activeTopbarOwnerId = ownerId;
    topbarDebugLog('topbar owner claimed', { ownerId, reason });
}

export function releaseTopbarOwner(ownerId: string, reason: string): void {
    if (typeof window === 'undefined') return;
    if ((window as any).activeTopbarOwnerId !== ownerId) return;
    delete (window as any).activeTopbarOwnerId;
    topbarDebugLog('topbar owner released', { ownerId, reason });
}

export function getActiveTopbarOwnerId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return (window as any).activeTopbarOwnerId;
}
