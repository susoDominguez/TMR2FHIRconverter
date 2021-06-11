"use strict";
const logger = require("../../config/winston");

function Card(options = {}) {
  const {
    uuid = "CIG-00000000000000",
    patient = "dummy",
    summary = "Assessment of COPD",
    labelSource = "GOLD 2017 COPD assessment",
    labelSuggestions = "COPD assessment decision support",
    actionDescription = "Update COPD assessment interface",
    resourceId = "copdAssessParameters",
  } = options; //default values for COPD

  this._patient = patient;
  this._parameters = [
    {
      name: "patient",
      valueId: this._patient,
    },
    {
      name: "medicationBundle",
      resource: {
        resourceType: "Bundle",
        id: "medicationBundle",
        type: "collection",
        entry: [
          {
            resource: {
              resourceType: "Medication",
              id: "DrugCatSabaSama",
              code: {
                coding: [
                  {
                    code: "SabaSama",
                    display:
                      "medication containing a combination of SABA and SAMA",
                  },
                ],
              },
            },
          },
          {
            resource: {
              resourceType: "Medication",
              id: "DrugTSaba",
              code: {
                coding: [
                  {
                    code: "Saba",
                    display: "medication containing SABA",
                  },
                ],
              },
            },
          },
          {
            resource: {
              resourceType: "Medication",
              id: "DrugTSama",
              code: {
                coding: [
                  {
                    code: "Sama",
                    display: "medication containing SAMA",
                  },
                ],
              },
            },
          },
          {
            resource: {
              resourceType: "Medication",
              id: "DrugCatLabaLama",
              code: {
                coding: [
                  {
                    code: "LabaLama",
                    display:
                      "medication containing a combination of LABA and LAMA",
                  },
                ],
              },
            },
          },
          {
            resource: {
              resourceType: "Medication",
              id: "DrugTLaba",
              code: {
                coding: [
                  {
                    code: "Laba",
                    display: "medication containing LABA",
                  },
                ],
              },
            },
          },
          {
            resource: {
              resourceType: "Medication",
              id: "DrugTLama",
              code: {
                coding: [
                  {
                    code: "Lama",
                    display: "medication containing LAMA",
                  },
                ],
              },
            },
          },
          {
            resource: {
              resourceType: "Medication",
              id: "DrugCatLabaIcs",
              code: {
                coding: [
                  {
                    code: "LabaIcs",
                    display:
                      "medication containing a combination of LABA and ICS",
                  },
                ],
              },
            },
          },
          {
            resource: {
              resourceType: "Medication",
              id: "DrugCatLabaLamaIcs",
              code: {
                coding: [
                  {
                    code: "LabaLamaIcs",
                    display:
                      "medication containing a combination of LABA, LAMA and ICS",
                  },
                ],
              },
            },
          },
        ],
      },
    },
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
                    resourceType: "Parameters",
                    id: resourceId,
                    parameter: this._parameters,
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
 * types of COPD group: matching codes to text
 */
const copdGroup_map = new Map([
  [
    1097871000000101,
    "Global Initiative for Chronic Obstructive Lung Disease 2017 group A",
  ],
  [
    1097881000000104,
    "Global Initiative for Chronic Obstructive Lung Disease 2017 group B",
  ],
  [
    1097891000000102,
    "Global Initiative for Chronic Obstructive Lung Disease 2017 group C",
  ],
  [
    1097901000000101,
    "Global Initiative for Chronic Obstructive Lung Disease 2017 group D",
  ],
]);

/**
 * COPD medication code to FHIR id code
 */
const medFhirId_map = new Map([
  ["Saba", "DrugTSaba"],
  ["Sama", "DrugTSama"],
  ["SabaSama", "DrugCatSabaSama"],
  ["Laba", "DrugTLaba"],
  ["Lama", "DrugTLama"],
  ["LabaLama", "DrugCatLabaLama"],
  ["LabaLamaIcs", "DrugCatLabaLamaIcs"],
  ["LamaLaba", "DrugCatLabaLama"],
  ["LamaLabaIcs", "DrugCatLabaLamaIcs"],
  ["LabaIcs", "DrugCatLabaIcs"],
  ["Ics", "DrugTIcs"],
]);

/**
 * constant of the FHIR syntax
 */
const uriPrefix = "http://anonymous.org/",
  snomedSystem = "http://snomed.info/sct";
const med_ID = "Medication";

/// CLASSES

//class to represent copd group object with medication preferences [[a,b],[],[]]
class CopdGroupCoding {
  /**
   *
   * @param {integer} copdGroup_code
   * @param {boolean} isResultObj //copdGroup_map medFhirId_map
   */
  constructor(copdGroup_code, isResultObj) {
    //fixed label for name of valueCoding when ref to meds preferences for each copd group
    const name_assessed = "assessedCopdStage";
    //fixed label for name of selected copd group
    const name_medPrefs = "code";

    //copd group code
    this._name = isResultObj ? name_medPrefs : name_assessed;
    //copd group code
    this._code = String(copdGroup_code);
    //copd group display
    this._display = copdGroup_map.get(copdGroup_code);
    //coding system
    this._codingSystem = snomedSystem;
  }

  /**
   * Transforms the instance into a JS object
   *
   * @returns {Object}
   */
  toJSON = function () {
    return {
      name: this._name,
      valueCoding: {
        system: this._codingSystem,
        code: this._code,
        display: this._display,
      },
    };
  };
}
CopdGroupCoding.prototype.toString = toString;

//class to represent Condition FHIR resources
class Medication_preference {
  /**
   * @param {integer} index
   * @param {array} preferenceList
   */
  constructor(index, preferenceList) {
    this._entry = [];
    this._id = "list" + index;
    this._name = "medicationPreference_" + index;
    this._status = "current";
    this._mode = "changes";
    preferenceList.forEach((med) => {
      //med Id
      let medId = medFhirId_map.get(med);
      let med_entry = med_ID + "/" + medId;
      let entry = {
        item: {
          reference: med_entry,
        },
      };

      this._entry.push(entry);
    });
  }

  /**
   * Transforms the instance into a JS object
   *
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this._name,
      resource: {
        resourceType: "List",
        id: this._id,
        status: this._status,
        mode: this._mode,
        entry: this._entry,
      },
    };
  }
}

Medication_preference.prototype.toString = toString;

/**
 *
 * @param {string} patient patient identifier
 * @param {string} cigId uuid
 * @param {object} { groupA: ListA, groupB: ListB, groupC:ListC, groupD:ListD} containing list of lists of medication preferences for each COPD group
 * @param {integer} copdGroup_snomedCode code denoting the assessed COPD group
 * @returns object JSON card object
 */
function createCards(
  patient,
  { groupA, groupB, groupC, groupD },
  copdGroup_snomedCode
) {
  /*logger.info(
    `copdGroup_snomedCode is ${JSON.stringify(copdGroup_snomedCode)}`
  );*/

  //Object with arguments required to create a new Card object
  const cardParams = {
    uuid: undefined,
    patient: undefined,
    summary: undefined,
    labelSource: undefined,
    labelSuggestions: undefined,
    actionDescription: undefined,
    resourceId: undefined,
  };

  let groups = [groupA, groupB, groupC, groupD];

  //those not defined have a default value
  cardParams.patient = patient;
  //cardParams.uuid = "1234567890";

  //create a new CDS Card object
  const card = new Card(cardParams);

  // A - D snomed codes
  const snomedCodeArr = [
    1097871000000101,
    1097881000000104,
    1097891000000102,
    1097901000000101,
  ];
  const nameCodeArr = ["copdGroupA", "copdGroupB", "copdGroupC", "copdGroupD"];

  //add result for assessed copd stage
  let tempResult = new CopdGroupCoding(copdGroup_snomedCode, false).toJSON();

  card._parameters.push(tempResult);

  //add results for each COPD group
  for (let index = 0; index < groups.length; index++) {
    //parameter part list
    let part = [];
    //list of medications
    const medsArrOfArrs = groups[index];
    //snomed code for group
    const groupCode = snomedCodeArr[index];
    //label of object name
    const nameCode = nameCodeArr[index];

    //create objects for part list:
    //1. Code object
    let temp = new CopdGroupCoding(groupCode, true).toJSON();
 //   logger.info(`CopdGroupCoding is ${JSON.stringify(temp)}`);
//    logger.info(`nameCode is ${JSON.stringify(nameCode)}`);
    part.push(temp);

    //2. Medication preferences
    for (let arrIndx = 0; arrIndx < medsArrOfArrs.length; arrIndx++) {
      let medsArr = medsArrOfArrs[arrIndx];
     // logger.info(` arrIndx is ${JSON.stringify(arrIndx)}`);
      let temp = new Medication_preference((arrIndx + 1), medsArr).toJSON();
      //logger.info(` Medication preferences is ${JSON.stringify(temp)}`);
      part.push(temp);
     // logger.info(` part is ${JSON.stringify(part)}`);
    }

    //final object containing result
    let tempObj = { 'name': nameCode, 'part': part };
    //logger.info(`tempObj is ${JSON.stringify(tempObj)}`);

    //add final result to card
    card._parameters.push(tempObj);
  }

  return card.toJSON();
}

/**
 * creates a CDS card and adds medication preferences for each COPD group
 * @returns object
 */
exports.setCdsCard_medPrefs = createCards;
