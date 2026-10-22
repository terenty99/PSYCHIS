// Presentation only: retain original saved metadata without endorsing it.
export function researchStatusLabel(status, fallback = 'Research artifact') {
  if (typeof status !== 'string' || !status.trim()) return fallback;
  if (/^(peer reviewed|crawled live|verified|empirically proven|\d+(?:\.\d+)?% confidence)$/i.test(status.trim())) {
    return 'Unverified status';
  }
  return status;
}
