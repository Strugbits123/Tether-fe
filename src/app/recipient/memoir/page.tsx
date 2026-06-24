"use client";

// Recipient portal — Memoir. A self-contained reading experience with three
// views driven by local state: the cover, the chapter reader, and the closing
// "The End" screen. Static placeholder content for now; wires to real memoir
// data once the recipient-facing endpoints exist.

import { useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Menu,
  Pencil,
  Volume2,
} from "lucide-react";

const SANS = "Inter, sans-serif";
const SERIF = '"Instrument Serif", serif';

type Chapter = {
  title: string;
  tags: string[];
  paragraphs: string[];
  images: string[];
};

const MEMOIR_TITLE = "Sarah's Story";
const MEMOIR_SUBTITLE = "A life remembered, a legacy shared";
const IMG = "/images/Dashboard/reciepients/memoir";

const CHAPTERS: Chapter[] = [
  {
    title: "Growing Up in Chicago",
    tags: ["being love", "hardship", "lifestyle"],
    paragraphs: [
      "I was born in Chicago in 1965, in a small apartment on the South Side. My parents had immigrated from Poland just three years earlier, carrying with them nothing but hope and determination. My father worked two jobs — one at a meatpacking plant during the day, and another as a janitor at night. My mother cleaned houses and took in sewing work.",
      "Our apartment was cramped, but it was filled with love. I remember the smell of my mother's cooking — pierogi and borscht on Sundays, the only day my father didn't work. We didn't have much, but we had each other, and somehow that was enough.",
      "I learned English at school and taught it to my parents at home. By the time I was eight, I was translating letters, helping fill out forms, negotiating with landlords. I grew up fast, but I never resented it. I understood, even then, the sacrifices they had made for me. I learned English at school and taught it to my parents at home. By the time I was eight, I was translating letters, helping fill out forms, negotiating with landlords. I grew up fast, but I never resented it. I understood, even then, the sacrifices they had made for me.",
    ],
    images: [`${IMG}/img1.png`, `${IMG}/img2.png`, `${IMG}/img3.png`],
  },
  {
    title: "Finding My Way",
    tags: ["courage", "growth", "love"],
    paragraphs: [
      "I left home at eighteen with two suitcases and a scholarship to a college two states away. It was the first time I had ever been further than the city limits, and I remember sitting on the bus, watching Chicago shrink behind me, equal parts terrified and exhilarated.",
      "Those years taught me who I was when no one was watching. I waited tables at night, studied until my eyes burned, and slowly built a life that was entirely my own. I made mistakes, plenty of them, but each one carved me into someone a little braver, a little kinder.",
      "And then, on an ordinary Tuesday in a campus library, I met your father. He was reaching for the same book I was, and neither of us let go. Sometimes the biggest turns in a life arrive disguised as the smallest moments.",
    ],
    images: [`${IMG}/img1.png`, `${IMG}/img2.png`, `${IMG}/img3.png`],
  },
  {
    title: "The Day You Were Born",
    tags: [],
    paragraphs: [
      "You were born on a Tuesday in May, at 6:47 in the morning. I remember everything about that day — the way the sun came through the hospital window, the sound of your first cry, the expression on your father’s face when the nurse placed you in his arms.",
      'He cried. I had never seen him cry before, not once in all the years we’d been together. But holding you, looking down at your tiny perfect face, tears just streamed down his cheeks. "She’s here," he kept saying. "She’s really here."',
      'We had chosen your name months before — Maya, which means "illusion" in Sanskrit but also "water" in Hebrew. Your father loved the poetry of it, the way it meant different things in different languages, just like you would grow up to contain multitudes.',
      "You were so small, barely six pounds. The nurses kept saying you were perfect, and you were. Perfect tiny fingers, perfect tiny toes. You had your father’s nose and my eyes. You still do.",
      "That first night, I couldn’t sleep. I just watched you breathing in your little bassinet next to my bed. I made you so many promises that night — promises to protect you, to love you, to give you a life better than the one I had. I’ve spent every day since trying to keep those promises.",
    ],
    images: [`${IMG}/img4.png`, `${IMG}/img5.png`, `${IMG}/img6.png`],
  },
];

type View = "cover" | "reading" | "end";

export default function RecipientMemoirPage() {
  const [view, setView] = useState<View>("cover");
  const [chapterIndex, setChapterIndex] = useState(0);

  const goToReading = (index: number) => {
    setChapterIndex(index);
    setView("reading");
  };

  if (view === "cover") {
    return <MemoirCover onContinue={() => goToReading(0)} />;
  }

  if (view === "end") {
    return <MemoirEnd onReturn={() => setView("cover")} />;
  }

  return (
    <MemoirReader
      chapterIndex={chapterIndex}
      onBackToCover={() => setView("cover")}
      onPrev={() => setChapterIndex((i) => Math.max(0, i - 1))}
      onNext={() => {
        if (chapterIndex >= CHAPTERS.length - 1) setView("end");
        else setChapterIndex((i) => i + 1);
      }}
    />
  );
}

/* ------------------------------- Cover ------------------------------- */

function MemoirCover({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="w-full min-h-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[600px] flex flex-col items-center">
        {/* A Memoir badge */}
        <div
          className="flex items-center justify-center"
          style={{
            height: 31.5,
            padding: "0 14px",
            borderRadius: 9999,
            background: "#4F46E51A",
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 13,
              lineHeight: "19.5px",
              letterSpacing: "0.57px",
              textTransform: "uppercase",
              textAlign: "center",
              color: "#4F46E5",
            }}
          >
            A Memoir
          </span>
        </div>

        {/* Title + meta stack */}
        <div
          className="w-full flex flex-col items-center"
          style={{ gap: 29, marginTop: 47.5 }}
        >
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(36px, 11vw, 56px)",
              lineHeight: 1.1,
              textAlign: "center",
              color: "#111827",
              margin: 0,
            }}
          >
            {MEMOIR_TITLE}
          </h1>

          <p
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: 20,
              lineHeight: "30px",
              textAlign: "center",
              color: "#6B7280",
              margin: 0,
            }}
          >
            {MEMOIR_SUBTITLE}
          </p>

          <div style={{ width: 96, height: 1, background: "#E5E7EB" }} />

          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 15,
              lineHeight: "22.5px",
              letterSpacing: "-0.23px",
              textAlign: "center",
              color: "#6B7280",
              margin: 0,
            }}
          >
            {CHAPTERS.length} chapters
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
            style={{
              gap: 8,
              height: 50.5,
              padding: "0 24px",
              borderRadius: 10,
              background: "#4F46E5",
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 15,
                lineHeight: "22.5px",
                letterSpacing: "-0.23px",
                color: "#FFFFFF",
              }}
            >
              Continue
            </span>
            <ArrowRight
              style={{ width: 20, height: 20, color: "#FFFFFF" }}
              strokeWidth={2}
            />
          </button>

          {/* Listen / download links */}
          <div
            className="flex flex-col items-center"
            style={{ gap: 12, paddingTop: 16 }}
          >
            <SecondaryAction icon="speaker" label="Listen with AI narration" />
            <SecondaryAction icon="file" label="Download as PDF" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SecondaryAction({
  icon,
  label,
}: {
  icon: "speaker" | "file";
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center cursor-pointer transition-opacity hover:opacity-70"
      style={{ gap: 8 }}
    >
      {icon === "speaker" ?
        <Volume2
          style={{ width: 16, height: 16, color: "#6B7280" }}
          strokeWidth={2}
        />
      : <FileText
          style={{ width: 16, height: 16, color: "#6B7280" }}
          strokeWidth={2}
        />
      }
      <span
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "21px",
          letterSpacing: "-0.15px",
          color: "#6B7280",
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ------------------------------ Reader ------------------------------ */

function MemoirReader({
  chapterIndex,
  onBackToCover,
  onPrev,
  onNext,
}: {
  chapterIndex: number;
  onBackToCover: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const chapter = CHAPTERS[chapterIndex];
  const isFirst = chapterIndex === 0;
  const isLast = chapterIndex === CHAPTERS.length - 1;

  return (
    <div className="w-full flex flex-col">
      {/* Top bar — outer holds the 24px/1.33px vertical padding + side gutters;
          the inner 800px row is centered (mirrors the design's 479.33px L/R pad). */}
      <div
        className="w-full h-[70px] flex items-center px-4 sm:px-6"
        style={{
          background: "#FFFFFF",
          borderBottom: "1.33px solid #E5E7EB",
          paddingBottom: 1.33,
        }}
      >
        <div className="w-full max-w-[800px] mx-auto flex items-center justify-between">
          {/* row height 21 comes from the content */}
          <button
            type="button"
            onClick={onBackToCover}
            className="flex items-center cursor-pointer transition-opacity hover:opacity-70"
            style={{ gap: 6 }}
          >
            <ChevronLeft
              style={{ width: 16, height: 16, color: "#6B7280" }}
              strokeWidth={2}
            />
            <span style={navTextStyle("#6B7280")}>Back to cover</span>
          </button>

          <button
            type="button"
            className="flex items-center cursor-pointer transition-opacity hover:opacity-70"
            style={{ gap: 6 }}
          >
            <Menu
              style={{ width: 16, height: 16, color: "#6B7280" }}
              strokeWidth={2}
            />
            <span style={navTextStyle("#6B7280")}>Chapters</span>
          </button>
        </div>
      </div>

      {/* Chapter body */}
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
        <div
          className="w-full max-w-[720px]"
          style={{ padding: "64px 0 56px" }}
        >
          {/* Chapter label */}
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 13,
              lineHeight: "19.5px",
              letterSpacing: "0.57px",
              textTransform: "uppercase",
              color: "#9CA3AF",
              margin: 0,
            }}
          >
            Chapter {chapterIndex + 1} of {CHAPTERS.length}
          </p>

          {/* Text Chapter pill */}
          <div
            className="inline-flex items-center"
            style={{
              gap: 5,
              height: 22,
              padding: "0 12px",
              marginTop: 16,
              borderRadius: 4,
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
            }}
          >
            <Pencil
              style={{ width: 12, height: 12, color: "#364153" }}
              strokeWidth={2}
            />
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: 10,
                lineHeight: "20px",
                letterSpacing: "-0.15px",
                color: "#364153",
              }}
            >
              Text Chapter
            </span>
          </div>

          {/* Title + listen */}
          <div
            className="flex items-start justify-between gap-4"
            style={{ marginTop: 16 }}
          >
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(28px, 7vw, 42px)",
                lineHeight: 1.2,
                color: "#111827",
                margin: 0,
              }}
            >
              {chapter.title}
            </h2>

            <button
              type="button"
              className="flex items-center justify-center cursor-pointer flex-shrink-0 transition-opacity hover:opacity-90"
              style={{
                gap: 6,
                height: 32,
                padding: "0 16px",
                borderRadius: 8,
                background: "#4F46E5",
                border: "1.25px solid #FFFFFF1A",
              }}
            >
              <Volume2
                style={{ width: 16, height: 16, color: "#FFFFFF" }}
                strokeWidth={2}
              />
              <span
                style={{
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: "20px",
                  letterSpacing: "-0.15px",
                  color: "#FFFFFF",
                }}
              >
                listen
              </span>
            </button>
          </div>

          {/* Tag chips */}
          {chapter.tags.length > 0 && (
            <div
              className="flex flex-wrap items-center"
              style={{ gap: 8, marginTop: 24 }}
            >
              {chapter.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center justify-center"
                  style={{
                    height: 36,
                    padding: "0 14px",
                    borderRadius: 9999,
                    background: "#4F46E51A",
                    fontFamily: SANS,
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: "20px",
                    letterSpacing: "-0.15px",
                    textAlign: "center",
                    color: "#4F46E5",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Paragraphs */}
          <div className="flex flex-col" style={{ gap: 24, marginTop: 40 }}>
            {chapter.paragraphs.map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: "32.4px",
                  color: "#374151",
                  margin: 0,
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Chapter Exhibits */}
          <div
            className="flex flex-col"
            style={{
              gap: 24,
              marginTop: 40,
              paddingTop: 49.33,
              borderTop: "1.33px solid #E5E7EB",
            }}
          >
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div className="flex flex-col" style={{ gap: 8 }}>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: 24,
                    lineHeight: "36px",
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Chapter Exhibits
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontWeight: 400,
                    fontSize: 15,
                    lineHeight: "22.5px",
                    letterSpacing: "-0.23px",
                    color: "#6B7280",
                    margin: 0,
                  }}
                >
                  3 photos with notes
                </p>
              </div>

              <button
                type="button"
                className="flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  gap: 8,
                  height: 41,
                  padding: "0 16px",
                  borderRadius: 10,
                  background: "#4F46E5",
                }}
              >
                <ImageIcon
                  style={{ width: 16, height: 16, color: "#FFFFFF" }}
                  strokeWidth={2}
                />
                <span
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: "21px",
                    letterSpacing: "-0.15px",
                    color: "#FFFFFF",
                  }}
                >
                  View Exhibits
                </span>
              </button>
            </div>

            {/* Image strip */}
            <div className="grid grid-cols-3" style={{ gap: 16 }}>
              {chapter.images.map((src, i) => (
                <div
                  key={i}
                  className="overflow-hidden"
                  style={{
                    width: "100%",
                    maxWidth: 208,
                    aspectRatio: "1 / 1",
                    borderRadius: 10,
                    background: "#E5E7EB",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${chapter.title} exhibit ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav bar */}
      <div
        className="w-full"
        style={{ background: "#FFFFFF", borderTop: "1.33px solid #E5E7EB" }}
      >
        <div
          className="w-full max-w-[800px] mx-auto flex items-center justify-between"
          style={{ padding: "24px 32px" }}
        >
          {/* Left action */}
          {isFirst ?
            <button
              type="button"
              onClick={onBackToCover}
              className="flex items-center cursor-pointer transition-opacity hover:opacity-70"
              style={{ gap: 6 }}
            >
              <ChevronLeft
                style={{ width: 16, height: 16, color: "#4F46E5" }}
                strokeWidth={2}
              />
              <span style={navTextStyle("#4F46E5")}>Back to cover</span>
            </button>
          : <button
              type="button"
              onClick={onPrev}
              className="flex items-center cursor-pointer transition-opacity hover:opacity-70"
              style={{ gap: 6 }}
            >
              <ChevronLeft
                style={{ width: 16, height: 16, color: "#4F46E5" }}
                strokeWidth={2}
              />
              <span style={navTextStyle("#4F46E5")}>Previous chapter</span>
            </button>
          }

          {/* Progress dots */}
          <div className="flex items-center" style={{ gap: 4 }}>
            {CHAPTERS.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === chapterIndex ? 32 : 6,
                  height: 6,
                  borderRadius: 9999,
                  background: i === chapterIndex ? "#4F46E5" : "#E5E7EB",
                  transition: "width 0.2s ease",
                }}
              />
            ))}
          </div>

          {/* Right action */}
          <button
            type="button"
            onClick={onNext}
            className="flex items-center cursor-pointer transition-opacity hover:opacity-70"
            style={{ gap: 6 }}
          >
            <span style={navTextStyle("#4F46E5")}>
              {isLast ? "Finish reading" : "Next chapter"}
            </span>
            <ChevronRight
              style={{ width: 16, height: 16, color: "#4F46E5" }}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function navTextStyle(color: string): React.CSSProperties {
  return {
    fontFamily: SANS,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "21px",
    letterSpacing: "-0.15px",
    textAlign: "center",
    color,
    whiteSpace: "nowrap",
  };
}

/* -------------------------------- End -------------------------------- */

function MemoirEnd({ onReturn }: { onReturn: () => void }) {
  return (
    <div className="w-full min-h-full flex items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-[600px] flex flex-col items-center"
        style={{ gap: 30 }}
      >
        <div className="w-full flex flex-col items-center" style={{ gap: 20 }}>
          {/* Decorative emblem */}
          <div
            className="relative flex-shrink-0"
            style={{
              width: 64,
              height: 64,
              borderRadius: 9999,
              background: "#4F46E51A",
            }}
          >
            <span
              className="absolute"
              style={{
                top: 0,
                left: 0,
                width: 32,
                height: 32,
                borderRadius: 9999,
                background: "#4F46E533",
              }}
            />
          </div>

          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(32px, 9vw, 48px)",
              lineHeight: 1.5,
              textAlign: "center",
              color: "#111827",
              margin: 0,
            }}
          >
            The End
          </h1>

          <p
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 18,
              lineHeight: "29.25px",
              textAlign: "center",
              color: "#6B7280",
              margin: 0,
            }}
          >
            Thank you for taking the time to read these memories. May they bring
            you comfort, joy, and a deeper connection to the story of a life
            well-lived.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col items-center" style={{ gap: 20 }}>
          <button
            type="button"
            onClick={onReturn}
            className="flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
            style={{
              height: 50.5,
              padding: "0 24px",
              borderRadius: 10,
              background: "#4F46E5",
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 15,
                lineHeight: "22.5px",
                letterSpacing: "-0.23px",
                textAlign: "center",
                color: "#FFFFFF",
              }}
            >
              Return to cover
            </span>
          </button>

          <div
            className="flex items-center flex-wrap justify-center"
            style={{ gap: 24 }}
          >
            <SecondaryAction icon="speaker" label="Listen with AI" />
            <SecondaryAction icon="file" label="Download as PDF" />
          </div>

          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 13,
              lineHeight: "19.5px",
              letterSpacing: "-0.08px",
              textAlign: "center",
              color: "#9CA3AF",
              margin: 0,
            }}
          >
            Your access to this memoir never expires
          </p>
        </div>
      </div>
    </div>
  );
}
