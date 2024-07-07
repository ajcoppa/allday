import { CombatStrategy } from "grimoire-kolmafia";
import {
  availableAmount,
  buy,
  cliExecute,
  create,
  equip,
  getCampground,
  getClanName,
  guildStoreAvailable,
  haveEquipped,
  hippyStoneBroken,
  inebrietyLimit,
  itemAmount,
  myAdventures,
  myClass,
  myHp,
  myInebriety,
  myLevel,
  myMaxhp,
  pvpAttacksLeft,
  restoreHp,
  restoreMp,
  use,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $path,
  $skill,
  $stat,
  ascend,
  get,
  getTodaysHolidayWanderers,
  have,
  Lifestyle,
  Macro,
  set,
  uneffect,
} from "libram";

import { args } from "../args";

import { getCurrentLeg, Leg, Quest } from "./structure";
import {
  canDiet,
  getGarden,
  maxBase,
  stooperDrunk,
  totallyDrunk,
} from "./utils";

export function AftercoreQuest(): Quest {
  return {
    name: "Aftercore",
    completed: () => getCurrentLeg() > Leg.Aftercore,
    tasks: [
      {
        name: "Join VIP Clan",
        completed: () => !args.clan || getClanName().toLowerCase() === args.clan.toLowerCase(),
        do: () => cliExecute(`/whitelist ${args.clan}`),
      },
      {
        name: "Prep Fireworks Shop",
        completed: () => !have($item`Clan VIP Lounge key`) || get("_alldayFireworksPrepped", false),
        do: () => {
          visitUrl("clan_viplounge.php?action=fwshop&whichfloor=2");
          set("_alldayFireworksPrepped", true);
        },
      },
      {
        name: "Breakfast",
        completed: () => get("breakfastCompleted"),
        do: () => cliExecute("breakfast"),
      },
      {
        name: "Harvest Garden",
        completed: () =>
          getGarden() === $item`none` ||
          getGarden() === $item`packet of mushroom spores` ||
          getCampground()[getGarden().name] === 0,
        do: () => cliExecute("garden pick"),
        tracking: "Dailies",
        limit: { tries: 3 },
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
        name: "LGR Seed",
        completed: () =>
          !have($item`lucky gold ring`) || get("_stenchAirportToday") || get("stenchAirportAlways"),
        do: () => use($item`one-day ticket to Dinseylandfill`),
      },
      {
        name: "Restore HP",
        completed: () => myHp() > 0.5 * myMaxhp(),
        do: () => restoreHp(0.95 * myMaxhp()),
      },
      {
        name: "Stock Up on MMJs",
        ready: () =>
          guildStoreAvailable() &&
          (myClass().primestat === $stat`Mysticality` ||
            (myClass() === $class`Accordion Thief` && myLevel() >= 9)),
        completed: () => availableAmount($item`magical mystery juice`) >= 500,
        acquire: [
          {
            item: $item`magical mystery juice`,
            num: 500,
          },
        ],
        do: () => false,
      },
      {
        name: "Garbo",
        completed: () => stooperDrunk() || (!canDiet() && myAdventures() === 0),
        prepare: () => uneffect($effect`Beaten Up`),
        do: () => {
          cliExecute(args.garboaftercore);
        },
        post: () => {
          if (myAdventures() === 0)
            $effects`Power Ballad of the Arrowsmith, Stevedave's Shanty of Superiority, The Moxious Madrigal, The Magical Mojomuscular Melody, Aloysius' Antiphon of Aptitude, Ur-Kel's Aria of Annoyance`
              .filter((ef) => have(ef))
              .forEach((ef) => uneffect(ef));
        },
        clear: "all",
        tracking: "Garbo",
        limit: { tries: 1 },
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
        completed: () => myAdventures() === 0 || !have($item`Map to Safety Shelter Grimace Prime`),
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
        name: "Garbo (Drunk)",
        ready: () => have($item`Drunkula's wineglass`),
        prepare: () => uneffect($effect`Beaten Up`),
        completed: () => myAdventures() === 0,
        do: () => cliExecute("garbo ascend"),
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
        completed: () => pvpAttacksLeft() === 0 || !hippyStoneBroken(),
        do: (): void => {
          cliExecute("unequip");
          cliExecute("UberPvPOptimizer");
          cliExecute("swagger");
        },
      },
      {
        name: "Get Pizzas + Ticket + Time",
        completed: () => {
          return (
            $items`Deep Dish of Legend, Calzone of Legend, Pizza of Legend, one-day ticket to Dinseylandfill, borrowed time`.filter(
              (it) => have(it)
            ).length === 5
          );
        },
        do: (): void => {
          $items`one-day ticket to Dinseylandfill, borrowed time`.forEach((it) => {
            if (!have(it)) {
              buy(it);
            }
          });
          $items`Deep Dish of Legend, Calzone of Legend, Pizza of Legend`.forEach((it) => {
            if (!have(it)) {
              create(it);
            }
          });
        },
      },
      {
        name: "Visit Council",
        completed: () => get("_alldayCouncilVisited", false),
        do: (): void => {
          visitUrl("council.php");
          set("_alldayCouncilVisited", true);
        },
      },
      {
        name: "Ascend CS",
        completed: () => getCurrentLeg() >= Leg.CommunityService,
        do: (): void => {
          ascend(
            $path`Community Service`,
            $class`Seal Clubber`,
            Lifestyle.softcore,
            "wombat",
            $item`astral six-pack`,
            $item`astral pet sweater`
          );
          cliExecute("refresh all");
        },
      },
    ],
  };
}
