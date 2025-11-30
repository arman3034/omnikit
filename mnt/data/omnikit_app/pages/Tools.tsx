import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Type, Settings, Sparkles, ChevronRight, ArrowLeft, Box, Download, FileText, Lightbulb } from 'lucide-react';
import { Badge, Button } from '../components/UIComponents';
import { TextConverter, MarkdownPreview } from '../tools/TextTools';
import { QRGenerator, PasswordGenerator, ColorPalette } from '../tools/UtilityTools';
import { AiSummarizer } from '../tools/AiTools';
import { Tool, ToolCategory } from '../types';
import { generateMarkdownCheatSheet } from '../services/pdfGenerator';
import { useToast } from '../components/Toast';

export const TOOLS_DATA: Tool[] = [
  {
    id: 'text-converter',
    name: 'Text Converter',
    description: 'Case conversion and text statistics.',
    instructions: "Ever pasted text that was all screaming in CAPS or totally lowercase? This tool fixes that instantly. Just paste your text, click the format you want (like Sentence case), and copy it back. It's perfect for fixing messy email subjects or social media posts without retyping everything.",
    category: 'text',
    icon: Type,
    component: <TextConverter />,
    path: 'text-converter'
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Live Markdown to HTML editor.',
    instructions: "Writing for the web? Markdown is the standard, but it's hard to visualize in your head. Type on the left side, and see exactly how it will look on the right. It's a lifesaver for checking your README files, blog posts, or documentation before you hit publish.",
    category: 'text',
    icon: Type,
    component: <MarkdownPreview />,
    path: 'markdown-preview'
  },
  {
    id: 'ai-summary',
    name: 'AI Summarizer',
    description: 'Condense text using Gemini AI.',
    instructions: "We've all faced walls of text we simply don't have time to read. Paste that long email, report, or article here, and let our AI give you the gist in seconds. It saves you time while ensuring you don't miss the important details.",
    category: 'ai',
    icon: Sparkles,
    component: <AiSummarizer />,
    path: 'ai-summary'
  },
  {
    id: 'qr-generator',
    name: 'QR Generator',
    description: 'Create QR codes from text/URLs.',
    instructions: "Need to share a Wi-Fi password, a website link, or a contact card quickly? Don't make people type it out. Enter the info here, generate a code, and let them scan it with their phone. It's the fastest way to bridge the physical and digital worlds.",
    category: 'utility',
    icon: Settings,
    component: <QRGenerator />,
    path: 'qr-generator'
  },
  {
    id: 'password-generator',
    name: 'Password Gen',
    description: 'Secure random password creation.',
    instructions: "Using 'password123' is a security nightmare. Use this tool to create a rock-solid, unhackable password. You can adjust the length and complexity, then copy it straight to your password manager. Stay safe out there!",
    category: 'utility',
    icon: Settings,
    component: <PasswordGenerator />,
    path: 'password-generator'
  },
  {
    id: 'color-palette',
    name: 'Color Palette',
    description: 'Generate random color schemes.',
    instructions: "Stuck on design ideas? Don't overthink it. Hit the button to get fresh, harmonious color combinations instantly. It's the fastest way to break through creative block for web designers, artists, or anyone looking for a little aesthetic inspiration.",
    category: 'utility',
    icon: Settings,
    component: <ColorPalette />,
    path: 'color-palette'
  }
];

const Tools: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const { showToast } = useToast();
  
  const activeCategory = searchParams.get('category') as ToolCategory | 'all' || 'all';
  const toolIdFromUrl = searchParams.get('tool');

  // Sync state with URL param
  useEffect(() => {
    if (toolIdFromUrl) {
      const tool = TOOLS_DATA.find(t => t.id === toolIdFromUrl);
      if (tool) setSelectedTool(tool);
    } else {
      setSelectedTool(null);
    }
  }, [toolIdFromUrl]);

  const categories: { id: ToolCategory | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Tools', icon: Box },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'utility', label: 'Utilities', icon: Settings },
    { id: 'ai', label: 'AI Magic', icon: Sparkles },
  ];

  const filteredTools = activeCategory === 'all' 
    ? TOOLS_DATA 
    : TOOLS_DATA.filter(t => t.category === activeCategory);

  const handleToolSelect = (tool: Tool) => {
    setSearchParams({ tool: tool.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSelection = useCallback(() => {
    setSearchParams(activeCategory === 'all' ? {} : { category: activeCategory });
  }, [setSearchParams, activeCategory]);

  const handleDownloadPdf = () => {
    try {
      generateMarkdownCheatSheet();
      showToast('Opening PDF in new tab...', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate PDF', 'error');
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTool) {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool, clearSelection]);

  if (selectedTool) {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <nav aria-label="Breadcrumb" className="mb-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={clearSelection}
              className="flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium group px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Back to tools list"
            >
              <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
              Back to Tools
            </button>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 hidden md:inline-block" aria-hidden="true">
              Press ESC to close
            </span>
          </div>
        </nav>
        
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400" aria-hidden="true">
                <selectedTool.icon size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTool.name}</h1>
                <p className="text-slate-500 dark:text-slate-400">{selectedTool.description}</p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8">
            {/* Helpful Guide / Instructions Block */}
            {selectedTool.instructions && (
              <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-800 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex gap-4 text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
                 <div className="bg-white dark:bg-slate-900 p-2 rounded-lg h-fit shadow-sm text-indigo-500 dark:text-indigo-400 shrink-0 border border-indigo-50 dark:border-indigo-900/50">
                    <Lightbulb size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm uppercase tracking-wide">About this tool</h3>
                    <p className="text-sm md:text-base">{selectedTool.instructions}</p>
                 </div>
              </div>
            )}

            {selectedTool.component}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tools Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Select a category or choose a tool to get started.</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="tablist" aria-label="Tool Categories">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSearchParams(cat.id === 'all' ? {} : { category: cat.id })}
              role="tab"
              aria-selected={activeCategory === cat.id}
              aria-controls="tools-grid"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
                ${activeCategory === cat.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/50' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'}
              `}
            >
              {/* @ts-ignore */}
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div id="tools-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <button 
              key={tool.id}
              onClick={() => handleToolSelect(tool)}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-50 dark:hover:shadow-indigo-900/20 transition-all cursor-pointer flex flex-col h-full text-left focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              aria-label={`Open ${tool.name}`}
            >
              <div className="flex justify-between items-start mb-4 w-full">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-600 group-hover:text-white transition-colors" aria-hidden="true">
                  <tool.icon size={24} />
                </div>
                <Badge color={tool.category === 'ai' ? 'rose' : 'indigo'}>
                  {tool.category.toUpperCase()}
                </Badge>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{tool.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow">{tool.description}</p>
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:translate-x-1 transition-transform" aria-hidden="true">
                Launch Tool <ChevronRight size={16} className="ml-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Resources Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <FileText className="text-indigo-600 dark:text-indigo-400" /> Resources & Downloads
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hidden md:block">
                 <FileText size={32} />
              </div>
              <div>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white">Markdown Professional Cheat Sheet</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">A quick reference guide for all markdown syntax.</p>
              </div>
           </div>
           <Button 
             onClick={handleDownloadPdf}
             className="w-full md:w-auto shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
           >
             <Download size={20} className="mr-2" />
             Download Markdown Cheat Sheet (PDF)
           </Button>
        </div>
      </div>
    </div>
  );
};

export default Tools;