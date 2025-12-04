import React, { useState } from 'react';
import { Card, Button, InputGroup, TextAreaGroup, SelectGroup } from '../components/UIComponents';
import { Send, Mail, CheckCircle, MapPin, ExternalLink, AlertCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    message: '' 
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const response = await fetch("https://formspree.io/f/mdkvrpej", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus('error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', source: '', message: '' });
    setStatus('idle');
  };

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto py-12 md:py-20 text-center animate-in fade-in zoom-in duration-500" role="status" aria-live="polite">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Feedback Submitted Successfully!</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">Thank you for getting in touch. We have received your message.</p>
        <Button onClick={resetForm} variant="outline" size="lg">Send Another Message</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 py-8 md:py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Contact Us</h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
            We are always looking to improve our tools. Whether you have a feature request, found a bug, or just want to say hello, fill out the form and we'll be in touch.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-5 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Mail size={28} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Email Us</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-2">For general inquiries and support.</p>
              <a href="mailto:armanrehmani73@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-lg inline-flex items-center gap-1">
                armanrehmani73@gmail.com <ExternalLink size={14} />
              </a>
            </div>
          </div>

           <div className="flex items-start gap-5 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-rose-50 dark:bg-rose-900/30 p-4 rounded-xl text-rose-600 dark:text-rose-400">
              <MapPin size={28} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Location</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Sher Rubani Town,<br/>
                Okara, Pakistan
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card title="Send Feedback" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputGroup 
            label="Full Name" 
            placeholder="Your Name" 
            required
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com" 
              required
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <InputGroup 
              label="Phone Number (Optional)" 
              type="tel" 
              placeholder="+92 ..."
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <SelectGroup
            label="How did you hear about us?"
            required
            name="source"
            value={formData.source}
            onChange={e => setFormData({...formData, source: e.target.value})}
            options={[
              { value: 'search', label: 'Search Engine (Google, Bing)' },
              { value: 'social', label: 'Social Media' },
              { value: 'friend', label: 'Friend or Colleague' },
              { value: 'blog', label: 'Blog or Article' },
              { value: 'other', label: 'Other' },
            ]}
          />

          <TextAreaGroup 
            label="Your Message" 
            placeholder="Tell us about your project or feedback..." 
            required
            name="message"
            className="min-h-[150px]"
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
          />

          {status === 'error' && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle size={20} />
              <p>Something went wrong. Please try again later.</p>
            </div>
          )}
          
          <div className="space-y-4">
            <Button type="submit" className="w-full" size="lg" isLoading={status === 'submitting'}>
              <Send size={20} className="mr-2" /> Send Message
            </Button>
          </div>
          
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
            By sending this message, you agree to our privacy policy.
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Contact;