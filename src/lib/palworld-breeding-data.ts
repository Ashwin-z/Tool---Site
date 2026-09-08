// Generated from Palworld live breeding data on 2026-05-03.
// Source references used during generation:
// - https://palworld.gg/breeding-calculator
// - https://palworld.wiki.gg/wiki/Breeding

export type PalworldGender = "male" | "female";

export type PalworldPal = {
  id: string;
  bpClass: string;
  name: string;
  number: string | null;
  breedingPower: number;
  rarity: number;
  maleProbability: number;
  elements: string[];
  order: number;
  isBoss: boolean;
  regularEligible: boolean;
};

export type PalworldSpecialCombo = {
  parentAId: string;
  parentBId: string;
  childId: string;
  parentAGender: PalworldGender | null;
  parentBGender: PalworldGender | null;
};

export const palworldPals: PalworldPal[] = [
  {
    "id": "BadCatgirl",
    "bpClass": "badcatgirl",
    "name": "Nyafia",
    "number": "139",
    "breedingPower": 645,
    "rarity": 4,
    "maleProbability": 40,
    "elements": [
      "Dark"
    ],
    "order": 0,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "BlueberryFairy",
    "bpClass": "blueberryfairy",
    "name": "Prunelia",
    "number": "138",
    "breedingPower": 755,
    "rarity": 5,
    "maleProbability": 40,
    "elements": [
      "Grass",
      "Dark"
    ],
    "order": 1,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "GoldenHorse",
    "bpClass": "goldenhorse",
    "name": "Gildane",
    "number": "140",
    "breedingPower": 505,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 2,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "TentacleTurtle",
    "bpClass": "tentacleturtle",
    "name": "Turtacle",
    "number": "148",
    "breedingPower": 1105,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 3,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "TentacleTurtle_Ground",
    "bpClass": "tentacleturtle_ground",
    "name": "Turtacle Terra",
    "number": "148B",
    "breedingPower": 1065,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Ground"
    ],
    "order": 4,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Anubis",
    "bpClass": "anubis",
    "name": "Anubis",
    "number": "100",
    "breedingPower": 570,
    "rarity": 10,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 5,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Baphomet",
    "bpClass": "baphomet",
    "name": "Incineram",
    "number": "040",
    "breedingPower": 590,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Fire",
      "Dark"
    ],
    "order": 6,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Baphomet_Dark",
    "bpClass": "baphomet_dark",
    "name": "Incineram Noct",
    "number": "040B",
    "breedingPower": 580,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 7,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Bastet",
    "bpClass": "bastet",
    "name": "Mau",
    "number": "024",
    "breedingPower": 1480,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 8,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Bastet_Ice",
    "bpClass": "bastet_ice",
    "name": "Mau Cryst",
    "number": "024B",
    "breedingPower": 1440,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 9,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Boar",
    "bpClass": "boar",
    "name": "Rushoar",
    "number": "020",
    "breedingPower": 1130,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 10,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Carbunclo",
    "bpClass": "carbunclo",
    "name": "Lifmunk",
    "number": "004",
    "breedingPower": 1430,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 11,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "ColorfulBird",
    "bpClass": "colorfulbird",
    "name": "Tocotoco",
    "number": "027",
    "breedingPower": 1340,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 12,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Deer",
    "bpClass": "deer",
    "name": "Eikthyrdeer",
    "number": "037",
    "breedingPower": 920,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 13,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Deer_Ground",
    "bpClass": "deer_ground",
    "name": "Eikthyrdeer Terra",
    "number": "037B",
    "breedingPower": 900,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 14,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "DrillGame",
    "bpClass": "drillgame",
    "name": "Digtoise",
    "number": "067",
    "breedingPower": 850,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 15,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Eagle",
    "bpClass": "eagle",
    "name": "Galeclaw",
    "number": "047",
    "breedingPower": 1030,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 16,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "ElecPanda",
    "bpClass": "elecpanda",
    "name": "Grizzbolt",
    "number": "103",
    "breedingPower": 200,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Electric"
    ],
    "order": 17,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Ganesha",
    "bpClass": "ganesha",
    "name": "Teafant",
    "number": "016",
    "breedingPower": 1490,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 18,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Garm",
    "bpClass": "garm",
    "name": "Direhowl",
    "number": "026",
    "breedingPower": 1060,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 19,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Gorilla",
    "bpClass": "gorilla",
    "name": "Gorirat",
    "number": "049",
    "breedingPower": 1040,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 20,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Gorilla_Ground",
    "bpClass": "gorilla_ground",
    "name": "Gorirat Terra",
    "number": "049B",
    "breedingPower": 1030,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 21,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Hedgehog",
    "bpClass": "hedgehog",
    "name": "Jolthog",
    "number": "012",
    "breedingPower": 1370,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Electric"
    ],
    "order": 22,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Hedgehog_Ice",
    "bpClass": "hedgehog_ice",
    "name": "Jolthog Cryst",
    "number": "012B",
    "breedingPower": 1360,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 23,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Kirin",
    "bpClass": "kirin",
    "name": "Univolt",
    "number": "056",
    "breedingPower": 680,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Electric"
    ],
    "order": 24,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Kitsunebi",
    "bpClass": "kitsunebi",
    "name": "Foxparks",
    "number": "005",
    "breedingPower": 1400,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 25,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "LittleBriarRose",
    "bpClass": "littlebriarrose",
    "name": "Bristla",
    "number": "030",
    "breedingPower": 1320,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 26,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Mutant",
    "bpClass": "mutant",
    "name": "Lunaris",
    "number": "063",
    "breedingPower": 1110,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 27,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Penguin",
    "bpClass": "penguin",
    "name": "Pengullet",
    "number": "010",
    "breedingPower": 1350,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Ice"
    ],
    "order": 28,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Penguin_Electric",
    "bpClass": "penguin_electric",
    "name": "Pengullet Lux",
    "number": "010B",
    "breedingPower": 1310,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Electric"
    ],
    "order": 29,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "RaijinDaughter",
    "bpClass": "raijindaughter",
    "name": "Dazzi",
    "number": "062",
    "breedingPower": 1210,
    "rarity": 2,
    "maleProbability": 20,
    "elements": [
      "Electric"
    ],
    "order": 30,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "SharkKid",
    "bpClass": "sharkkid",
    "name": "Gobfin",
    "number": "031",
    "breedingPower": 1090,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 31,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "SharkKid_Fire",
    "bpClass": "sharkkid_fire",
    "name": "Gobfin Ignis",
    "number": "031B",
    "breedingPower": 1100,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 32,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "SheepBall",
    "bpClass": "sheepball",
    "name": "Lamball",
    "number": "001",
    "breedingPower": 1470,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 33,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Umihebi",
    "bpClass": "umihebi",
    "name": "Jormuntide",
    "number": "101",
    "breedingPower": 310,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Dragon",
      "Water"
    ],
    "order": 34,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Umihebi_Fire",
    "bpClass": "umihebi_fire",
    "name": "Jormuntide Ignis",
    "number": "101B",
    "breedingPower": 315,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Dragon",
      "Fire"
    ],
    "order": 35,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Werewolf",
    "bpClass": "werewolf",
    "name": "Loupmoon",
    "number": "046",
    "breedingPower": 950,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 36,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "WindChimes",
    "bpClass": "windchimes",
    "name": "Hangyu",
    "number": "032",
    "breedingPower": 1420,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 37,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "WindChimes_Ice",
    "bpClass": "windchimes_ice",
    "name": "Hangyu Cryst",
    "number": "032B",
    "breedingPower": 1422,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 38,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Suzaku",
    "bpClass": "suzaku",
    "name": "Suzaku",
    "number": "102",
    "breedingPower": 50,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 39,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Suzaku_Water",
    "bpClass": "suzaku_water",
    "name": "Suzaku Aqua",
    "number": "102B",
    "breedingPower": 30,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 40,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "FireKirin",
    "bpClass": "firekirin",
    "name": "Pyrin",
    "number": "058",
    "breedingPower": 360,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 41,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FireKirin_Dark",
    "bpClass": "firekirin_dark",
    "name": "Pyrin Noct",
    "number": "058B",
    "breedingPower": 240,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Fire",
      "Dark"
    ],
    "order": 42,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "FairyDragon",
    "bpClass": "fairydragon",
    "name": "Elphidran",
    "number": "080",
    "breedingPower": 540,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Dragon"
    ],
    "order": 43,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FairyDragon_Water",
    "bpClass": "fairydragon_water",
    "name": "Elphidran Aqua",
    "number": "080B",
    "breedingPower": 530,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Dragon",
      "Water"
    ],
    "order": 44,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "SweetsSheep",
    "bpClass": "sweetssheep",
    "name": "Woolipop",
    "number": "034",
    "breedingPower": 1190,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 45,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "WhiteTiger",
    "bpClass": "whitetiger",
    "name": "Cryolinx",
    "number": "083",
    "breedingPower": 130,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 46,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Alpaca",
    "bpClass": "alpaca",
    "name": "Melpaca",
    "number": "036",
    "breedingPower": 890,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 47,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Serpent",
    "bpClass": "serpent",
    "name": "Surfent",
    "number": "065",
    "breedingPower": 560,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 48,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Serpent_Ground",
    "bpClass": "serpent_ground",
    "name": "Surfent Terra",
    "number": "065B",
    "breedingPower": 550,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 49,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "DarkCrow",
    "bpClass": "darkcrow",
    "name": "Cawgnito",
    "number": "044",
    "breedingPower": 1080,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 50,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "BlueDragon",
    "bpClass": "bluedragon",
    "name": "Azurobe",
    "number": "082",
    "breedingPower": 500,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Dragon"
    ],
    "order": 51,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "BlueDragon_Ice",
    "bpClass": "bluedragon_ice",
    "name": "Azurobe Cryst",
    "number": "082B",
    "breedingPower": 480,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Ice",
      "Dragon"
    ],
    "order": 52,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "PinkCat",
    "bpClass": "pinkcat",
    "name": "Cattiva",
    "number": "002",
    "breedingPower": 1460,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 53,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "NegativeKoala",
    "bpClass": "negativekoala",
    "name": "Depresso",
    "number": "017",
    "breedingPower": 1380,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 54,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FengyunDeeper",
    "bpClass": "fengyundeeper",
    "name": "Fenglope",
    "number": "093",
    "breedingPower": 980,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 55,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "VolcanicMonster",
    "bpClass": "volcanicmonster",
    "name": "Reptyro",
    "number": "088",
    "breedingPower": 320,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Fire",
      "Ground"
    ],
    "order": 56,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "VolcanicMonster_Ice",
    "bpClass": "volcanicmonster_ice",
    "name": "Reptyro Cryst",
    "number": "088B",
    "breedingPower": 230,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Ice",
      "Ground"
    ],
    "order": 57,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "GhostBeast",
    "bpClass": "ghostbeast",
    "name": "Maraith",
    "number": "066",
    "breedingPower": 1150,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 58,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "RobinHood",
    "bpClass": "robinhood",
    "name": "Robinquill",
    "number": "048",
    "breedingPower": 1020,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 59,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "RobinHood_Ground",
    "bpClass": "robinhood_ground",
    "name": "Robinquill Terra",
    "number": "048B",
    "breedingPower": 1000,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Grass",
      "Ground"
    ],
    "order": 60,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "LazyDragon",
    "bpClass": "lazydragon",
    "name": "Relaxaurus",
    "number": "085",
    "breedingPower": 280,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Dragon",
      "Water"
    ],
    "order": 61,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "LazyDragon_Electric",
    "bpClass": "lazydragon_electric",
    "name": "Relaxaurus Lux",
    "number": "085B",
    "breedingPower": 270,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Dragon",
      "Electric"
    ],
    "order": 62,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "AmaterasuWolf",
    "bpClass": "amaterasuwolf",
    "name": "Kitsun",
    "number": "061",
    "breedingPower": 830,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 63,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "LizardMan",
    "bpClass": "lizardman",
    "name": "Leezpunk",
    "number": "045",
    "breedingPower": 1120,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 64,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "LizardMan_Fire",
    "bpClass": "lizardman_fire",
    "name": "Leezpunk Ignis",
    "number": "045B",
    "breedingPower": 1140,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 65,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "BluePlatypus",
    "bpClass": "blueplatypus",
    "name": "Fuack",
    "number": "006",
    "breedingPower": 1330,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 66,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "BluePlatypus_Fire",
    "bpClass": "blueplatypus_fire",
    "name": "Fuack Ignis",
    "number": "006B",
    "breedingPower": 1290,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Fire"
    ],
    "order": 67,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "BirdDragon",
    "bpClass": "birddragon",
    "name": "Vanwyrm",
    "number": "071",
    "breedingPower": 660,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Fire",
      "Dark"
    ],
    "order": 68,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "BirdDragon_Ice",
    "bpClass": "birddragon_ice",
    "name": "Vanwyrm Cryst",
    "number": "071B",
    "breedingPower": 620,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Ice",
      "Dark"
    ],
    "order": 69,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "ChickenPal",
    "bpClass": "chickenpal",
    "name": "Chikipi",
    "number": "003",
    "breedingPower": 1500,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 70,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FlowerDinosaur",
    "bpClass": "flowerdinosaur",
    "name": "Dinossom",
    "number": "064",
    "breedingPower": 820,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Grass",
      "Dragon"
    ],
    "order": 71,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FlowerDinosaur_Electric",
    "bpClass": "flowerdinosaur_electric",
    "name": "Dinossom Lux",
    "number": "064B",
    "breedingPower": 810,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Electric",
      "Dragon"
    ],
    "order": 72,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "ElecCat",
    "bpClass": "eleccat",
    "name": "Sparkit",
    "number": "007",
    "breedingPower": 1410,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Electric"
    ],
    "order": 73,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "IceHorse",
    "bpClass": "icehorse",
    "name": "Frostallion",
    "number": "110",
    "breedingPower": 120,
    "rarity": 20,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 74,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "IceHorse_Dark",
    "bpClass": "icehorse_dark",
    "name": "Frostallion Noct",
    "number": "110B",
    "breedingPower": 100,
    "rarity": 20,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 75,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "GrassMammoth",
    "bpClass": "grassmammoth",
    "name": "Mammorest",
    "number": "090",
    "breedingPower": 300,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Grass",
      "Ground"
    ],
    "order": 76,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "GrassMammoth_Ice",
    "bpClass": "grassmammoth_ice",
    "name": "Mammorest Cryst",
    "number": "090B",
    "breedingPower": 290,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Ice",
      "Ground"
    ],
    "order": 77,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "CatVampire",
    "bpClass": "catvampire",
    "name": "Felbat",
    "number": "094",
    "breedingPower": 1010,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 78,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "SakuraSaurus",
    "bpClass": "sakurasaurus",
    "name": "Broncherry",
    "number": "086",
    "breedingPower": 860,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 79,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "SakuraSaurus_Water",
    "bpClass": "sakurasaurus_water",
    "name": "Broncherry Aqua",
    "number": "086B",
    "breedingPower": 840,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Grass",
      "Water"
    ],
    "order": 80,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Horus",
    "bpClass": "horus",
    "name": "Faleris",
    "number": "105",
    "breedingPower": 370,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 81,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "KingBahamut",
    "bpClass": "kingbahamut",
    "name": "Blazamut",
    "number": "096",
    "breedingPower": 10,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 82,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "KingBahamut_Dragon",
    "bpClass": "kingbahamut_dragon",
    "name": "Blazamut Ryu",
    "number": "096B",
    "breedingPower": 9,
    "rarity": 10,
    "maleProbability": 50,
    "elements": [
      "Dragon",
      "Fire"
    ],
    "order": 83,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "BerryGoat",
    "bpClass": "berrygoat",
    "name": "Caprity",
    "number": "035",
    "breedingPower": 930,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 84,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "IceDeer",
    "bpClass": "icedeer",
    "name": "Reindrix",
    "number": "059",
    "breedingPower": 880,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 85,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "BlackGriffon",
    "bpClass": "blackgriffon",
    "name": "Shadowbeak",
    "number": "107",
    "breedingPower": 60,
    "rarity": 10,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 86,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "WhiteMoth",
    "bpClass": "whitemoth",
    "name": "Sibelyx",
    "number": "079",
    "breedingPower": 450,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 87,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "CuteFox",
    "bpClass": "cutefox",
    "name": "Vixy",
    "number": "014",
    "breedingPower": 1450,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 88,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FoxMage",
    "bpClass": "foxmage",
    "name": "Wixen",
    "number": "076",
    "breedingPower": 1160,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 89,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FoxMage_Dark",
    "bpClass": "foxmage_dark",
    "name": "Wixen Noct",
    "number": "076B",
    "breedingPower": 1150,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Fire",
      "Dark"
    ],
    "order": 90,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "PinkLizard",
    "bpClass": "pinklizard",
    "name": "Lovander",
    "number": "069",
    "breedingPower": 940,
    "rarity": 5,
    "maleProbability": 30,
    "elements": [
      "Neutral"
    ],
    "order": 91,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "WizardOwl",
    "bpClass": "wizardowl",
    "name": "Hoocrates",
    "number": "015",
    "breedingPower": 1390,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 92,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Kelpie",
    "bpClass": "kelpie",
    "name": "Kelpsea",
    "number": "081",
    "breedingPower": 1260,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 93,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Kelpie_Fire",
    "bpClass": "kelpie_fire",
    "name": "Kelpsea Ignis",
    "number": "081B",
    "breedingPower": 1270,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 94,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "NegativeOctopus",
    "bpClass": "negativeoctopus",
    "name": "Killamari",
    "number": "023",
    "breedingPower": 1290,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Dark",
      "Water"
    ],
    "order": 95,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "NegativeOctopus_Neutral",
    "bpClass": "negativeoctopus_neutral",
    "name": "Killamari Primo",
    "number": "023B",
    "breedingPower": 1250,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Neutral",
      "Water"
    ],
    "order": 96,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "CowPal",
    "bpClass": "cowpal",
    "name": "Mozzarina",
    "number": "029",
    "breedingPower": 910,
    "rarity": 2,
    "maleProbability": 20,
    "elements": [
      "Neutral"
    ],
    "order": 97,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Yeti",
    "bpClass": "yeti",
    "name": "Wumpo",
    "number": "091",
    "breedingPower": 460,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 98,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Yeti_Grass",
    "bpClass": "yeti_grass",
    "name": "Wumpo Botan",
    "number": "091B",
    "breedingPower": 480,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 99,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "VioletFairy",
    "bpClass": "violetfairy",
    "name": "Vaelet",
    "number": "078",
    "breedingPower": 1050,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 100,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "HawkBird",
    "bpClass": "hawkbird",
    "name": "Nitewing",
    "number": "038",
    "breedingPower": 420,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 101,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FlowerRabbit",
    "bpClass": "flowerrabbit",
    "name": "Flopie",
    "number": "028",
    "breedingPower": 1280,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 102,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "LilyQueen",
    "bpClass": "lilyqueen",
    "name": "Lyleen",
    "number": "104",
    "breedingPower": 250,
    "rarity": 9,
    "maleProbability": 30,
    "elements": [
      "Grass"
    ],
    "order": 103,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "LilyQueen_Dark",
    "bpClass": "lilyqueen_dark",
    "name": "Lyleen Noct",
    "number": "104B",
    "breedingPower": 210,
    "rarity": 10,
    "maleProbability": 30,
    "elements": [
      "Dark"
    ],
    "order": 104,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "QueenBee",
    "bpClass": "queenbee",
    "name": "Elizabee",
    "number": "051",
    "breedingPower": 330,
    "rarity": 8,
    "maleProbability": 10,
    "elements": [
      "Grass"
    ],
    "order": 105,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "SoldierBee",
    "bpClass": "soldierbee",
    "name": "Beegarde",
    "number": "050",
    "breedingPower": 1070,
    "rarity": 4,
    "maleProbability": 10,
    "elements": [
      "Grass"
    ],
    "order": 106,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "CatBat",
    "bpClass": "catbat",
    "name": "Tombat",
    "number": "068",
    "breedingPower": 750,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 107,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "GrassPanda",
    "bpClass": "grasspanda",
    "name": "Mossanda",
    "number": "033",
    "breedingPower": 430,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 108,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "GrassPanda_Electric",
    "bpClass": "grasspanda_electric",
    "name": "Mossanda Lux",
    "number": "033B",
    "breedingPower": 390,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Electric"
    ],
    "order": 109,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "FlameBuffalo",
    "bpClass": "flamebuffalo",
    "name": "Arsox",
    "number": "042",
    "breedingPower": 790,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 110,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "ThunderDog",
    "bpClass": "thunderdog",
    "name": "Rayhound",
    "number": "060",
    "breedingPower": 740,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Electric"
    ],
    "order": 111,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "CuteMole",
    "bpClass": "cutemole",
    "name": "Fuddler",
    "number": "022",
    "breedingPower": 1220,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 112,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "BlackMetalDragon",
    "bpClass": "blackmetaldragon",
    "name": "Astegon",
    "number": "098",
    "breedingPower": 150,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Dragon",
      "Dark"
    ],
    "order": 113,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "GrassRabbitMan",
    "bpClass": "grassrabbitman",
    "name": "Verdash",
    "number": "077",
    "breedingPower": 990,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 114,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "IceFox",
    "bpClass": "icefox",
    "name": "Foxcicle",
    "number": "057",
    "breedingPower": 760,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 115,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "JetDragon",
    "bpClass": "jetdragon",
    "name": "Jetragon",
    "number": "111",
    "breedingPower": 90,
    "rarity": 20,
    "maleProbability": 50,
    "elements": [
      "Dragon"
    ],
    "order": 116,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "DreamDemon",
    "bpClass": "dreamdemon",
    "name": "Daedream",
    "number": "019",
    "breedingPower": 1230,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 117,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Monkey",
    "bpClass": "monkey",
    "name": "Tanzee",
    "number": "008",
    "breedingPower": 1250,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 118,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Manticore",
    "bpClass": "manticore",
    "name": "Blazehowl",
    "number": "084",
    "breedingPower": 710,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 119,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Manticore_Dark",
    "bpClass": "manticore_dark",
    "name": "Blazehowl Noct",
    "number": "084B",
    "breedingPower": 670,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Fire",
      "Dark"
    ],
    "order": 120,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "KingAlpaca",
    "bpClass": "kingalpaca",
    "name": "Kingpaca",
    "number": "089",
    "breedingPower": 470,
    "rarity": 8,
    "maleProbability": 90,
    "elements": [
      "Neutral"
    ],
    "order": 121,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "KingAlpaca_Ice",
    "bpClass": "kingalpaca_ice",
    "name": "Kingpaca Cryst",
    "number": "089B",
    "breedingPower": 440,
    "rarity": 9,
    "maleProbability": 90,
    "elements": [
      "Ice"
    ],
    "order": 122,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "PlantSlime",
    "bpClass": "plantslime",
    "name": "Gumoss",
    "number": "013",
    "breedingPower": 1240,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Grass",
      "Ground"
    ],
    "order": 123,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "MopBaby",
    "bpClass": "mopbaby",
    "name": "Swee",
    "number": "053",
    "breedingPower": 1300,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 124,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "MopKing",
    "bpClass": "mopking",
    "name": "Sweepa",
    "number": "054",
    "breedingPower": 410,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 125,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "CatMage",
    "bpClass": "catmage",
    "name": "Katress",
    "number": "075",
    "breedingPower": 700,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 126,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "CatMage_Fire",
    "bpClass": "catmage_fire",
    "name": "Katress Ignis",
    "number": "075B",
    "breedingPower": 690,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Dark",
      "Fire"
    ],
    "order": 127,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "PinkRabbit",
    "bpClass": "pinkrabbit",
    "name": "Ribbuny",
    "number": "039",
    "breedingPower": 1310,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 128,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "ThunderBird",
    "bpClass": "thunderbird",
    "name": "Beakon",
    "number": "073",
    "breedingPower": 220,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Electric"
    ],
    "order": 129,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "HerculesBeetle",
    "bpClass": "herculesbeetle",
    "name": "Warsect",
    "number": "092",
    "breedingPower": 340,
    "rarity": 8,
    "maleProbability": 85,
    "elements": [
      "Ground",
      "Grass"
    ],
    "order": 130,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "HerculesBeetle_Ground",
    "bpClass": "herculesbeetle_ground",
    "name": "Warsect Terra",
    "number": "092B",
    "breedingPower": 275,
    "rarity": 9,
    "maleProbability": 85,
    "elements": [
      "Ground"
    ],
    "order": 131,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "SaintCentaur",
    "bpClass": "saintcentaur",
    "name": "Paladius",
    "number": "108",
    "breedingPower": 80,
    "rarity": 20,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 132,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "NightFox",
    "bpClass": "nightfox",
    "name": "Nox",
    "number": "021",
    "breedingPower": 1180,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 133,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "CaptainPenguin",
    "bpClass": "captainpenguin",
    "name": "Penking",
    "number": "011",
    "breedingPower": 520,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Ice"
    ],
    "order": 134,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "CaptainPenguin_Black",
    "bpClass": "captainpenguin_black",
    "name": "Penking Lux",
    "number": "011B",
    "breedingPower": 490,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Electric"
    ],
    "order": 135,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "WeaselDragon",
    "bpClass": "weaseldragon",
    "name": "Chillet",
    "number": "055",
    "breedingPower": 800,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Ice",
      "Dragon"
    ],
    "order": 136,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "WeaselDragon_Fire",
    "bpClass": "weaseldragon_fire",
    "name": "Chillet Ignis",
    "number": "055B",
    "breedingPower": 790,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Fire",
      "Dragon"
    ],
    "order": 137,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "SkyDragon",
    "bpClass": "skydragon",
    "name": "Quivern",
    "number": "095",
    "breedingPower": 350,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Dragon"
    ],
    "order": 138,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "SkyDragon_Grass",
    "bpClass": "skydragon_grass",
    "name": "Quivern Botan",
    "number": "095B",
    "breedingPower": 340,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Dragon",
      "Grass"
    ],
    "order": 139,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "HadesBird",
    "bpClass": "hadesbird",
    "name": "Helzephyr",
    "number": "097",
    "breedingPower": 190,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 140,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "HadesBird_Electric",
    "bpClass": "hadesbird_electric",
    "name": "Helzephyr Lux",
    "number": "097B",
    "breedingPower": 180,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Dark",
      "Electric"
    ],
    "order": 141,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "RedArmorBird",
    "bpClass": "redarmorbird",
    "name": "Ragnahawk",
    "number": "074",
    "breedingPower": 380,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 142,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Ronin",
    "bpClass": "ronin",
    "name": "Bushi",
    "number": "072",
    "breedingPower": 640,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 143,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Ronin_Dark",
    "bpClass": "ronin_dark",
    "name": "Bushi Noct",
    "number": "072B",
    "breedingPower": 650,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Fire",
      "Dark"
    ],
    "order": 144,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "FlyingManta",
    "bpClass": "flyingmanta",
    "name": "Celaray",
    "number": "025",
    "breedingPower": 870,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 145,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FlyingManta_Thunder",
    "bpClass": "flyingmanta_thunder",
    "name": "Celaray Lux",
    "number": "025B",
    "breedingPower": 830,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Electric"
    ],
    "order": 146,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "BlackCentaur",
    "bpClass": "blackcentaur",
    "name": "Necromus",
    "number": "109",
    "breedingPower": 70,
    "rarity": 20,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 147,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "FlowerDoll",
    "bpClass": "flowerdoll",
    "name": "Petallia",
    "number": "087",
    "breedingPower": 780,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 148,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "NaughtyCat",
    "bpClass": "naughtycat",
    "name": "Grintale",
    "number": "052",
    "breedingPower": 510,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 149,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "CuteButterfly",
    "bpClass": "cutebutterfly",
    "name": "Cinnamoth",
    "number": "041",
    "breedingPower": 490,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 150,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "DarkScorpion",
    "bpClass": "darkscorpion",
    "name": "Menasting",
    "number": "099",
    "breedingPower": 260,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Dark",
      "Ground"
    ],
    "order": 151,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "DarkScorpion_Ground",
    "bpClass": "darkscorpion_ground",
    "name": "Menasting Terra",
    "number": "099B",
    "breedingPower": 250,
    "rarity": 10,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 152,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "ThunderDragonMan",
    "bpClass": "thunderdragonman",
    "name": "Orserk",
    "number": "106",
    "breedingPower": 140,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Dragon",
      "Electric"
    ],
    "order": 153,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "WoolFox",
    "bpClass": "woolfox",
    "name": "Cremis",
    "number": "018",
    "breedingPower": 1455,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 154,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "LazyCatfish",
    "bpClass": "lazycatfish",
    "name": "Dumud",
    "number": "043",
    "breedingPower": 895,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Ground",
      "Water"
    ],
    "order": 155,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "LazyCatfish_Gold",
    "bpClass": "lazycatfish_gold",
    "name": "Dumud Gild",
    "number": "043B",
    "breedingPower": 855,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Ground",
      "Water"
    ],
    "order": 156,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "LavaGirl",
    "bpClass": "lavagirl",
    "name": "Flambelle",
    "number": "070",
    "breedingPower": 1405,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 157,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FlameBambi",
    "bpClass": "flamebambi",
    "name": "Rooby",
    "number": "009",
    "breedingPower": 1155,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 158,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "NightLady",
    "bpClass": "nightlady",
    "name": "Bellanoir",
    "number": "112",
    "breedingPower": 1,
    "rarity": 20,
    "maleProbability": 10,
    "elements": [
      "Dark"
    ],
    "order": 159,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "NightLady_Dark",
    "bpClass": "nightlady_dark",
    "name": "Bellanoir Libero",
    "number": "112B",
    "breedingPower": 1,
    "rarity": 20,
    "maleProbability": 10,
    "elements": [
      "Dark"
    ],
    "order": 160,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "MoonQueen",
    "bpClass": "moonqueen",
    "name": "Selyne",
    "number": "113",
    "breedingPower": 345,
    "rarity": 9,
    "maleProbability": 20,
    "elements": [
      "Dark",
      "Neutral"
    ],
    "order": 161,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "KendoFrog",
    "bpClass": "kendofrog",
    "name": "Croajiro",
    "number": "114",
    "breedingPower": 795,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 162,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "KendoFrog_Dark",
    "bpClass": "kendofrog_dark",
    "name": "Croajiro Noct",
    "number": "114B",
    "breedingPower": 765,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Dark"
    ],
    "order": 163,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "LeafPrincess",
    "bpClass": "leafprincess",
    "name": "Lullu",
    "number": "115",
    "breedingPower": 905,
    "rarity": 4,
    "maleProbability": 30,
    "elements": [
      "Grass"
    ],
    "order": 164,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "MushroomDragon",
    "bpClass": "mushroomdragon",
    "name": "Shroomer",
    "number": "116",
    "breedingPower": 720,
    "rarity": 4,
    "maleProbability": 55,
    "elements": [
      "Grass"
    ],
    "order": 165,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "MushroomDragon_Dark",
    "bpClass": "mushroomdragon_dark",
    "name": "Shroomer Noct",
    "number": "116B",
    "breedingPower": 730,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Grass",
      "Dark"
    ],
    "order": 166,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "SmallArmadillo",
    "bpClass": "smallarmadillo",
    "name": "Kikit",
    "number": "117",
    "breedingPower": 1125,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 167,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "CandleGhost",
    "bpClass": "candleghost",
    "name": "Sootseer",
    "number": "118",
    "breedingPower": 545,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Dark",
      "Fire"
    ],
    "order": 168,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "ScorpionMan",
    "bpClass": "scorpionman",
    "name": "Prixter",
    "number": "119",
    "breedingPower": 355,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Dark",
      "Ground"
    ],
    "order": 169,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "WingGolem",
    "bpClass": "winggolem",
    "name": "Knocklem",
    "number": "120",
    "breedingPower": 265,
    "rarity": 9,
    "maleProbability": 70,
    "elements": [
      "Ground"
    ],
    "order": 170,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "GuardianDog",
    "bpClass": "guardiandog",
    "name": "Yakumo",
    "number": "121",
    "breedingPower": 945,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 171,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "SifuDog",
    "bpClass": "sifudog",
    "name": "Dogen",
    "number": "122",
    "breedingPower": 665,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 172,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "FeatherOstrich",
    "bpClass": "featherostrich",
    "name": "Dazemu",
    "number": "123",
    "breedingPower": 675,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 173,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "MimicDog",
    "bpClass": "mimicdog",
    "name": "Mimog",
    "number": "124",
    "breedingPower": 1200,
    "rarity": 7,
    "maleProbability": 80,
    "elements": [
      "Neutral"
    ],
    "order": 174,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "DarkAlien",
    "bpClass": "darkalien",
    "name": "Xenovader",
    "number": "125",
    "breedingPower": 465,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 175,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "WhiteAlienDragon",
    "bpClass": "whitealiendragon",
    "name": "Xenogard",
    "number": "126",
    "breedingPower": 435,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Dragon"
    ],
    "order": 176,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "DarkMechaDragon",
    "bpClass": "darkmechadragon",
    "name": "Xenolord",
    "number": "127",
    "breedingPower": 265,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Dark",
      "Dragon"
    ],
    "order": 177,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "GhostRabbit",
    "bpClass": "ghostrabbit",
    "name": "Nitemary",
    "number": "128",
    "breedingPower": 705,
    "rarity": 6,
    "maleProbability": 40,
    "elements": [
      "Dark"
    ],
    "order": 178,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "NightBlueHorse",
    "bpClass": "nightbluehorse",
    "name": "Starryon",
    "number": "129",
    "breedingPower": 365,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 179,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "WhiteShieldDragon",
    "bpClass": "whiteshielddragon",
    "name": "Silvegis",
    "number": "130",
    "breedingPower": 215,
    "rarity": 8,
    "maleProbability": 50,
    "elements": [
      "Dragon"
    ],
    "order": 180,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "BlackPuppy",
    "bpClass": "blackpuppy",
    "name": "Smokie",
    "number": "131",
    "breedingPower": 1245,
    "rarity": 2,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 181,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "WhiteDeer",
    "bpClass": "whitedeer",
    "name": "Celesdir",
    "number": "132",
    "breedingPower": 815,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 182,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "MysteryMask",
    "bpClass": "mysterymask",
    "name": "Omascul",
    "number": "133",
    "breedingPower": 630,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 183,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "GrimGirl",
    "bpClass": "grimgirl",
    "name": "Splatterina",
    "number": "134",
    "breedingPower": 725,
    "rarity": 4,
    "maleProbability": 38,
    "elements": [
      "Dark"
    ],
    "order": 184,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "PurpleSpider",
    "bpClass": "purplespider",
    "name": "Tarantriss",
    "number": "135",
    "breedingPower": 825,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 185,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "BlueThunderHorse",
    "bpClass": "bluethunderhorse",
    "name": "Azurmane",
    "number": "136",
    "breedingPower": 400,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Electric"
    ],
    "order": 186,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "OctopusGirl",
    "bpClass": "octopusgirl",
    "name": "Gloopie",
    "number": "151",
    "breedingPower": 1195,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Dark"
    ],
    "order": 187,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "IceNarwhal",
    "bpClass": "icenarwhal",
    "name": "Whalaska",
    "number": "154",
    "breedingPower": 445,
    "rarity": 7,
    "maleProbability": 58,
    "elements": [
      "Ice",
      "Water"
    ],
    "order": 188,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "IceNarwhal_Fire",
    "bpClass": "icenarwhal_fire",
    "name": "Whalaska Ignis",
    "number": "154B",
    "breedingPower": 430,
    "rarity": 8,
    "maleProbability": 42,
    "elements": [
      "Ice",
      "Fire"
    ],
    "order": 189,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "JellyfishFairy",
    "bpClass": "jellyfishfairy",
    "name": "Jelliette",
    "number": "150",
    "breedingPower": 1385,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 190,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Kitsunebi_Ice",
    "bpClass": "kitsunebi_ice",
    "name": "Foxparks Cryst",
    "number": "005B",
    "breedingPower": 1305,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 191,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "BerryGoat_Dark",
    "bpClass": "berrygoat_dark",
    "name": "Caprity Noct",
    "number": "035B",
    "breedingPower": 855,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 192,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "PinkRabbit_Grass",
    "bpClass": "pinkrabbit_grass",
    "name": "Ribbuny Botan",
    "number": "039B",
    "breedingPower": 1205,
    "rarity": 1,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 193,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Werewolf_Ice",
    "bpClass": "werewolf_ice",
    "name": "Loupmoon Cryst",
    "number": "046B",
    "breedingPower": 805,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 194,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "AmaterasuWolf_Dark",
    "bpClass": "amaterasuwolf_dark",
    "name": "Kitsun Noct",
    "number": "061B",
    "breedingPower": 735,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 195,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "RaijinDaughter_Water",
    "bpClass": "raijindaughter_water",
    "name": "Dazzi Noct",
    "number": "062B",
    "breedingPower": 1115,
    "rarity": 2,
    "maleProbability": 20,
    "elements": [
      "Dark",
      "Electric"
    ],
    "order": 196,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "WhiteTiger_Ground",
    "bpClass": "whitetiger_ground",
    "name": "Cryolinx Terra",
    "number": "083B",
    "breedingPower": 160,
    "rarity": 7,
    "maleProbability": 50,
    "elements": [
      "Ground"
    ],
    "order": 197,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "FengyunDeeper_Electric",
    "bpClass": "fengyundeeper_electric",
    "name": "Fenglope Lux",
    "number": "093B",
    "breedingPower": 835,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Electric"
    ],
    "order": 198,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "Horus_Water",
    "bpClass": "horus_water",
    "name": "Faleris Aqua",
    "number": "105B",
    "breedingPower": 245,
    "rarity": 9,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 199,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "SnowTigerBeastman",
    "bpClass": "snowtigerbeastman",
    "name": "Bastigor",
    "number": "137",
    "breedingPower": 170,
    "rarity": 8,
    "maleProbability": 60,
    "elements": [
      "Ice"
    ],
    "order": 200,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "GhostAnglerfish",
    "bpClass": "ghostanglerfish",
    "name": "Ghangler",
    "number": "153",
    "breedingPower": 525,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Dark",
      "Water"
    ],
    "order": 201,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "GhostAnglerfish_Fire",
    "bpClass": "ghostanglerfish_fire",
    "name": "Ghangler Ignis",
    "number": "153B",
    "breedingPower": 505,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Fire",
      "Water"
    ],
    "order": 202,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "IceWitch",
    "bpClass": "icewitch",
    "name": "Icelyn",
    "number": "142",
    "breedingPower": 605,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 203,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "LeafMomonga",
    "bpClass": "leafmomonga",
    "name": "Herbil",
    "number": "141",
    "breedingPower": 1445,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Grass",
      "Neutral"
    ],
    "order": 204,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "IceCrocodile",
    "bpClass": "icecrocodile",
    "name": "Munchill",
    "number": "146",
    "breedingPower": 1335,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Ice",
      "Water"
    ],
    "order": 205,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "StuffedShark",
    "bpClass": "stuffedshark",
    "name": "Finsider",
    "number": "152",
    "breedingPower": 1295,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 206,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "StuffedShark_Fire",
    "bpClass": "stuffedshark_fire",
    "name": "Finsider Ignis",
    "number": "152B",
    "breedingPower": 1255,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Fire"
    ],
    "order": 207,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "IceSeal",
    "bpClass": "iceseal",
    "name": "Polapup",
    "number": "147",
    "breedingPower": 745,
    "rarity": 5,
    "maleProbability": 50,
    "elements": [
      "Ice",
      "Water"
    ],
    "order": 208,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "Plesiosaur",
    "bpClass": "plesiosaur",
    "name": "Braloha",
    "number": "145",
    "breedingPower": 335,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Grass",
      "Ground"
    ],
    "order": 209,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "TropicalOstrich",
    "bpClass": "tropicalostrich",
    "name": "Palumba",
    "number": "144",
    "breedingPower": 455,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 210,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "SnowPeafowl",
    "bpClass": "snowpeafowl",
    "name": "Frostplume",
    "number": "143",
    "breedingPower": 655,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Ice"
    ],
    "order": 211,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "JellyfishGhost",
    "bpClass": "jellyfishghost",
    "name": "Jellroy",
    "number": "149",
    "breedingPower": 1395,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Water",
      "Dark"
    ],
    "order": 212,
    "isBoss": false,
    "regularEligible": true
  },
  {
    "id": "PoseidonOrca",
    "bpClass": "poseidonorca",
    "name": "Neptilius",
    "number": "155",
    "breedingPower": 90,
    "rarity": 20,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 213,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaMonster001",
    "bpClass": "yakushimamonster001",
    "name": "Green Slime",
    "number": null,
    "breedingPower": 1430,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Grass"
    ],
    "order": 214,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaMonster001_Blue",
    "bpClass": "yakushimamonster001_blue",
    "name": "Blue Slime",
    "number": null,
    "breedingPower": 1490,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Water"
    ],
    "order": 215,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaMonster001_Red",
    "bpClass": "yakushimamonster001_red",
    "name": "Red Slime",
    "number": null,
    "breedingPower": 1405,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Fire"
    ],
    "order": 216,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaMonster001_Purple",
    "bpClass": "yakushimamonster001_purple",
    "name": "Purple Slime",
    "number": null,
    "breedingPower": 1390,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 217,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaMonster001_Pink",
    "bpClass": "yakushimamonster001_pink",
    "name": "Illuminant Slime",
    "number": null,
    "breedingPower": 1500,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 218,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaMonster001_Rainbow",
    "bpClass": "yakushimamonster001_rainbow",
    "name": "Rainbow Slime",
    "number": null,
    "breedingPower": 1320,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 219,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaMonster002",
    "bpClass": "yakushimamonster002",
    "name": "Enchanted Sword",
    "number": null,
    "breedingPower": 1380,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 220,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaMonster003",
    "bpClass": "yakushimamonster003",
    "name": "Cave Bat",
    "number": null,
    "breedingPower": 1340,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 221,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaMonster003_Purple",
    "bpClass": "yakushimamonster003_purple",
    "name": "Illuminant Bat",
    "number": null,
    "breedingPower": 1250,
    "rarity": 4,
    "maleProbability": 50,
    "elements": [
      "Neutral"
    ],
    "order": 222,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaBoss001",
    "bpClass": "yakushimaboss001",
    "name": "Eye of Cthulhu",
    "number": null,
    "breedingPower": 1380,
    "rarity": 6,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 223,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "YakushimaBoss001_Small",
    "bpClass": "yakushimaboss001_small",
    "name": "Demon Eye",
    "number": null,
    "breedingPower": 1390,
    "rarity": 3,
    "maleProbability": 50,
    "elements": [
      "Dark"
    ],
    "order": 224,
    "isBoss": false,
    "regularEligible": false
  },
  {
    "id": "RAID_YakushimaBoss001_Green",
    "bpClass": "yakushimaboss001_green",
    "name": "True Eye of Cthulhu",
    "number": null,
    "breedingPower": 9999,
    "rarity": 10,
    "maleProbability": 50,
    "elements": [],
    "order": 225,
    "isBoss": true,
    "regularEligible": false
  }
];

export const palworldSpecialCombos: PalworldSpecialCombo[] = [
  {
    "parentAId": "TentacleTurtle_Ground",
    "parentBId": "TentacleTurtle_Ground",
    "childId": "TentacleTurtle_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "DrillGame",
    "parentBId": "TentacleTurtle",
    "childId": "TentacleTurtle_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Baphomet",
    "parentBId": "GhostBeast",
    "childId": "Baphomet_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Baphomet_Dark",
    "parentBId": "Baphomet_Dark",
    "childId": "Baphomet_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Bastet",
    "parentBId": "Penguin",
    "childId": "Bastet_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Bastet_Ice",
    "parentBId": "Bastet_Ice",
    "childId": "Bastet_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Deer",
    "parentBId": "WindChimes",
    "childId": "Deer_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Deer_Ground",
    "parentBId": "Deer_Ground",
    "childId": "Deer_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "ElecPanda",
    "parentBId": "ElecPanda",
    "childId": "ElecPanda",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "GrassPanda",
    "parentBId": "ThunderDog",
    "childId": "ElecPanda",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Gorilla",
    "parentBId": "SmallArmadillo",
    "childId": "Gorilla_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Gorilla_Ground",
    "parentBId": "Gorilla_Ground",
    "childId": "Gorilla_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Hedgehog",
    "parentBId": "Penguin",
    "childId": "Hedgehog_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Hedgehog_Ice",
    "parentBId": "Hedgehog_Ice",
    "childId": "Hedgehog_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Penguin_Electric",
    "parentBId": "Penguin_Electric",
    "childId": "Penguin_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "ElecCat",
    "parentBId": "Penguin",
    "childId": "Penguin_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "SharkKid_Fire",
    "parentBId": "SharkKid_Fire",
    "childId": "SharkKid_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FlameBambi",
    "parentBId": "SharkKid",
    "childId": "SharkKid_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Umihebi_Fire",
    "parentBId": "Umihebi_Fire",
    "childId": "Umihebi_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Manticore",
    "parentBId": "Umihebi",
    "childId": "Umihebi_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "WindChimes_Ice",
    "parentBId": "WindChimes_Ice",
    "childId": "WindChimes_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "MopBaby",
    "parentBId": "WindChimes",
    "childId": "WindChimes_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Suzaku",
    "parentBId": "Umihebi",
    "childId": "Suzaku_Water",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Suzaku_Water",
    "parentBId": "Suzaku_Water",
    "childId": "Suzaku_Water",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FireKirin_Dark",
    "parentBId": "FireKirin_Dark",
    "childId": "FireKirin_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "CatMage",
    "parentBId": "FireKirin",
    "childId": "FireKirin_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FairyDragon",
    "parentBId": "Serpent",
    "childId": "FairyDragon_Water",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FairyDragon_Water",
    "parentBId": "FairyDragon_Water",
    "childId": "FairyDragon_Water",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Serpent_Ground",
    "parentBId": "Serpent_Ground",
    "childId": "Serpent_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "LazyCatfish",
    "parentBId": "Serpent",
    "childId": "Serpent_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BlueDragon",
    "parentBId": "SnowPeafowl",
    "childId": "BlueDragon_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BlueDragon_Ice",
    "parentBId": "BlueDragon_Ice",
    "childId": "BlueDragon_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "VolcanicMonster_Ice",
    "parentBId": "VolcanicMonster_Ice",
    "childId": "VolcanicMonster_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "IceFox",
    "parentBId": "VolcanicMonster",
    "childId": "VolcanicMonster_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "RobinHood_Ground",
    "parentBId": "RobinHood_Ground",
    "childId": "RobinHood_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "CuteMole",
    "parentBId": "RobinHood",
    "childId": "RobinHood_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "LazyDragon_Electric",
    "parentBId": "LazyDragon_Electric",
    "childId": "LazyDragon_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "ElecCat",
    "parentBId": "LazyDragon",
    "childId": "LazyDragon_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "LizardMan_Fire",
    "parentBId": "LizardMan_Fire",
    "childId": "LizardMan_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "LavaGirl",
    "parentBId": "LizardMan",
    "childId": "LizardMan_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BluePlatypus",
    "parentBId": "LavaGirl",
    "childId": "BluePlatypus_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BluePlatypus_Fire",
    "parentBId": "BluePlatypus_Fire",
    "childId": "BluePlatypus_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BirdDragon",
    "parentBId": "IceFox",
    "childId": "BirdDragon_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BirdDragon_Ice",
    "parentBId": "BirdDragon_Ice",
    "childId": "BirdDragon_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FlowerDinosaur",
    "parentBId": "ThunderDog",
    "childId": "FlowerDinosaur_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FlowerDinosaur_Electric",
    "parentBId": "FlowerDinosaur_Electric",
    "childId": "FlowerDinosaur_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "IceHorse",
    "parentBId": "IceHorse",
    "childId": "IceHorse",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "IceHorse_Dark",
    "parentBId": "IceHorse_Dark",
    "childId": "IceHorse_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "HadesBird",
    "parentBId": "IceHorse",
    "childId": "IceHorse_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "GrassMammoth",
    "parentBId": "Yeti",
    "childId": "GrassMammoth_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "GrassMammoth_Ice",
    "parentBId": "GrassMammoth_Ice",
    "childId": "GrassMammoth_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BluePlatypus",
    "parentBId": "SakuraSaurus",
    "childId": "SakuraSaurus_Water",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "SakuraSaurus_Water",
    "parentBId": "SakuraSaurus_Water",
    "childId": "SakuraSaurus_Water",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Anubis",
    "parentBId": "BirdDragon",
    "childId": "Horus",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Horus",
    "parentBId": "Horus",
    "childId": "Horus",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "KingBahamut_Dragon",
    "parentBId": "KingBahamut_Dragon",
    "childId": "KingBahamut_Dragon",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "AmaterasuWolf",
    "parentBId": "BlackMetalDragon",
    "childId": "BlackGriffon",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BlackGriffon",
    "parentBId": "BlackGriffon",
    "childId": "BlackGriffon",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FoxMage_Dark",
    "parentBId": "FoxMage_Dark",
    "childId": "FoxMage_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "CatMage",
    "parentBId": "FoxMage",
    "childId": "FoxMage_Dark",
    "parentAGender": "male",
    "parentBGender": "female"
  },
  {
    "parentAId": "NegativeOctopus",
    "parentBId": "PinkRabbit",
    "childId": "NegativeOctopus_Neutral",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "NegativeOctopus_Neutral",
    "parentBId": "NegativeOctopus_Neutral",
    "childId": "NegativeOctopus_Neutral",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "LilyQueen",
    "parentBId": "LilyQueen",
    "childId": "LilyQueen",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FlowerDoll",
    "parentBId": "GrassPanda",
    "childId": "LilyQueen",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "LilyQueen_Dark",
    "parentBId": "LilyQueen_Dark",
    "childId": "LilyQueen_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "DarkScorpion",
    "parentBId": "LilyQueen",
    "childId": "LilyQueen_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "ElecPanda",
    "parentBId": "GrassPanda",
    "childId": "GrassPanda_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "GrassPanda_Electric",
    "parentBId": "GrassPanda_Electric",
    "childId": "GrassPanda_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "JetDragon",
    "parentBId": "JetDragon",
    "childId": "JetDragon",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "CatVampire",
    "parentBId": "Manticore",
    "childId": "Manticore_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Manticore_Dark",
    "parentBId": "Manticore_Dark",
    "childId": "Manticore_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "IceDeer",
    "parentBId": "KingAlpaca",
    "childId": "KingAlpaca_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "KingAlpaca_Ice",
    "parentBId": "KingAlpaca_Ice",
    "childId": "KingAlpaca_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "CatMage",
    "parentBId": "FoxMage",
    "childId": "CatMage_Fire",
    "parentAGender": "female",
    "parentBGender": "male"
  },
  {
    "parentAId": "CatMage_Fire",
    "parentBId": "CatMage_Fire",
    "childId": "CatMage_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "DrillGame",
    "parentBId": "HerculesBeetle",
    "childId": "HerculesBeetle_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "HerculesBeetle_Ground",
    "parentBId": "HerculesBeetle_Ground",
    "childId": "HerculesBeetle_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "SaintCentaur",
    "parentBId": "SaintCentaur",
    "childId": "SaintCentaur",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "CaptainPenguin",
    "parentBId": "ThunderDog",
    "childId": "CaptainPenguin_Black",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "CaptainPenguin_Black",
    "parentBId": "CaptainPenguin_Black",
    "childId": "CaptainPenguin_Black",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FlameBuffalo",
    "parentBId": "WeaselDragon",
    "childId": "WeaselDragon_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "WeaselDragon_Fire",
    "parentBId": "WeaselDragon_Fire",
    "childId": "WeaselDragon_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "SkyDragon_Grass",
    "parentBId": "SkyDragon_Grass",
    "childId": "SkyDragon_Grass",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "LeafPrincess",
    "parentBId": "SkyDragon",
    "childId": "SkyDragon_Grass",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "HadesBird",
    "parentBId": "ThunderBird",
    "childId": "HadesBird_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "HadesBird_Electric",
    "parentBId": "HadesBird_Electric",
    "childId": "HadesBird_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Ronin_Dark",
    "parentBId": "Ronin_Dark",
    "childId": "Ronin_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "CandleGhost",
    "parentBId": "Ronin",
    "childId": "Ronin_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FlyingManta",
    "parentBId": "Kirin",
    "childId": "FlyingManta_Thunder",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FlyingManta_Thunder",
    "parentBId": "FlyingManta_Thunder",
    "childId": "FlyingManta_Thunder",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BlackCentaur",
    "parentBId": "BlackCentaur",
    "childId": "BlackCentaur",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "DarkScorpion",
    "parentBId": "WingGolem",
    "childId": "DarkScorpion_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "DarkScorpion_Ground",
    "parentBId": "DarkScorpion_Ground",
    "childId": "DarkScorpion_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "ElecPanda",
    "parentBId": "LazyDragon",
    "childId": "ThunderDragonMan",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "ThunderDragonMan",
    "parentBId": "ThunderDragonMan",
    "childId": "ThunderDragonMan",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Deer_Ground",
    "parentBId": "LazyCatfish",
    "childId": "LazyCatfish_Gold",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "LazyCatfish_Gold",
    "parentBId": "LazyCatfish_Gold",
    "childId": "LazyCatfish_Gold",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "NightLady",
    "parentBId": "NightLady",
    "childId": "NightLady",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "NightLady",
    "parentBId": "NightLady_Dark",
    "childId": "NightLady",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "NightLady_Dark",
    "parentBId": "NightLady_Dark",
    "childId": "NightLady_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Mutant",
    "parentBId": "SaintCentaur",
    "childId": "MoonQueen",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "MoonQueen",
    "parentBId": "MoonQueen",
    "childId": "MoonQueen",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "KendoFrog",
    "parentBId": "Ronin_Dark",
    "childId": "KendoFrog_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "KendoFrog_Dark",
    "parentBId": "KendoFrog_Dark",
    "childId": "KendoFrog_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "MimicDog",
    "parentBId": "MimicDog",
    "childId": "MimicDog",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "DarkAlien",
    "parentBId": "DarkAlien",
    "childId": "DarkAlien",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "WhiteAlienDragon",
    "parentBId": "WhiteAlienDragon",
    "childId": "WhiteAlienDragon",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "DarkMechaDragon",
    "parentBId": "DarkMechaDragon",
    "childId": "DarkMechaDragon",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Deer_Ground",
    "parentBId": "GoldenHorse",
    "childId": "WhiteDeer",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "WhiteDeer",
    "parentBId": "WhiteDeer",
    "childId": "WhiteDeer",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "IceNarwhal",
    "parentBId": "WeaselDragon_Fire",
    "childId": "IceNarwhal_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "IceNarwhal_Fire",
    "parentBId": "IceNarwhal_Fire",
    "childId": "IceNarwhal_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "IceFox",
    "parentBId": "Kitsunebi",
    "childId": "Kitsunebi_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Kitsunebi_Ice",
    "parentBId": "Kitsunebi_Ice",
    "childId": "Kitsunebi_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BerryGoat",
    "parentBId": "PurpleSpider",
    "childId": "BerryGoat_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BerryGoat_Dark",
    "parentBId": "BerryGoat_Dark",
    "childId": "BerryGoat_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "LittleBriarRose",
    "parentBId": "PinkRabbit",
    "childId": "PinkRabbit_Grass",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "PinkRabbit_Grass",
    "parentBId": "PinkRabbit_Grass",
    "childId": "PinkRabbit_Grass",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "MopKing",
    "parentBId": "Werewolf",
    "childId": "Werewolf_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Werewolf_Ice",
    "parentBId": "Werewolf_Ice",
    "childId": "Werewolf_Ice",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "AmaterasuWolf",
    "parentBId": "BadCatgirl",
    "childId": "AmaterasuWolf_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "AmaterasuWolf_Dark",
    "parentBId": "AmaterasuWolf_Dark",
    "childId": "AmaterasuWolf_Dark",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "MysteryMask",
    "parentBId": "RaijinDaughter",
    "childId": "RaijinDaughter_Water",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "RaijinDaughter_Water",
    "parentBId": "RaijinDaughter_Water",
    "childId": "RaijinDaughter_Water",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FeatherOstrich",
    "parentBId": "WhiteTiger",
    "childId": "WhiteTiger_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "WhiteTiger_Ground",
    "parentBId": "WhiteTiger_Ground",
    "childId": "WhiteTiger_Ground",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "BlueThunderHorse",
    "parentBId": "FengyunDeeper",
    "childId": "FengyunDeeper_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "FengyunDeeper_Electric",
    "parentBId": "FengyunDeeper_Electric",
    "childId": "FengyunDeeper_Electric",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Horus",
    "parentBId": "Umihebi",
    "childId": "Horus_Water",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Horus_Water",
    "parentBId": "Horus_Water",
    "childId": "Horus_Water",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "Anubis",
    "parentBId": "IceHorse",
    "childId": "SnowTigerBeastman",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "SnowTigerBeastman",
    "parentBId": "SnowTigerBeastman",
    "childId": "SnowTigerBeastman",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "CandleGhost",
    "parentBId": "GhostAnglerfish",
    "childId": "GhostAnglerfish_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "GhostAnglerfish_Fire",
    "parentBId": "GhostAnglerfish_Fire",
    "childId": "GhostAnglerfish_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "SharkKid_Fire",
    "parentBId": "StuffedShark",
    "childId": "StuffedShark_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "StuffedShark_Fire",
    "parentBId": "StuffedShark_Fire",
    "childId": "StuffedShark_Fire",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "PoseidonOrca",
    "parentBId": "PoseidonOrca",
    "childId": "PoseidonOrca",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001",
    "parentBId": "YakushimaMonster001",
    "childId": "YakushimaMonster001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001",
    "parentBId": "YakushimaMonster001_Blue",
    "childId": "YakushimaMonster001_Blue",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Blue",
    "parentBId": "YakushimaMonster001_Blue",
    "childId": "YakushimaMonster001_Blue",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001",
    "parentBId": "YakushimaMonster001_Red",
    "childId": "YakushimaMonster001_Red",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Red",
    "parentBId": "YakushimaMonster001_Red",
    "childId": "YakushimaMonster001_Red",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001",
    "parentBId": "YakushimaMonster001_Purple",
    "childId": "YakushimaMonster001_Purple",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Blue",
    "parentBId": "YakushimaMonster001_Red",
    "childId": "YakushimaMonster001_Purple",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Blue",
    "parentBId": "YakushimaMonster001_Purple",
    "childId": "YakushimaMonster001_Purple",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Purple",
    "parentBId": "YakushimaMonster001_Red",
    "childId": "YakushimaMonster001_Purple",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Purple",
    "parentBId": "YakushimaMonster001_Purple",
    "childId": "YakushimaMonster001_Purple",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001",
    "parentBId": "YakushimaMonster001_Pink",
    "childId": "YakushimaMonster001_Pink",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Blue",
    "parentBId": "YakushimaMonster001_Pink",
    "childId": "YakushimaMonster001_Pink",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Pink",
    "parentBId": "YakushimaMonster001_Red",
    "childId": "YakushimaMonster001_Pink",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Pink",
    "parentBId": "YakushimaMonster001_Purple",
    "childId": "YakushimaMonster001_Pink",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Pink",
    "parentBId": "YakushimaMonster001_Pink",
    "childId": "YakushimaMonster001_Pink",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001",
    "parentBId": "YakushimaMonster001_Rainbow",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001",
    "parentBId": "YakushimaMonster003",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Blue",
    "parentBId": "YakushimaMonster001_Rainbow",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Blue",
    "parentBId": "YakushimaMonster003",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Blue",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Red",
    "parentBId": "YakushimaMonster003",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Red",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Purple",
    "parentBId": "YakushimaMonster001_Rainbow",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Pink",
    "parentBId": "YakushimaMonster001_Rainbow",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Pink",
    "parentBId": "YakushimaMonster003",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Pink",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Rainbow",
    "parentBId": "YakushimaMonster001_Red",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Rainbow",
    "parentBId": "YakushimaMonster001_Rainbow",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Rainbow",
    "parentBId": "YakushimaMonster002",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Rainbow",
    "parentBId": "YakushimaMonster003",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Rainbow",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaMonster001_Rainbow",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001",
    "parentBId": "YakushimaMonster002",
    "childId": "YakushimaMonster002",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Blue",
    "parentBId": "YakushimaMonster002",
    "childId": "YakushimaMonster002",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Red",
    "parentBId": "YakushimaMonster002",
    "childId": "YakushimaMonster002",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Purple",
    "parentBId": "YakushimaMonster002",
    "childId": "YakushimaMonster002",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Pink",
    "parentBId": "YakushimaMonster002",
    "childId": "YakushimaMonster002",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster002",
    "parentBId": "YakushimaMonster002",
    "childId": "YakushimaMonster002",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster002",
    "parentBId": "YakushimaMonster003",
    "childId": "YakushimaMonster002",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster002",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaMonster002",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster003",
    "parentBId": "YakushimaMonster003",
    "childId": "YakushimaMonster003",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Purple",
    "parentBId": "YakushimaMonster003",
    "childId": "YakushimaMonster003_Purple",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster001_Purple",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaMonster003_Purple",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster003",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaMonster003_Purple",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaMonster003_Purple",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaMonster003_Purple",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaMonster001",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaMonster001_Blue",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaMonster001_Red",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaMonster001_Purple",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaMonster001_Pink",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaMonster001_Rainbow",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaMonster002",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaMonster003",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaBoss001",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001",
    "parentBId": "YakushimaBoss001_Small",
    "childId": "YakushimaBoss001",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001_Small",
    "parentBId": "YakushimaMonster001",
    "childId": "YakushimaBoss001_Small",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001_Small",
    "parentBId": "YakushimaMonster001_Blue",
    "childId": "YakushimaBoss001_Small",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001_Small",
    "parentBId": "YakushimaMonster001_Red",
    "childId": "YakushimaBoss001_Small",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001_Small",
    "parentBId": "YakushimaMonster001_Purple",
    "childId": "YakushimaBoss001_Small",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001_Small",
    "parentBId": "YakushimaMonster001_Pink",
    "childId": "YakushimaBoss001_Small",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001_Small",
    "parentBId": "YakushimaMonster001_Rainbow",
    "childId": "YakushimaBoss001_Small",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001_Small",
    "parentBId": "YakushimaMonster002",
    "childId": "YakushimaBoss001_Small",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001_Small",
    "parentBId": "YakushimaMonster003",
    "childId": "YakushimaBoss001_Small",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001_Small",
    "parentBId": "YakushimaMonster003_Purple",
    "childId": "YakushimaBoss001_Small",
    "parentAGender": null,
    "parentBGender": null
  },
  {
    "parentAId": "YakushimaBoss001_Small",
    "parentBId": "YakushimaBoss001_Small",
    "childId": "YakushimaBoss001_Small",
    "parentAGender": null,
    "parentBGender": null
  }
];
