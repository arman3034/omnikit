import React from 'react';
import { DEVELOPER_CREDIT, APP_NAME } from '../constants';
import { Heart, Code, Coffee } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <div className="mb-10 flex justify-center animate-in zoom-in duration-700">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/50 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
          <Heart size={40} fill="currentColor" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight">Crafted with Passion</h1>
      
      <div className="prose prose-lg dark:prose-invert mx-auto text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">
        <p>
          Hi there! Welcome to <strong>{APP_NAME}</strong>.
        </p>
        <p>
          We know how annoying it is to search for a simple tool only to be bombarded with ads and slow loading times. That's why we built this suite—to be your reliable, digital Swiss Army Knife. 
        </p>
        <p>
          Everything here runs efficiently in your browser, respecting your privacy and your time. No sign-ups, no tracking, just tools that work.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-100 dark:shadow-slate-900/50 max-w-lg mx-auto transform hover:scale-[1.02] transition-transform duration-300">
        <div className="flex flex-col items-center gap-4">
           <div className="flex -space-x-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300">
                 <Code size={20} />
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border-2 border-white dark:border-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 z-10">
                 <Heart size={20} fill="currentColor" />
              </div>
               <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 border-2 border-white dark:border-slate-800 flex items-center justify-center text-rose-500 dark:text-rose-400">
                 <Coffee size={20} />
              </div>
           </div>
           
           <div>
             <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Designed & Developed by</p>
             <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
               {DEVELOPER_CREDIT}
             </h2>
           </div>
           
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
             Building useful things for the web.
           </p>
        </div>
      </div>
    </div>
  );
};

export default About;