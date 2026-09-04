const adminService = require('../services/adminService');
const { ok } = require('../utils/response');

function listPending(req, res) {
  ok(res, { creators: adminService.listCreatorsByStatus('PENDING_VERIFICATION') });
}

function listApproved(req, res) {
  ok(res, { creators: adminService.listCreatorsByStatus('APPROVED') });
}

function listRejected(req, res) {
  ok(res, { creators: adminService.listCreatorsByStatus('REJECTED') });
}

function getCreator(req, res) {
  ok(res, { creator: adminService.getFullCreator(Number(req.params.id)) });
}

function approve(req, res) {
  ok(res, { creator: adminService.approve(Number(req.params.id), req.user.id) });
}

function reject(req, res) {
  ok(res, { creator: adminService.reject(Number(req.params.id), req.user.id, req.body.reason) });
}

function requestChanges(req, res) {
  ok(res, { creator: adminService.requestChanges(Number(req.params.id), req.user.id, req.body.reason) });
}

function unpublish(req, res) {
  ok(res, { creator: adminService.unpublish(Number(req.params.id), req.user.id, req.body.reason) });
}

module.exports = { listPending, listApproved, listRejected, getCreator, approve, reject, requestChanges, unpublish };
