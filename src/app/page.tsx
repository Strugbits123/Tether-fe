"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiMenu, FiX, FiCheck, FiArrowRight } from 'react-icons/fi'
import { BsCameraVideo } from 'react-icons/bs'
import { MdOutlineLock, MdOutlineFolderOpen, MdOutlineManageAccounts } from 'react-icons/md'
import { RiBook2Line, RiUserHeartLine, RiSendPlaneLine } from 'react-icons/ri'
import { TbChecklist } from 'react-icons/tb'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { IoStarSharp } from 'react-icons/io5'
import { HiOutlinePhotograph } from 'react-icons/hi'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-5 h-5">
                <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-slate-900">Tether</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#pricing" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">Pricing</Link>
            <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">How it Works</Link>
            <Link href="#about" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">About Us</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/register?mode=signin" className="text-slate-700 font-medium text-sm px-4 py-2 hover:text-violet-600 transition-colors">
              Sign In
            </Link>
            <Link href="/register?mode=signup" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
              Get started
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-3">
            <Link href="#pricing" className="text-slate-700 font-medium py-2 border-b border-slate-50" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link href="#how-it-works" className="text-slate-700 font-medium py-2 border-b border-slate-50" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
            <Link href="#about" className="text-slate-700 font-medium py-2 border-b border-slate-50" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            <Link href="/register?mode=signin" className="text-center py-2.5 border border-slate-200 rounded-lg font-medium text-slate-700 mt-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            <Link href="/register?mode=signup" className="text-center py-2.5 bg-violet-600 rounded-lg font-semibold text-white" onClick={() => setMobileMenuOpen(false)}>Get started</Link>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 pt-16 pb-0">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7 py-12">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-3 py-1.5 text-violet-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              Legacy planning, made simple
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight">
              Your Legacy.<br />
              Planned Beautifully.<br />
              <em className="text-violet-600 font-serif not-italic">Remembered Forever.</em>
            </h1>

            <p className="text-slate-500 text-lg max-w-md leading-relaxed">
              Tether helps you preserve your story, organize your assets, and ensure the people you love receive exactly what you want them to have.
            </p>

            <ul className="space-y-3">
              {[
                "Build and edit your personal memoir",
                "Store and share contacts, documents and files",
                "Send video, audio, and written messages for loved ones",
                "Automate and schedule their time delivery",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                  <FiCheck className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/register?mode=signup" className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-violet-200">
                Share Now
              </Link>
              <Link href="#how-it-works" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">
                See how it works <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-slate-400 text-xs">Free for 3 months →</p>
          </div>

          {/* Hero mockup — add public/images/hero-dashboard.png */}
          <div className="relative lg:flex lg:justify-end pb-0">
            <div className="relative w-full max-w-lg mx-auto lg:mx-0 rounded-t-2xl overflow-hidden shadow-2xl shadow-violet-100 aspect-[4/3] bg-slate-100">
              <Image
                src="/images/hero-dashboard.png"
                alt="Tether dashboard preview"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <section className="bg-white border-y border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <FiCheck className="w-5 h-5 text-violet-600" />, title: "Easy to use", desc: "Guided interface anyone can master" },
            { icon: <HiOutlinePhotograph className="w-5 h-5 text-violet-600" />, title: "Needs little info", desc: "Start with just a few details" },
            { icon: <RiUserHeartLine className="w-5 h-5 text-violet-600" />, title: "Affordable", desc: "Flexible plans for every family" },
            { icon: <MdOutlineLock className="w-5 h-5 text-violet-600" />, title: "Private & Secure", desc: "Encrypted and access-controlled" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                {item.icon}
              </div>
              <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM — DARK ── */}
      <section className="bg-[#0B0B1E] text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">// THE PROBLEM</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              The problem <span className="text-slate-400 font-normal italic">we are solving</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Every year families face the death of someone they love and discover — for the very first time — that the person who just died was not prepared. The things that were never said. The things they would have wanted their family to know. The pain is indescribable — all of it — knowing their memory dies with them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white/5 rounded-2xl p-10 border border-white/10">
            {[
              { stat: "60%", label: "of people die without any estate planning, leaving families without direction" },
              { stat: "14 mo", label: "average time to settle an estate without clear guidance from the deceased" },
              { stat: "$1.2K", label: "average legal fee families face navigating an estate alone and unprepared" },
            ].map((item, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-5xl md:text-6xl font-bold text-white mb-3">{item.stat}</div>
                <p className="text-slate-400 text-sm leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMISE — DARK ── */}
      <section className="bg-[#0B0B1E] text-white py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">// THE PROMISE</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              The promise <em className="text-violet-400 font-normal not-italic">tether makes</em>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-4">
              Tether is more than a product. We believe every life has a story — their values, their memories, their documents — and makes it accessible to the right people at the right times, exactly as they intended.
            </p>
            <p className="text-slate-400 text-base leading-relaxed">
              Tether is not just a product. Every person who uses Tether makes a promise — a promise to the people they love.
            </p>
          </div>

          <blockquote className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-3xl">
            <p className="text-white/90 text-lg italic leading-relaxed">
              "Tether is for all those times we take our loved ones for granted. I struggled talking to my friends and family. They will have everything they need, when they need it."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-white">JM</div>
              <div>
                <div className="text-white font-semibold text-sm">John M.</div>
                <div className="text-slate-400 text-xs">Tether member since 2024</div>
              </div>
            </div>
          </blockquote>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section id="about" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-violet-500 text-xs font-bold uppercase tracking-widest">// WHAT WE DO</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-4 mb-4 max-w-3xl mx-auto leading-tight">
              Make sure your friends and family have what they need, when they need it.
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Everything your family needs — organized, secured, automated exactly when and to whom you choose.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <BsCameraVideo className="w-6 h-6 text-violet-600" />,
                title: "Personal Messages",
                desc: "Record video, audio, or written messages for each person in your life — delivered at exactly the right moment.",
              },
              {
                icon: <MdOutlineFolderOpen className="w-6 h-6 text-violet-600" />,
                title: "Store & Files",
                desc: "Centralize legal, financial, and insurance documents in one place, accessible to the right people automatically.",
              },
              {
                icon: <RiBook2Line className="w-6 h-6 text-violet-600" />,
                title: "Memory Builder",
                desc: "Write chapters of your life story with photos and audio, sharing memories and lessons that defined you.",
              },
              {
                icon: <TbChecklist className="w-6 h-6 text-violet-600" />,
                title: "Guidance Creator",
                desc: "Leave practical instructions, wishes, and guidance so your family knows exactly what you wanted.",
              },
            ].map((item, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-100 hover:border-violet-100 transition-all group">
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-violet-100 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-slate-50/60 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-violet-500 text-xs font-bold uppercase tracking-widest">// HOW IT WORKS</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-4 leading-tight">
              Set up in an afternoon.<br />Peace of mind forever.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { n: "01", icon: <MdOutlineManageAccounts className="w-6 h-6" />, title: "Create account", desc: "Sign up and set your preferences in minutes." },
              { n: "02", icon: <BsCameraVideo className="w-6 h-6" />, title: "Record messages", desc: "Create video, audio, or written messages for loved ones." },
              { n: "03", icon: <MdOutlineFolderOpen className="w-6 h-6" />, title: "Organize life info", desc: "Upload documents, photos, and important personal details." },
              { n: "04", icon: <RiSendPlaneLine className="w-6 h-6" />, title: "Designate destiny", desc: "Choose who receives what and exactly when it's delivered." },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-200">
                  {step.icon}
                </div>
                <span className="text-violet-400 text-xs font-bold uppercase tracking-wider">{step.n}</span>
                <h3 className="font-bold text-slate-800 text-base">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Executor CTA bar */}
          <div className="bg-violet-600 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white font-medium text-base text-center md:text-left max-w-xl">
              When the time comes — the Executor dashboard provides guided, automated management — notifying the right people at exactly the right time.
            </p>
            <Link href="/register?mode=signup" className="bg-white text-violet-600 font-bold px-6 py-3 rounded-xl text-sm whitespace-nowrap hover:bg-violet-50 transition-colors flex-shrink-0">
              Take Paid Message Manager to executor
            </Link>
          </div>
        </div>
      </section>

      {/* ── MESSAGES FEATURE ── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-violet-500 text-xs font-bold uppercase tracking-widest">// MESSAGE</span>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Everything you want to say,<br />
              <span className="text-slate-400 font-normal">Everyone who should receive it.</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Record personal messages in any format — video, audio, or written — and assign each one to exactly the right person, triggered by the moment you choose.
            </p>
            <ul className="space-y-3">
              {[
                "Record unlimited video messages for any recipient",
                "Add voice notes with personal warmth",
                "Write letters for birthdays, milestones, or any moment",
                "Assign recipients with total precision and control",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                  <AiOutlineCheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* add public/images/message-mockup.png */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-slate-100 aspect-[4/3]">
            <Image src="/images/message-mockup.png" alt="Messages feature mockup" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* ── DOCUMENTS FEATURE ── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* add public/images/documents-mockup.png */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-slate-100 aspect-[4/3] order-2 lg:order-1">
            <Image src="/images/documents-mockup.png" alt="Documents feature mockup" fill className="object-cover" />
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <span className="text-violet-500 text-xs font-bold uppercase tracking-widest">// WHERE IT GOES</span>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              One place for every document and file,<br />
              <span className="text-slate-400 font-normal">Automated delivery when they need it.</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Tether becomes the single source of truth for your estate. Wills, insurance policies, property documents — organized and delivered automatically to the right people.
            </p>
            <ul className="space-y-3">
              {[
                "Organize all legal and financial documents",
                "Set access permissions per person",
                "Automated delivery upon triggering conditions",
                "Bank-grade encryption for every file",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                  <AiOutlineCheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── EXECUTOR EXPERIENCE ── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-violet-500 text-xs font-bold uppercase tracking-widest">// EXECUTOR EXPERIENCE</span>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Your executor gets a guided path,<br />
              <span className="text-slate-400 font-normal">not a pile of chaos.</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              When the time comes, your executor receives a clear automated dashboard that walks them through every step — notifying the right people at the right moments.
            </p>
            <ul className="space-y-3">
              {[
                "Automated executor notifications",
                "Step-by-step guided checklist",
                "All documents in one accessible place",
                "Guided delivery of messages to recipients",
                "Legal documentation support",
                "Concierge available for complex estates",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                  <AiOutlineCheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* add public/images/executor-mockup.png */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-slate-100 aspect-[4/3]">
            <Image src="/images/executor-mockup.png" alt="Executor experience mockup" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* ── PHOTOS FEATURE ── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* add public/images/photos-mockup.png */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-slate-100 aspect-[4/3] order-2 lg:order-1">
            <Image src="/images/photos-mockup.png" alt="Photos feature mockup" fill className="object-cover" />
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <span className="text-violet-500 text-xs font-bold uppercase tracking-widest">// PHOTOS</span>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Every picture tells their story.
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Build curated photo albums connected to your memories. Each picture comes to life with stories, context, and the people who were there — preserved forever for the people who love you.
            </p>
            <ul className="space-y-3">
              {[
                "Upload and organize your favourite photos",
                "Attach stories and captions to each image",
                "Group by life chapters or events",
                "Share curated albums with specific family members",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                  <AiOutlineCheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── MEMOIR + GROWING UP ── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <span className="text-violet-500 text-xs font-bold uppercase tracking-widest">// MEMOIR</span>
            <h2 className="text-4xl font-bold text-slate-900">Write your life story.</h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Your life deserves to be told in full. Create a memoir that captures where you came from, what you stood for, and the moments that shaped who you became.
            </p>
            <ul className="space-y-3">
              {[
                "Guided chapter prompts to get you started",
                "Rich text editor with full formatting",
                "Add photos and audio to bring chapters to life",
                "Control who sees which parts of your story",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                  <AiOutlineCheckCircle className="w-5 h-5 text-violet-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            {/* add public/images/memoir-mockup.png */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-slate-100 aspect-video mt-4">
              <Image src="/images/memoir-mockup.png" alt="Memoir feature mockup" fill className="object-cover" />
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-violet-500 text-xs font-bold uppercase tracking-widest">// GROWING UP</span>
            <h2 className="text-4xl font-bold text-slate-900">Growing Up in Chicago</h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Start with the neighborhood that shaped you. Tether's guided memoir chapters walk you through every era — from childhood to today — so nothing important gets left out.
            </p>
            {/* add public/images/story-mockup.png */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-slate-100 aspect-video mt-4">
              <Image src="/images/story-mockup.png" alt="Story feature mockup" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-violet-500 text-xs font-bold uppercase tracking-widest">// WHAT THEY SAY</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-4">Built for love, proven by families.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Margaret T.",
                role: "Mother of 3, Texas",
                quote: "I used to worry about what would happen to my family without clear direction. Tether gave me peace of mind I didn't know was possible.",
              },
              {
                name: "David K.",
                role: "Father, California",
                quote: "Setting up my Tether account was one of the most meaningful things I've ever done. My kids will know exactly how I felt about them.",
              },
              {
                name: "Linda R.",
                role: "Grandmother, New York",
                quote: "I recorded video messages for each of my grandchildren. Knowing they'll see those one day brings me so much comfort.",
              },
            ].map((review, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <IoStarSharp key={j} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{review.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-xs flex-shrink-0">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{review.name}</div>
                    <div className="text-slate-400 text-xs">{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — DARK ── */}
      <section className="bg-[#0B0B1E] text-white py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">// SOMETHING FINAL</span>
          <h2 className="text-5xl md:text-6xl font-bold mt-6 mb-10 max-w-2xl mx-auto leading-tight">
            The most loving thing you can do is{' '}
            <em className="text-violet-400 not-italic">be prepared.</em>
          </h2>
          <Link href="/register?mode=signup" className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-violet-900">
            Get started
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080812] text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
            <div className="space-y-3 max-w-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">Tether</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your digital legacy, planned beautifully and delivered with love.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-16 gap-y-6">
              <div className="space-y-3">
                <h5 className="text-white font-semibold text-sm">Product</h5>
                <div className="space-y-2.5 flex flex-col">
                  <Link href="#how-it-works" className="text-sm hover:text-white transition-colors">How it works</Link>
                  <Link href="#pricing" className="text-sm hover:text-white transition-colors">Pricing</Link>
                  <Link href="#about" className="text-sm hover:text-white transition-colors">About</Link>
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="text-white font-semibold text-sm">Legal</h5>
                <div className="space-y-2.5 flex flex-col">
                  <Link href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="#" className="text-sm hover:text-white transition-colors">Terms of Service</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} Tether. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
