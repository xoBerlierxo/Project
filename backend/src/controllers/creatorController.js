const creatorService = require('../services/creatorService');
const authService = require('../services/authService');
const { validateCreatorApplication, validateService } = require('../utils/validators');
const { signToken } = require('../utils/auth');
const { ok } = require('../utils/response');
const { ApiError } = require('../utils/response');

function apply(req, res) {
  validateCreatorApplication(req.body);

  const user = authService.findOrCreateCreatorUser(req.body.email);
  const creator = creatorService.createApplication(req.body, user.id);
  const token = signToken(user);

  ok(res, { creator, token }, 201);
}

function updateProfile(req, res) {
  const creator = creatorService.updateCreatorProfile(Number(req.params.id), req.user.id, req.body);
  ok(res, { creator });
}

function createService(req, res) {
  validateService(req.body);
  const service = creatorService.createService(Number(req.params.id), req.user.id, req.body);
  ok(res, { service }, 201);
}

function updateService(req, res) {
  const service = creatorService.updateService(Number(req.params.id), req.user.id, req.body);
  ok(res, { service });
}

function deactivateService(req, res) {
  creatorService.deactivateService(Number(req.params.id), req.user.id);
  ok(res, { deactivated: true });
}

function uploadPhoto(req, res) {
  if (!req.file) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'photo file is required');
  }
  const photoUrl = `/uploads/${req.file.filename}`;
  const creator = creatorService.updateCreatorProfile(Number(req.params.id), req.user.id, { photo_url: photoUrl });
  ok(res, { creator });
}

module.exports = { apply, updateProfile, createService, updateService, deactivateService, uploadPhoto };
