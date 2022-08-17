import { openWikiLink } from "@game/gameplay/externals/tocWikiLink";

export function dynamicChoiceActionFunctions() {
  const dictionary: Record<string, () => void | Promise<void>> = {
    openWikiLink: openWikiLink,
  };

  return {
    performAction(key: string) {
      const $function = dictionary[key];
      if (!$function) return console.error(`Action not found — "${key}()"`);
      return $function();
    },
  };
}

export type DynamicChoiceActionsService = ReturnType<typeof dynamicChoiceActionFunctions>;
