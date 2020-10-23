{
    "EHR": {
        "selectedTreatment": {
            "resource": {
                "reference": {
                    "resourceType": "Observation",
                    "id": "COPD.group",
                    "text": "COPD GOLD group"
                },
                "result": {
                    "code": "B",
                    "display": "COPD GOLD group B"
                },
                "other": {
                    "drugTypePreferences": {
                        "reference": {
                            "refId": "COPD.group",
                            "resultCode": "B"
                        },
                        "entries": []
                    }
                }
            }
        }
    },
    "DSS": {
        "proposedTreatment": {
            "resource": {
                "reference": {
                    "resourceType": "Observation",
                    "id": "COPD.group",
                    "text": "COPD GOLD group"
                },
                "result": {
                    "code": "B",
                    "display": "COPD GOLD group B"
                },
                "other": {
                    "drugTypes": {
                        "drugTypePreferences": {
                            "reference": {
                                "refId": "COPD.group",
                                "resultCode": "B"
                            },
                            "entries": [
                                {
                                    "preferred": {
                                        "administrationOf": "Laba"
                                    },
                                    "alternative": [
                                        {
                                            "administrationOf": "LabaLama"
                                        }
                                    ]
                                },
                                {
                                    "preferred": {
                                        "administrationOf": "Lama"
                                    },
                                    "alternative": [
                                        {
                                            "administrationOf": "LabaLama"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        }
    },
    "TMR": {
        "guidelineGroup": {
            "id": "CIG-2803202017350345",
            "interactions": [
                {
                    "type": "alternative",
                    "interactionNorms": [
                        {
                            "recId": "http://anonymous.org/data/RecCOPD-LabaDecModAlsShould",
                            "type": "primary"
                        },
                        {
                            "recId": "http://anonymous.org/data/RecCOPD-LamaDecModAlsShould",
                            "type": "primary"
                        },
                        {
                            "recId": "http://anonymous.org/data/RecCOPD-LabaLamaDecModAlsShould",
                            "type": "primary"
                        }
                    ]
                },
                {
                    "type": "repetition",
                    "interactionNorms": [
                        {
                            "recId": "http://anonymous.org/data/RecCOPD-LabaDecModAlsShould",
                            "type": "primary"
                        },
                        {
                            "recId": "http://anonymous.org/data/RecCOPD-LamaDecModAlsShould",
                            "type": "primary"
                        },
                        {
                            "recId": "http://anonymous.org/data/RecCOPD-LabaLamaDecModAlsShould",
                            "type": "primary"
                        }
                    ]
                },
                {
                    "type": "contradiction",
                    "interactionNorms": [
                        {
                            "recId": "http://anonymous.org/data/RecCOPD-LabaDecModAlsShouldShould",
                            "type": "primary"
                        },
                        {
                            "recId": "http://anonymous.org/data/RecCOPD-BetaAgonistIncLowRiskCdrShouldnot",
                            "type": "primary"
                        }
                    ]
                },
                {
                    "type": "contradiction",
                    "interactionNorms": [
                        {
                            "recId": "http://anonymous.org/data/RecCOPD-LabaLamaDecModAlsShould",
                            "type": "primary"
                        },
                        {
                            "recId": "http://anonymous.org/data/RecCOPD-BetaAgonistIncLowRiskCdrShouldnot",
                            "type": "primary"
                        }
                    ]
                }
            ],
            "recommendations": [
                {
                    "id": "http://anonymous.org/data/RecCOPD-BetaAgonistIncLowRiskCdrShouldnot",
                    "text": "clinician should avoid recommending administration of Beta Agonist bronchodilators to patients with cardiovascular disease",
                    "motivation": "none",
                    "derivedFrom": "GOLD COPD 2017",
                    "suggestion": "nonrecommend",
                    "careActionType": {
                        "id": "http://anonymous.org/data/DrugCatBetaAgonist",
                        "code": "BetaAgonist",
                        "display": "administration of Beta Agonist bronchodilator",
                        "requestType": 0
                    },
                    "causationBeliefs": [
                        {
                            "id": "http://anonymous.org/data/CBBetaAgonistIncLowRiskCdr",
                            "contribution": "negative",
                            "probability": "always",
                            "evidence": "high-level",
                            "author": "JDA",
                            "transition": {
                                "id": "http://anonymous.org/data/TrIncLowRiskCdr",
                                "effect": "increase",
                                "property": {
                                    "id": "http://anonymous.org/data/PropCrd",
                                    "display": "risk of having cardiac rhythm disturbances",
                                    "code": "Crd"
                            },
                            "situationTypes": [
                                    {
                                        "id": "http://anonymous.org/data/SitLowRiskCrd",
                                        "type": "hasTransformableSituation",
                                        "value": {
                                            "code": "SitLowRiskCrd",
                                            "display": "a low risk of having cardiac rhythm disturbances"
                                        }
                                    },
                                    {
                                        "id": "http://anonymous.org/data/SitMildAls",
                                        "type": "hasExpectedSituation",
                                        "value": {
                                            "code": "SitHighRiskCrd",
                                            "display": "a high risk of having cardiac rhythm disturbances"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "id": "http://anonymous.org/data/RecCOPD-LabaDecModAlsShould",
                    "text": "Clinician should recommend administering LABA bronchodilator",
                    "motivation": "none",
                    "derivedFrom": "GOLD COPD 2017",
                    "suggestion": "recommend",
                    "careActionType": {
                        "id": "http://anonymous.org/data/DrugTLaba",
                        "code": "Laba",
                        "display": "administration of LABA bronchodilator",
                        "requestType": 0
                    },
                    "causationBeliefs": [
                        {
                            "id": "http://anonymous.org/data/CBLabaDecModAls",
                            "contribution": "positive",
                            "probability": "always",
                            "evidence": "high-level",
                            "author": "Jesus",
                            "transition": {
                                "id": "http://anonymous.org/data/TrDecModAls",
                                "effect": "decrease",
                                "property": {
                                    "display": "airflow limitation severity",
                                    "code": "Als"
                                },
                                "situationTypes": [
                                    {
                                        "id": "http://anonymous.org/data/SitModAls",
                                        "type": "hasTransformableSituation",
                                        "value": {
                                            "code": "SitModAls",
                                            "display": "a moderate airflow limitation severity"
                                        }
                                    },
                                    {
                                        "id": "http://anonymous.org/data/SitMildAls",
                                        "type": "hasExpectedSituation",
                                        "value": {
                                            "code": "SitMildAls",
                                            "display": "a mild airflow limitation severity"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "id": "http://anonymous.org/data/RecCOPD-LamaDecModAlsShould",
                    "text": "Clinician should recommend administering LAMA bronchodilator",
                    "motivation": "none",
                    "derivedFrom": "GOLD COPD 2017",
                    "suggestion": "recommend",
                    "careActionType": {
                        "id": "http://anonymous.org/data/DrugTLama",
                        "code": "Lama",
                        "display": "administration of LAMA bronchodilator",
                        "requestType": 0
                    },
                    "causationBeliefs": [
                        {
                            "id": "http://anonymous.org/data/CBLamaDecModAls",
                            "contribution": "positive",
                            "probability": "always",
                            "evidence": "high-level",
                            "author": "JDA",
                            "transition": {
                                "id": "http://anonymous.org/data/TrDecModAls",
                                "effect": "decrease",
                                "property": {
                                    "display": "airflow limitation severity",
                                    "code": "Als"
                                },
                                "situationTypes": [
                                    {
                                        "id": "http://anonymous.org/data/SitModAls",
                                        "type": "hasTransformableSituation",
                                        "value": {
                                            "code": "SitModAls",
                                            "display": "a moderate airflow limitation severity"
                                        }
                                    },
                                    {
                                        "id": "http://anonymous.org/data/SitMildAls",
                                        "type": "hasExpectedSituation",
                                        "value": {
                                            "code": "SitMildAls",
                                            "display": "a mild airflow limitation severity"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "id": "http://anonymous.org/data/RecCOPD-LabaLamaDecModAlsShould",
                    "text": "Clinician should recommend administering LABA+LAMA bronchodilator",
                    "motivation": "none",
                    "derivedFrom": "GOLD COPD 2017",
                    "suggestion": "recommend",
                    "careActionType": {
                        "id": "http://anonymous.org/data/DrugTLabaLama",
                        "code": "LabaLama",
                        "display": "administration of LABA+LAMA bronchodilator",
                        "requestType": 0
                    },
                    "causationBeliefs": [
                        {
                            "id": "http://anonymous.org/data/CBLabaLamaDecModAls",
                            "contribution": "positive",
                            "probability": "always",
                            "evidence": "high-level",
                            "author": "JDA",
                            "transition": {
                                "id": "http://anonymous.org/data/TrDecModAls",
                                "effect": "decrease",
                                "property": {
                                    "display": "airflow limitation severity",
                                    "code": "Als"
                                },
                                "situationTypes": [
                                    {
                                        "id": "http://anonymous.org/data/SitModAls",
                                        "type": "hasTransformableSituation",
                                        "value": {
                                            "code": "SitModAls",
                                            "display": "a moderate airflow limitation severity"
                                        }
                                    },
                                    {
                                        "id": "http://anonymous.org/data/SitMildAls",
                                        "type": "hasExpectedSituation",
                                        "value": {
                                            "code": "SitMildAls",
                                            "display": "a mild airflow limitation severity"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "id": "http://anonymous.org/data/RecCOPD-SctIncQolShould",
                    "text": "Clinician should encourage patient to quit smoking by offering smoking cessation therapy",
                    "motivation": "none",
                    "derivedFrom": "GOLD COPD 2017",
                    "suggestion": "recommend",
                    "careActionType": {
                        "id": "http://anonymous.org/data/NonDrugTSct",
                        "code": "TSct",
                        "display": "application of smoking cessation therapy",
                        "requestType": 1
                    },
                    "causationBeliefs": [
                        {
                            "id": "http://anonymous.org/data/CBSmokingCessationIncQol",
                            "contribution": "positive",
                            "probability": "always",
                            "evidence": "high-level",
                            "author": "JDA",
                            "transition": {
                                "id": "http://anonymous.org/data/TrIncQol",
                                "effect": "increase",
                                "property": {
                                    "display": "quality of life",
                                    "code": "Qol"
                                },
                                "situationTypes": [
                                    {
                                        "id": "http://anonymous.org/data/SitPoorQol",
                                        "type": "hasTransformableSituation",
                                        "value": {
                                            "code": "SitPoorQol",
                                            "display": "a poor quality of life"
                                        }
                                    },
                                    {
                                        "id": "http://anonymous.org/data/SitStandardQol",
                                        "type": "hasExpectedSituation",
                                        "value": {
                                            "code": "SitStandardQol",
                                            "display": "a standard quality of life"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "id": "http://anonymous.org/data/RecCOPD-FluVacDecFluRiskShould",
                    "text": "Clinician should encourage administering seasonal influenza vaccine to decrease risk of contracting influenxa disease",
                    "motivation": "none",
                    "derivedFrom": "GOLD COPD 2017",
                    "suggestion": "recommend",
                    "careActionType": {
                        "id": "http://anonymous.org/data/VacTFluVac",
                        "code": "FluVac",
                        "display": "administration of seasonal influenza vaccine",
                        "requestType": 2
                    },
                    "causationBeliefs": [
                        {
                            "id": "http://anonymous.org/data/CBFluVacDecFluRisk",
                            "contribution": "positive",
                            "probability": "always",
                            "evidence": "high-level",
                            "author": "JDA",
                            "transition": {
                                "id": "http://anonymous.org/data/TrDecFluRisk",
                                "effect": "decrease",
                                "property": {
                                    "display": "risk of contracting influenza disease",
                                    "code": "FluRisk"
                                },
                                "situationTypes": [
                                    {
                                        "id": "http://anonymous.org/data/SitHighRFlu",
                                        "type": "hasTransformableSituation",
                                        "value": {
                                            "code": "SitHighRFlu",
                                            "display": "a high risk of contracting influenza disease"
                                        }
                                    },
                                    {
                                        "id": "http://anonymous.org/data/SitLowRFlu",
                                        "type": "hasExpectedSituation",
                                        "value": {
                                            "code": "SitLowRFlu",
                                            "display": "a low risk of contracting influenza disease"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    }
}
