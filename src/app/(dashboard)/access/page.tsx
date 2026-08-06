"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Flag,
  Image as ImageIcon,
  Info,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Shield,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import AddRecipientsModal from "@/components/dashboard/AddRecipientsModal";
import AddReleaseManagerModal from "@/components/dashboard/AddReleaseManagerModal";
import ReleaseManagerConsentModal from "@/components/dashboard/ReleaseManagerConsentModal";
import GuardianConsentModal from "@/components/dashboard/GuardianConsentModal";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/context/ToastContext";
import { getRecipients, type Recipient } from "@/lib/api/recipients";
import {
  getReleaseManager,
  type ReleaseManager,
} from "@/lib/api/release-managers";
import {
  designateGuardian,
  getAccessOverview,
  removeGuardian,
  removeRecipient,
  sendRmReminder,
  updateRecipient,
  type AccessOverview,
  type AccessRecipient,
  type ContentSummary,
} from "@/lib/api/access";
import { displayRelationship } from "@/lib/relationship";
import { ApiError } from "@/lib/api/client";

/**
 * Guardian order numbers come from the backend and can be left with gaps after a
 * guardian is removed (e.g. 1, 3 instead of 1, 2). Recompute a dense 1..N ranking
 * across every recipient (both groups) so the displayed "Guardian N" labels stay
 * contiguous regardless of what the backend returns.
 */
function getGuardianOrderMap(overview: AccessOverview): Map<string, number> {
  const allMembers = [
    ...overview.recipients.family.members,
    ...overview.recipients.friends_and_others.members,
  ];
  const guardians = allMembers
    .filter((m) => m.is_guardian)
    .sort(
      (a, b) => (a.guardian_order ?? Infinity) - (b.guardian_order ?? Infinity),
    );

  const map = new Map<string, number>();
  guardians.forEach((g, index) => map.set(g.id, index + 1));
  return map;
}

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

const RECIPIENT_STATUS: Record<
  Recipient["invitation_status"],
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Pending", variant: "default" },
  sent: { label: "Sent", variant: "info" },
  bounced: { label: "Bounced", variant: "error" },
};

const RM_STATUS: Record<
  ReleaseManager["status"],
  { label: string; variant: BadgeVariant }
> = {
  invited: { label: "Invited", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Declined", variant: "error" },
  bounced: { label: "Bounced", variant: "error" },
  revoked: { label: "Revoked", variant: "default" },
};

const RM_STATUS_LABEL: Record<
  ReleaseManager["status"],
  { label: string; color: string; bg: string }
> = {
  invited: { label: "INVITED", color: "#BB4D00", bg: "#FEF3C7" },
  accepted: { label: "CONFIRMED", color: "#008236", bg: "#D1FAE5" },
  declined: { label: "DECLINED", color: "#DC2626", bg: "#FEE2E2" },
  bounced: { label: "INVITATION BOUNCED", color: "#DC2626", bg: "#FEE2E2" },
  revoked: { label: "REVOKED", color: "#6A7282", bg: "#F3F4F6" },
};

async function getToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AccessPage() {
  const { showToast } = useToast();

  // Fallback (legacy) data — always fetched so the page still works if the
  // richer /access/overview endpoint isn't live yet.
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [releaseManager, setReleaseManager] = useState<ReleaseManager | null>(
    null,
  );
  // Rich data — powers the full mockup UI when available.
  const [overview, setOverview] = useState<AccessOverview | null>(null);

  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);

  const [addingRecipient, setAddingRecipient] = useState(false);
  const [addRecipientRelationship, setAddRecipientRelationship] =
    useState("Family");
  const [addingManager, setAddingManager] = useState(false);
  const [rmConsentOpen, setRmConsentOpen] = useState(false);

  const loadData = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [recipientsResult, rmResult, overviewResult] =
        await Promise.allSettled([
          getRecipients(token),
          getReleaseManager(token),
          getAccessOverview(token),
        ]);
      if (recipientsResult.status === "fulfilled") {
        setRecipients(recipientsResult.value);
      }
      if (rmResult.status === "fulfilled") {
        setReleaseManager(rmResult.value);
      }
      setOverview(
        overviewResult.status === "fulfilled" ? overviewResult.value : null,
      );
    } catch {
      showToast("Failed to load your access settings.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Data-fetch-on-mount. The setState calls inside loadData run after an await
  // (never synchronously in the effect body), so the cascading-render the rule
  // guards against doesn't apply here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadData();
  }, [loadData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Computed once per `overview` rather than per RecipientGroup: both groups
  // derive the same ranking from the same full member list, and a fresh Map
  // identity on every render would also churn the groups needlessly.
  const guardianOrderMap = useMemo(
    () => (overview ? getGuardianOrderMap(overview) : new Map<string, number>()),
    [overview],
  );

  const handleSendReminder = async () => {
    const token = await getToken();
    if (!token) return;
    setSendingReminder(true);
    try {
      await sendRmReminder(token);
      showToast("Reminder sent to your Release Manager.", "success");
    } catch (e) {
      showToast(
        e instanceof ApiError ? e.message : "Failed to send reminder.",
        "error",
      );
    } finally {
      setSendingReminder(false);
    }
  };

  const handleRemoveRecipient = async (recipient: {
    id: string;
    name: string;
  }) => {
    if (
      !window.confirm(
        `Remove ${recipient.name} as a recipient? This cannot be undone.`,
      )
    )
      return;
    const token = await getToken();
    if (!token) return;
    try {
      await removeRecipient(token, recipient.id);
      showToast(`${recipient.name} was removed.`, "success");
      loadData();
    } catch (e) {
      showToast(
        e instanceof ApiError ? e.message : "Failed to remove recipient.",
        "error",
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: "36px",
            color: "#101828",
          }}
        >
          Access Control
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "-0.31px",
            color: "#4A5565",
          }}
        >
          Manage your recipients and what they will have access to. All
          Recipients must be at least 18 years old.
        </p>
      </div>

      {/* Release Manager */}
      <section className="flex flex-col gap-3">
        {loading ? (
          <CardSkeleton />
        ) : overview ? (
          overview.release_manager ? (
            <RichReleaseManagerCard
              rm={overview.release_manager}
              sendingReminder={sendingReminder}
              onSendReminder={handleSendReminder}
              onChange={() => setRmConsentOpen(true)}
            />
          ) : (
            <EmptyState
              icon={Shield}
              title="No Release Manager designated"
              description="Designate a trusted person who can release your Tether when the time comes."
              cta="Designate a Release Manager"
              onClick={() => setRmConsentOpen(true)}
            />
          )
        ) : releaseManager ? (
          <div
            className="flex items-start gap-4"
            style={{
              borderRadius: 14,
              border: "1.25px solid rgba(0,0,0,0.1)",
              background: "#FFFFFF",
              padding: 16,
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                background: "linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)",
              }}
            >
              <Shield className="w-7 h-7" color="#4F39F6" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    lineHeight: "24px",
                    color: "#101828",
                  }}
                >
                  {releaseManager.name}
                </h3>
                <Badge variant={RM_STATUS[releaseManager.status].variant}>
                  {RM_STATUS[releaseManager.status].label}
                </Badge>
              </div>
              <MetaRow recipient={releaseManager} />
              {releaseManager.note && <NoteText note={releaseManager.note} />}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Shield}
            title="No Release Manager designated"
            description="Designate a trusted person who can release your Tether when the time comes."
            cta="Designate a Release Manager"
            onClick={() => setRmConsentOpen(true)}
          />
        )}
      </section>

      {overview ? (
        <>
          <RecipientGroup
            label="Family Members"
            members={overview.recipients.family.members}
            guardianCount={overview.stats.total_guardians}
            maxGuardians={overview.stats.max_guardians}
            guardianOrderMap={guardianOrderMap}
            loading={loading}
            onAddPerson={() => {
              setAddRecipientRelationship("Family");
              setAddingRecipient(true);
            }}
            onRemove={handleRemoveRecipient}
            onRefresh={loadData}
          />
          <RecipientGroup
            label="Friends & Others"
            members={overview.recipients.friends_and_others.members}
            guardianCount={overview.stats.total_guardians}
            maxGuardians={overview.stats.max_guardians}
            guardianOrderMap={guardianOrderMap}
            loading={loading}
            onAddPerson={() => {
              setAddRecipientRelationship("Friend");
              setAddingRecipient(true);
            }}
            onRemove={handleRemoveRecipient}
            onRefresh={loadData}
          />
        </>
      ) : (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <SectionTitle
              icon={Users}
              label="Recipients"
              count={recipients.length}
            />
            {!loading && recipients.length > 0 && (
              <AddButton
                label="Add Recipient"
                onClick={() => setAddingRecipient(true)}
              />
            )}
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : recipients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No recipients yet"
              description="Recipients are the people who will receive your messages, photos, and documents."
              cta="Add your first recipient"
              onClick={() => setAddingRecipient(true)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recipients.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-4"
                  style={{
                    borderRadius: 14,
                    border: "1.25px solid rgba(0,0,0,0.1)",
                    background: "#FFFFFF",
                    padding: 16,
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      background:
                        "linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)",
                    }}
                  >
                    <Users
                      className="w-7 h-7"
                      color="#4F39F6"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className="truncate"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          fontSize: 16,
                          lineHeight: "24px",
                          color: "#101828",
                        }}
                      >
                        {r.name}
                      </h3>
                      <Badge
                        variant={RECIPIENT_STATUS[r.invitation_status].variant}
                      >
                        {RECIPIENT_STATUS[r.invitation_status].label}
                      </Badge>
                    </div>
                    <MetaRow recipient={r} />
                    {r.note && <NoteText note={r.note} />}
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: "16px",
                        color: "#6A7282",
                      }}
                    >
                      Added {formatDate(r.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modals */}
      <ReleaseManagerConsentModal
        open={rmConsentOpen}
        onClose={() => setRmConsentOpen(false)}
        onConfirm={() => {
          setRmConsentOpen(false);
          setAddingManager(true);
        }}
      />
      <AddReleaseManagerModal
        open={addingManager}
        onClose={() => setAddingManager(false)}
        onCreated={loadData}
      />
      <AddRecipientsModal
        open={addingRecipient}
        onClose={() => setAddingRecipient(false)}
        onCreated={loadData}
        defaultRelationship={addRecipientRelationship}
      />
    </div>
  );
}

/* ---------------------- Rich Release Manager card ---------------------- */

function RichReleaseManagerCard({
  rm,
  sendingReminder,
  onSendReminder,
  onChange,
}: {
  rm: AccessOverview["release_manager"];
  sendingReminder: boolean;
  onSendReminder: () => void;
  onChange: () => void;
}) {
  if (!rm) return null;
  const statusMeta = RM_STATUS_LABEL[rm.status];

  return (
    <div
      className="flex flex-col gap-4"
      style={{
        borderRadius: 14,
        border: "1.25px solid rgba(0,0,0,0.1)",
        background: "#FFFFFF",
        padding: 20,
      }}
    >
      <div className="flex items-start gap-4 flex-wrap">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#4F46E5",
          }}
        >
          <Star className="w-5 h-5 text-white" fill="#FFFFFF" strokeWidth={0} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span
            className="inline-flex items-center self-start"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 11.5,
              letterSpacing: "0.5px",
              color: statusMeta.color,
              background: statusMeta.bg,
              borderRadius: 9999,
              padding: "3px 10px",
            }}
          >
            {statusMeta.label}
          </span>
          <h3
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 17,
              color: "#101828",
            }}
          >
            {rm.name}
          </h3>
          <MetaRow recipient={rm} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rm.status === "invited" && (
            <button
              type="button"
              onClick={onSendReminder}
              disabled={sendingReminder}
              className="cursor-pointer hover:bg-gray-50 disabled:opacity-50"
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.1)",
                background: "#FFFFFF",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 13.5,
                color: "#0A0A0A",
              }}
            >
              {sendingReminder ? "Sending…" : "Send reminder"}
            </button>
          )}
          <button
            type="button"
            onClick={onChange}
            className="cursor-pointer hover:bg-gray-50"
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 13.5,
              color: "#0A0A0A",
            }}
          >
            Change Release Manager
          </button>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
        <FeatureBullet
          icon={Lock}
          label="Accesses all documents after verification"
        />
        <FeatureBullet
          icon={Users}
          label="Manages distribution to all recipients"
        />
        <FeatureBullet icon={Flag} label="Carries out your final wishes" />
      </div>
    </div>
  );
}

function FeatureBullet({
  icon: Icon,
  label,
}: {
  icon: typeof Lock;
  label: string;
}) {
  return (
    <span
      className="flex items-center gap-1.5"
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontSize: 13.5,
        color: "#4A5565",
      }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" color="#4F39F6" strokeWidth={2} />
      {label}
    </span>
  );
}

/* ---------------------- Rich recipient group (family / friends) ---------------------- */

function RecipientGroup({
  label,
  members,
  guardianCount,
  maxGuardians,
  guardianOrderMap,
  loading,
  onAddPerson,
  onRemove,
  onRefresh,
}: {
  label: string;
  members: AccessRecipient[];
  guardianCount: number;
  maxGuardians: number;
  guardianOrderMap: Map<string, number>;
  loading: boolean;
  onAddPerson: () => void;
  onRemove: (recipient: { id: string; name: string }) => void;
  onRefresh: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              color: "#6A7282",
            }}
          >
            {label}
          </span>
          {members.length > 0 && (
            <span
              className="flex items-center justify-center"
              style={{
                minWidth: 20,
                height: 20,
                padding: "0 6px",
                borderRadius: 9999,
                background: "#EEF2FF",
                color: "#4F39F6",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 11.5,
              }}
            >
              {members.length}
            </span>
          )}
        </div>
        {members.length > 0 && (
          <AddButton label="Add person" onClick={onAddPerson} />
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title={`No ${label.toLowerCase()} yet`}
          description="Recipients are the people who will receive your messages, photos, and documents."
          cta="Add a person"
          onClick={onAddPerson}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          {members.map((m) => (
            <RichRecipientCard
              key={m.id}
              member={m}
              expanded={expandedId === m.id}
              onToggleExpand={() =>
                setExpandedId((id) => (id === m.id ? null : m.id))
              }
              canDesignateGuardian={guardianCount < maxGuardians}
              maxGuardians={maxGuardians}
              guardianOrder={
                guardianOrderMap.get(m.id) ?? m.guardian_order ?? undefined
              }
              onRemove={() => onRemove(m)}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RichRecipientCard({
  member,
  expanded,
  onToggleExpand,
  canDesignateGuardian,
  maxGuardians,
  guardianOrder,
  onRemove,
  onRefresh,
}: {
  member: AccessRecipient;
  expanded: boolean;
  onToggleExpand: () => void;
  canDesignateGuardian: boolean;
  /** Server-provided limit (stats.max_guardians) — drives the notice copy so it
   *  can't drift from the value the API actually enforces. */
  maxGuardians: number;
  guardianOrder?: number;
  onRemove: () => void;
  onRefresh: () => void;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [guardianModalOpen, setGuardianModalOpen] = useState(false);
  const [guardianSubmitting, setGuardianSubmitting] = useState(false);
  const [guardianCapNoticeOpen, setGuardianCapNoticeOpen] = useState(false);
  // Stable id so the button can point at the notice via aria-describedby.
  const guardianCapNoticeId = useId();

  // Re-sync the editable fields when the parent refetches and hands down a
  // changed member. Deliberately a synchronous effect rather than a `key`-based
  // remount, so the surrounding expand/collapse and modal state survive a
  // refresh; the writes are guarded by the dep array and settle in one pass.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone ?? "");
  }, [member.name, member.email, member.phone]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const dirty =
    name.trim() !== member.name ||
    email !== member.email ||
    phone !== (member.phone ?? "");

  const handleSave = async () => {
    // Checked before the request, not after: the API accepts any string for
    // `name`, so a blank one would persist and leave the recipient nameless
    // everywhere they're listed.
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast("Recipient name can't be empty.", "error");
      return;
    }

    const token = await getToken();
    if (!token) return;
    setSaving(true);
    try {
      await updateRecipient(token, member.id, { name: trimmedName, email, phone });
      showToast("Contact information updated.", "success");
      onRefresh();
    } catch (e) {
      showToast(
        e instanceof ApiError ? e.message : "Failed to save changes.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmGuardian = async () => {
    const token = await getToken();
    if (!token) return;
    setGuardianSubmitting(true);
    try {
      await designateGuardian(token, member.id, { legal_acknowledged: true });
      showToast(`${member.name} is now a guardian.`, "success");
      setGuardianModalOpen(false);
      onRefresh();
    } catch (e) {
      showToast(
        e instanceof ApiError ? e.message : "Failed to designate guardian.",
        "error",
      );
    } finally {
      setGuardianSubmitting(false);
    }
  };

  const handleRemoveGuardian = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      await removeGuardian(token, member.id);
      showToast(`${member.name} is no longer a guardian.`, "success");
      onRefresh();
    } catch (e) {
      showToast(
        e instanceof ApiError ? e.message : "Failed to remove guardian.",
        "error",
      );
    }
  };

  const firstName = member.name.split(" ")[0];

  return (
    <>
      <div
        className="flex flex-col"
        style={{
          borderRadius: 14,
          border: "1.25px solid rgba(0,0,0,0.1)",
          background: "#FFFFFF",
        }}
      >
        {/* Collapsed header row — always visible */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-full flex items-start gap-3 cursor-pointer text-left"
          style={{ padding: 16 }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#4F39F6",
              }}
            >
              {member.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <h3
              className="truncate"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: "#101828",
              }}
            >
              {member.name}
            </h3>
            {member.content_summary && (
              <ContentTags summary={member.content_summary} />
            )}
            <span
              className="flex items-center gap-1.5 flex-wrap"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: 13,
                color: "#6A7282",
              }}
            >
              {member.phone && <span>{member.phone}</span>}
              {member.phone && member.email && <span aria-hidden>|</span>}
              <span className="truncate">{member.email}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {member.is_guardian && (
              <span
                className="inline-flex items-center gap-1"
                style={{
                  height: 22,
                  borderRadius: 9999,
                  padding: "0 8px",
                  background: "#F5F3FF",
                  color: "#7C3AED",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 11.5,
                }}
              >
                <Award className="w-3 h-3" strokeWidth={2} />
                Guardian {guardianOrder ?? ""}
              </span>
            )}
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-[#6A7282]" strokeWidth={2} />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6A7282]" strokeWidth={2} />
            )}
          </div>
        </button>

        {expanded && (
          <div
            className="flex flex-col gap-4"
            style={{ padding: "0 16px 16px" }}
          >
            <div className="flex flex-col gap-2">
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#101828",
                }}
              >
                Contact Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Editable because a recipient's legal name can genuinely change
                    (marriage, for example) and there was previously no way to
                    correct it — only email and phone. The API already accepted
                    `name` on PATCH /access/recipients/:id. */}
                <LabeledInput label="Full name" value={name} onChange={setName} />
                <LabeledInput
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                />
                <LabeledInput
                  label="Phone number"
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                />
              </div>
            </div>

            <div
              className="flex items-start gap-2"
              style={{ borderRadius: 10, background: "#EFF6FF", padding: 12 }}
            >
              <Info
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                color="#2563EB"
                strokeWidth={2}
              />
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 13,
                  lineHeight: "18px",
                  color: "#1D4ED8",
                }}
              >
                Access is released after verification. {firstName} will not see
                any content until your Release Manager completes the release
                plan process.
              </p>
            </div>

            <div
              className="flex flex-col gap-2"
              style={{ borderRadius: 10, background: "#F5F3FF", padding: 12 }}
            >
              <div className="flex items-center gap-1.5">
                <Shield
                  className="w-4 h-4 flex-shrink-0"
                  color="#7C3AED"
                  strokeWidth={2}
                />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 13.5,
                    color: "#4C1D95",
                  }}
                >
                  Guardian Role
                </span>
              </div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 13,
                  lineHeight: "18px",
                  color: "#5B21B6",
                }}
              >
                A Guardian acts as a backup Release Manager if your primary
                Release Manager is unavailable or unwilling to act.
              </p>
              {member.is_guardian ? (
                <button
                  type="button"
                  onClick={handleRemoveGuardian}
                  className="self-start cursor-pointer hover:opacity-80"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "#DC2626",
                  }}
                >
                  Remove as Guardian
                </button>
              ) : (
                // Wrapper carries the hover handlers: a disabled <button> fires no
                // pointer events, so the "already selected two" disclaimer has to
                // hang off an enabled parent. The button itself stays greyed, as
                // requested — the disclaimer explains *why* rather than replacing it.
                <div
                  className="relative self-start"
                  onMouseEnter={() =>
                    !canDesignateGuardian && setGuardianCapNoticeOpen(true)
                  }
                  onMouseLeave={() => setGuardianCapNoticeOpen(false)}
                >
                  {/* aria-disabled rather than the `disabled` attribute: a truly
                      disabled button is removed from the tab order and swallows
                      pointer events, so keyboard and touch users could never
                      reach the explanation — hover was the only way in. This
                      stays focusable and tappable, announces itself as disabled,
                      and reveals the notice instead of opening the modal. */}
                  <button
                    type="button"
                    aria-disabled={!canDesignateGuardian}
                    aria-describedby={
                      !canDesignateGuardian ? guardianCapNoticeId : undefined
                    }
                    onFocus={() =>
                      !canDesignateGuardian && setGuardianCapNoticeOpen(true)
                    }
                    onBlur={() => setGuardianCapNoticeOpen(false)}
                    onClick={() => {
                      if (!canDesignateGuardian) {
                        setGuardianCapNoticeOpen(true);
                        return;
                      }
                      setGuardianModalOpen(true);
                    }}
                    className={`flex items-center justify-center gap-1.5 ${
                      canDesignateGuardian
                        ? "cursor-pointer hover:bg-purple-50"
                        : "cursor-not-allowed opacity-40"
                    }`}
                    style={{
                      height: 32,
                      padding: "0 14px",
                      borderRadius: 9999,
                      border: "1.25px solid #7C3AED",
                      background: "#FFFFFF",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 13,
                      color: "#7C3AED",
                    }}
                  >
                    <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                    Select as Guardian
                  </button>

                  {guardianCapNoticeOpen && !canDesignateGuardian && (
                    <div
                      id={guardianCapNoticeId}
                      role="status"
                      className="absolute z-50 bg-white rounded-lg p-3 shadow-lg"
                      style={{
                        top: 38,
                        left: 0,
                        width: 240,
                        border: "1px solid #E5E7EB",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12.5,
                        lineHeight: "18px",
                        color: "#4A5565",
                      }}
                    >
                      {`You have already selected ${maxGuardians} Guardian${
                        maxGuardians === 1 ? "" : "s"
                      }. Remove one first to choose someone else.`}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={onRemove}
                className="cursor-pointer hover:opacity-80"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 13.5,
                  color: "#DC2626",
                }}
              >
                Remove {firstName}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty || saving}
                className="cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
                style={{
                  height: 32,
                  padding: "0 16px",
                  borderRadius: 8,
                  background: dirty ? "#4F46E5" : "#E5E7EB",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: dirty ? "#FFFFFF" : "#9CA3AF",
                }}
              >
                {saving ? "Saving…" : dirty ? "Save" : "Saved"}
              </button>
            </div>
          </div>
        )}
      </div>

      <GuardianConsentModal
        open={guardianModalOpen}
        onClose={() => setGuardianModalOpen(false)}
        onConfirm={handleConfirmGuardian}
        loading={guardianSubmitting}
      />
    </>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 12.5,
          color: "#4A5565",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full focus:outline-none"
        style={{
          height: 36,
          borderRadius: 8,
          border: "1px solid rgba(0,0,0,0.1)",
          background: "#F9FAFB",
          padding: "0 12px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 13.5,
          color: "#101828",
        }}
      />
    </div>
  );
}

function ContentTags({ summary }: { summary: ContentSummary }) {
  const items: { icon: typeof ImageIcon; count: number; label: string }[] = [
    { icon: ImageIcon, count: summary.photos, label: "Photos" },
    { icon: Shield, count: summary.memoir_chapters, label: "Memoir Chapters" },
    { icon: FileText, count: summary.documents, label: "Documents" },
    { icon: MessageSquare, count: summary.messages, label: "Messages" },
  ].filter((i) => i.count > 0);

  if (items.length === 0) return null;

  return (
    <span
      className="flex flex-wrap items-center gap-x-1 gap-y-0.5"
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontSize: 13,
        color: "#6A7282",
      }}
    >
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden>•</span>}
          {item.count} {item.label}
        </span>
      ))}
    </span>
  );
}

/* ---------------------- Sub components ---------------------- */

function SectionTitle({
  icon: Icon,
  label,
  count,
}: {
  icon: typeof Shield;
  label: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-[#4F39F6]" strokeWidth={2} />
      <h2
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 18,
          lineHeight: "28px",
          color: "#101828",
        }}
      >
        {label}
      </h2>
      {typeof count === "number" && count > 0 && (
        <span
          className="flex items-center justify-center"
          style={{
            minWidth: 22,
            height: 22,
            padding: "0 7px",
            borderRadius: 9999,
            background: "#EEF2FF",
            color: "#4F39F6",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50"
      style={{
        height: 36,
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.1)",
        background: "#FFFFFF",
        padding: "0 16px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 14,
        lineHeight: "20px",
        letterSpacing: "-0.15px",
        color: "#101828",
      }}
    >
      <Plus className="w-4 h-4" strokeWidth={2.25} />
      {label}
    </button>
  );
}

function MetaRow({
  recipient,
}: {
  recipient: { email: string; phone: string | null; relationship: string };
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1"
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        lineHeight: "20px",
        letterSpacing: "-0.15px",
        color: "#4A5565",
      }}
    >
      <span className="flex items-center gap-1.5 min-w-0">
        <Mail
          className="w-4 h-4 text-[#4A5565] flex-shrink-0"
          strokeWidth={2}
        />
        <span className="truncate">{recipient.email}</span>
      </span>
      {recipient.phone && (
        <>
          <span aria-hidden>•</span>
          <span className="flex items-center gap-1.5">
            <Phone
              className="w-4 h-4 text-[#4A5565] flex-shrink-0"
              strokeWidth={2}
            />
            {recipient.phone}
          </span>
        </>
      )}
      {recipient.relationship && (
        <>
          <span aria-hidden>•</span>
          <span>{displayRelationship(recipient.relationship)}</span>
        </>
      )}
    </div>
  );
}

function NoteText({ note }: { note: string }) {
  return (
    <p
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontSize: 13,
        lineHeight: "18px",
        color: "#6A7282",
        fontStyle: "italic",
      }}
    >
      “{note}”
    </p>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  onClick,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center gap-3"
      style={{
        borderRadius: 14,
        border: "1.25px dashed rgba(0,0,0,0.12)",
        background: "#FFFFFF",
        padding: "40px 24px",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: "linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)",
        }}
      >
        <Icon className="w-7 h-7" color="#4F39F6" strokeWidth={2} />
      </div>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 16,
          color: "#101828",
        }}
      >
        {title}
      </p>
      <p
        className="max-w-md"
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "20px",
          color: "#4A5565",
        }}
      >
        {description}
      </p>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 mt-1"
        style={{
          height: 40,
          borderRadius: 8,
          background: "#4F46E5",
          padding: "0 18px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: "#FFFFFF",
        }}
      >
        <UserPlus className="w-4 h-4" strokeWidth={2.25} />
        {cta}
      </button>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div
      className="animate-pulse flex items-start gap-4"
      style={{
        borderRadius: 14,
        border: "1.25px solid rgba(0,0,0,0.1)",
        background: "#FFFFFF",
        padding: 16,
      }}
    >
      <div
        className="flex-shrink-0"
        style={{
          width: 56,
          height: 56,
          borderRadius: 10,
          background: "#EEF2FF",
        }}
      />
      <div className="flex-1 flex flex-col gap-2 pt-1">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  );
}
