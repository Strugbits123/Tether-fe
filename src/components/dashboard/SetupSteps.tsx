"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { notifyActivityChanged } from "@/lib/activity-helpers";
import { createClient } from "@/lib/supabase/client";
import { getRecipients } from "@/lib/api/recipients";
import { getReleaseManager } from "@/lib/api/release-managers";
import { getPhotos } from "@/lib/api/photos";
import {
  getMessages,
  getMessage,
  assignmentsToAudience,
} from "@/lib/api/messages";
import { displayRelationship } from "@/lib/relationship";
import FinishProfileModal from "./FinishProfileModal";
import AddReleaseManagerModal from "./AddReleaseManagerModal";
import AddRecipientsModal from "./AddRecipientsModal";
import AddPhotosModal from "./AddPhotosModal";
import CreateMessageModal, {
  type EditableMessage,
} from "./CreateMessageModal";
import PlaceholderStepModal from "./PlaceholderStepModal";

type PersonView = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: string;
  note: string;
};

// Maps a stored recipient/release-manager record to the modal's read-only shape.
function toPersonView(p: {
  name: string;
  email: string;
  phone: string | null;
  relationship: string;
  note: string | null;
}): PersonView {
  const parts = p.name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    email: p.email,
    phone: p.phone ?? "",
    relationship: displayRelationship(p.relationship),
    note: p.note ?? "",
  };
}

async function getToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

type StepKey =
  | "finish_account"
  | "add_release_manager"
  | "add_recipients"
  | "add_photos"
  | "create_message";

const STEP_DEFS: { key: StepKey; label: string; cta: string; index: number }[] =
  [
    {
      key: "finish_account",
      label: "Finish Your Profile",
      cta: "Finish",
      index: 1,
    },
    { key: "add_recipients", label: "Add Recipients", cta: "Add", index: 2 },
    {
      key: "add_release_manager",
      label: "Add a Release Manager",
      cta: "Add",
      index: 3,
    },
    { key: "add_photos", label: "Add Photos", cta: "Upload", index: 4 },
    {
      key: "create_message",
      label: "Create a Message",
      cta: "Start",
      index: 5,
    },
  ];

export default function SetupSteps() {
  const { profile, profileLoading, refreshProfile } = useAuth();
  const [openStep, setOpenStep] = useState<StepKey | null>(null);
  // Read-only records for already-completed steps 2 & 3 (null = create mode).
  const [recipientView, setRecipientView] = useState<PersonView | null>(null);
  const [rmView, setRmView] = useState<PersonView | null>(null);
  // First uploaded photo's URL for the read-only photos view (null = create mode).
  const [photoView, setPhotoView] = useState<string[] | null>(null);
  // First-ever message for the read-only message view (null = create mode).
  const [messageView, setMessageView] = useState<EditableMessage | null>(null);
  // 'visible' → showing; 'fading' → playing the fade-out; 'gone' → unmounted.
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");
  // Tracks whether we ever saw an incomplete state this session. Only then do we
  // animate the fade — if onboarding is already complete on arrival we never show.
  const [wasIncomplete, setWasIncomplete] = useState(false);

  // Refresh onboarding state AND the activity feed after any successful action.
  const refreshAll = () => {
    refreshProfile();
    notifyActivityChanged();
  };

  const closeModal = () => {
    setOpenStep(null);
    setRecipientView(null);
    setRmView(null);
    setPhotoView(null);
    setMessageView(null);
  };

  // Opening a step: completed recipients / release-manager / photos / message
  // steps open read-only, pre-filled with the existing record(s); else the
  // create form. (Finish-profile reads its own data, gated by the onboarding flag.)
  const openStepFor = async (key: StepKey, done: boolean) => {
    setRecipientView(null);
    setRmView(null);
    setPhotoView(null);
    setMessageView(null);
    if (
      done &&
      (key === "add_recipients" ||
        key === "add_release_manager" ||
        key === "add_photos" ||
        key === "create_message")
    ) {
      const token = await getToken();
      if (token) {
        try {
          if (key === "add_recipients") {
            const recipients = await getRecipients(token);
            if (recipients[0]) setRecipientView(toPersonView(recipients[0]));
          } else if (key === "add_release_manager") {
            const rm = await getReleaseManager(token);
            if (rm) setRmView(toPersonView(rm));
          } else if (key === "add_photos") {
            const photos = await getPhotos(token);
            // Show the first uploaded photo.
            const first = photos.find((p) => p.signedUrl);
            if (first?.signedUrl) setPhotoView([first.signedUrl]);
          } else {
            // First-ever message (earliest created), with full body/assignments.
            const messages = await getMessages(token);
            const earliest = [...messages].sort((a, b) =>
              a.created_at.localeCompare(b.created_at),
            )[0];
            if (earliest) {
              const full = await getMessage(token, earliest.id);
              const { audience, selectedIndividualIds } = assignmentsToAudience(
                full.assignments,
              );
              setMessageView({
                id: full.id,
                audience,
                selectedIndividualIds,
                messageType: full.type === "text" ? "write" : full.type,
                title: full.title,
                notes: full.notes ?? "",
                body: full.body ?? "",
              });
            }
          }
        } catch {
          /* fall back to the create form if the record can't be loaded */
        }
      }
    }
    setOpenStep(key);
  };

  const onboarding = profile?.onboarding;
  const steps = STEP_DEFS.map((s) => ({
    ...s,
    done: onboarding ? !!onboarding[s.key as keyof typeof onboarding] : false,
  }));

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = (completed / total) * 100;
  const allDone = !!profile && completed === total;

  // Remember once we've observed an incomplete checklist (profile loaded, a step
  // still pending). Adjusting state during render (guarded so it runs once) is
  // the supported way to derive a value from prior renders without an effect.
  if (profile && !allDone && !wasIncomplete) {
    setWasIncomplete(true);
  }

  // Once every step is complete — and only if it was incomplete earlier this
  // session — linger for 3s then gracefully fade the card out.
  useEffect(() => {
    if (!allDone || !wasIncomplete || phase !== "visible") return;
    const t = setTimeout(() => setPhase("fading"), 3000);
    return () => clearTimeout(t);
  }, [allDone, wasIncomplete, phase]);

  // Unmount once the fade transition (600ms) has finished.
  useEffect(() => {
    if (phase !== "fading") return;
    const t = setTimeout(() => setPhase("gone"), 650);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;

  // Already fully onboarded when the dashboard loaded — don't show the checklist
  // at all (no appear-then-fade flash on every visit).
  if (allDone && !wasIncomplete) return null;

  if (profileLoading && !profile) {
    return (
      <div
        className="w-full rounded-[14px] bg-white p-5 sm:p-6"
        style={{ border: "1px solid rgba(0,0,0,0.1)" }}
      >
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-1.5 bg-gray-200 rounded-full mb-5" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-[10px] mb-3" />
          ))}
        </div>
      </div>
    );
  }

  const activeStepDef = openStep
    ? STEP_DEFS.find((s) => s.key === openStep)
    : null;

  return (
    <div
      className="w-full rounded-[14px] bg-white p-5 sm:p-6"
      style={{
        border: "1px solid rgba(0,0,0,0.1)",
        transition: "opacity 600ms ease, transform 600ms ease",
        opacity: phase === "fading" ? 0 : 1,
        transform: phase === "fading" ? "translateY(-8px) scale(0.98)" : "none",
      }}
    >
      {/* Header */}
      <div className="pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3
            className="text-[17px] font-semibold text-[#101828] leading-7"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Let&apos;s get you set up
          </h3>
          <p
            className="text-[13.3px] font-semibold text-[#4A5565] leading-5"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Complete your setup — {completed} of {total} done
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)",
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <StepRow
            key={step.index}
            step={step}
            onClick={() => openStepFor(step.key, step.done)}
          />
        ))}
      </div>

      {/* Modals */}
      <FinishProfileModal
        open={openStep === "finish_account"}
        onClose={closeModal}
        onSkip={closeModal}
        cancelLabel="Cancel"
        readOnly={!!onboarding?.finish_account}
        onCompleted={() => {
          refreshAll();
          closeModal();
        }}
      />
      <AddRecipientsModal
        open={openStep === "add_recipients"}
        onClose={closeModal}
        onSkip={closeModal}
        cancelLabel="Cancel"
        readOnly={!!recipientView}
        initialData={recipientView}
        onCreated={() => {
          refreshAll();
          closeModal();
        }}
      />
      <AddReleaseManagerModal
        open={openStep === "add_release_manager"}
        onClose={closeModal}
        onSkip={closeModal}
        cancelLabel="Cancel"
        readOnly={!!rmView}
        initialData={rmView}
        onCreated={() => {
          refreshAll();
          closeModal();
        }}
      />
      <AddPhotosModal
        open={openStep === "add_photos"}
        onClose={closeModal}
        onSkip={closeModal}
        readOnly={!!photoView}
        initialPhotos={photoView ?? []}
        onCreated={() => {
          refreshAll();
          closeModal();
        }}
      />
      <CreateMessageModal
        open={openStep === "create_message"}
        onClose={closeModal}
        readOnly={!!messageView}
        initialMessage={messageView ?? undefined}
        headerTitle={messageView ? "Your Message" : undefined}
        onCreated={() => {
          refreshAll();
          closeModal();
        }}
      />
      {activeStepDef &&
        activeStepDef.key !== "finish_account" &&
        activeStepDef.key !== "add_release_manager" &&
        activeStepDef.key !== "add_recipients" &&
        activeStepDef.key !== "add_photos" &&
        activeStepDef.key !== "create_message" && (
          <PlaceholderStepModal
            open
            title={activeStepDef.label}
            onClose={() => setOpenStep(null)}
          />
        )}
    </div>
  );
}

type StepItem = { label: string; cta: string; done: boolean; index: number };

function StepRow({ step, onClick }: { step: StepItem; onClick: () => void }) {
  const isDone = step.done;

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 rounded-[10px] p-3 sm:p-4"
      style={{
        background: isDone ? "#F0FDF4" : "#FFFFFF",
        border: isDone ? "1px solid #B9F8CF" : "1px solid #E5E7EB",
      }}
    >
      {/* Icon / number */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isDone ? "#00C950" : "#E5E7EB" }}
      >
        {isDone ? (
          <Check className="w-5 h-5 text-white" strokeWidth={3} />
        ) : (
          <span
            className="text-[14px] font-semibold leading-5 text-[#6A7282]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {step.index}
          </span>
        )}
      </div>

      {/* Label */}
      <p
        className="flex-1 min-w-0 text-[14px] sm:text-[16.9px] font-semibold text-[#364153] leading-5 sm:leading-7 break-words"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {step.label}
      </p>

      {/* CTA */}
      <button
        type="button"
        onClick={onClick}
        className="flex-shrink-0 px-3 h-8 rounded-lg text-white text-[13px] font-semibold leading-none transition-opacity hover:opacity-90 cursor-pointer"
        style={{
          background: isDone ? "rgba(79,70,229,0.5)" : "#4F46E5",
          minWidth: 75,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {step.cta}
      </button>
    </div>
  );
}
