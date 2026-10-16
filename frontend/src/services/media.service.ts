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
  ReplayPlayback,
  Transport,
} from './contracts';

export function createMediaService(transport: Transport) {
  return {
    // Owner camera operations
    cameras: (venueId?: string, signal?: AbortSignal) =>
      transport.request<CameraDevice[]>(venueId ? `/owner/cameras?venueId=${encodeURIComponent(venueId)}` : '/owner/cameras', { signal }),
    registerCamera: (input: CameraRegisterInput) =>
      transport.request<CameraDevice>('/owner/cameras', { method: 'POST', body: input }),
    updateCamera: (id: string, input: CameraUpdateInput) =>
      transport.request<CameraDevice>(`/owner/cameras/${id}`, { method: 'PATCH', body: input }),

    // Admin certification review
    certifyCamera: (id: string, input: CameraCertificationReviewInput) =>
      transport.request<CameraDevice>(`/admin/cameras/${id}/certify`, { method: 'POST', body: input }),

    // Owner recording operations
    recordings: (venueId?: string, signal?: AbortSignal) =>
      transport.request<MatchRecording[]>(venueId ? `/owner/recordings?venueId=${encodeURIComponent(venueId)}` : '/owner/recordings', { signal }),
    recordingDetail: (id: string, signal?: AbortSignal) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}`, { signal }),
    retryRecording: (id: string) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}/retry`, { method: 'POST' }),
    advanceRecordingDemoState: (id: string, nextStatus: RecordingStatus) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}/advance`, { method: 'POST', body: { status: nextStatus } }),
    updateConsent: (id: string, input: { status: PrivacyConsentStatus; guardianConsentStatus?: 'pending' | 'granted' | 'denied'; notes?: string }) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}/consent`, { method: 'POST', body: input }),
    completePrivacyBlur: (id: string) =>
      transport.request<MatchRecording>(`/owner/recordings/${id}/privacy-blur`, { method: 'POST' }),
    updatePublication: (id: string, input: { visibility: MediaVisibility; ownerApproved: boolean }) =>
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
