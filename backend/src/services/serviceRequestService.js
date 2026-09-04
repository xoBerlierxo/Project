const db = require('../db/connection');
const { ApiError } = require('../utils/response');
const { sanitizeText } = require('../utils/sanitize');

function createRequest({ service_id, customer_name, customer_email, message }) {
  const service = db.prepare(`
    SELECT cs.*, cp.status AS creator_status
    FROM creator_services cs
    JOIN creator_profiles cp ON cp.id = cs.creator_id
    WHERE cs.id = ? AND cs.active = 1
  `).get(service_id);

  if (!service || service.creator_status !== 'APPROVED') {
    throw new ApiError(404, 'NOT_FOUND', 'Service not found');
  }

  const result = db.prepare(`
    INSERT INTO service_requests (creator_id, service_id, customer_name, customer_email, message, status)
    VALUES (?, ?, ?, ?, ?, 'PENDING')
  `).run(service.creator_id, service_id, sanitizeText(customer_name), customer_email, sanitizeText(message || ''));

  return db.prepare('SELECT * FROM service_requests WHERE id = ?').get(result.lastInsertRowid);
}

module.exports = { createRequest };
