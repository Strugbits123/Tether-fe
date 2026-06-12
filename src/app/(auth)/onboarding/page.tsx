"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
import { createClient } from '@/lib/supabase/client'
import { api, ApiError } from '@/lib/api/client'
import { createRecipient, getRecipients } from '@/lib/api/recipients'
import { createReleaseManager, getReleaseManager } from '@/lib/api/release-managers'
import {
  getMessages,
  createVideoUploadUrl,
  createAudioUploadUrl,
  confirmAudioUpload,
} from '@/lib/api/messages'
import { requestDocUploadUrls, createDocumentsBatch } from '@/lib/api/documents'
import { toRecipientRelationship, toReleaseManagerRelationship } from '@/lib/relationship'
import Step1 from '@/components/onboarding/Step1'
import Step2 from '@/components/onboarding/Step2'
import Step3 from '@/components/onboarding/Step3'
import Step4 from '@/components/onboarding/Step4'
import Step5 from '@/components/onboarding/Step5'

const ASSIGN_LATER = [{ scope: 'assign_later' as const }]

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

const errorText = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

const isMediaFile = (f: File) => f.type.startsWith('audio/') || f.type.startsWith('video/')

/** Maps a browser MIME type to the document fileType the API accepts, or null if unsupported. */
function deriveDocFileType(mimeType: string): string | null {
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'docx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/heic': 'heic',
  }
  return map[mimeType] ?? null
}

/**
 * Uploads the files chosen on Step 5: documents go through the documents
 * upload-url + batch flow, while audio/video become messages. Everything is
 * assigned "assign_later" — recipients can be set later. Best-effort: a single
 * bad file won't abort the whole batch.
 */
async function uploadOnboardingFiles(token: string, files: File[]): Promise<void> {
  const media = files.filter(isMediaFile)
  const docs = files
    .filter((f) => !isMediaFile(f))
    .map((file) => ({ file, fileType: deriveDocFileType(file.type) }))
    .filter((d): d is { file: File; fileType: string } => d.fileType !== null)

  // Documents — request signed URLs, upload, then record the batch.
  if (docs.length > 0) {
    const uploadUrls = await requestDocUploadUrls(
      token,
      docs.map(({ file }) => ({
        fileName: file.name,
        fileType: file.type,
        fileSizeBytes: file.size,
      })),
    )
    const results = await Promise.allSettled(
      uploadUrls.map(async (urlInfo) => {
        const { file } = docs[urlInfo.fileIndex]
        const res = await fetch(urlInfo.signedUploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        })
        if (!res.ok) throw new Error(`Upload failed for ${file.name}`)
        return { urlInfo, file }
      }),
    )
    const uploaded = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
    if (uploaded.length > 0) {
      await createDocumentsBatch(token, {
        documents: uploaded.map(({ urlInfo, file }) => ({
          storagePath: urlInfo.storagePath,
          originalFilename: file.name,
          fileType: deriveDocFileType(file.type) as string,
          fileSizeBytes: file.size,
        })),
        assignments: ASSIGN_LATER,
      })
    }
  }

  // Audio / video — each becomes a message.
  for (const file of media) {
    if (file.type.startsWith('video/')) {
      const { uploadUrl } = await createVideoUploadUrl(token, {
        title: file.name || 'untitled',
        assignments: ASSIGN_LATER,
      })
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!res.ok) throw new Error(`Upload failed for ${file.name}`)
    } else {
      const { signedUploadUrl, messageId } = await createAudioUploadUrl(token, {
        title: file.name || 'untitled',
        assignments: ASSIGN_LATER,
        fileType: file.type,
      })
      const res = await fetch(signedUploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!res.ok) throw new Error(`Upload failed for ${file.name}`)
      await confirmAudioUpload(token, messageId, {
        durationSeconds: 0,
        fileSizeBytes: file.size,
      })
    }
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stepLoading, setStepLoading] = useState(false)

  // Step 1: Purpose
  const [purposes, setPurposes] = useState<string[]>([])

  // Step 2: Recipients
  const [recipients, setRecipients] = useState<any[]>([])
  const [fetchedRecipients, setFetchedRecipients] = useState<any[]>([])

  // Step 3: Release Manager
  const [releaseManager, setReleaseManager] = useState<any>(null)
  const [fetchedManager, setFetchedManager] = useState<any>(null)
  const [releaseManagerSaved, setReleaseManagerSaved] = useState(false)

  // Step 4: Messages
  const [fetchedMessages, setFetchedMessages] = useState<any[]>([])

  const handleStep1Next = async (selections: string[]) => {
    setPurposes(selections)
    setStepLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        showToast('Session expired. Please sign in again.', 'error')
        return
      }
      await api.post('/users/onboarding/purposes', { purposes: selections }, token)
      // Pre-fetch recipients for step 2 in case they were added previously.
      try {
        setFetchedRecipients(await getRecipients(token))
      } catch { /* non-blocking — display-only */ }
      // Only advance once the save actually succeeded.
      setCurrentStep(2)
    } catch (err) {
      showToast(errorText(err, 'Could not save your selections. Please try again.'), 'error')
    } finally {
      setStepLoading(false)
    }
  }

  const handleStep2Next = async (recips: any[]) => {
    setRecipients(recips)
    setStepLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        showToast('Session expired. Please sign in again.', 'error')
        return
      }
      if (recips.length > 0) {
        const results = await Promise.allSettled(
          recips.map((r) =>
            createRecipient(token, {
              firstName: r.firstName,
              lastName: r.lastName,
              email: r.email,
              relationship: toRecipientRelationship(r.relationship),
            })
          )
        )
        // A 409 means the recipient already exists (e.g. a retry) — treat as done.
        // Any other rejection is a real error: surface it and stay on this step.
        const failures = results
          .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
          .filter((r) => !(r.reason instanceof ApiError && r.reason.statusCode === 409))
        if (failures.length > 0) {
          showToast(
            errorText(failures[0].reason, 'Some recipients could not be added. Please try again.'),
            'error',
          )
          return
        }
      }
      // Pre-fetch release manager for step 3 in case it was added previously.
      try {
        const fetched = await getReleaseManager(token)
        if (fetched) {
          setFetchedManager(fetched)
          setReleaseManagerSaved(true)
        }
      } catch { /* non-blocking — display-only */ }
      setCurrentStep(3)
    } catch (err) {
      showToast(errorText(err, 'Could not save your recipients. Please try again.'), 'error')
    } finally {
      setStepLoading(false)
    }
  }

  const handleStep2Back = () => {
    setCurrentStep(1)
  }

  const handleStep3Next = async (manager: any) => {
    setReleaseManager(manager)
    setStepLoading(true)
    try {
      const token = await getToken()
      if (!token) {
        showToast('Session expired. Please sign in again.', 'error')
        return
      }
      // manager is null when the user skipped — nothing to save, just advance.
      if (manager && !releaseManagerSaved) {
        await createReleaseManager(token, {
          firstName: manager.firstName,
          lastName: manager.lastName,
          email: manager.email,
          phone: manager.phone || undefined,
          relationship: toReleaseManagerRelationship(manager.relationship),
        })
        setReleaseManagerSaved(true)
      }
      setCurrentStep(4)
    } catch (err) {
      showToast(errorText(err, 'Could not save your Release Manager. Please try again.'), 'error')
    } finally {
      setStepLoading(false)
    }
  }

  const handleStep3Back = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) {
        const fetched = await getRecipients(token)
        setFetchedRecipients(fetched)
      }
    } catch {
      // Non-blocking — show step 2 regardless
    } finally {
      setRecipients([])
      setCurrentStep(2)
    }
  }

  const handleStep4Next = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) {
        const msgs = await getMessages(token)
        setFetchedMessages(msgs)
      }
    } catch { /* non-blocking */ }
    setCurrentStep(5)
  }

  const handleStep4Back = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) {
        const fetched = await getReleaseManager(token)
        if (fetched) {
          setFetchedManager(fetched)
          setReleaseManagerSaved(true)
        }
      }
    } catch {
      // Non-blocking — show step 3 regardless
    } finally {
      setCurrentStep(3)
    }
  }

  // Finishing setup. `files` carries any documents/media chosen on Step 5 — an
  // empty array means the user skipped this step, so nothing is uploaded and the
  // add_photos step stays incomplete. The other steps keep whatever true/false
  // state they earned from actually creating recipients/manager/message.
  const handleStep5Next = async (files: File[] = []) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        showToast('Session expired. Please sign in again.', 'error')
        router.push('/signin')
        return
      }

      // Upload Step 5 files first so the document/message steps reflect reality
      // before we mark onboarding complete. Skipping (no files) leaves them as-is.
      if (files.length > 0) {
        await uploadOnboardingFiles(token, files)
      }

      await api.post('/users/onboarding/complete', {}, token)

      showToast('Welcome to Tether!', 'success')
      router.push('/dashboard?onboarded=true')
    } catch (err: any) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStep5Back = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) {
        const msgs = await getMessages(token)
        setFetchedMessages(msgs)
      }
    } catch { /* non-blocking */ }
    setCurrentStep(4)
  }

  return (
    <div
      className="min-h-screen font-sans flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDF4 100%)',
      }}
    >
      {currentStep === 1 && (
        <Step1 onNext={handleStep1Next} loading={stepLoading} />
      )}

      {currentStep === 2 && (
        <Step2
          onNext={handleStep2Next}
          onBack={handleStep2Back}
          loading={stepLoading}
          initialRecipients={fetchedRecipients}
        />
      )}

      {currentStep === 3 && (
        <Step3
          onNext={handleStep3Next}
          onBack={handleStep3Back}
          loading={stepLoading}
          initialManager={fetchedManager}
        />
      )}

      {currentStep === 4 && (
        <Step4
          onNext={handleStep4Next}
          onBack={handleStep4Back}
          initialMessages={fetchedMessages}
        />
      )}

      {currentStep === 5 && (
        <Step5
          onNext={handleStep5Next}
          onBack={handleStep5Back}
          loading={loading}
          initialMessages={fetchedMessages}
        />
      )}
    </div>
  )
}
