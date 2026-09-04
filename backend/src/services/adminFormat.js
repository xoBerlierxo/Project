const db = require('../db/connection');

function getAvailabilityForServiceInternal(serviceId) {
  return db
    .prepare('SELECT * FROM availability_slots WHERE service_id = ? AND active = 1 ORDER BY weekday, start_time')
    .all(serviceId);
}

function formatServiceInternal(row, availability) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description,
    duration_minutes: row.duration_minutes,
    price: row.price,
    meeting_required: Boolean(row.meeting_required),
    delivery_time: row.delivery_time,
    active: Boolean(row.active),
    availability: availability.map((slot) => ({
      weekday: slot.weekday,
      start_time: slot.start_time,
      end_time: slot.end_time,
      timezone: slot.timezone,
    })),
  };
}

module.exports = { getAvailabilityForServiceInternal, formatServiceInternal };
