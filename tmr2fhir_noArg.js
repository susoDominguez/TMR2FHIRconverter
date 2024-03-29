"use strict";

const logger = require("../../config/winston");


function Card(options = {}) {
  const {
    uuid = "CIG-00000000000000",
    patient = "dummy",
    summary = "Personalised knowledge-based decision support in patients with multimorbidity",
    labelSource = "TMR-based clinical guidelines",
    labelSuggestions = "care plan decision support",
    actionDescription = "Update COPD care plan",
    resourceId = "bundle",
    birthDate = "",
  } = options; //default values for COPD

  this.patient = patient;
  let patientUrl = "http://acme.com/Patient/" + patient;
  this.birthDate = birthDate;
  this.entry = [
    {
     // fullUrl: patientUrl,
      resource: {
        resourceType: "Patient",
        id: this.patient,
        active: true
        //birthDate: birthDate,
      }
    }
  ];

  //only property of Card
  this.toJSON = () => {
    return {
      cards: [
        {
          summary: summary,
          indicator: "info",
          source: {
            label: labelSource,
          },
          suggestions: [
            {
              label: labelSuggestions,
              uuid: uuid,
              actions: [
                {
                  type: "update",
                  description: actionDescription,
                  resource: {
                    resourceType: "Bundle",
                    id: resourceId,
                    type: "collection",
                    entry: this.entry,
                  },
                },
              ],
            },
          ],
          selectionBehaviour: "at-most-one",
        },
      ],
    };
  };

  this.toString = () => JSON.stringify(this.toJSON());
}

/**
 * constant of the FHIR syntax
 */
const uriPrefix = "http://anonymous.org/";
const med_ID = "Medication",
  cond_ID = "Condition",
  effect_ID = "ForecastEffect",
  medReq_ID = "MedicationRequest",
  servReq_ID = "ServiceRequest",
  interact_ID = "interactions",
  detecIs_ID = "DetectedIssue",
  carePlan_ID = "CarePlan";
/**
 * types of request: Medication, service or vaccination
 */
const requestMap = new Map([
  [0, medReq_ID],
  [1, servReq_ID],
  [2, medReq_ID],
]); //[2,ImmunizationRecommendation]

const altInter = "alternative",
  contrInter = "contradiction",
  repairInter = "repairable",
  repetInter = "repetition";

//mitigation codes for contradiction
const contrMitStopped = "13",
  contrMitAlt = "ALTHRPYMIT",
  contrMitRep = "INVEFFCTMIT";

//interaction types
const interactionCodes = new Map([
  [
    altInter,
    {
      interaction: [
        {
          system: "http://anonymous.org/CodeSystem/interactions",
          code: "ALTHRPY",
          display: "Alternative Therapies With Same Intended Effect"
        }
      ],
      mitigation: [
        {
          action: {
            coding: [
              {
                system: "http://anonymous.org/CodeSystem/interactions",
                code: "NOTREQ",
                display: "Mitigation Not Required",
              }
            ]
          }
        }
      ]
    }
  ],
  [
    contrInter,
    {
      interaction: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "DACT",
          display: "Drug Action Detected Issue"
        }
      ],
      mitigation: [
        {
          action: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: contrMitStopped,
                display: "Stopped Concurrent Therapy"
              }
            ]
          }
        }/*,
        {
          action: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/interactions",
                code: contrMitAlt,
                display:
                  "Selected Alternative Therapy With Same Intended Effect"
              }
            ]
          }
        },
        {
          action: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/interactions",
                code: contrMitRep,
                display:
                  "Adverse Effect Repaired By Drug Action with Inverse Effect"
              }
            ]
          }
        } */
      ]
    }
  ],
  [
    repetInter,
    {
      interaction: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "DUPTHPY",
          display: "Duplicate Therapy Alert"
        }
      ],
      mitigation: [
        {
          action: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "13",
                display: "Stopped Concurrent Therapy"
              }
            ]
          }
        }
      ]
    }
  ],
  [
    repairInter,
    {
      interaction: [
        {
          system: "http://anonymous.org/codeSystem/interactions",
          code: "INVEFFCT",
          display: "Adverse and therapeutic therapies with inverse effect"
        }
      ],
      mitigation: [
        {
          action: {
            coding: [
              {
                system: "http://anonymous.org/codeSystem/interactions",
                code: "NOTREQ",
                display: "Mitigation Not Required"
              }
            ]
          }
        }
      ]
    }
  ]
]);

//validating parameters
//this one is when parametr is undefined the default value is an error object
const required = (name, className) => {
  throw new Error(`Parameter ${name} is required in class ${className}`);
};
//PROTOTYPE FUNCTIONS SHARED BY MORE THAN ONE CLASS

/**
 *
 * @param {Array} param0 array containing pre and post situation in no specific order
 */
function getSituations([
  sitA = required("situationA", this.constructor.name),
  sitB = required("situationA", this.constructor.name),
]) {
  //assert they are objects
  //assert.plainObject(sitA);
  //assert.plainObject(sitB);
  if (!("type" in sitA))
    throw new Error("propery type is missing in situationType");

  return String(sitA.type) === "hasTransformableSituation"
    ? { preSituation: sitA, postSituation: sitB }
    : { preSituation: sitB, postSituation: sitA };
}

function getResourceList() {
  return Array.from(this.map.values());
}

function getId(
  preSituation = required("preSituation", this.constructor.name),
  postSituation = required("postSituation", this.constructor.name),
  beliefIndex = required("beliefIndex", this.constructor.name),
  contribution = required("contribution", this.constructor.name)
) {
  return String(
    preSituation.value.code +
      "2" +
      postSituation.value.code +
      (beliefIndex === 0 ? "M" : "S") +
      contribution.charAt(0)
  );
}

function validateCBSchema(causationBelief) {
  const cbPropList = [
      "id",
      "contribution",
      "probability",
      "evidence",
      "author",
      "transition",
    ],
    trPropList = ["id", "effect", "property", "situationTypes"],
    prPropList = ["id", "display", "code"],
    sitPropList = ["id", "type", "value"],
    valuePropList = ["code", "display"];

  let property;
  if (
    !cbPropList.every((prop) => {
      property = prop;
      return prop in causationBelief;
    })
  )
    throw new Error(
      `property ${property} is missing in causationBelief with id ${causationBelief.id}`
    );
  if (
    !trPropList.every((prop) => {
      property = prop;
      return prop in causationBelief.transition;
    })
  )
    throw new Error(
      `property ${property} is missing in transition with causationBelief id ${causationBelief.id}.`
    );
  if (
    !prPropList.every((prop) => {
      property = prop;
      return prop in causationBelief.transition.property;
    })
  )
    throw new Error(
      `property ${property} is missing in property with causationBelief id ${causationBelief.id}.`
    );

  let situationTypes = causationBelief.transition.situationTypes;
  if (!situationTypes || !Array.isArray(situationTypes))
    throw new Error(
      `situationTypes is not an array in causationBelief ${causationBelief.id}.`
    );
  if (!situationTypes[0] || !situationTypes[1])
    throw new Error(
      `situation is missing from CausationBelief ${causationBelief.id}.`
    );
  if (
    !sitPropList.every((prop) => {
      property = prop;
      return prop in situationTypes[0];
    })
  )
    throw new Error(
      `property ${property} is missing in situation with causationBelief id ${causationBelief.id}.`
    );
  if (
    !valuePropList.every((prop) => {
      property = prop;
      return prop in situationTypes[0].value;
    })
  )
    throw new Error(
      `property ${property} is missing in situation with causationBelief id ${causationBelief.id}.`
    );
  if (
    !sitPropList.every((prop) => {
      property = prop;
      return prop in situationTypes[1];
    })
  )
    throw new Error(
      `property ${property} is missing in situation with causationBelief id ${causationBelief.id}.`
    );
  if (
    !valuePropList.every((prop) => {
      property = prop;
      return prop in situationTypes[1].value;
    })
  )
    throw new Error(
      `property ${property} is missing in situation with causationBelief id ${causationBelief.id}.`
    );
}

function add_MainCond_and_EffectList(causationBelief, index) {
  let condition, forecastEffect;

  //extract pre and post situation objects
  let { preSituation, postSituation } = this.getSituations(
    causationBelief.transition.situationTypes
  );
  condition = cond_ID + "/" + preSituation.value.code;
  //add condition id if this is the main effect (side effects conditions can be fetched via forecast effects)
  if (index === 0) this._conditionList.push({ reference: condition });

  forecastEffect =
    effect_ID +
    "/" +
    this.getId(
      preSituation,
      postSituation,
      index,
      causationBelief.contribution
    );
  //add forecastEffect id
  this._forecastEffectList.push({ reference: forecastEffect });
}

function toString() {
  return JSON.stringify(this.toJSON(), null, "  ");
}

//////RESOURCE CLASSES

//class to represent Medication FHIR resources
class FhirMedication {
  /**
   *
   * @param {string} url
   * @param {object} careActionTypeObject
   */
  constructor(url, { id, code, display, requestType }) {
    //resource id
    this._id = String(id).slice(26);
    //drug URL
    this._codingSystem = String(id);
    //drug label
    this._codingCode = code;
    //display of care action label
    this._codingDisplay = String(display);
    this._fullUrl = url;
    this._codeObject = {
      coding: [
        {
          system: this._codingSystem,
          code: this._codingCode,
          display: this._codingDisplay,
        },
      ],
    };
  }

  /**
   * Transforms the instance into a JS object
   *
   * @returns {Object}
   */
  toJSON = function () {
    return {
      //fullUrl: this._fullUrl,
      resource: {
        resourceType: med_ID,
        id: this._id,
        code: this._codeObject,
      },
    };
  };
}
FhirMedication.prototype.toString = toString;

//class to represent Condition FHIR resources
class FhirCondition {
  /**
   * @param {string} url
   * @param {object} situationType
   * @param {string} patient
   */
  constructor(url, { id, type, value: { code, display } }, patient) {
    this._id = String(code);
    this._codingSystem = String(id);
    this._codingDisplay = String(display);
    this._codingCode = String(code);
    this._fullUrl = url;
    this._patient = patient;
    this._codeObject = {
      coding: [
        {
          system: this._codingSystem,
          code: this._codingCode,
          display: this._codingDisplay,
        },
      ],
    };
  }

  /**
   * Transforms the instance into a JS object
   *
   * @returns {Object}
   */
  toJSON() {
    return {
     // fullUrl: this._fullUrl,
      resource: {
        resourceType: cond_ID,
        id: this._id,
        code: this._codeObject,
        subject: {
          reference: this._patient,
        },
      },
    };
  }
}

FhirCondition.prototype.toString = toString;

//class to represent ForecastEffect FHIR resources
class FhirForecastEffect {
  constructor(
    recId,
    url,
    fhirID,
    request,
    {
      id,
      contribution,
      probability,
      evidence,
      author,
      transition,
      preSituation,
      postSituation,
    },
    index,
    patient
  ) {
    this._requestList = [];

    //constants of the class forecastEffect
    const main = "main-effect";
    const side = "side-effect";
    const negative = "adverse-effect";
    const positive = "therapeutic-effect";

    this.addRequestUrl(recId, request);

    //temp let containing identifier of this ForecastEffect instance
    this._id = fhirID;
    //this._fullUrl = url;
    this._effectType = index === 0 ? main : side;
    this._eventType = String(contribution) == "positive" ? positive : negative;
    this._probability = String(probability);
    this._evidenceLevel = String(evidence);
    this._expectedCodingSystem = String(postSituation.id);
    this._expectedCodingCode = String(postSituation.value.code);
    this._expectedCodingDisplay = String(postSituation.value.display);
    this._propCodingSystem = String(transition.property.id);
    this._propCodingCode = String(transition.property.code);
    this._propCodingDisplay = String(transition.property.display);
    this._degree = String(transition.effect);
    this._patient = patient;
    this._condition = cond_ID + "/" + preSituation.value.code;
  }

  addRequestUrl(recId, request) {
    let medReq = requestMap.get(request) + "/" + recId.slice(26);
    this._requestList.push({ reference: medReq });
  }

  toJSON() {
    return {
      //fullUrl: this._fullUrl,
      resource: {
        resourceType: effect_ID,
        id: this._id,
        typeOfEffect: this._effectType,
        typeOfEvent: this._eventType,
        subject: {
          reference: this._patient,
        },
        appliesTo: {
          careActionInstance: this._requestList,
          conditionAddressed: {
            reference: this._condition,
          },
        },
        expectedOutcomeCode: {
          coding: [
            {
              system: this._expectedCodingSystem,
              code: this._expectedCodingCode,
              display: this._expectedCodingDisplay,
            },
          ],
        },
        targetMeasurement: {
          measuredProperty: {
            coding: [
              {
                system: this._propCodingSystem,
                code: this._propCodingCode,
                display: this._propCodingDisplay,
              },
            ],
          },
          degreeOfChange: this._degree,
        },
        probability: this._probability,
        evidence: this._evidenceLevel,
      },
    };
  }
}
FhirForecastEffect.prototype.toString = toString;

class FhirMedicationRequest {
  /**
   * @param {string} url FHIR entry element unique ULR
   * @param {string} fhirId FHIR resource identifier
   * @param {object} recObject TMR recomendation object
   * @param {object} interactions TMR interactions object
   * @param {string} patient patient id
   */
  constructor(
    url,
    fhirId,
    {
      id,
      text,
      motivation,
      derivedFrom,
      suggestion,
      careActionType,
      causationBeliefs,
    },
    interactions,
    patient
  ) {
    this._conditionList = [];
    this._forecastEffectList = [];
    this._detectedIssueList = [];

    this._fullUrl = url;
    this._id = fhirId;
    this._cigUri = String(derivedFrom);
    this._patient = patient;
    this._medication = med_ID + "/" + String(careActionType.id).slice(26);
    this._doNotRecommend = String(suggestion) === "nonrecommend";
    //create list of Conditions and ForecastEffects -both have the same number of resources

    //validate schema
    for (let index = 0; index < causationBeliefs.length; index++) {
      const causationBelief = causationBeliefs[index];
      this.validateCBSchema(causationBelief);
      this.add_MainCond_and_EffectList(causationBelief, index);
    }

    this.addDetectedIssues(interactions);
  }

  /**
   *
   * @param {Array} interactionList           TODO: check algorithm
   */
  addDetectedIssues(interactionList) {
    if (!Array.isArray(interactionList))
      throw new Error("interaction is not an array");

    //reconstruct TMR URI for recommendation
    const tmrId = uriPrefix + "data/" + this._id;
    let refId;
    for (let index = 0; index < interactionList.length; index++) {
      const { type, interactionNorms } = interactionList[index];

      if (!Array.isArray(interactionNorms))
        throw new Error("interactionNorms is not an array");

      refId = detecIs_ID + "/" + type + index;
      //for each norm, check whether they are refering to this MedicationRequest
      for (let i = 0; i < interactionNorms.length; i++) {
        const norm = interactionNorms[i];
        if (tmrId === String(norm.recId)) {
          this._detectedIssueList.push({
            reference: refId,
          });
        } //end If
      } //end For
    } //end  For
  }

  toJSON() {
    return {
      //fullUrl: this._fullUrl,
      resource: {
        resourceType: medReq_ID,
        id: this._id,
        status: "active",
        intent: "plan",
        instantiatesUri: this._cigUri,
        doNotPerform: this._doNotRecommend,
        reasonReference: this._conditionList,
        "forecast-effects": this._forecastEffectList,
        medicationReference: {
          reference: this._medication,
        },
        subject: {
          reference: this._patient,
        },
        detectedIssue: this._detectedIssueList,
      },
    };
  }
}
FhirMedicationRequest.prototype.toString = toString;
FhirMedicationRequest.prototype.getSituations = getSituations;
FhirMedicationRequest.prototype.getId = getId;
FhirMedicationRequest.prototype.add_MainCond_and_EffectList = add_MainCond_and_EffectList;
FhirMedicationRequest.prototype.validateCBSchema = validateCBSchema;

class FhirServiceRequest {
  /**
   * @param {string} url FHIR entry element unique ULR
   * @param {string} fhirId FHIR resource identifier
   * @param {object} recObject TMR recomendation object
   * @param {string} patient patient id
   */
  constructor(
    url,
    fhirId,
    patient,
    {
      id,
      text,
      motivation,
      derivedFrom,
      suggestion,
      careActionType,
      causationBeliefs,
    }
  ) {
    this._conditionList = [];
    this._forecastEffectList = [];

    this._fullUrl = url;
    this._id = fhirId;
    this._cigUri = String(derivedFrom);
    this._patient = patient;
    this._medication = servReq_ID + "/" + String(careActionType.id).slice(26);
    this._doNotRecommend = String(suggestion) === "nonrecommend";
    this._serviceSystem = careActionType.id;
    this._serviceCode = careActionType.code;
    this._serviceDisplay = careActionType.display;

    //create list of Conditions and ForecastEffects -both have the same number of resources
    for (let index = 0; index < causationBeliefs.length; index++) {
      const causationBelief = causationBeliefs[index];
      this.validateCBSchema(causationBelief);
      this.add_MainCond_and_EffectList(causationBelief, index);
    }
  }

  /**
   *
   */
  toJSON() {
    return {
      //fullUrl: this._fullUrl,
      resource: {
        resourceType: servReq_ID,
        id: this._id,
        status: "active",
        intent: "plan",
        instantiatesUri: this._cigUri,
        doNotPerform: this._doNotRecommend,
        reasonReference: this._conditionList,
        "forecast-effects": this._forecastEffectList,
        code: {
          coding: [
            {
              system: this._serviceSystem,
              code: this._serviceCode,
              display: this._serviceDisplay,
            },
          ],
        },
        subject: {
          reference: this._patient,
        },
      },
    };
  }
}

FhirServiceRequest.prototype.getSituations = getSituations;
FhirServiceRequest.prototype.getId = getId;
FhirServiceRequest.prototype.add_MainCond_and_EffectList = add_MainCond_and_EffectList;
FhirServiceRequest.prototype.toString = toString;
FhirServiceRequest.prototype.validateCBSchema = validateCBSchema;

class FhirDetectedIssue {

  constructor(interactionType, indexInList, normsList) {
    this._fullUrl =
      uriPrefix + detecIs_ID + "/" + interactionType + indexInList;
    this._id = interactionType + indexInList;
    this._implicatedList = this.createImplicatedList(normsList);

    let { interaction, mitigation } = interactionCodes.get(interactionType);
    this._codingList = interaction;
    this._mitigationList = mitigation;
  }

  createImplicatedList(list) {
    //only medicationRequests have detected interactions
    //if (!Array.isArray(list))
    //  throw new Error("list of Norms in interaction is not an array");

    let resultList = list.map((normObject) => ({
      reference: medReq_ID + "/" + String(normObject.recId).slice(26),
    }));
    return resultList;
  }

  /**
   *
   */
  toJSON() {
    return {
      //fullUrl: this._fullUrl,
      resource: {
        resourceType: detecIs_ID,
        id: this._id,
        status: "preliminary",
        code: {
          coding: this._codingList,
        },
      },
      implicated: this._implicatedList,
      mitigation: this._mitigationList,
    };
  }
}

/**
 * It takes index of plan to add to ID, a title for the plan, the list of TMR Rec Ids which are part of the plan and the FHIR entries corresponding to the converted TMR components.
 */
class FhirCarePlan {

  constructor(planIndex, title, patient, recIdList, fhirEntries) {
    this._fullUrl = uriPrefix + carePlan_ID + "/" + carePlan_ID + planIndex;
    this._id = carePlan_ID + planIndex;
    this._title = title;
    this._patient = patient;
    this._activityList = this.addRequestRef(fhirEntries, recIdList);
  }

  /**
   * Conver TMR URIs into FHIR URLs
   * @param {Array} entryFhirList list of FHIR entries already added to the instance of the response schema
   * @param {Array} recIdList list of TMR recommendation Ids
   *
   * @returns {string} resource unique URL
   */
  addRequestRef(entryFhirList, recIdList) {
    let resultArr;
 
    if (!Array.isArray(entryFhirList) || !Array.isArray(recIdList))
      throw Error({message: "One parameter is not an array as expected in FhirCarePLan."});

    resultArr = recIdList.map((urlRef) => {
      let id = String(urlRef).slice(26);
      //find entry object with same id
      let entryObj = entryFhirList.find((entry) => entry.resource.id == id);

      let identifier = entryObj.resource.resourceType + "/" + id;

      //return fullURl
      return { reference: identifier };
    });

    return resultArr;
  }

  toJSON() {
    return {
      //fullUrl: this._fullUrl,
      resource: {
        resourceType: carePlan_ID,
        id: this._id,
        status: "active",
        intent: "plan",
        title: this._title,
      },
      subject: {
        reference: this._patient,
      },
      activity: this._activityList,
    };
  }
}

//////////////////////////////////
/////////////////////////////////////
/////////////////////// Classes holding resource classes

class MedicationResources {
  /**
   *
   * @param {Map<string, FhirMedication>} map Create a Map of medication resources
   */
  constructor(map) {
    //Map containing medication resources
    this.map = map;
  }

  /**
   *
   * @param {string} code
   */
  showFullUrl(code) {
    return uriPrefix + med_ID + "/" + code;
  }

  /**
   * Given a TMR Recommendation, converts a tmr care action type into a FHIR medication and adds it to a Map object, if the care action has not been converted before.
   */
  add() {
    //obtain argument from the calling function
    return ({
      id,
      text,
      motivation,
      derivedFrom,
      suggestion,
      careActionType,
      causationBeliefs,
    }) => {
      if (careActionType) {
        //create Fhir URL
        const url = this.showFullUrl(careActionType.code);
        //if it does not find key, add new medication using the care action type
        if (!this.map.has(url)) {
          this.map.set(url, new FhirMedication(url, careActionType));
        }
      }
      return this;
    };
  }
}

MedicationResources.prototype.getResourceList = getResourceList;

/**
 *
 */
class ConditionResources {
  /**
   *
   * @param {Map<string, FhirCondition>} map Create a Map of condition resources
   */
  constructor(map) {
    //Map containing  resources
    this.map = map;
  }

  showFullUrl(code) {
    return uriPrefix + cond_ID + "/" + code;
  }

  addOneResource(situationTypes, patient) {
    //if not undefined, act on it
    //if(!Array.isArray(situationTypes)) throw new Error('situationTypes is not an array');

    let preSit = this.getSituations(situationTypes).preSituation;
    //console.log(JSON.stringify(preSit));
    //create Fhir URL
    const url = this.showFullUrl(preSit.value.code);

    //if it doesnt find key, add new Condition using the care action type
    if (!this.map.has(url)) {
      this.map.set(url, new FhirCondition(url, preSit, patient));
    }
  }

  add() {
    //obtain argument from the calling function
    return (patient, rec) => {
      //if(!Array.isArray(causationBeliefs)) throw new Error('causationBeliefs is not an array');
      let causationBeliefs = rec.causationBeliefs;
      //for each CB, add a condition
      for (let i = 0; i < causationBeliefs.length; i++) {
        let situationTypes = causationBeliefs[i].transition.situationTypes;
        this.addOneResource(situationTypes, patient);
      }

      return this;
    };
  }
}

//add getSituations to prototype of ConditionResources
ConditionResources.prototype.getSituations = getSituations;
ConditionResources.prototype.getResourceList = getResourceList;

class ForecastEffectResources {
  /**
   *
   * @param {Map<string, FhirForecastEffect>} map Create a Map of  resources
   */
  constructor(map) {
    //Map containing medication resources
    this.map = map;
  }

  showFullUrl(fhirId) {
    return uriPrefix + effect_ID + "/" + fhirId;
  }

  addOneResource(recId, request, causationBelief, index, patient) {
    //validate CB
    //this.validateCBSchema(causationBelief);

    const {
      id,
      contribution,
      probability,
      evidence,
      author,
      transition,
    } = causationBelief;
    const { preSituation, postSituation } = this.getSituations(
      transition.situationTypes
    );
    const fhirId = this.getId(preSituation, postSituation, index, contribution);
    //create Fhir URL
    const url = this.showFullUrl(fhirId);

    //if it doesnt find key, add new ForecastEffect using the care action type
    if (!this.map.has(url)) {
      this.map.set(
        url,
        new FhirForecastEffect(
          recId,
          url,
          fhirId,
          request,
          {
            id,
            contribution,
            probability,
            evidence,
            author,
            transition,
            preSituation,
            postSituation,
          },
          index,
          patient
        )
      );
    } else {
      //if it already exits, add the MedicationRequest url to the instance
      this.map.get(url).addRequestUrl(recId, request);
    }
  }

  /**
   * Given a TMR Recommendation, converts a tmr care action type into a FHIR medication and adds it to a Map object, if the care action has not been converted before.
   */
  add() {
    //obtain argument from the calling function
    return (
      patient,
      {
        id,
        text,
        motivation,
        derivedFrom,
        suggestion,
        careActionType,
        causationBeliefs,
      }
    ) => {
      //validate CBs
      if (!Array.isArray(causationBeliefs))
        throw new Error(
          `causationBeliefs is not an array in recommendation with id ${id}.`
        );

      let requestType = careActionType.requestType;

      //loop over CBs
      for (let i = 0; i < causationBeliefs.length; i++) {
        const cb = causationBeliefs[i];
        // this.validateCBSchema(cb);
        this.addOneResource(id, requestType, cb, i, patient);
      }

      return this;
    };
  }
}
//adding function getSituations to class FhirForecastEffect
ForecastEffectResources.prototype.getSituations = getSituations;
ForecastEffectResources.prototype.getResourceList = getResourceList;
ForecastEffectResources.prototype.getId = getId;

/**
 * class to construct the set of FHIR MedicationRequests taken from the TMR data.
 * It is also the first class to be built as it has all the required checks to validate the TMR schema.
 */
class MedicationRequestResources {
  /**
   *
   * @param {Map<string, FhirMedicationRequest>} map Create a Map of  resources
   */
  constructor(map) {
    //Map containing medication resources
    this.map = map;
  }

  /**
   *
   * @param {object} tmrRecObject TMR-based recomendation in JSON notation
   */
  showFullUrl(fhirId) {
    return uriPrefix + medReq_ID + "/" + fhirId;
  }

  /**
   * Given a TMR Recommendation, converts a tmr care action type into a FHIR medication and adds it to a Map object, if the care action has not been converted before.
   */
  add() {
    //obtain argument from the calling function
    return (patient, interactions, rec) => {
      //expected schemas to be already validated
      const fhirId = String(rec.id).slice(26);

      //create Fhir URL
      const url = this.showFullUrl(fhirId);
      //if it doesnot find key, add new medication using the care action type
      if (!this.map.has(url)) {
        this.map.set(
          url,
          new FhirMedicationRequest(url, fhirId, rec, interactions, patient)
        );
      }
      //return the object
      return this;
    };
  }
}

//adding function getSituations to class FhirForecastEffect
MedicationRequestResources.prototype.getSituations = getSituations;
MedicationRequestResources.prototype.getResourceList = getResourceList;
MedicationRequestResources.prototype.getId = getId;

class ServiceRequestResources {
  /**
   *
   * @param {Map<string, FhirServiceRequest>} map Create a Map of  resources
   */
  constructor(map) {
    //Map containing medication resources
    this.map = map;
  }

  /**
   *
   * @param {object} tmrRecObject TMR-based recomendation in JSON notation
   */
  showFullUrl(fhirId) {
    return uriPrefix + servReq_ID + "/" + fhirId;
  }

  /**
   * Given a TMR Recommendation, converts a tmr care action type into a FHIR medication and adds it to a Map object, if the care action has not been converted before.
   */
  add() {
    //obtain argument from the calling function
    return (
      patient,
      {
        id,
        text,
        motivation,
        derivedFrom,
        suggestion,
        careActionType,
        causationBeliefs,
      }
    ) => {
      //schema should have already been validated by MedicationRequestResources

      const fhirId = String(id).slice(26);
      //create Fhir URL
      const url = this.showFullUrl(fhirId);
      //if it does find key, add new medication using the care action type
      if (!this.map.has(url)) {
        this.map.set(
          url,
          new FhirServiceRequest(url, fhirId, patient, {
            id,
            text,
            motivation,
            derivedFrom,
            suggestion,
            careActionType,
            causationBeliefs,
          })
        );
      }
      return this;
    };
  }
}

//adding function getSituations to class FhirForecastEffect
ServiceRequestResources.prototype.getSituations = getSituations;
ServiceRequestResources.prototype.getResourceList = getResourceList;
ServiceRequestResources.prototype.getId = getId;

class DetectedIssueResources {
  /**
   *
   *
   */
  constructor() {
    //Map containing  FhirDetectedIssue resources
    this._issueArr = [];
  }

  /**
   * Given a TMR Recommendation, converts a tmr interaction into a FHIR DetectedIssue and adds it to a Map object, if the interaction has not been converted before.
   */
  add() {
    //obtain argument from the calling function
    return (arrayInter) => {
      //if (!Array.isArray(arrayInter))
      //throw new Error("interactions object is not an array");

      let interaction;
      for (let index = 0; index < arrayInter.length; index++) {
        interaction = arrayInter[index];
        /* if (
          (!
            interaction.hasOwnProperty("type") &&
            interaction.hasOwnProperty("interactionNorms")
          )
        )
          throw new Error(
            "missing type or interactionNorms properties on interaction array"
          );*/
        this._issueArr.push(
          new FhirDetectedIssue(
            interaction.type,
            index,
            interaction.interactionNorms
          )
        );
      }
      return this;
    };
  }
}

class CarePlanResources {
  constructor() {
    this._carePlanArr = [];
  }
  add() {
    return (title, patient, recIdList, fhirReqEntries) => {

      if (!Array.isArray(fhirReqEntries))
        throw new Error(
          {message: "parameter 'fhirReqEntries' is not an Array as expected in CarePlanResources."}
        );

          this._carePlanArr.push(
            new FhirCarePlan(
              1,
              title,
              patient,
              recIdList,
              fhirReqEntries
            )
          );
        
      }
      return this;
    };
}

function validateInteractionsSchema(interactions) {
  //check interactions  is array
  if (!Array.isArray(interactions))
    throw new Error("interactions is not an array");

  const interPropList = ["type", "interactionNorms"],
    normPropList = ["type", "recId"];

  let property;

  for (let index = 0; index < interactions.length; index++) {
    const normObj = interactions[index];

    if (
      !interPropList.every((prop) => {
        property = prop;
        return prop in normObj;
      })
    )
      throw new Error(
        `interaction object is missing property ${property} at index ${index}.`
      );
    for (let i = 0; i < normObj.length; i++) {
      const norm = normObj[i];
      if (
        !normPropList.every((prop) => {
          property = prop;
          return prop in normObj;
        })
      )
        throw new Error(
          `interactionNorms is missing property ${property} at index ${i}.`
        );
    }
  }
}

/**
 * Validate one recommendation
 * @param {object} recommendation
 */
function validateRecSchema(recommendation) {
  //check arrays have expected properties
  const recPropList = [
      "id",
      // 'text',
      // 'motivation',
      "derivedFrom",
      "suggestion",
      "careActionType",
      "causationBeliefs",
    ],
    carePropList = ["id", "code", "requestType", "display"];

  let property;

  if (
    !recPropList.every((prop) => {
      property = prop;
      return prop in recommendation;
    })
  )
    throw new Error(
      `property '${property}' is missing in recommendation ${recommendation} array.`
    );

  //Next, check careActionType, causationBeliefs  are arrays

  //finally, check for properties on the 3 arrays from above
  if (
    !carePropList.every((prop) => {
      property = prop;
      return prop in recommendation.careActionType;
    })
  )
    throw new Error(
      `property '${property}' is missing in careActionType object.`
    );

  if (!Array.isArray(recommendation.causationBeliefs))
    throw new Error("causationBeliefs is not an array");
  //CB checking is done elsewhere
}

/**
 * 
 * @param {string} patient patient Id
 * @param {object} aggregatedForm JSON object containing merged CIG Id, recommendations and identified interactions
 * @returns 
 */
function translateTmrToFhir(patient, aggregatedForm
  ) {
  //create resources
  let condObj = new ConditionResources(new Map());
  let medReqObj = new MedicationRequestResources(new Map());
  let servReqObj = new ServiceRequestResources(new Map());
  let effectObj = new ForecastEffectResources(new Map());
  let medObj = new MedicationResources(new Map());
  let issueObj = new DetectedIssueResources();

  const tmrProp = ["interactions", "recommendations"];

  if (
    !aggregatedForm
    .guidelineGroup ||
    !tmrProp.every((prop) => prop in aggregatedForm
    .guidelineGroup)
  ) throw new Error("TMR schema is not as expected.");

  const interactions = aggregatedForm.guidelineGroup.interactions,
        recs = aggregatedForm.guidelineGroup.recommendations;

  //validate interactions schema
  validateInteractionsSchema(interactions);

  if (!Array.isArray(recs))
    throw new Error("TMR recommendations is not an array");

  for (let index = 0; index < recs.length; index++) {
    const norm = recs[index];

    //validate recommendations. It validates both medication and services
    validateRecSchema(norm);

    let request = norm.careActionType.requestType;

    //first get the medicationRequest as it has the validating schema checks for REcs and interactions
    // add forecastEffect, Medication, Condition
    //next get service request
    //add -in same map object- forecast Medication and Condition resources
    //add detected issues
    let addMedicationRequest = medReqObj.add();
    let addServiceRequest = servReqObj.add();
    let addForecastEffect = effectObj.add();
    let addMedication = medObj.add();
    let addCondition = condObj.add();

    //check is a medication request
    if (medReq_ID === requestMap.get(request)) {
      addMedicationRequest(patient, interactions, norm);
      addMedication(norm);
    } else if (servReq_ID === requestMap.get(request)) {
      addServiceRequest(patient, norm);
    }

    addForecastEffect(patient, norm);
    addCondition(patient, norm);
  }

  let addDetectedIssues = issueObj.add();
  addDetectedIssues(interactions);

  //this list of entries will be used to find the correspondence between the resolution engine extensions and the CarePlan resources.
  const fhirReqList = servReqObj
    .getResourceList()
    .concat(medReqObj.getResourceList());

  //now turn each resource object into a JSON object and concatenate before returning them
  const output = medObj
    .getResourceList()
    .concat(
      condObj.getResourceList(),
      effectObj.getResourceList(),
      fhirReqList,
      issueObj._issueArr
    );

  //flaten the array using the customised toJSON function
  //const result = JSON.parse(JSON.stringify(output, null, "  "));

  return JSON.parse(
    JSON.stringify({ entry: output, requestList: fhirReqList })
  );
}

/**
 * 
 * @param {string} patient patient identifier
 * @param {string} encounterId uuid CIG label
 * @param {string} cigId encounter
 * @param {object} aggregatedForm object containing TMR terms
 * @returns object
 */
function createCards({patient, encounterId, cigId, aggregatedForm}) {

  // Object with arguments required to create a new Card object
  const cardParams = {
    uuid: undefined,
    patient: undefined,
    summary: undefined,
    labelSource: undefined,
    labelSuggestions: undefined,
    actionDescription: undefined,
    resourceId: undefined,
  };

  //logger.info(`AGGREGATED FORM IN CREATED CARDS IS ${JSON.stringify(aggregatedForm)}`);

  //those not defined have a default value
  cardParams.patient = patient;
  cardParams.birthDate = '';
  cardParams.uuid = cigId;

  //create a new CDS Card object
  const card = new Card(cardParams);

  //convert TMR 2 FHIR entries
  const { entry, requestList } = translateTmrToFhir(
    "Patient/" + card.patient,
    aggregatedForm
  );

  //extract all recs ids from json structure
  let recIdList = aggregatedForm.guidelineGroup.recommendations.map( (rec) => { return rec.id} );
  
  //add care plans
  let carePlanList = createCarePlanList('personalised COPD care plan', card.patient, recIdList, requestList);
  //concat entries
  let entryList = entry.concat(carePlanList);
  //
  card.entry = (card.entry === []) ? entryList : card.entry.concat(entryList);

  return card.toJSON();
}

function createCarePlanList(title, patient, recIdList, fhirEntries) {
  let planObj = new CarePlanResources();
  let addCarePlans = planObj.add(); 
  addCarePlans(title, "Patient/" + patient, recIdList, fhirEntries);

  return JSON.parse(JSON.stringify(planObj._carePlanArr));
}

/**
 * creates a CDS card and add resources from the given TMR data
 * @returns object
 */
exports.setCdsCard_NonMitigation = createCards;