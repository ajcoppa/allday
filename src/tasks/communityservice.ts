import { CombatStrategy, step } from "grimoire-kolmafia";
import {
  availableAmount,
  buy,
  canInteract,
  cliExecute,
  equip,
  haveEquipped,
  hippyStoneBroken,
  inebrietyLimit,
  itemAmount,
  myAdventures,
  myInebriety,
  myMaxhp,
  mySign,
  numericModifier,
  print,
  pvpAttacksLeft,
  restoreHp,
  restoreMp,
  use,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $familiars,
  $item,
  $location,
  $skill,
  get,
  getTodaysHolidayWanderers,
  have,
  Macro,
  set,
  uneffect,
} from "libram";

import { args } from "../args";

import { getCurrentLeg, Leg, Quest } from "./structure";
import { canDiet, doneAdventuring, maxBase, stooperDrunk, totallyDrunk } from "./utils";

export function CSQuests(): Quest[] {
  return [
    {
      name: "CS Run",
      completed: () => getCurrentLeg() !== Leg.CommunityService || step("questL13Final") > 11,
      tasks: [
        {
          name: "Prep Fireworks Shop",
          completed: () =>
            !have($item`Clan VIP Lounge key`) || get("_alldayFireworksPrepped", false),
          do: () => {
            visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2");
            set("_alldayFireworksPrepped", true);
          },
        },
        {
          name: "SIT Course",
          ready: () => have($item`S.I.T. Course Completion Certificate`),
          completed: () => get("_sitCourseCompleted", false),
          choices: {
            1494: 2,
          },
          do: () => use($item`S.I.T. Course Completion Certificate`),
        },
        {
          name: "Break Stone",
          completed: () => hippyStoneBroken() || !args.pvp,
          do: (): void => {
            visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
            visitUrl("peevpee.php?place=fight");
          },
        },
        {
          name: "Stillsuit Prep",
          completed: () => itemAmount($item`tiny stillsuit`) === 0,
          do: () =>
            equip(
              $item`tiny stillsuit`,
              get(
                "stillsuitFamiliar",
                $familiars`Gelatinous Cubeling, Levitating Potato, Mosquito`.find((fam) =>
                  have(fam)
                ) || $familiar`none`
              )
            ),
        },
        {
          name: "Run",
          completed: () => get("csServicesPerformed").split(",").length >= 11 && canInteract(),
          do: () => cliExecute("instantsccs"),
          clear: "all",
          tracking: "Run",
        },
      ],
    },
    {
      name: "Post-CS Aftercore",
      completed: () => getCurrentLeg() !== Leg.CommunityService,
      tasks: [
        {
          name: "Moon Spoon",
          completed: () =>
            !have($item`hewn moon-rune spoon`) ||
            get("moonTuned") ||
            mySign().toLowerCase() === "wombat",
          do: () => cliExecute("spoon wombat"),
        },
        {
          name: "Breakfast",
          completed: () => get("breakfastCompleted"),
          do: () => cliExecute("breakfast"),
        },
        {
          name: "Garbo",
          ready: () => get("_stenchAirportToday") || get("stenchAirportAlways"),
          completed: () => (myAdventures() === 0 && !canDiet()) || stooperDrunk(),
          prepare: () => uneffect($effect`Beaten Up`),
          do: () => cliExecute("garbo workshed=cmc"),
          post: () =>
            $effects`Power Ballad of the Arrowsmith, Stevedave's Shanty of Superiority, The Moxious Madrigal, The Magical Mojomuscular Melody, Aloysius' Antiphon of Aptitude, Ur-Kel's Aria of Annoyance`
              .filter((ef) => have(ef))
              .forEach((ef) => uneffect(ef)),
          clear: "all",
          tracking: "Garbo",
        },
        {
          name: "Turn in FunFunds",
          ready: () => get("_stenchAirportToday") && itemAmount($item`FunFunds™`) >= 20,
          completed: () => have($item`one-day ticket to Dinseylandfill`),
          do: () =>
            buy($coinmaster`The Dinsey Company Store`, 1, $item`one-day ticket to Dinseylandfill`),
          tracking: "Garbo",
        },
        {
          name: "PvP",
          ready: () => doneAdventuring(),
          completed: () => pvpAttacksLeft() === 0 || !hippyStoneBroken(),
          do: (): void => {
            cliExecute("unequip");
            cliExecute("UberPvPOptimizer");
            cliExecute("swagger");
          },
        },
        {
          name: "Stooper",
          ready: () =>
            myInebriety() === inebrietyLimit() &&
            have($item`tiny stillsuit`) &&
            get("familiarSweat") >= 300,
          completed: () => !have($familiar`Stooper`) || stooperDrunk(),
          do: () => {
            useFamiliar($familiar`Stooper`);
            cliExecute("drink stillsuit distillate");
          },
        },
        {
          name: "Nightcap",
          ready: () => doneAdventuring(),
          completed: () => totallyDrunk(),
          do: () => cliExecute("CONSUME NIGHTCAP"),
        },
        {
          name: "Barfing Drunk with Stooper",
          ready: () =>
            stooperDrunk() && have($familiar`Stooper`) && !have($item`Drunkula's wineglass`),
          completed: () => myAdventures() === 0 || totallyDrunk(),
          acquire: [{ item: $item`seal tooth` }],
          outfit: () => ({
            familiar: $familiar`Stooper`,
            modifier: `${maxBase()}, 2.5 meat, 0.6 items`,
          }),
          effects: $effects`How to Scam Tourists`, //need to add meat buffs that we can cast
          prepare: (): void => {
            restoreHp(0.75 * myMaxhp());
            restoreMp(20);
          },
          do: $location`Barf Mountain`,
          combat: new CombatStrategy()
            .macro(Macro.trySkill($skill`Curse of Weaksauce`), getTodaysHolidayWanderers())
            .macro(() =>
              Macro.step("pickpocket")
                .trySkill($skill`Bowl Straight Up`)
                .trySkill($skill`Sing Along`)
                .tryItem($item`porquoise-handled sixgun`)
                .externalIf(
                  haveEquipped($item`mafia pointer finger ring`),
                  Macro.trySkill($skill`Furious Wallop`)
                    .trySkill($skill`Summer Siesta`)
                    .trySkill($skill`Throw Shield`)
                    .trySkill($skill`Precision Shot`)
                )
                .attack()
                .repeat()
            ),
          limit: { tries: 30 },
        },
        {
          name: "Nightcap (Wine Glass)",
          ready: () => have($item`Drunkula's wineglass`),
          completed: () => totallyDrunk(),
          do: () => cliExecute(`CONSUME NIGHTCAP VALUE ${get("valueOfAdventure") - 1000}`),
        },
        {
          name: "Nightcap (Marginal)",
          ready: () => have($item`Beach Comb`) || have($item`Map to Safety Shelter Grimace Prime`),
          completed: () => totallyDrunk(),
          do: () => cliExecute(`CONSUME NIGHTCAP VALUE 500`),
        },
        {
          name: "Grimace Maps",
          completed: () =>
            myAdventures() === 0 || !have($item`Map to Safety Shelter Grimace Prime`),
          effects: $effects`Transpondent`,
          choices: {
            536: () =>
              availableAmount($item`distention pill`) <
              availableAmount($item`synthetic dog hair pill`) +
                availableAmount($item`Map to Safety Shelter Grimace Prime`)
                ? 1
                : 2,
          },
          do: () => use($item`Map to Safety Shelter Grimace Prime`),
          limit: { tries: 30 },
        },
        {
          name: "Pajamas",
          completed: () => have($item`burning cape`),
          acquire: [
            { item: $item`clockwork maid`, price: 7 * get("valueOfAdventure"), optional: true },
            { item: $item`burning cape` },
          ],
          do: () => {
            if (have($item`clockwork maid`)) {
              use($item`clockwork maid`);
            }
          },
          outfit: () => ({
            familiar:
              $familiars`Trick-or-Treating Tot, Left-Hand Man, Disembodied Hand, Grey Goose`.find(
                (fam) => have(fam)
              ),
            modifier: `adventures${args.pvp ? ", 0.3 fites" : ""}`,
          }),
        },
        {
          name: "Alert-No Nightcap",
          ready: () => !doneAdventuring(),
          completed: () => stooperDrunk(),
          do: (): void => {
            const targetAdvs = 100 - numericModifier("adventures");
            print("goorbo completed, but did not overdrink.", "red");
            if (targetAdvs < myAdventures() && targetAdvs > 0)
              print(
                `Rerun with fewer than ${targetAdvs} adventures for goorbo to handle your diet`,
                "red"
              );
            else print("Something went wrong.", "red");
          },
        },
      ],
    },
  ];
}
