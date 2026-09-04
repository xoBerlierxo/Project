const db = require('../db/connection');
const { ApiError } = require('../utils/response');
const { sanitizeText } = require('../utils/sanitize');

function toBool(value) {
  return value === 1 || value === true || value === '1' || value === 'true';
}

function formatService(row, availability) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    description: row.description,
    duration_minutes: row.duration_minutes,
    price: row.price,
    meeting_required: toBool(row.meeting_required),
    delivery_time: row.delivery_time,
    availability: availability.map((slot) => ({
      weekday: slot.weekday,
      start_time: slot.start_time,
      end_time: slot.end_time,
      timezone: slot.timezone,
    })),
  };
}

function getAvailabilityForService(serviceId) {
  return db
    .prepare('SELECT * FROM availability_slots WHERE service_id = ? AND active = 1 ORDER BY weekday, start_time')
    .all(serviceId);
}

function getActiveServicesForCreator(creatorId) {
  const services = db
    .prepare('SELECT * FROM creator_services WHERE creator_id = ? AND active = 1 ORDER BY id')
    .all(creatorId);
  return services.map((s) => formatService(s, getAvailabilityForService(s.id)));
}

function formatCreatorCard(row) {
  const services = getActiveServicesForCreator(row.id);
  const startingPrice = services.length ? Math.min(...services.map((s) => s.price)) : null;

  return {
    id: row.id,
    name: row.name,
    photo_url: row.photo_url,
    company: row.current_status === 'WORKING' ? row.company : null,
    current_status: row.current_status,
    job_title: row.current_status === 'WORKING' ? row.job_title : null,
    description: row.description,
    verified: row.status === 'APPROVED',
    service_categories: [...new Set(services.map((s) => s.category))],
    starting_price: startingPrice,
  };
}

function formatCreatorProfile(row) {
  return {
    id: row.id,
    name: row.name,
    photo_url: row.photo_url,
    company: row.current_status === 'WORKING' ? row.company : null,
    current_status: row.current_status,
    job_title: row.current_status === 'WORKING' ? row.job_title : null,
    years_experience: row.years_experience,
    linkedin_url: row.linkedin_url,
    description: row.description,
    verified: row.status === 'APPROVED',
    services: getActiveServicesForCreator(row.id),
  };
}

function listPublicCreators({ category }) {
  const rows = db.prepare("SELECT * FROM creator_profiles WHERE status = 'APPROVED' ORDER BY id").all();
  const cards = rows.map(formatCreatorCard);
  if (!category) return cards;
  return cards.filter((c) => c.service_categories.includes(category));
}

function getPublicCreatorById(id) {
  const row = db.prepare("SELECT * FROM creator_profiles WHERE id = ? AND status = 'APPROVED'").get(id);
  if (!row) throw new ApiError(404, 'NOT_FOUND', 'Creator not found');
  return formatCreatorProfile(row);
}

function createApplication(data, userId) {
  const insert = db.prepare(`
    INSERT INTO creator_profiles
      (user_id, name, photo_url, company, current_status, linkedin_url, job_title, years_experience, description, status)
    VALUES (@user_id, @name, @photo_url, @company, @current_status, @linkedin_url, @job_title, @years_experience, @description, 'PENDING_VERIFICATION')
  `);

  const result = insert.run({
    user_id: userId,
    name: sanitizeText(data.name),
    photo_url: data.photo_url || null,
    company: data.current_status === 'NOT_WORKING' ? null : sanitizeText(data.company),
    current_status: data.current_status || 'WORKING',
    linkedin_url: data.linkedin_url,
    job_title: data.current_status === 'NOT_WORKING' ? null : sanitizeText(data.job_title),
    years_experience: Number(data.years_experience),
    description: sanitizeText(data.description),
  });

  db.prepare(`
    INSERT INTO verifications (creator_id, verification_type, status)
    VALUES (?, 'MANUAL_ADMIN_REVIEW', 'PENDING')
  `).run(result.lastInsertRowid);

  return getCreatorAnyStatus(result.lastInsertRowid);
}

function getCreatorAnyStatus(id) {
  const row = db.prepare('SELECT * FROM creator_profiles WHERE id = ?').get(id);
  if (!row) throw new ApiError(404, 'NOT_FOUND', 'Creator not found');
  return row;
}

function assertCreatorOwnership(creatorId, userId) {
  const row = getCreatorAnyStatus(creatorId);
  if (row.user_id !== userId) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not own this creator profile');
  }
  return row;
}

const UPDATABLE_PROFILE_FIELDS = [
  'name', 'photo_url', 'company', 'current_status',
  'linkedin_url', 'job_title', 'years_experience', 'description',
];

function updateCreatorProfile(creatorId, userId, data) {
  assertCreatorOwnership(creatorId, userId);

  const fields = UPDATABLE_PROFILE_FIELDS.filter((f) => data[f] !== undefined);
  if (fields.length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'No updatable fields provided');
  }

  const setClause = fields.map((f) => `${f} = @${f}`).join(', ');
  const params = { id: creatorId };
  for (const f of fields) {
    params[f] = ['name', 'company', 'job_title', 'description'].includes(f)
      ? sanitizeText(data[f])
      : data[f];
  }

  db.prepare(`UPDATE creator_profiles SET ${setClause}, updated_at = datetime('now') WHERE id = @id`).run(params);
  return getCreatorAnyStatus(creatorId);
}

function createService(creatorId, userId, data) {
  assertCreatorOwnership(creatorId, userId);

  const insert = db.prepare(`
    INSERT INTO creator_services
      (creator_id, category, name, description, duration_minutes, price, meeting_required, delivery_time)
    VALUES (@creator_id, @category, @name, @description, @duration_minutes, @price, @meeting_required, @delivery_time)
  `);

  const meetingRequired = Boolean(data.meeting_required);
  const result = insert.run({
    creator_id: creatorId,
    category: data.category,
    name: sanitizeText(data.name),
    description: sanitizeText(data.description),
    duration_minutes: meetingRequired ? Number(data.duration_minutes) || null : null,
    price: Number(data.price),
    meeting_required: meetingRequired ? 1 : 0,
    delivery_time: meetingRequired ? null : sanitizeText(data.delivery_time),
  });

  const serviceId = result.lastInsertRowid;

  if (meetingRequired) {
    const insertSlot = db.prepare(`
      INSERT INTO availability_slots (service_id, weekday, start_time, end_time, timezone)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const slot of data.availability) {
      insertSlot.run(serviceId, slot.weekday, slot.start_time, slot.end_time, slot.timezone || 'Asia/Kolkata');
    }
  }

  return formatService(db.prepare('SELECT * FROM creator_services WHERE id = ?').get(serviceId), getAvailabilityForService(serviceId));
}

function getServiceOwner(serviceId) {
  const row = db.prepare('SELECT * FROM creator_services WHERE id = ?').get(serviceId);
  if (!row) throw new ApiError(404, 'NOT_FOUND', 'Service not found');
  return row;
}

const UPDATABLE_SERVICE_FIELDS = ['category', 'name', 'description', 'duration_minutes', 'price', 'meeting_required', 'delivery_time'];

function updateService(serviceId, userId, data) {
  const service = getServiceOwner(serviceId);
  assertCreatorOwnership(service.creator_id, userId);

  const fields = UPDATABLE_SERVICE_FIELDS.filter((f) => data[f] !== undefined);
  const params = { id: serviceId };
  for (const f of fields) {
    if (f === 'meeting_required') {
      params[f] = data[f] ? 1 : 0;
    } else if (['name', 'description', 'delivery_time'].includes(f)) {
      params[f] = sanitizeText(data[f]);
    } else {
      params[f] = data[f];
    }
  }

  if (fields.length > 0) {
    const setClause = fields.map((f) => `${f} = @${f}`).join(', ');
    db.prepare(`UPDATE creator_services SET ${setClause}, updated_at = datetime('now') WHERE id = @id`).run(params);
  }

  if (Array.isArray(data.availability)) {
    db.prepare('UPDATE availability_slots SET active = 0 WHERE service_id = ?').run(serviceId);
    const insertSlot = db.prepare(`
      INSERT INTO availability_slots (service_id, weekday, start_time, end_time, timezone)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const slot of data.availability) {
      insertSlot.run(serviceId, slot.weekday, slot.start_time, slot.end_time, slot.timezone || 'Asia/Kolkata');
    }
  }

  const updated = db.prepare('SELECT * FROM creator_services WHERE id = ?').get(serviceId);
  return formatService(updated, getAvailabilityForService(serviceId));
}

function deactivateService(serviceId, userId) {
  const service = getServiceOwner(serviceId);
  assertCreatorOwnership(service.creator_id, userId);
  db.prepare("UPDATE creator_services SET active = 0, updated_at = datetime('now') WHERE id = ?").run(serviceId);
}

module.exports = {
  listPublicCreators,
  getPublicCreatorById,
  createApplication,
  getCreatorAnyStatus,
  updateCreatorProfile,
  createService,
  updateService,
  deactivateService,
  formatCreatorProfile,
};
