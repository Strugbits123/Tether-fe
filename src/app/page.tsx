"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Check, 
  Sparkles, 
  Lock, 
  DollarSign, 
  Play, 
  ShieldAlert, 
  FileText, 
  Video, 
  Volume2, 
  Plus, 
  ArrowRight,
  Menu,
  X
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-tether-hero flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
            {/* Custom Infinite/Loop SVG */}
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-6 h-6 text-white"
            >
              <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-sans font-extrabold text-2xl tracking-tight text-slate-900">Tether</span>
              <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold px-1.5 py-0.25 rounded-md uppercase tracking-wider">co</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#home" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors duration-200">
            Home
          </Link>
          <Link href="#how-it-works" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors duration-200">
            How it works
          </Link>
          <Link href="#about" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors duration-200">
            About Us
          </Link>
          <Link href="#pricing" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors duration-200">
            Pricing
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/register?mode=signin" 
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-indigo-600 text-slate-700 hover:text-indigo-600 font-semibold text-sm transition-all duration-200 bg-white/50 backdrop-blur-sm"
          >
            Sign in
          </Link>
          <Link 
            href="/register?mode=signup" 
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:shadow-indigo-100 transition-all duration-200"
          >
            Start free trial
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-6 right-6 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-slate-100 flex flex-col gap-4 md:hidden transition-all duration-300 z-50">
            <Link 
              href="#home" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 hover:text-indigo-600 font-semibold text-base py-2 border-b border-slate-50"
            >
              Home
            </Link>
            <Link 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 hover:text-indigo-600 font-semibold text-base py-2 border-b border-slate-50"
            >
              How it works
            </Link>
            <Link 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 hover:text-indigo-600 font-semibold text-base py-2 border-b border-slate-50"
            >
              About Us
            </Link>
            <Link 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 hover:text-indigo-600 font-semibold text-base py-2 border-b border-slate-50"
            >
              Pricing
            </Link>
            <div className="flex flex-col gap-3 mt-2">
              <Link 
                href="/register?mode=signin" 
                className="w-full text-center py-3 rounded-xl border border-slate-200 hover:border-indigo-600 text-slate-700 hover:text-indigo-600 font-semibold text-sm transition-colors bg-white"
              >
                Sign in
              </Link>
              <Link 
                href="/register?mode=signup" 
                className="w-full text-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                Start free trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
        {/* Left Side: Copy and CTAs */}
        <div className="lg:col-span-6 space-y-8 flex flex-col items-start z-10">
          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 bg-white/70 border border-slate-200/80 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm backdrop-blur-sm animate-fade-in">
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
            <span className="text-slate-600 text-xs font-semibold">Legacy planning made simple and affordable</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-slate-900 leading-[1.08] tracking-tight animate-slide-up">
            Your legacy.<br />
            Planned beautifully.<br />
            <span className="text-indigo-600 italic font-serif relative">
              Remembered forever.
              <span className="absolute bottom-1 left-0 w-full h-[3px] bg-indigo-100 -z-10 rounded-full"></span>
            </span>
          </h1>

          {/* Value Bullet Points */}
          <ul className="space-y-4 text-slate-600 font-sans text-base md:text-lg">
            {[
              "Easily build and share your personal memoir",
              "Store and share photos, documents, and files",
              "Make video, audio, and written messages for loved ones",
              "Automated delivery when the time comes"
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mt-1 text-indigo-600 flex-shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/register?mode=signup" 
              className="w-full sm:w-auto text-center px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Free
            </Link>
            <Link 
              href="#how-it-works" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-bold text-base transition-all duration-200"
            >
              See how it works
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center group-hover:bg-slate-300">
                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* Right Side: High Fidelity App Mockup */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
          {/* Back glows */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-indigo-300/25 blur-3xl -z-10"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-200/20 blur-3xl -z-10"></div>

          {/* Floating Security Badge */}
          <div className="absolute -top-6 right-8 bg-white border border-slate-150 rounded-2xl shadow-xl shadow-slate-150/40 px-4 py-2.5 flex items-center gap-2 z-30 animate-bounce-slow">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-700 font-bold text-xs">Bank-grade security · AES-256</span>
          </div>

          {/* Main App Container */}
          <div className="w-full max-w-[500px] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden relative z-25 group hover:shadow-slate-300/50 hover:border-slate-300 transition-all duration-300">
            {/* Browser chrome header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              </div>
              <div className="bg-slate-100/80 px-4 py-1 rounded-lg text-[10px] text-slate-500 font-mono font-medium border border-slate-200/40">
                app.tether.co/dashboard
              </div>
              <div className="w-12"></div>
            </div>

            {/* Mockup App Content */}
            <div className="p-6 space-y-6">
              {/* Chapter Card */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/30 space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">Chapter 2</span>
                    <h3 className="font-serif font-normal text-slate-800 text-xl mt-0.5">Meeting Your Mother</h3>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Complete
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100/60">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-[9px] font-bold text-indigo-700 flex items-center justify-center shadow-sm">JC</span>
                    <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 text-[9px] font-bold text-amber-700 flex items-center justify-center -ml-3 shadow-sm">KH</span>
                    <span className="font-semibold text-slate-500 ml-1">Assigned to</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>1582 words</span>
                    <span>Mar 30, 2026</span>
                  </div>
                </div>
              </div>

              {/* Recent Messages */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Recent Messages</h4>
                
                {/* Message 1 */}
                <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50/40 transition-colors duration-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-slate-800 font-bold text-sm">To: Sarah (daughter)</div>
                      <div className="text-slate-400 text-xs mt-0.5">Video · 3 min 42 sec</div>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.75 rounded-md border border-emerald-100">Saved</span>
                </div>

                {/* Message 2 */}
                <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50/40 transition-colors duration-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-slate-800 font-bold text-sm">To: James (son)</div>
                      <div className="text-slate-400 text-xs mt-0.5">Audio · 7 min 11 sec</div>
                    </div>
                  </div>
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.75 rounded-md border border-amber-100">Draft</span>
                </div>
              </div>

              {/* Document Hub */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Document Hub</h4>
                
                <div className="space-y-2">
                  {[
                    { name: "Last Will & Testament_2024.pdf", type: "Legal" },
                    { name: "Bank_Account_Summary.pdf", type: "Financial" },
                    { name: "Life_Insurance_Policy.pdf", type: "Insurance" }
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/20 px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 font-medium text-xs truncate max-w-[200px] sm:max-w-[250px]">{doc.name}</span>
                      </div>
                      <span className="text-slate-400 text-[10px] font-semibold">{doc.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Toast at bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2 z-30 animate-pulse">
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</div>
              <span className="text-slate-700 font-semibold text-[11px] whitespace-nowrap">New recipient added successfully</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Value Propositions Section */}
      <footer className="w-full bg-white border-t border-slate-100 py-12 mt-12 relative z-30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { 
              icon: <Check className="w-5 h-5 text-indigo-600" />, 
              title: "Easy to use",
              desc: "Simple, guiding interface designed for anyone to write down their story."
            },
            { 
              icon: <Sparkles className="w-5 h-5 text-indigo-600" />, 
              title: "Beautifully made",
              desc: "Premium layouts and designs to make your memories look timeless."
            },
            { 
              icon: <DollarSign className="w-5 h-5 text-indigo-600" />, 
              title: "Affordable",
              desc: "Flexible, transparent pricing options with no hidden legacy maintenance fees."
            },
            { 
              icon: <Lock className="w-5 h-5 text-indigo-600" />, 
              title: "Private & Secure",
              desc: "Encrypted securely and delivered only when and how you specify."
            }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col gap-3 group p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">{item.title}</h4>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
