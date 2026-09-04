const db = require('../db/connection');
const { ApiError } = require('../utils/response');
const { getAvailabilityForServiceInternal, formatServiceInternal } = require('./adminFormat');

function listCreatorsByStatus(status) {
  return db.prepare('SELECT * FROM creator_profiles WHERE status = ? ORDER BY created_at DESC').all(status);
}

function getFullCreator(id) {
  const creator = db.prepare('SELECT * FROM creator_profiles WHERE id = ?').get(id);
  if (!creator) throw new ApiError(404, 'NOT_FOUND', 'Creator not found');

  const services = db.prepare('SELECT * FROM creator_services WHERE creator_id = ? ORDER BY id').all(id)
    .map((s) => formatServiceInternal(s, getAvailabilityForServiceInternal(s.id)));

  const verification = db.prepare('SELECT * FROM verifications WHERE creator_id = ? ORDER BY id DESC LIMIT 1').get(id);
  const owner = db.prepare('SELECT id, email FROM users WHERE id = ?').get(creator.user_id);

  return {
    ...creator,
    email: owner ? owner.email : null,
    services,
    verification,
  };
}

function recordAdminAction(adminId, creatorId, action, reason) {
  db.prepare(`
    INSERT INTO admin_actions (admin_id, creator_id, action, reason)
    VALUES (?, ?, ?, ?)
  `).run(adminId, creatorId, action, reason || null);
}

function setStatus(creatorId, status) {
  const result = db.prepare("UPDATE creator_profiles SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, creatorId);
  if (result.changes === 0) throw new ApiError(404, 'NOT_FOUND', 'Creator not found');
}

function approve(creatorId, adminId) {
  setStatus(creatorId, 'APPROVED');
  db.prepare("UPDATE verifications SET status = 'VERIFIED', checked_by = ?, checked_at = datetime('now') WHERE creator_id = ?")
    .run(adminId, creatorId);
  recordAdminAction(adminId, creatorId, 'APPROVE', null);
  return getFullCreator(creatorId);
}

function reject(creatorId, adminId, reason) {
  setStatus(creatorId, 'REJECTED');
  db.prepare("UPDATE verifications SET status = 'FAILED', checked_by = ?, checked_at = datetime('now'), notes = ? WHERE creator_id = ?")
    .run(adminId, reason || null, creatorId);
  recordAdminAction(adminId, creatorId, 'REJECT', reason);
  return getFullCreator(creatorId);
}

function requestChanges(creatorId, adminId, reason) {
  setStatus(creatorId, 'CHANGES_REQUIRED');
  db.prepare('UPDATE verifications SET notes = ? WHERE creator_id = ?').run(reason || null, creatorId);
  recordAdminAction(adminId, creatorId, 'REQUEST_CHANGES', reason);
  return getFullCreator(creatorId);
}

function unpublish(creatorId, adminId, reason) {
  setStatus(creatorId, 'UNPUBLISHED');
  recordAdminAction(adminId, creatorId, 'UNPUBLISH', reason);
  return getFullCreator(creatorId);
}

module.exports = {
  listCreatorsByStatus,
  getFullCreator,
  approve,
  reject,
  requestChanges,
  unpublish,
};
