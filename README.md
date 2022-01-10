# TMR2FHIRconverter
`(tmr2fhir_noArg.js)` Translates a TMR-based clinical guideline -possibly a guideline representing a combination of guidelines- and its identified potential interactions -depicted as a JSON document- into a single FHIR Care Plan.

`(tmr2fhir-component.js)` Extends `(tmr2fhir_noArg.js)` by translating a corresponding conflict resolution JSON document that has been added to the JSON document in `(tmr2fhir_noArg.js)`.

`(copd-assess_2_FHIR.js)` Translates the result of the copd-assess hook into FHIR structures.
