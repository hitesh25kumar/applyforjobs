type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface JobListing {
  title: string;
  company: string;
  location: string;
  url: string;
  platform: string;
}

interface ExtensionMessage {
  type: 'status' | 'pair' | 'prepare-current-job' | 'fill-current-form' | 'disconnect' | 'page-pair';
  code?: string;
  apiBaseUrl?: string;
  profile?: Record<string, string>;
  taskId?: string;
  requestId?: string;
}

interface ExtensionResponse {
  ok: boolean;
  status?: ConnectionStatus;
  message?: string;
  taskId?: string;
  job?: JobListing;
}

interface StoredConnection {
  apiBaseUrl: string;
  token: string;
  expiresAt: string;
}

interface TaskRecord {
  id: string;
  state: string;
  job: JobListing;
}
