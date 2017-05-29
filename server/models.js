'use strict';

const mongoose = require('mongoose');
const bluebird = require('bluebird');
const ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = bluebird;

const spec = {
    ident : {
        regex : /^CSC[a-z]{2}[0-9]{5}$/,
        stages : ['staging', 'finalized', 'deleted'],
        types : ['bg', 'fn']
    },
    skip : {
        reasons : ['', '$$NA', '$$LIMIT', '$$NOTAPPLICABLE', '$$AMBIGUOUS' ]
    },
    additional: {
        states : ['wip', 'notvalidated', 'validated']
    },
    ic_details : {
        levels : [ 'NA', 'info', 'debug', 'notice', 'warning',
                   'error', 'critical', 'alert', 'emergency'] 
    }
};

const ident_json = {
    id: { type: String, required: true, trim: true, match: spec.ident.regex },
    type: { type: String, required: true, enum: spec.ident.types,
            default: spec.ident.types[0] },
    stage: { type: String, required: true, enum: spec.ident.stages,
             default: spec.ident.stages[0] }
};

const ident_schema = new mongoose.Schema(ident_json);
const ident = mongoose.model('ident', ident_schema);

const authors_json = {
    creator: { type: String, minlength: 2, trim: true },
    contributors: { type: [ String ] },
    user: { type: String, required: true, minlength : 2, trim: true }
};

const authors_schema =  new mongoose.Schema(authors_json);
const authors = mongoose.model('authors', authors_schema);

const skip_json = {
    reason: { type: String, default: '', enum: spec.skip.reasons },
    description: { type: String, default: '' }
};

const skip_schema = new mongoose.Schema(skip_json);
const skip = mongoose.model('skip', skip_schema);

const condition_json = {
    name: { type: String, default: '', required: true },
    filename: { type: String, default: ''},
    command: { type: String, default: '', required: true},
    regex: { type: String, default: '', required: true},
    comment: { type: String, default: ''}
};

const condition_schema = new mongoose.Schema(condition_json);
const condition = mongoose.model('condition', condition_schema);

const optional_json = { 
    pid: { type: String, default: ''},
    action: { type: String, default: ''},
    title: { type: String, default: ''},
    alert_type: { type: String , enum : ["TBD", "LATER"], default: 'TBD'},
    confidence_level: { type: Number , default: ''},
    link: { type: String , default: ''},
    notes: { type: String , default: ''},
    other: { type: String , default: ''}
};

const optional_schema = new mongoose.Schema(optional_json);
const optional = mongoose.model('optional', optional_schema);

const additional_json = {
    distribution_level: { type: String, default: ''},
    validation_state: { type: String , enum: spec.additional.states,
                        default: spec.additional.states[0]},
    labels: [ String ],            
    tech: { type: String, default: ''},
    sub_tech: { type: String, default: ''}
};

const additional_schema = new mongoose.Schema(additional_json);
const additional = mongoose.model('additional', additional_schema);

const dsig_details_json = {
    logic: { type: String, default: '' },    
    skip : skip_schema,
    conditions: [ condition_schema ],
    optional: optional_schema,
    additional: additional_schema
};

function validate_skip(skip) {
    if (skip.reason === '') {
        return true;
    } else if (skip_json.reason.enum.includes(skip.reason)) {
        return (skip.description.length > 0);
    } 
    return false;
}

const dsig_details_schema = new mongoose.Schema(dsig_details_json);
const dsig_details = mongoose.model('dsig_details', dsig_details_schema);

const release_note_json = {
    Symptom: { type: String, default: ''},
    Condition: { type: String, default: ''},
    Workaround: { type: String, default: ''},
    Additional: { type: String, default: ''}
};

const release_note_schema = new mongoose.Schema(release_note_json);
const release_note = mongoose.model('release_note', release_note_schema);

const defect_details_json = {
    headline: { type: String, default: ''},
    priority: { type: String, default: ''},
    severity: { type: String, default: ''},
    found: { type: String , default: ''},
    project: { type: String, default: ''},
    product: { type: String, default: ''},
    component: { type: String, default: ''},
    hardware: { type: String, default: ''},
    keywords: { type: String, default: ''},
    version: { type: String, default: ''},
    integrated_releases: { type: String, default: ''},
    verified_release: { type: String, default: ''},
    release_note: release_note_schema
};

const defect_details_schema = new mongoose.Schema(defect_details_json);
const defect_details = mongoose.model('defect_details', defect_details_schema);

const field_notice_details_json = {
    title: { type: String, default: ''},
    headline: { type: String, default: ''},
    sn_affected: { type: Number, default: 0},
    pid_affected: { type: Number, default: 0},
    problem_description: { type: String, default: ''},
    background: { type: String, default: ''},
    symptom: { type: String, default: ''},
    workaround_or_solution: { type: String, default: ''},
    action: { type: String, default: ''},
    associated_defect: { type: String, default: ''},
    engineering_change_order: { type: String, default: ''},
    product_family: { type: String, default: ''},
    internal_field_notices_url: { type: String, default: ''},
    external_field_notices_url: { type: String, default: ''},
    associated_umpire: { type: String, default: ''},
    publish_date: { type: String, default: ''},
    distribution: { type: String, default: ''}
};

const field_notice_details_schema = new mongoose.Schema(field_notice_details_json);
const field_notice_details = mongoose.model('field_notice_details', field_notice_details_json);

const ic_details_json = {
    title: { type: String, default: ''},
    severity_level: { type: String, default: spec.ic_details.levels[0],
                      enum : spec.ic_details.levels },
    customer_impact: { type: String, default: ''},
    required_to_hit: { type: String, default: ''},
    next_steps: { type: String, default: ''},
    additional_info: { type: String, default: ''},
    evidence_loc: { type: String, default: ''},
    description: { type: String, default: ''},
    symptom: { type: String, default: ''},
    action: { type: String, default: ''},
    feature: { type: String, default: ''},
    pid: { type: String, default: ''},
    product: { type: String, default: ''},
    version: { type: String, default: ''},
    extras: {
	doc_note1: { type: String, default: ''},
	ref_link1: { type: String, default: ''}
    }
};

const ic_details_schema = new mongoose.Schema(ic_details_json);
const ic_details = mongoose.model('ic_details', ic_details_json);

const dsig_json = {
    ident: { type : ident_schema, validate : [ validate_ident,'invalid id number' ] },
    authors: { type: authors_schema, validate : [ validate_authors, 'invalid authors names' ] },
    dsig_details: { type : dsig_details_schema, validate: [ validate_dsig_details, 'invalid dsig details'] },
    defect_details: { type : defect_details_schema},
    field_notice_details: { type : field_notice_details_schema},
    ic_details: { type : ic_details_schema }
};

function validate_dsig_details(details) {
    const names = details.logic.split(/[ &|\*\+()]+/).filter((x) => (x!== ''));
    const ok = details.conditions.reduce((result, condition) => {
        return result && names.includes(condition.name);
    }, true);
    return ok;
}

function validate_ident(ident) {
    return ((spec.ident.match.test(ident.id)) &&
            (ident_json.type.enum.includes(ident.type)) &&
            (ident_json.stage.enum.includes(ident.stage)) );
}

function validate_authors(authors) {
    return ((authors.contributors.length > 0) &&
            (authors.user.length > 0) &&
            (authors.contributors.includes(authors.user))
           );
}

const dsig_schema = new mongoose.Schema(
    dsig_json ,
    { timestamps: { createdAt: 'created_at', updatedAt : 'modified_at'} }
);

const dsig = mongoose.model('dsig', dsig_schema);

const cdets_json = {
    id: {type: String, required: true },
    TBD: String
};

const cdets_schema = new mongoose.Schema(cdets_json);
const cdets = mongoose.model('cdets', cdets_schema);

module.exports = {
    ident_json, ident_schema, ident,
    authors_json, authors_schema, authors,
    skip_json, skip_schema, skip,
    condition_json, condition_schema, condition,
    optional_json, optional_schema, optional,
    additional_json, additional_schema, additional,
    dsig_details_json, dsig_details_schema, dsig_details,
    release_note_json, release_note_schema, release_note,
    defect_details_json, defect_details_schema, defect_details,
    field_notice_details_json, field_notice_details_schema, field_notice_details,
    ic_details_json, ic_details_schema, ic_details,
    dsig_json, dsig_schema, dsig,
    cdets_json, cdets_schema, cdets
};
