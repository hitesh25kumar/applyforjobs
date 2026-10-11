window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window || event.origin !== location.origin) return;
  if (!event.data || event.data.source !== 'job-applyer-dashboard') return;

  const request = event.data as {
    type?: string;
    code?: string;
    apiBaseUrl?: string;
    requestId?: string;
  };
  if (request.type === 'pair-extension' && typeof request.code === 'string') {
    void chrome.runtime.sendMessage({
      type: 'pair',
      code: request.code,
      apiBaseUrl: request.apiBaseUrl,
    }).then((response) => {
      window.postMessage({
        source: 'job-applyer-extension',
        type: 'pair-result',
        requestId: request.requestId,
        response,
      }, location.origin);
    }).catch((error: unknown) => {
      window.postMessage({
        source: 'job-applyer-extension',
        type: 'pair-result',
        requestId: request.requestId,
        response: {
          ok: false,
          message: error instanceof Error ? error.message : 'Could not pair the extension.',
        },
      }, location.origin);
    });
    return;
  }

  if (request.type === 'extension-status') {
    void chrome.runtime.sendMessage({ type: 'status' }).then((response) => {
      window.postMessage({
        source: 'job-applyer-extension',
        type: 'status-result',
        requestId: request.requestId,
        response,
      }, location.origin);
    });
  }
});
