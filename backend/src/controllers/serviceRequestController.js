const serviceRequestService = require('../services/serviceRequestService');
const { requireFields, isEmail } = require('../utils/validators');
const { ApiError, ok } = require('../utils/response');

function createRequest(req, res) {
  requireFields(req.body, ['service_id', 'customer_name', 'customer_email']);
  if (!isEmail(req.body.customer_email)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid customer_email format');
  }
  const request = serviceRequestService.createRequest(req.body);
  ok(res, { request }, 201);
}

module.exports = { createRequest };
