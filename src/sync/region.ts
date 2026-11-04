export async function approximateRegion() {
  // Timezone is deliberately coarse. No location permission, IP lookup or tracking.
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const city = timezone.split('/').slice(1).join(' / ').replaceAll('_', ' ');

  return city ? `Approximate region: ${city} time zone` : 'Region unavailable';
}
