type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface JobListing {
  title: string;
  company: string;
  location: string;
  url: string;
  platform: string;
}

interface ExtensionMessage {
  type: 'status' | 'pair' | 'prepare-current-job' | 'fill-current-form' | 'disconnect' | 'page-pair'
    | 'start-visible-automation' | 'capture-selected-post' | 'finish-recruiter-run';
  code?: string;
  apiBaseUrl?: string;
  profile?: Record<string, string>;
  taskId?: string;
  requestId?: string;
  targetUrl?: string;
  runId?: string;
}

interface ExtensionResponse {
  ok: boolean;
  status?: ConnectionStatus;
  message?: string;
  taskId?: string;
  job?: JobListing;
  windowId?: number;
  runId?: string;
  postNumber?: number;
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

interface SelectedPost {
  text: string;
  url: string;
  title: string;
}

interface RecruiterRun {
  id: string;
  maxPosts: number;
}
