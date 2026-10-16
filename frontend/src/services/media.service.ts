import type {
  CameraCertificationReviewInput,
  CameraDevice,
  CameraRegisterInput,
  CameraUpdateInput,
  MatchRecording,
  MediaVisibility,
  PrivacyConsentStatus,
  PublicHighlight,
  RecordingStatus,
  ReplayEntitlement,
  ReplayPlayback,
  Transport,
} from './contracts';

export function createMediaService(transport: Transport) {
  return {
    // Owner camera operations
    cameras: (venueId?: string | AbortSignal, signal?: AbortSignal) => {
      const vid = typeof venueId === 'string' ? venueId : undefined;
      const sig = venueId instanceof AbortSignal ? venueId : signal;
      return transport.request<CameraDevice[]>(vid ? `/owner/cameras?venueId=${encodeURIComponent(vid)}` : '/owner/cameras', { signal: sig });
    },
    registerCamera: (input: CameraRegisterInput) =>
      transport.request<CameraDevice>('/owner/cameras', { method: 'POST', body: input }),
    updateCamera: (id: string, input: CameraUpdateInput) =>
      transport.request<CameraDevice>(`/owner/cameras/${id}`, { method: 'PATCH', body: input }),

    // Admin certification review
    adminCameras: (signal?: AbortSignal) =>
      transport.request<CameraDevice[]>('/admin/cameras', { signal }),
    certifyCamera: (id: string, input: CameraCertificationReviewInput) =>
      transport.request<CameraDevice>(`/admin/cameras/${id}/certify`, { method: 'POST', body: input }),
    grantReplayEntitlement: (recordingId: string, input: string | { userId: string; expiresAt?: string }) => {
      const body = typeof input === 'string' ? { userId: input } : input;
      return transport.request<ReplayEntitlement>(`/owner/recordings/${recordingId}/entitlements`, { method: 'POST', body });
    },

    // Owner recording operations
    recordings: (venueId?: string | AbortSignal, signal?: AbortSignal) => {
      const vid = typeof venueId === 'string' ? venueId : undefined;
      const sig = venueId instanceof AbortSignal ? venueId : signal;
      return transport.request<MatchRecording[]>(vid ? `/owner/recordings?venueId=${encodeURIComponent(vid)}` : '/owner/recordings', { signal: sig });
    },
    recordingDetail: (id: string, signal?: AbortSignal) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}`, { signal }),
    retryRecording: (id: string) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}/retry`, { method: 'POST' }),
    advanceRecordingDemoState: (id: string, nextStatus: RecordingStatus, failureReason?: string) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}/advance`, { method: 'POST', body: { status: nextStatus, failureReason } }),
    updateConsent: (id: string, input: { status?: PrivacyConsentStatus; participantStatus?: PrivacyConsentStatus; guardianStatus?: 'pending' | 'granted' | 'denied'; guardianConsentStatus?: 'pending' | 'granted' | 'denied'; minorParticipant?: boolean; notes?: string }) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}/consent`, { method: 'POST', body: input }),
    completePrivacyBlur: (id: string) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}/privacy-blur`, { method: 'POST' }),
    updatePublication: (id: string, input: { visibility: MediaVisibility; ownerApproved?: boolean }) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}/publication`, { method: 'POST', body: input }),
    unpublishRecording: (id: string, reason?: string) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}/unpublish`, { method: 'POST', body: { reason } }),

    // Player replay & public highlights
    replays: (signal?: AbortSignal) =>
      transport.request<ReplayPlayback[]>('/replays', { signal }),
    bookingReplay: (bookingId: string, signal?: AbortSignal) =>
      transport.request<ReplayPlayback>(`/bookings/${bookingId}/replay`, { signal }),
    venueHighlights: (venueId: string, signal?: AbortSignal) =>
      transport.request<PublicHighlight[]>(`/venues/${venueId}/highlights`, { signal }),
  };
}
