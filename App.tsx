import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CodeAuditor from './components/CodeAuditor';
import CloudGuard from './components/CloudGuard';
import OSINTScan from './components/OSINTScan';
import PasswordVault from './components/PasswordVault';
import SOCChat from './components/SOCChat';
import AuditVault from './components/AuditVault';
import Footer from './components/Footer';
import { AppTab, AuditResult } from './types';
import { Menu, X, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [auditHistory, setAuditHistory] = useState<AuditResult[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load history from localStorage on initial mount
  useEffect(() => {
    const saved = localStorage.getItem('ciphersync_audit_vault');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAuditHistory(parsed);
        }
      } catch (e) {
        console.error("Vault corruption detected. Reinitializing.", e);
      }
    }
  }, []);

  // Sync history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ciphersync_audit_vault', JSON.stringify(auditHistory));
  }, [auditHistory]);

  const addToHistory = (result: Omit<AuditResult, 'id' | 'timestamp'>) => {
    const newEntry: AuditResult = {
      ...result,
      id: `CS-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString(),
    } as AuditResult;
    
    setAuditHistory(prev => [newEntry, ...prev].slice(0, 100));
  };

  const deleteHistoryItem = (id: string) => {
    setAuditHistory(prev => prev.filter(item => item.id !== id));
  };

  const purgeHistory = () => {
    setAuditHistory([]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return <Dashboard auditCount={auditHistory.length} />;
      case AppTab.CODE_AUDITOR: return <CodeAuditor onAuditComplete={(res: any) => addToHistory({ ...res, type: 'CODE' })} />;
      case AppTab.CLOUD_GUARD: return <CloudGuard onAuditComplete={(res: any) => addToHistory({ ...res, type: 'CLOUD' })} />;
      case AppTab.OSINT_SCAN: return <OSINTScan onAuditComplete={(res: any) => addToHistory({ ...res, type: 'OSINT' })} />;
      case AppTab.PASSWORD_VAULT: return <PasswordVault />;
      case AppTab.SOC_CHAT: return <SOCChat />;
      case AppTab.AUDIT_VAULT: return <AuditVault history={auditHistory} onPurge={purgeHistory} onDeleteItem={deleteHistoryItem} />;
      default: return <Dashboard auditCount={auditHistory.length} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-50 overflow-hidden font-mono">
      {/* Sidebar - Controlled by Hamburger */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-900 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} 
          closeSidebar={() => setIsSidebarOpen(false)} 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto relative">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 h-16 bg-slate-950/90 border-b border-slate-900 z-40 flex items-center px-6 justify-between backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="text-cyan-400 hover:bg-slate-900 p-2 rounded-lg transition-colors border border-transparent hover:border-cyan-400/20"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="font-black tracking-tighter text-white font-mono text-lg flex items-center gap-2">
              <Shield size={20} className="text-cyan-400" />
              CIPHERSYNC
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            DEFENSE SYSTEMS ACTIVE
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-10 pb-20">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </div>
        <Footer />
      </main>

      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;