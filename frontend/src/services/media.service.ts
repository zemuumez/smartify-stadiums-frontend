import type { CameraDevice, MediaAsset, Transport } from './contracts';
export function createMediaService(transport: Transport) {
  return {
    cameras: () => transport.request<CameraDevice[]>('/owner/cameras'),
    replays: () => transport.request<MediaAsset[]>('/media'),
  };
}
