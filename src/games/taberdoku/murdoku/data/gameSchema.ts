import type {
  CaseContent,
  CaseStatus,
  Character,
  Clue,
  ClueType,
  Guess,
  GuessResult,
  MurdokuCase,
  Placement,
  Position,
  Room,
  RoomElement,
  Solution,
  ValidationResult,
  SolvabilityResult,
} from "../logic/game";

export type {
  CaseContent,
  CaseStatus,
  Character,
  Clue,
  ClueType,
  Guess,
  GuessResult,
  MurdokuCase,
  Placement,
  Position,
  Room,
  RoomElement,
  Solution,
  ValidationResult,
  SolvabilityResult,
};

export {
  validateSolution,
  checkGuess,
  isCaseSolvable,
  checkSudokuConstraints,
  getRoomForCell,
  getPlacement,
  characterAtPosition,
  buildEmptyGrid,
  createDefaultRooms,
  createEmptyCase,
  DEFAULT_CASE_CONTENT,
} from "../logic/game";

export const SAMPLE_CASE_CONTENT: CaseContent = {
  "gridRows": 9,
  "gridCols": 9,
  "rooms": [
    {
      "id": "parque-gatos",
      "name": "Parque de los gatos",
      "cells": [
        {
          "row": 0,
          "col": 0
        },
        {
          "row": 0,
          "col": 1
        },
        {
          "row": 1,
          "col": 0
        },
        {
          "row": 1,
          "col": 1
        },
        {
          "row": 2,
          "col": 0
        },
        {
          "row": 2,
          "col": 1
        }
      ],
      "elements": [
        {
          "name": "Río",
          "icon": "🌊",
          "position": {
            "row": 2,
            "col": 0
          },
          "walkable": false
        }
      ]
    },
    {
      "id": "ibaiondo",
      "name": "Ibaiondo",
      "cells": [
        {
          "row": 0,
          "col": 2
        },
        {
          "row": 0,
          "col": 3
        },
        {
          "row": 0,
          "col": 4
        },
        {
          "row": 0,
          "col": 5
        },
        {
          "row": 0,
          "col": 6
        },
        {
          "row": 1,
          "col": 2
        },
        {
          "row": 1,
          "col": 3
        },
        {
          "row": 1,
          "col": 4
        },
        {
          "row": 1,
          "col": 5
        },
        {
          "row": 1,
          "col": 6
        },
        {
          "row": 2,
          "col": 2
        },
        {
          "row": 2,
          "col": 3
        },
        {
          "row": 2,
          "col": 4
        },
        {
          "row": 2,
          "col": 5
        },
        {
          "row": 2,
          "col": 6
        }
      ],
      "elements": [
        {
          "name": "Frontón cubierto y bar",
          "icon": "🏟️",
          "position": {
            "row": 0,
            "col": 4
          },
          "walkable": false
        },
        {
          "name": "Frontón cubierto y bar",
          "icon": "🍺",
          "position": {
            "row": 0,
            "col": 5
          },
          "walkable": false
        },
        {
          "name": "Río",
          "icon": "🌊",
          "position": {
            "row": 2,
            "col": 3
          },
          "walkable": false
        },
        {
          "name": "Río",
          "icon": "🌊",
          "position": {
            "row": 2,
            "col": 4
          },
          "walkable": false
        },
        {
          "name": "Río",
          "icon": "🌊",
          "position": {
            "row": 2,
            "col": 5
          },
          "walkable": false
        }
      ]
    },
    {
      "id": "skatepark",
      "name": "Skatepark",
      "cells": [
        {
          "row": 0,
          "col": 7
        },
        {
          "row": 0,
          "col": 8
        },
        {
          "row": 1,
          "col": 7
        },
        {
          "row": 1,
          "col": 8
        },
        {
          "row": 2,
          "col": 7
        },
        {
          "row": 2,
          "col": 8
        }
      ],
      "elements": [
        {
          "name": "Río",
          "icon": "🌊",
          "position": {
            "row": 2,
            "col": 8
          },
          "walkable": false
        }
      ]
    },
    {
      "id": "renfe",
      "name": "Renfe",
      "cells": [
        {
          "row": 3,
          "col": 0
        },
        {
          "row": 4,
          "col": 0
        },
        {
          "row": 5,
          "col": 0
        },
        {
          "row": 6,
          "col": 0
        },
        {
          "row": 7,
          "col": 0
        }
      ],
      "elements": []
    },
    {
      "id": "fronton-viejo",
      "name": "Frontón viejo",
      "cells": [
        {
          "row": 3,
          "col": 1
        },
        {
          "row": 3,
          "col": 2
        },
        {
          "row": 4,
          "col": 1
        },
        {
          "row": 4,
          "col": 2
        },
        {
          "row": 5,
          "col": 1
        },
        {
          "row": 5,
          "col": 2
        },
        {
          "row": 6,
          "col": 1
        },
        {
          "row": 7,
          "col": 1
        }
      ],
      "elements": []
    },
    {
      "id": "azoka",
      "name": "Azoka",
      "cells": [
        {
          "row": 3,
          "col": 3
        },
        {
          "row": 3,
          "col": 4
        },
        {
          "row": 3,
          "col": 5
        },
        {
          "row": 4,
          "col": 3
        },
        {
          "row": 4,
          "col": 4
        },
        {
          "row": 4,
          "col": 5
        },
        {
          "row": 5,
          "col": 3
        },
        {
          "row": 5,
          "col": 4
        },
        {
          "row": 5,
          "col": 5
        }
      ],
      "elements": []
    },
    {
      "id": "axular",
      "name": "Axular",
      "cells": [
        {
          "row": 3,
          "col": 6
        },
        {
          "row": 3,
          "col": 7
        },
        {
          "row": 3,
          "col": 8
        },
        {
          "row": 4,
          "col": 6
        },
        {
          "row": 4,
          "col": 7
        },
        {
          "row": 4,
          "col": 8
        },
        {
          "row": 5,
          "col": 6
        },
        {
          "row": 5,
          "col": 7
        },
        {
          "row": 5,
          "col": 8
        }
      ],
      "elements": []
    },
    {
      "id": "alameda",
      "name": "Alameda",
      "cells": [
        {
          "row": 6,
          "col": 2
        },
        {
          "row": 6,
          "col": 3
        },
        {
          "row": 6,
          "col": 4
        },
        {
          "row": 6,
          "col": 5
        },
        {
          "row": 7,
          "col": 2
        },
        {
          "row": 7,
          "col": 3
        },
        {
          "row": 7,
          "col": 4
        },
        {
          "row": 7,
          "col": 5
        },
        {
          "row": 8,
          "col": 0
        },
        {
          "row": 8,
          "col": 1
        },
        {
          "row": 8,
          "col": 2
        },
        {
          "row": 8,
          "col": 3
        },
        {
          "row": 8,
          "col": 4
        },
        {
          "row": 8,
          "col": 5
        },
        {
          "row": 8,
          "col": 6
        }
      ],
      "elements": [
        {
          "name": "Iglesia",
          "icon": "⛪",
          "position": {
            "row": 6,
            "col": 2
          },
          "walkable": false
        },
        {
          "name": "Iglesia",
          "icon": "⛪",
          "position": {
            "row": 7,
            "col": 2
          },
          "walkable": false
        }
      ]
    },
    {
      "id": "la-campa",
      "name": "La campa",
      "cells": [
        {
          "row": 6,
          "col": 6
        },
        {
          "row": 6,
          "col": 7
        },
        {
          "row": 6,
          "col": 8
        },
        {
          "row": 7,
          "col": 6
        },
        {
          "row": 7,
          "col": 7
        },
        {
          "row": 7,
          "col": 8
        },
        {
          "row": 8,
          "col": 7
        },
        {
          "row": 8,
          "col": 8
        }
      ],
      "elements": [
        {
          "name": "Ambulatorio",
          "icon": "🏥",
          "position": {
            "row": 6,
            "col": 8
          },
          "walkable": false
        }
      ]
    }
  ],
  "characters": [
    {
      "id": "postman",
      "name": "Sr. Barquillero",
      "image": "/characters/p1.png",
      "description": {
        "es": "Vendedor de barquillos de toda la vida.",
        "eu": "Betiko barquillo saltzailea.",
        "en": "Lifelong wafer seller."
      }
    },
    {
      "id": "stylist",
      "name": "Moon scissors",
      "image": "/characters/p2.png",
      "description": {
        "es": "Estilista con tijeras afiladas como la luna.",
        "eu": "Ilargia bezain zorrotzak diren artaziak dituen estilista.",
        "en": "Stylist with moon-sharp scissors."
      }
    },
    {
      "id": "cameraman",
      "name": "El padre del rapero",
      "image": "/characters/p3.png",
      "description": {
        "es": "Siempre grabando con su cámara.",
        "eu": "Beti bere kamerarekin grabatzen.",
        "en": "Always filming with his camera."
      }
    },
    {
      "id": "icequeen",
      "name": "Ice Queen",
      "image": "/characters/p4.png",
      "description": {
        "es": "Fría como el hielo.",
        "eu": "Izotza bezain hotza.",
        "en": "Cold as ice."
      }
    },
    {
      "id": "taber",
      "name": "Taber",
      "image": "/characters/p5.png",
      "description": {
        "es": "El alma de The Taber Games.",
        "eu": "The Taber Gamesen arima.",
        "en": "The soul of The Taber Games."
      }
    },
    {
      "id": "tabletgirl",
      "name": "Tablet girl",
      "image": "/characters/p6.png",
      "description": {
        "es": "Nunca suelta su tablet.",
        "eu": "Ez du inoiz bere tableta uzten.",
        "en": "Never lets go of her tablet."
      }
    },
    {
      "id": "dna-noelia",
      "name": "Doña Noelia",
      "image": "/characters/p7.png",
      "description": {
        "es": "Vecina de toda la vida.",
        "eu": "Betiko auzokidea.",
        "en": "Lifelong neighbour."
      }
    },
    {
      "id": "luigi",
      "name": "Luigi",
      "image": "/characters/p8.png",
      "description": {
        "es": "Siempre con prisas.",
        "eu": "Beti presaka.",
        "en": "Always in a hurry."
      }
    },
    {
      "id": "lord-shadow",
      "name": "Lord shadow",
      "image": "/characters/p9.png",
      "description": {
        "es": "Nadie sabe de dónde sale.",
        "eu": "Inork ez daki nondik datorren.",
        "en": "Nobody knows where he comes from."
      }
    }
  ],
  "solution": {
    "killerId": "lord-shadow",
    "victimId": "postman",
    "placements": [
      {
        "characterId": "taber",
        "row": 0,
        "col": 3
      },
      {
        "characterId": "cameraman",
        "row": 1,
        "col": 0
      },
      {
        "characterId": "icequeen",
        "row": 2,
        "col": 7
      },
      {
        "characterId": "lord-shadow",
        "row": 3,
        "col": 5
      },
      {
        "characterId": "postman",
        "row": 4,
        "col": 4
      },
      {
        "characterId": "stylist",
        "row": 5,
        "col": 1
      },
      {
        "characterId": "dna-noelia",
        "row": 6,
        "col": 6
      },
      {
        "characterId": "luigi",
        "row": 7,
        "col": 8
      },
      {
        "characterId": "tabletgirl",
        "row": 8,
        "col": 2
      }
    ]
  },
  "clues": [
    {
      "id": "clue-taber",
      "text": {
        "es": "Taber estaba en Ibaiondo, justo a la izquierda del frontón cubierto.",
        "eu": "Taber Ibaiondon zegoen, frontoi estaliaren ezkerrean.",
        "en": "Taber was in Ibaiondo, right to the left of the covered frontón."
      },
      "type": "clue",
      "characterId": "taber"
    },
    {
      "id": "clue-cameraman",
      "text": {
        "es": "El padre del rapero grababa en el Parque de los gatos, pegado al borde oeste del pueblo.",
        "eu": "Raperoaren aita Katuen parkean grabatzen ari zen, herriaren mendebaldeko ertzean.",
        "en": "The rapper's dad was filming in the Cats' park, on the town's western edge."
      },
      "type": "clue",
      "characterId": "cameraman"
    },
    {
      "id": "clue-icequeen",
      "text": {
        "es": "Ice Queen miraba el río desde el Skatepark, en la orilla, pero sin mojarse.",
        "eu": "Ice Queen Skateparketik ibaiari begira zegoen, ertzean, baina busti gabe.",
        "en": "Ice Queen watched the river from the Skatepark, on the bank, without getting wet."
      },
      "type": "clue",
      "characterId": "icequeen"
    },
    {
      "id": "clue-lord-shadow",
      "text": {
        "es": "Lord shadow acechaba en la Azoka, en su fila más al norte.",
        "eu": "Lord shadow Azokan zelatan zegoen, iparraldeko errenkadan.",
        "en": "Lord shadow lurked in the Azoka, in its northernmost row."
      },
      "type": "clue",
      "characterId": "lord-shadow"
    },
    {
      "id": "clue-postman",
      "text": {
        "es": "El Sr. Barquillero vendía barquillos en el centro exacto de la Azoka.",
        "eu": "Barquillero jauna Azokaren erdi-erdian barquilloak saltzen ari zen.",
        "en": "Mr. Barquillero was selling wafers in the exact centre of the Azoka."
      },
      "type": "clue",
      "characterId": "postman"
    },
    {
      "id": "clue-stylist",
      "text": {
        "es": "Moon scissors cortaba el pelo en el Frontón viejo, en su fila más al sur.",
        "eu": "Moon scissors Frontoi zaharrean ilea mozten ari zen, hegoaldeko errenkadan.",
        "en": "Moon scissors was cutting hair in the old frontón, in its southernmost row."
      },
      "type": "clue",
      "characterId": "stylist"
    },
    {
      "id": "clue-dna-noelia",
      "text": {
        "es": "Doña Noelia esperaba en La campa, en la misma fila que el ambulatorio.",
        "eu": "Noelia andrea La campan zain zegoen, anbulatorioaren errenkada berean.",
        "en": "Doña Noelia was waiting in La campa, in the same row as the health centre."
      },
      "type": "clue",
      "characterId": "dna-noelia"
    },
    {
      "id": "clue-luigi",
      "text": {
        "es": "Luigi corría por La campa, junto al borde este del pueblo.",
        "eu": "Luigi La campan korrika zebilen, herriaren ekialdeko ertzean.",
        "en": "Luigi was running in La campa, along the town's eastern edge."
      },
      "type": "clue",
      "characterId": "luigi"
    },
    {
      "id": "clue-tabletgirl",
      "text": {
        "es": "Tablet girl estaba en la Alameda, justo debajo de la iglesia.",
        "eu": "Tablet girl Alamedan zegoen, elizaren azpian.",
        "en": "Tablet girl was in the Alameda, right below the church."
      },
      "type": "clue",
      "characterId": "tabletgirl"
    }
  ]
};

export const SAMPLE_CASE: MurdokuCase = {
  id: "sample",
  title: "Crimen en la Bahía: El Silencio del Barquillero",
  creator_id: null,
  status: "approved",
  content: SAMPLE_CASE_CONTENT,
  rejection_note: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
