# TMR2FHIRconverter
(1) Translates a TMR-based clinical guideline -possibly a guideline representing a combination of guidelines- and its identified potential interactions -depicted as a JSON document- into a single FHIR Care Plan.
(2) Extends (1) by translating a corresponding conflict resolution JSON document that has been added to the JSON document in (1).
(3) Translates the result of the copd-assess hook into FHIR structures.
