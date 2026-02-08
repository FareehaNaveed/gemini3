export enum AppTab {
  DASHBOARD = 'dashboard',
  CODE_AUDITOR = 'code_auditor',
  CLOUD_GUARD = 'cloud_guard',
  OSINT_SCAN = 'osint_scan',
  PASSWORD_VAULT = 'password_vault',
  SOC_CHAT = 'soc_chat',
  AUDIT_VAULT = 'audit_vault'
}

export interface AuditResult {
  id: string;
  timestamp: string;
  type: 'CODE' | 'CLOUD' | 'OSINT' | 'URL' | 'BREACH' | 'PASSWORD';
  content: string;
  summary: string;
  score?: number;
  remediation?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdate: string;
}