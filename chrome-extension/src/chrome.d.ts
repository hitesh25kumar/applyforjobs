declare namespace chrome {
  namespace runtime {
    const onMessage: {
      addListener(
        listener: (
          message: ExtensionMessage,
          sender: unknown,
          sendResponse: (response: ExtensionResponse) => void,
        ) => boolean | void,
      ): void;
    };
    function sendMessage(message: ExtensionMessage): Promise<ExtensionResponse>;
  }

  namespace storage {
    namespace local {
      function get(keys: string[]): Promise<Record<string, unknown>>;
      function set(items: Record<string, unknown>): Promise<void>;
      function remove(keys: string[]): Promise<void>;
    }
  }
  namespace alarms {
    const onAlarm: { addListener(listener: (alarm: { name: string }) => void): void };
    function create(name: string, info: { periodInMinutes?: number; delayInMinutes?: number }): void;
  }
  namespace tabs {
    function query(queryInfo: { active: boolean; lastFocusedWindow: boolean }): Promise<Array<{ id?: number; url?: string }>>;
    function sendMessage(tabId: number, message: ExtensionMessage): Promise<ExtensionResponse>;
  }
  namespace scripting {
    function executeScript<T>(details: {
      target: { tabId: number };
      func: (...args: never[]) => T;
      args?: unknown[];
    }): Promise<Array<{ result?: T }>>;
  }
  namespace windows {
    function create(details: { url: string; focused?: boolean; type?: 'normal' }): Promise<{ id?: number }>;
  }
}

declare function importScripts(...urls: string[]): void;
