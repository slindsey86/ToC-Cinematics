export function createDynamicStoryTextService() {

   const dictionary: Record<string, () => string> = {
    ACTIVE_CONDUCTOR: () => "Orson Brisk",
    ACTIVE_CONDUCTOR_FLAVOR_TEXT: () => ACTIVE_CONDUCTOR_FLAVOR_TEXTS_BY_NAME["Orson Brisk"],
    CLAIMED_TRAIN_NAME: () => "ChoodLaw",
    CLAIMED_TRAIN_CONDITION: () => "95",
  };

  const service = {
    get: (key: string) => {
      try {
        return dictionary[key]?.() || null;
      } catch {
        return null;
      }
    },
    replacePlaceholders: (text: string) => {
      const rgx = /{{([A-Z._]+)}}/gi;
      return text.replace(rgx, (_, PLACEHOLDER_KEY) => service.get(PLACEHOLDER_KEY) ?? "");
    },
  };

  return service;
}

export type DynamicStoryTextService = ReturnType<typeof createDynamicStoryTextService>;

const ACTIVE_CONDUCTOR_FLAVOR_TEXTS_BY_NAME: Record<string, string> = {
  "Orson Brisk":
    "He’s also a transplant to the Centuryverse. He could\nprobably give you all kinds of helpful tips for life on the rails.\nJust…don’t ask him about his run-in with the ghost.",
  "Piggy Back Ned":
    "He was born and raised on his father’s farm over in the\nPawpaw Plains. I’d bet he’d be willing to teach you all about\nthe train routes in that area, once you got to know him. He\nmight wrangle you into helping him hunt for his\nmissing pig, though…",
  "Tommy Two-Pair":
    "He’s a bit of a loose cannon, and he’s definitely made\na few enemies around here, but he’s loyal to his friends.\nJust don’t play poker with him. Trust me.",
  "Shayan Kahree":
    "He’s one of the kindest people you’ll meet,\nand one of my most trusted companions. If it weren’t\nfor his stories, you wouldn’t believe he has a sordid past.",
  "Whiplash Ash":
    "She’ll move mountains for the people she loves. She’ll also\nmove her fist through the face of anyone who tries to\nhurt said loved ones…",
  "Billy Clover":
    "Most of the time he speaks in rhymes, but don’t let that\nscare you away. If you’re caught in a snare, he’s likely\nto spare—He’s likely to save your whole day.",
  "Speedy Jame":
    "He makes for an excellent time travel companion.\nYou'll have to ask him about the time he and I met a\nparticularly grumpy dinosaur...",
  "Paloma Haulita":
    "You could call her an expert in identity threft prevention.\nTrust me: She's a good friend to have around if\nyou're ever feeling unlike yourself.",
  "Missy Sweetluck":
    "She always manages to find herself caught in the most\ninteresting adventures... And when things look grim, you can\nrely on her good heart and penchant for pyrotechnics\nto see you through the worst of it!",
  "Brute Force Tobias":
    "He might look like a lumbering super-soldier, but he's\nreally just a big teddy bear. And he's surprisingly\nrational, even when the world around him isn't.",
  "Big Break Osipov":
    "He's got a spectacular collection of curios\nand curiosities. And if he likes you, you\nmight even get to see them free of charge!",
  "Johnny Quick-Knuckles":
    "If you've ever wondered how a human battering ram would\nbehave, well... There's Johnny, for you. He can be a bit\ncrass at times, but deep down he means well.",
  "Wesley Strike":
    "They call him the Gentleman Boxer, and he's certainly both of\nthose things. Rumor has it he's suddenly developed an acute\nfear of thunder storms. Maybe you could figure out why?",
  "Gutshot Gauthier":
    "He's been here longer than any of us, and if you can get on\nhis good side, you're likely to benefit from his wealth of\nexperience... Just make sure to keep a bit of garlic\naround, in case he comes calling...",
  "KC Jones":
    "He's endlessly good-natured, even in the face of cruel\nand unusual circumstances. And he's certainly endured\nsome unusual circumstances...",
};

// const ACTIVE_CONDUCTOR_FLAVOR_TEXTS = {
//   1001: "He’s also a transplant to the Centuryverse. He could probably give you all kinds of helpful tips for life on the rails. Just…don’t ask him about his run-in with the ghost.",
//   1002: "He was born and raised on his father’s farm over in the Pawpaw Plains. I’d bet he’d be willing to teach you all about the train routes in that area, once you got to know him. He might wrangle you into helping him hunt for his missing pig, though…",
//   1003: "He’s a bit of a loose cannon, and he’s definitely made a few enemies around here, but he’s loyal to his friends. Just don’t play poker with him. Trust me.",
//   1004: "He’s one of the kindest people you’ll meet, and one of my most trusted companions. If it weren’t for his stories, you wouldn’t believe he has a sordid past.",
//   1005: "She’ll move mountains for the people she loves. She’ll also move her fist through the face of anyone who tries to hurt said loved ones…",
//   1006: "Most of the time he speaks in rhymes, but don’t let that scare you away. If you’re caught in a snare, he’s lucky to spare—He’s likely to save your whole day.",
//   1007: "He makes for an excellent time travel companion. You'll have to ask him about the time he and I met a particularly grumpy dinosaur...",
//   1008: "You could call her an expert in identity threft prevention. Trust me: She's a good friend to have around if you're ever feeling unlike yourself.",
//   1009: "She always manages to find herself caught in teh most interesting adventures... And when things look grim, you can rely on her good heart and penchant for pyrotechnics to see you through the worst of it!",
//   1010: "He might look like a lumbering super-soldier, but he's really just a big teddy bear. And he's surprisingly rational, even when the world around him isn't.",
//   1011: "He's got a spectacular collection of curios and curiosities. And if he likes you, you might even get to see them free of charge!",
//   1012: "If you've ever wondered how a human battering ram would behave, well... There's Johnny, for you. He can be a bit crass at times, but deep down he means well.",
//   1013: "They call him the Gentleman Boxer, and he's certainly both of those things. Rumor has it he's suddenly developed an acute fear of thunder storms. Maybe you could figure out why?",
//   1014: "He's been here longer than any of us, and if you can get on his good side, you're likely to benefit from his wealth of experience... Just make sure to keep a bit of garlic around, in case he comes calling...",
//   1015: "He's endlessly good-natured, even in the face of cruel and unusual circumstances. And he's certainly endured some unusual circumstances...",
// };
