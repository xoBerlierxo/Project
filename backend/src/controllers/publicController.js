const creatorService = require('../services/creatorService');
const { ok } = require('../utils/response');

function listCreators(req, res) {
  const { category } = req.query;
  const creators = creatorService.listPublicCreators({ category });
  ok(res, { creators });
}

function getCreator(req, res) {
  const creator = creatorService.getPublicCreatorById(req.params.id);
  ok(res, { creator });
}

module.exports = { listCreators, getCreator };
