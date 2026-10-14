// Haversine formula to calculate great-circle distance in meters between two lat/lng points
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (x) => (x * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

function checkGeoFence(session, studentLat, studentLng) {
  // If geofencing is not enabled for this session, allow by default
  if (!session.geo_fence_enabled) {
    return { allowed: true, reason: 'Geo-fencing disabled for this session' };
  }

  // If enabled, student MUST provide coordinates
  if (studentLat === undefined || studentLat === null || studentLng === undefined || studentLng === null) {
    return {
      allowed: false,
      reason: 'Location access is required by classroom geofence. Please enable GPS on your device.'
    };
  }

  const sLat = parseFloat(studentLat);
  const sLng = parseFloat(studentLng);
  const cLat = parseFloat(session.geo_lat);
  const cLng = parseFloat(session.geo_lng);
  const radius = parseFloat(session.geo_radius_m) || 100;

  if (isNaN(cLat) || isNaN(cLng)) {
    return { allowed: true, reason: 'Classroom coordinates not configured properly' };
  }

  const distance = haversineDistance(cLat, cLng, sLat, sLng);

  if (distance <= radius) {
    return {
      allowed: true,
      distance: Math.round(distance),
      reason: `Within boundary (${Math.round(distance)}m / ${radius}m allowed)`
    };
  } else {
    return {
      allowed: false,
      distance: Math.round(distance),
      reason: `Outside classroom radius (${Math.round(distance)}m away, max allowed is ${radius}m)`
    };
  }
}

module.exports = {
  haversineDistance,
  checkGeoFence
};
