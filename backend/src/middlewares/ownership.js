const ApiError = require("../utils/ApiError");
const { ROLES } = require("../constants");

// Ownership gate: loads the :id document from the given model, 404s if
// absent, 403s if it belongs to another user (admins bypass), and
// attaches it as req.doc so handlers never re-query.
//
// This single middleware is what guarantees users can never read or
// mutate each other's workouts / measurements / goals / photos.

function ownership(Model, { param = "id" } = {}) {
  return async (req, res, next) => {
    const doc = await Model.findById(req.params[param]);
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);

    const ownerId = doc.user ? doc.user.toString() : null;
    const isOwner = ownerId && ownerId === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;
    if (!isOwner && !isAdmin) throw ApiError.forbidden();

    req.doc = doc;
    next();
  };
}

module.exports = ownership;
