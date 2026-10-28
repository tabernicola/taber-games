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
  "image": "/taberdoku/murdoku/cases/pintada.png",
  "gridRows": 9,
  "gridCols": 9,
  "rooms": [
    {
      "id": "parque-gatos",
      "name": "Parque de los gatos",
      "namePosition": {
        "row": 1,
        "col": 0
      },
      "nameOrientation": "horizontal",
      "nameAlignment": "bottom",
      "cells": [
        {
          "row": 0,
          "col": 0
        },
        {
          "row": 1,
          "col": 0
        }
      ],
      "elements": [
        {
          "name": "Mesa",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/00-00.png",
          "position": {
            "row": 0,
            "col": 0
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/00-01.png",
          "position": {
            "row": 1,
            "col": 0
          },
          "walkable": true
        }
      ]
    },
    {
      "id": "ibaiondo",
      "name": "Ibaiondo",
      "namePosition": {
        "row": 0,
        "col": 2
      },
      "nameOrientation": "horizontal",
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
          "name": "",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/02-00.png",
          "position": {
            "row": 0,
            "col": 2
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/03-00.png",
          "position": {
            "row": 0,
            "col": 3
          },
          "walkable": true
        },
        {
          "name": "Kantina",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/04-00.png",
          "position": {
            "row": 0,
            "col": 4
          },
          "walkable": false
        },
        {
          "name": "Kantina",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/05-00.png",
          "position": {
            "row": 0,
            "col": 5
          },
          "walkable": false
        },
        {
          "name": "",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/06-00.png",
          "position": {
            "row": 0,
            "col": 6
          },
          "walkable": true
        },
        {
          "name": "",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/02-01.png",
          "position": {
            "row": 1,
            "col": 2
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/03-01.png",
          "position": {
            "row": 1,
            "col": 3
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/04-01.png",
          "position": {
            "row": 1,
            "col": 4
          },
          "walkable": true
        },
        {
          "name": "Camino",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/05-01.png",
          "position": {
            "row": 1,
            "col": 5
          },
          "walkable": true
        },
        {
          "name": "Camino",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/06-01.png",
          "position": {
            "row": 1,
            "col": 6
          },
          "walkable": true
        },
        {
          "name": "Ría",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/02-02.png",
          "position": {
            "row": 2,
            "col": 2
          },
          "walkable": true
        },
        {
          "name": "Ría",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/03-02.png",
          "position": {
            "row": 2,
            "col": 3
          },
          "walkable": true
        },
        {
          "name": "Ría",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/04-02.png",
          "position": {
            "row": 2,
            "col": 4
          },
          "walkable": true
        },
        {
          "name": "Ría",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/05-02.png",
          "position": {
            "row": 2,
            "col": 5
          },
          "walkable": true
        },
        {
          "name": "Ría",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/06-02.png",
          "position": {
            "row": 2,
            "col": 6
          },
          "walkable": true
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
          "name": "Skate park",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/07-00.png",
          "position": {
            "row": 0,
            "col": 7
          },
          "walkable": true
        },
        {
          "name": "Skate park",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/08-00.png",
          "position": {
            "row": 0,
            "col": 8
          },
          "walkable": true
        },
        {
          "name": "Skate park",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/07-01.png",
          "position": {
            "row": 1,
            "col": 7
          },
          "walkable": true
        },
        {
          "name": "Skate park",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/08-01.png",
          "position": {
            "row": 1,
            "col": 8
          },
          "walkable": true
        },
        {
          "name": "Ría",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/07-02.png",
          "position": {
            "row": 2,
            "col": 7
          },
          "walkable": true
        },
        {
          "name": "Ría",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/08-02.png",
          "position": {
            "row": 2,
            "col": 8
          },
          "walkable": true
        }
      ]
    },
    {
      "id": "renfe",
      "name": "Estación vieja",
      "namePosition": {
        "row": 4,
        "col": 0
      },
      "nameOrientation": "vertical",
      "cells": [
        {
          "row": 0,
          "col": 1
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
        },
        {
          "row": 3,
          "col": 0
        },
        {
          "row": 3,
          "col": 1
        },
        {
          "row": 4,
          "col": 0
        },
        {
          "row": 4,
          "col": 1
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
        },
        {
          "row": 8,
          "col": 0
        }
      ],
      "elements": [
        {
          "name": "Viaducto",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/01-00.png",
          "position": {
            "row": 0,
            "col": 1
          },
          "walkable": true
        },
        {
          "name": "Viaducto",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/01-01.png",
          "position": {
            "row": 1,
            "col": 1
          },
          "walkable": true
        },
        {
          "name": "Viaducto",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/00-02.png",
          "position": {
            "row": 2,
            "col": 0
          },
          "walkable": true
        },
        {
          "name": "Viaducto",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/01-02.png",
          "position": {
            "row": 2,
            "col": 1
          },
          "walkable": true
        },
        {
          "name": "Estación",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/00-03.png",
          "position": {
            "row": 3,
            "col": 0
          },
          "walkable": true
        },
        {
          "name": "Estación",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/01-03.png",
          "position": {
            "row": 3,
            "col": 1
          },
          "walkable": true
        },
        {
          "name": "Estación",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/00-04.png",
          "position": {
            "row": 4,
            "col": 0
          },
          "walkable": true
        },
        {
          "name": "Estación",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/01-04.png",
          "position": {
            "row": 4,
            "col": 1
          },
          "walkable": true
        },
        {
          "name": "Viaducto",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/00-05.png",
          "position": {
            "row": 5,
            "col": 0
          },
          "walkable": true
        },
        {
          "name": "Viaducto",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/00-06.png",
          "position": {
            "row": 6,
            "col": 0
          },
          "walkable": true
        },
        {
          "name": "Viaducto",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/00-07.png",
          "position": {
            "row": 7,
            "col": 0
          },
          "walkable": true
        },
        {
          "name": "Viaducto",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/00-08.png",
          "position": {
            "row": 8,
            "col": 0
          },
          "walkable": true
        }
      ]
    },
    {
      "id": "fronton-viejo",
      "name": "Frontón viejo",
      "namePosition": {
        "row": 4,
        "col": 2
      },
      "nameOrientation": "vertical",
      "cells": [
        {
          "row": 3,
          "col": 2
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
      "elements": [
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/02-03.png",
          "position": {
            "row": 3,
            "col": 2
          },
          "walkable": true
        },
        {
          "name": "",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/02-04.png",
          "position": {
            "row": 4,
            "col": 2
          },
          "walkable": true
        },
        {
          "name": "Frontón",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/01-05.png",
          "position": {
            "row": 5,
            "col": 1
          },
          "walkable": true
        },
        {
          "name": "",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/02-05.png",
          "position": {
            "row": 5,
            "col": 2
          },
          "walkable": true
        },
        {
          "name": "Campo de fútbol",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/01-06.png",
          "position": {
            "row": 6,
            "col": 1
          },
          "walkable": true
        },
        {
          "name": "Parque",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/01-07.png",
          "position": {
            "row": 7,
            "col": 1
          },
          "walkable": true
        }
      ]
    },
    {
      "id": "azoka",
      "name": "Azoka",
      "namePosition": {
        "row": 3,
        "col": 3
      },
      "nameOrientation": "horizontal",
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
      "elements": [
        {
          "name": "Camino",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/03-03.png",
          "position": {
            "row": 3,
            "col": 3
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/04-03.png",
          "position": {
            "row": 3,
            "col": 4
          },
          "walkable": true
        },
        {
          "name": "Parque",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/05-03.png",
          "position": {
            "row": 3,
            "col": 5
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/03-04.png",
          "position": {
            "row": 4,
            "col": 3
          },
          "walkable": true
        },
        {
          "name": "Camino",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/04-04.png",
          "position": {
            "row": 4,
            "col": 4
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/05-04.png",
          "position": {
            "row": 4,
            "col": 5
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/03-05.png",
          "position": {
            "row": 5,
            "col": 3
          },
          "walkable": true
        },
        {
          "name": "Camino",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/04-05.png",
          "position": {
            "row": 5,
            "col": 4
          },
          "walkable": true
        },
        {
          "name": "Parque",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/05-05.png",
          "position": {
            "row": 5,
            "col": 5
          },
          "walkable": true
        }
      ]
    },
    {
      "id": "axular",
      "name": "Axular",
      "namePosition": {
        "row": 3,
        "col": 6
      },
      "nameOrientation": "horizontal",
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
      "elements": [
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/06-03.png",
          "position": {
            "row": 3,
            "col": 6
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/07-03.png",
          "position": {
            "row": 3,
            "col": 7
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/08-03.png",
          "position": {
            "row": 3,
            "col": 8
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/06-04.png",
          "position": {
            "row": 4,
            "col": 6
          },
          "walkable": true
        },
        {
          "name": "Parque",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/07-04.png",
          "position": {
            "row": 4,
            "col": 7
          },
          "walkable": true
        },
        {
          "name": "Fuente",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/08-04.png",
          "position": {
            "row": 4,
            "col": 8
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/06-05.png",
          "position": {
            "row": 5,
            "col": 6
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/07-05.png",
          "position": {
            "row": 5,
            "col": 7
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/08-05.png",
          "position": {
            "row": 5,
            "col": 8
          },
          "walkable": true
        }
      ]
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
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/02-06.png",
          "position": {
            "row": 6,
            "col": 2
          },
          "walkable": false
        },
        {
          "name": "Mesa",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/03-06.png",
          "position": {
            "row": 6,
            "col": 3
          },
          "walkable": true
        },
        {
          "name": "Camino",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/04-06.png",
          "position": {
            "row": 6,
            "col": 4
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/05-06.png",
          "position": {
            "row": 6,
            "col": 5
          },
          "walkable": true
        },
        {
          "name": "Iglesia",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/02-07.png",
          "position": {
            "row": 7,
            "col": 2
          },
          "walkable": false
        },
        {
          "name": "Mesa",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/03-07.png",
          "position": {
            "row": 7,
            "col": 3
          },
          "walkable": true
        },
        {
          "name": "Camino",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/04-07.png",
          "position": {
            "row": 7,
            "col": 4
          },
          "walkable": true
        },
        {
          "name": "Mesa",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/05-07.png",
          "position": {
            "row": 7,
            "col": 5
          },
          "walkable": true
        },
        {
          "name": "Camino",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/01-08.png",
          "position": {
            "row": 8,
            "col": 1
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/02-08.png",
          "position": {
            "row": 8,
            "col": 2
          },
          "walkable": true
        },
        {
          "name": "Camino",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/03-08.png",
          "position": {
            "row": 8,
            "col": 3
          },
          "walkable": true
        },
        {
          "name": "Camino",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/04-08.png",
          "position": {
            "row": 8,
            "col": 4
          },
          "walkable": true
        },
        {
          "name": "Terraza",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/05-08.png",
          "position": {
            "row": 8,
            "col": 5
          },
          "walkable": true
        },
        {
          "name": "Edificio",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/06-08.png",
          "position": {
            "row": 8,
            "col": 6
          },
          "walkable": false
        }
      ]
    },
    {
      "id": "la-campa",
      "name": "La campa",
      "namePosition": {
        "row": 6,
        "col": 6
      },
      "nameOrientation": "horizontal",
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
          "name": "Edificio",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/06-06.png",
          "position": {
            "row": 6,
            "col": 6
          },
          "walkable": false
        },
        {
          "name": "Parking",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/07-06.png",
          "position": {
            "row": 6,
            "col": 7
          },
          "walkable": true
        },
        {
          "name": "Ambulatorio",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/08-06.png",
          "position": {
            "row": 6,
            "col": 8
          },
          "walkable": false
        },
        {
          "name": "Edificio",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/06-07.png",
          "position": {
            "row": 7,
            "col": 6
          },
          "walkable": false
        },
        {
          "name": "Parking",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/07-07.png",
          "position": {
            "row": 7,
            "col": 7
          },
          "walkable": true
        },
        {
          "name": "Parking",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/08-07.png",
          "position": {
            "row": 7,
            "col": 8
          },
          "walkable": true
        },
        {
          "name": "Lizeo",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/07-08.png",
          "position": {
            "row": 8,
            "col": 7
          },
          "walkable": false
        },
        {
          "name": "Campo de fútbol",
          "icon": "",
          "image": "/taberdoku/murdoku/antxo/08-08.png",
          "position": {
            "row": 8,
            "col": 8
          },
          "walkable": true
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
    "witnessId": "tabletgirl",
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
        "col": 6
      },
      {
        "characterId": "tabletgirl",
        "row": 3,
        "col": 2
      },
      {
        "characterId": "lord-shadow",
        "row": 4,
        "col": 1
      },
      {
        "characterId": "stylist",
        "row": 5,
        "col": 4
      },
      {
        "characterId": "dna-noelia",
        "row": 6,
        "col": 7
      },
      {
        "characterId": "luigi",
        "row": 7,
        "col": 8
      },
      {
        "characterId": "postman",
        "row": 8,
        "col": 5
      }
    ]
  },
      "clues": [
    {
      "id": "clue-scene",
      "text": {
        "es": "Las pintadas aparecieron en la Estación vieja.",
        "eu": "Grafitiak Geltoki zaharrean agertu ziren.",
        "en": "The graffiti appeared at the Old Station."
      },
      "type": "fact"
    },
    {
      "id": "clue-witness",
      "text": {
        "es": "El testigo se encontraba en la terraza del Frontón viejo.",
        "eu": "Lekuko Frontoi zaharreko terrazan zegoen.",
        "en": "The witness was on the terrace of the Old frontón."
      },
      "type": "fact"
    },
    {
      "id": "clue-killer",
      "text": {
        "es": "El culpable fue visto en la Estación vieja.",
        "eu": "Erruduna Geltoki zaharrean ikusi zuten.",
        "en": "The culprit was seen at the Old Station."
      },
      "type": "fact"
    },
    {
      "id": "clue-taber",
      "text": {
        "es": "Taber estaba en Ibaiondo, en la terraza de la fila del norte.",
        "eu": "Taber Ibaiondon zegoen, iparraldeko errenkadako terrazan.",
        "en": "Taber was in Ibaiondo, on the terrace in the north row."
      },
      "type": "clue",
      "characterId": "taber",
      "roomId": "ibaiondo"
    },
    {
      "id": "clue-cameraman",
      "text": {
        "es": "El padre del rapero grababa en el Parque de los gatos, en la terraza al oeste del pueblo.",
        "eu": "Raperoaren aita Katuen parkean grabatzen ari zen, herriaren mendebaldean dagoen terrazan.",
        "en": "The rapper's dad was filming in the Cats' park, on the terrace to the west of the town."
      },
      "type": "clue",
      "characterId": "cameraman"
    },
    {
      "id": "clue-icequeen",
      "text": {
        "es": "Ice Queen estaba en Ibaiondo, en la ría.",
        "eu": "Ice Queen Ibaiondon zegoen, itsasadarrean.",
        "en": "Ice Queen was in Ibaiondo, in the river."
      },
      "type": "clue",
      "characterId": "icequeen"
    },
    {
      "id": "clue-lord-shadow",
      "text": {
        "es": "Lord shadow estaba en la Estación vieja, junto al viaducto.",
        "eu": "Lord shadow Geltoki zaharrean zegoen, zubibidearen ondoan.",
        "en": "Lord shadow was in the Old Station, next to the viaduct."
      },
      "type": "clue",
      "characterId": "lord-shadow"
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
      "id": "clue-dna-noelia",
      "text": {
        "es": "Doña Noelia esperaba en La campa, en el parking al norte.",
        "eu": "Doña Noelia La campan zain zegoen, iparraldeko parkingean.",
        "en": "Doña Noelia was waiting in La campa, in the parking to the north."
      },
      "type": "clue",
      "characterId": "dna-noelia"
    },
    {
      "id": "clue-stylist",
      "text": {
        "es": "Moon scissors cortaba el pelo en el Azoka, en el camino.",
        "eu": "Moon scissors Azokan ilea mozten ari zen, bidean.",
        "en": "Moon scissors was cutting hair in the Azoka, on the path."
      },
      "type": "clue",
      "characterId": "stylist",
      "elementId": "Camino"
    },
    {
      "id": "clue-tabletgirl",
      "text": {
        "es": "Tablet girl era el testigo y estaba en la terraza del Frontón viejo.",
        "eu": "Tablet girl lekuko zen eta Frontoi zaharreko terrazan zegoen.",
        "en": "Tablet girl was the witness and was on the terrace of the Old frontón."
      },
      "type": "clue",
      "characterId": "tabletgirl"
    },
    {
      "id": "clue-postman",
      "text": {
        "es": "El Sr. Barquillero vendía barquillos en el Alameda, en la terraza al sur.",
        "eu": "Barquillero jauna Alamedan barquilloak saltzen ari zen, hegoaldeko terrazan.",
        "en": "Mr. Barquillero was selling wafers in the Alameda, on the terrace to the south."
      },
      "type": "clue",
      "characterId": "postman"
    }
  ]
};

// Translations (eu / en) of room and element names; Spanish is the base name.
// Only zones whose name is translatable have entries here: the rest keep their
// original name in every language.
const NAME_I18N: Record<string, { eu: string; en: string }> = {
  "Estación vieja": { eu: "Geltoki zaharra", en: "Old station" },
  "Frontón viejo": { eu: "Frontoi zaharra", en: "Old frontón" },
  Ambulatorio: { eu: "Anbulatorioa", en: "Health centre" },
  Camino: { eu: "Bidea", en: "Path" },
  "Campo de fútbol": { eu: "Futbol zelaia", en: "Football field" },
  Edificio: { eu: "Eraikina", en: "Building" },
  "Estación": { eu: "Geltokia", en: "Station" },
  "Frontón": { eu: "Frontoia", en: "Frontón" },
  Fuente: { eu: "Iturria", en: "Fountain" },
  Iglesia: { eu: "Eliza", en: "Church" },
  Kantina: { eu: "Kantina", en: "Canteen" },
  Lizeo: { eu: "Lizeoa", en: "Lyceum" },
  Mesa: { eu: "Mahaia", en: "Table" },
  Parking: { eu: "Aparkalekua", en: "Car park" },
  Parque: { eu: "Parkea", en: "Park" },
  "Ría": { eu: "Itsasadarra", en: "Estuary" },
  "Skate park": { eu: "Skate parkea", en: "Skate park" },
  Terraza: { eu: "Terraza", en: "Terrace" },
  Viaducto: { eu: "Zubibidea", en: "Viaduct" },
};

function withI18n(name: string) {
  const tr = NAME_I18N[name];
  return tr ? { es: name, ...tr } : undefined;
}

for (const room of SAMPLE_CASE_CONTENT.rooms) {
  room.nameI18n ??= withI18n(room.name);
  for (const el of room.elements ?? []) el.nameI18n ??= withI18n(el.name);
}

export const SAMPLE_CASE: MurdokuCase = {
  id: "sample",
  title: "La pintada",
  titleI18n: {
    es: "La pintada",
    eu: "Grafitia",
    en: "The graffiti",
  },
  creator_id: null,
  status: "approved",
  content: SAMPLE_CASE_CONTENT,
  image: "/taberdoku/murdoku/cases/pintada.png",
  rejection_note: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
