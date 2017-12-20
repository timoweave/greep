'use strict';

const schemas = require('./schemas.js');

const mongoose = require('mongoose');

const ident = mongoose.model('ident', schemas.ident_schema);
const authors = mongoose.model('authors', schemas.authors_schema);
const skip = mongoose.model('skip', schemas.skip_schema);
const condition = mongoose.model('condition', schemas.condition_schema);
const optional = mongoose.model('optional', schemas.optional_schema);
const additional = mongoose.model('additional', schemas.additional_schema);
const dsig_details = mongoose.model('dsig_details', schemas.dsig_details_schema);
const release_note = mongoose.model('release_note', schemas.release_note_schema);
const defect_details = mongoose.model('defect_details', schemas.defect_details_schema);
const field_notice_details = mongoose.model('field_notice_details', schemas.field_notice_details_json);
const ic_details = mongoose.model('ic_details', schemas.ic_details_json);
const dsig = mongoose.model('dsig', schemas.dsig_schema);
const cdets = mongoose.model('cdets', schemas.cdets_schema);

module.exports = {
    ident, authors, skip, condition, optional,
    additional, dsig_details, release_note, defect_details,
    field_notice_details, ic_details, dsig, cdets
};
