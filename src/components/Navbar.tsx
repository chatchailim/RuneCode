import React from 'react';
import { HelpCircle } from 'lucide-react';

export type ActiveTab = 'minter' | 'lab' | 'scanner' | 'federation' | 'trust';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSpecs: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, onOpenSpecs, onOpenHelp }) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/90 sticky top-0 z-40 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#minter"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('minter');
        }}
        className="text-lg font-bold tracking-tight text-slate-100 hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
      >
        <span className="font-mono text-cyan-400">RC1</span>
        <span>RuneCode v1.0</span>
      </a>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('minter')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'minter' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Studio
        </button>
        <button
          onClick={() => onSelectTab('lab')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'lab' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Glyph Lab
        </button>
        <button
          onClick={() => onSelectTab('scanner')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'scanner' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Scanner
        </button>
        <button
          onClick={() => onSelectTab('federation')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'federation' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Federation
        </button>
        <button
          onClick={() => onSelectTab('trust')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'trust' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Trust & DID
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer border border-slate-700/80"
          title="คู่มือการใช้งานและคำอธิบายระบบ"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Help</span>
        </button>

        <button
          onClick={onOpenSpecs}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Specification
        </button>
      </div>
    </header>
  );
};
