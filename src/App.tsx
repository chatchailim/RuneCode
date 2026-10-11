import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { StudioMinter } from './components/StudioMinter';
import { GlyphLab } from './components/GlyphLab';
import { ScannerDecoder } from './components/ScannerDecoder';
import { FederationExplorer } from './components/FederationExplorer';
import { TrustAuthority } from './components/TrustAuthority';
import { DevSpecsModal } from './components/DevSpecsModal';
import { HelpModal } from './components/HelpModal';
import { createInitialRegistry } from './lib/runecode/sampleData';
import { CanonicalRuneRecord } from './lib/runecode/types';
import { HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('minter');
  const [registry, setRegistry] = useState<CanonicalRuneRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load or initialize registry
  useEffect(() => {
    async function loadData() {
      const stored = localStorage.getItem('nextwaver_runecode_registry');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRegistry(parsed);
            setIsLoading(false);
            return;
          }
        } catch {
          // Fallback to sample data
        }
      }

      const initial = await createInitialRegistry();
      setRegistry(initial);
      localStorage.setItem('nextwaver_runecode_registry', JSON.stringify(initial));
      setIsLoading(false);
    }

    loadData();
  }, []);

  const handleMintSuccess = (newRecord: CanonicalRuneRecord) => {
    setRegistry((prev) => {
      const updated = [newRecord, ...prev.filter((r) => r.runeId !== newRecord.runeId)];
      localStorage.setItem('nextwaver_runecode_registry', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectRecordFromScanner = (record: CanonicalRuneRecord) => {
    setSelectedRecordId(record.runeId);
    setActiveTab('federation');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* 3-Zone Top Navigation Contract */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Mobile Navigation Strip */}
      <div className="md:hidden flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-3 py-2 overflow-x-auto text-xs gap-1.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('minter')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'minter' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'lab' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Glyph Lab
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'scanner' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('federation')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'federation' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Federation
          </button>
          <button
            onClick={() => setActiveTab('trust')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'trust' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Trust & DID
          </button>
        </div>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="px-2.5 py-1.5 bg-slate-800 text-cyan-300 font-medium rounded-lg shrink-0 flex items-center gap-1"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Help</span>
        </button>
      </div>

      {/* Main Workspace Viewport */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
        {isLoading ? (
          <div className="py-24 text-center text-slate-500 text-sm animate-pulse">
            Bootstrapping RuneCode Federation Registry & Ed25519 Root Keyrings...
          </div>
        ) : (
          <>
            {activeTab === 'minter' && (
              <StudioMinter onMintSuccess={handleMintSuccess} />
            )}
            {activeTab === 'lab' && <GlyphLab />}
            {activeTab === 'scanner' && (
              <ScannerDecoder
                registry={registry}
                onSelectRecord={handleSelectRecordFromScanner}
              />
            )}
            {activeTab === 'federation' && (
              <FederationExplorer
                records={registry}
                selectedRecordId={selectedRecordId}
                onAddNewClick={() => setActiveTab('minter')}
                onBatchMinted={(batch) => {
                  setRegistry((prev) => {
                    const updated = [...batch, ...prev];
                    localStorage.setItem('nextwaver_runecode_registry', JSON.stringify(updated));
                    return updated;
                  });
                }}
              />
            )}
            {activeTab === 'trust' && (
              <TrustAuthority
                registry={registry}
                onMintedRecord={handleMintSuccess}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">RuneCode v1.0</span>
            <span aria-hidden="true">·</span>
            <span>Nextwaver Open Visual Identifier Standard</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              คู่มือการใช้งาน (User Manual)
            </button>
            <span aria-hidden="true">/</span>
            <span>OneManOS</span>
            <span aria-hidden="true">/</span>
            <span>OneVault</span>
            <span aria-hidden="true">/</span>
            <span>MyAI</span>
            <span aria-hidden="true">/</span>
            <span>BookChain</span>
          </div>
        </div>
      </footer>

      {/* Help & Beginners User Manual Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onNavigateToTab={(t) => setActiveTab(t)}
      />

      {/* Developer Specs & Protocol Modal */}
      <DevSpecsModal isOpen={isSpecsOpen} onClose={() => setIsSpecsOpen(false)} />
    </div>
  );
}
