
const altInter = "alternative",
contrInter = "contradiction",
repairInter = "repairable",
repetInter = "repetition";

//mitigation codes for contradiction
const contrMitStopped = "13",
contrMitAlt = "ALTHRPYMIT",
contrMitRep = "INVEFFCTMIT";

/**
 * Maps TMR recommendations urls to drug labels
 * @returns Map
 */
exports.recsMap = new Map([
    ["http://anonymous.org/data/RecCOPD-SamaMainMildPropAlsShould", "SAMA"],
    ["http://anonymous.org/data/RecCOPD-SabaMainMildPropAlsShould","SABA"],
    ["http://anonymous.org/data/RecCOPD-SabaSamaMainMildPropAlsShould", "SABA + SAMA"],
    ["http://anonymous.org/data/RecCOPD-LabaMainMildPropAlsShould", "LABA"],
    ["http://anonymous.org/data/RecCOPD-LamaMainMildPropAlsShould", "LAMA"],
    ["http://anonymous.org/data/RecCOPD-LabaLamaMainMildPropAlsShould", "LABA + LAMA"],
    ["http://anonymous.org/data/RecCOPD-LabaIcsMainMildPropAlsShould", "LABA + ICS"],
    ["http://anonymous.org/data/RecCOPD-LabaLamaIcsMainMildPropAlsShould", "LABA + LAMA + ICS"],
    ["http://anonymous.org/data/RecCOPD-LabaDecModPropAlsShould", "LABA"],
    ["http://anonymous.org/data/RecCOPD-LamaDecModPropAlsShould", "LAMA"],
    ["http://anonymous.org/data/RecCOPD-LabaLamaDecModPropAlsShould", "LABA + LAMA"],
    ["http://anonymous.org/data/RecCOPD-SabaDecModPropAlsShould", "SABA"],
    ["http://anonymous.org/data/RecCOPD-SamaDecModPropAlsShould", "SAMA"],
    ["http://anonymous.org/data/RecCOPD-SabaSamaDecModPropAlsShould", "SABA + SAMA"],
    ["http://anonymous.org/data/RecCOPD-LabaIcsDecModPropAlsShould", "LABA + ICS"],
    ["http://anonymous.org/data/RecCOPD-LabaLamaIcsDecModPropAlsShould", "LABA + LAMA + ICS"],
    ["http://anonymous.org/data/RecCOPD-LamaDecSevPropAlsShould", "LAMA"],
    ["http://anonymous.org/data/RecCOPD-LabaLamaDecSevPropAlsShould", "LABA + LAMA"],
    ["http://anonymous.org/data/RecCOPD-LabaIcsDecSevPropAlsShould", "LABA + ICS"],
    ["http://anonymous.org/data/RecCOPD-SabaDecSevPropAlsShould", "SABA"],
    ["http://anonymous.org/data/RecCOPD-SamaDecSevPropAlsShould", "SAMA"],
    ["http://anonymous.org/data/RecCOPD-SabaSamaDecSevPropAlsShould", "SABA + SAMA"],
    ["http://anonymous.org/data/RecCOPD-LabaLamaIcsDecSevPropAlsShould", "LABA + LAMA + ICS"],
    ["http://anonymous.org/data/RecCOPD-LamaDecVerySevPropAlsShould", "LAMA"],
    ["http://anonymous.org/data/RecCOPD-LabaLamaDecVerySevPropAlsShould", "LABA + LAMA"],
    ["http://anonymous.org/data/RecCOPD-LabaIcsDecVerySevPropAlsShould", "LABA + ICS"],
    ["http://anonymous.org/data/RecCOPD-LabaLamaIcsDecVerySevPropAlsShould", "LABA + LAMA + ICS"],
    ["http://anonymous.org/data/RecCOPD-LabaDecSevPropAlsShould", "LABA"],
    ["http://anonymous.org/data/RecCOPD-LabaDecVerySevPropAlsShould", "LABA"],
    ["http://anonymous.org/data/RecCOPD-SabaDecVerySevPropAlsShould", "SABA"],
    ["http://anonymous.org/data/RecCOPD-SamaDecVerySevPropAlsShould", "SAMA"],
    ["http://anonymous.org/data/RecCOPD-SabaSamaDecVerySevPropAlsShould", "SABA + SAMA"]
]);

exports.interactionCodes = new Map([
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