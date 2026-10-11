export async function probeConnection(signal?: AbortSignal): Promise<boolean> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, {once: true});
    if (signal?.aborted) abort();
    const timeout = window.setTimeout(abort, 5000);
    try {
        // HEAD is network-only in the worker. Do not mistake a cached page or login redirect for connectivity.
        return (await fetch('/', {method: 'HEAD', cache: 'no-store', redirect: 'error', signal: controller.signal})).ok;
    } catch {
        return false;
    } finally {
        window.clearTimeout(timeout);
        signal?.removeEventListener('abort', abort);
    }
}
