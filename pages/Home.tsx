import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Type, Settings, Sparkles } from 'lucide-react';
import { Card, Button } from '../components/UIComponents';
import { APP_NAME } from '../constants';

const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
          Every tool you need, <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 dark:from-indigo-400 dark:via-purple-400 dark:to-rose-400">
            right in your browser.
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          Simple, free, and secure web utilities for your daily tasks. 
          No downloads, no sign-ups, no fuss.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/tools">
            <Button size="lg" className="w-full sm:w-auto px-10 py-4 text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50 hover:shadow-2xl hover:shadow-indigo-300 dark:hover:shadow-indigo-800/50 transform transition-all hover:-translate-y-1">
              Start Using Tools
            </Button>
          </Link>
          <Link to="/about">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 py-4 text-lg bg-white dark:bg-slate-800 dark:text-indigo-400 dark:border-indigo-500/30 dark:hover:bg-slate-700">
              Our Story
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        
        <Link to="/tools?category=text" className="group">
          <div className="h-full bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-rose-100/50 dark:hover:shadow-rose-900/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-900/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-sm">
                <Type size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Text Utilities</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Convert case, analyze word counts, and preview Markdown in real-time.</p>
            </div>
          </div>
        </Link>
        
        <Link to="/tools?category=utility" className="group">
          <div className="h-full bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                <Settings size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Daily Helpers</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Generate secure passwords, create QR codes, and pick color palettes instantly.</p>
            </div>
          </div>
        </Link>

        <Link to="/tools?category=ai" className="group">
          <div className="h-full bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                <Sparkles size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">AI Powered</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Leverage the power of Gemini to summarize text and boost productivity.</p>
            </div>
          </div>
        </Link>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-10 md:p-16 text-white overflow-hidden relative shadow-2xl dark:shadow-indigo-900/20 border border-slate-800 dark:border-slate-800">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Why use {APP_NAME}?</h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              We built this because we were tired of ad-filled, slow websites. Our tools are built to be fast, private, and delightful to use. 
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="font-medium">100% Free</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="font-medium">Client-Side Secure</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="font-medium">Open Source</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-sm">
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">AI Powered</h4>
                    <p className="text-slate-300 text-sm">Now with Gemini integration</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Try our new AI summarizer to condense long articles in seconds.
                </p>
                <Link to="/tools?category=ai">
                  <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                    Try AI Tools
                  </button>
                </Link>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;