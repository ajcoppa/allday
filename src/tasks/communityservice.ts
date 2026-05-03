import { CombatStrategy, step } from "grimoire-kolmafia";
import {
  availableAmount,
  buy,
  cliExecute,
  closetAmount,
  create,
  equip,
  haveEquipped,
  hippyStoneBroken,
  inebrietyLimit,
  itemAmount,
  monkeyPaw,
  myAdventures,
  myAscensions,
  myInebriety,
  myMaxhp,
  mySign,
  numericModifier,
  print,
  pvpAttacksLeft,
  putCloset,
  restoreHp,
  restoreMp,
  takeCloset,
  use,
  useFamiliar,
  useSkill,
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
  CommunityService,
  get,
  getRemainingLiver,
  getRemainingSpleen,
  getRemainingStomach,
  getTodaysHolidayWanderers,
  have,
  Macro,
  set,
  uneffect,
} from "libram";

import { args } from "../args";

import { getCurrentLeg, Leg, Quest } from "./structure";
import {
  canDiet,
  doneAdventuring,
  maxBase,
  stooperDrunk,
  totallyDrunk,
} from "./utils";

const excludedBuffs = [
  $effect`HGH-charged`, // (+50% mus xp), unnecessary for leveling
  $effect`Ultra-Soft Steps`, // unnecessary for NC
  $effect`Silent Running`, // unnecessary for NC
  $effect`Wild and Westy!`, // unnecessary for NC
  $effect`Shadow Waters`, // unnecessary for NC
  $effect`Feeling Peaceful`, // unnnecessary for hot res
];

const csPrefs = {
  instant_musTestTurnLimit: 1,
  instant_mystTestTurnLimit: 1,
  instant_moxTestTurnLimit: 1,
  instant_spellTestTurnLimit: 1, // force abort before spell test to BCZ and wish manually
  instant_explicitlyExcludedBuffs: excludedBuffs.map((ef) => ef.id).join(","),
  // Great Wolf's Beastly Trousers, Stick-Knife of Loathing, Staff of Simmering Hatred
  instant_prePulls: "6451,4313,4305",
  instant_spellTestBusks: "1:220,2:350,3:160,4:180,5:400",
  instant_targetBaseMainStat: 170,
  instant_saveAbstraction: true,
  instant_saveAstralPilsners: 0,
  instant_saveBeesKnees: true,
  instant_saveBodySpradium: true,
  instant_saveBorisBeer: true,
  instant_saveCatalogCredits: 1,
  instant_saveEuclideanAngle: true,
  instant_saveHoneyBun: true,
  instant_savePerfectFreeze: true,
  instant_savePillkeeper: true,
  instant_savePlainCalzone: true,
  instant_saveRichRicotta: true,
  instant_saveRicottaCasserole: true,
  instant_saveRoastedVegetableItem: true,
  instant_saveRoastedVegetableStats: true,
  instant_saveSacramentoWine: true,
  instant_saveSockdollager: true,
  instant_saveWileyWheyBar: true,
  instant_skipCabernetSauvignon: true,
  instant_skipDistilledFortifiedWine: true,
  instant_skipDuplicateBembershoots: true,
  instant_saveBackups: 10,
  instant_saveLocketFactoryWorker: true,
  instant_skipCyclopsEyedrops: true,
  instant_skipEarlyTrainsetMeat: true,
  instant_saveAprilingBandPiccolo: true,
  instant_saveAprilingBandQuadTom: true,
  instant_saveAprilingBandSaxophone: true,
  instant_saveAprilingBandStaff: true,
  instant_saveAugustScepter: false,
  instant_saveCinch: true,
  instant_saveMimicEggs: true,
  instant_saveMonsterHabitats: 3,
  instant_saveStillsuit: true,
  instant_skipHighHeels: true,
  instant_skipMeatButler: true,
  _instant_skipCalzoneOfLegend: true,
  _instant_skipPizzaOfLegend: true,
};

const spellDamageWishes = [
  $effect`Witch Breaded`,
  $effect`Pisces in the Skyces`,
];

export function CSQuests(): Quest[] {
  return [
    {
      name: "CS Run",
      completed: () => getCurrentLeg() !== Leg.CommunityService || step("questL13Final") > 11,
      tasks: [
        {
          name: "Refresh All",
          completed: () => get("_alldayRefreshed", false),
          do: () => {
            cliExecute("refresh all");
            set("_alldayRefreshed", true);
          },
        },
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
          // Ensures correct preferences are set in case they get overwritten
          name: "Set CS Prefs",
          completed: () => get("_alldayCSPrefsSet", false),
          do: () => {
            for (const prefName in csPrefs) {
              const prefValue = csPrefs[prefName];
              set(prefName, prefValue);
            }
            set("_alldayCSPrefsSet", true);
          },
        },
        {
          name: "Run until Myst",
          completed: () => get("_instant_levelingTurns", Number.MIN_SAFE_INTEGER) >= 0,
          do: () => cliExecute(args.csscript),
          clear: "all",
          tracking: "Run",
        },
        {
          name: "Up to 11 for Mysticality",
          // Myst test abort happens after leveling is complete and turns are recorded in this pref
          ready: () => get("_instant_levelingTurns", Number.MIN_SAFE_INTEGER) >= 0 &&
            CommunityService.Mysticality.prediction > 1,
          completed: () => !have($item`blood cubic zirconia`) ||
            have($effect`Up to 11`) ||
            CommunityService.Mysticality.isDone(),
          do: () => {
            useSkill($skill`BCZ: Dial it up to 11`);
          },
          limit: { tries: 1 },
        },
        {
          name: "Run until Mox",
          completed: () => CommunityService.Moxie.isDone() ||
            have($effect`Amazing`) ||(get("_instant_levelingTurns", Number.MIN_SAFE_INTEGER) >= 0 &&
            CommunityService.Moxie.prediction > 1 &&
            CommunityService.Mysticality.isDone() &&
            !CommunityService.Moxie.isDone()),
          do: () => cliExecute(args.csscript),
          clear: "all",
          tracking: "Run",
        },
        {
          name: "Pocket Maze for Moxie",
          ready: () => get("_instant_levelingTurns", Number.MIN_SAFE_INTEGER) >= 0 &&
            CommunityService.Moxie.prediction > 1 &&
            CommunityService.Mysticality.isDone(),
          completed: () => !have($item`pocket maze`) ||
            CommunityService.Moxie.isDone(),
          do: () => {
            use($item`pocket maze`);
          },
          limit: { tries: 1 },
        },
        {
          name: "Run until Spell Damage",
          completed: () => CommunityService.WeaponDamage.isDone(),
          do: () => cliExecute(args.csscript),
          clear: "all",
          tracking: "Run",
        },
        {
          name: "BCZ for Spell Damage",
          ready: () => CommunityService.WeaponDamage.isDone(),
          completed: () => !have($item`blood cubic zirconia`) ||
            have($effect`Up to 11`) ||
            CommunityService.SpellDamage.isDone(),
          do: () => {
            useSkill($skill`BCZ: Dial it up to 11`);
          },
          limit: { tries: 1 },
        },
        {
          name: "Spell Damage Wishes",
          ready: () => CommunityService.WeaponDamage.isDone(),
          completed: () => CommunityService.SpellDamage.isDone() ||
            spellDamageWishes.every((ef) => have(ef)) ||
            !have($item`cursed monkey paw`) ||
            get("_monkeyPawWishesUsed") >= 5,
          do: () => {
            spellDamageWishes.forEach((ef) => monkeyPaw(ef));
          },
          limit: { tries: 1 },
        },
        {
          name: "Remove Spell Damage Turn Limit",
          ready: () => CommunityService.WeaponDamage.isDone() &&
            spellDamageWishes.every((ef) => have(ef)),
          completed: () => get("instant_spellTestTurnLimit", 1000) === 1000,
          do: () => {
            set("instant_spellTestTurnLimit", "");
          },
        },
        {
          name: "Finish CS",
          completed: () => get("lastEmptiedStorage") === myAscensions(),
          do: () => cliExecute(args.csscript),
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
          name: "Beach Access",
          completed: () => have($item`bitchin' meatcar`),
          do: () => create($item`bitchin' meatcar`),
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
          name: "Garbo",
          completed: () => (myAdventures() === 0 && !canDiet()) || stooperDrunk(),
          prepare: () => uneffect($effect`Beaten Up`),
          do: () => cliExecute(args.garbocs),
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
            cliExecute("PVP_MAB");
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
          name: "Fill Bonus Organs",
          completed: () => get("_alldayConsumedBonusOrgans", false),
          outfit: {
            modifier: "stomach capacity, liver capacity, spleen capacity, -tie",
          },
          do: () => {
            cliExecute("CONSUME ALL");
            if (
              getRemainingStomach() === 0 &&
              getRemainingLiver() === 0 &&
              getRemainingSpleen() === 0
            ) {
              set("_alldayConsumedBonusOrgans", true);
            } else {
              print("Failed to CONSUME for bonus organs!");
              // Will fail automatically due to not setting the property, meaning the task won't complete
            }
          },
          limit: { tries: 1 },
        },
        {
          name: "Nightcap",
          ready: () => doneAdventuring(),
          completed: () => totallyDrunk(),
          do: () => cliExecute("CONSUME NIGHTCAP"),
        },
        {
          name: "Use Oscus's Soda",
          ready: () => doneAdventuring(),
          completed: () => !have($item`Oscus's neverending soda`) || !!get("oscusSodaUsed"),
          do: () => {
            useSkill($skill`Cannelloni Cocoon`);
            use($item`Oscus's neverending soda`);
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
          name: "Offhand Remarkable",
          ready: () => have($item`August Scepter`),
          completed: () =>
            !have($skill`Aug. 13th: Left/Off Hander's Day!`) ||
            have($effect`Offhand Remarkable`) ||
            get("_aug13Cast", false),
          do: () => useSkill($skill`Aug. 13th: Left/Off Hander's Day!`),
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
            cliExecute("modtrace adventures");
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
          name: "Summon Soap Knife",
          completed: () => !have($skill`That's Not a Knife`) || get("_discoKnife"),
          prepare: () => putCloset(itemAmount($item`soap knife`), $item`soap knife`),
          do: () => useSkill($skill`That's Not a Knife`),
          post: () => takeCloset(closetAmount($item`soap knife`), $item`soap knife`),
        },
        {
          name: "Alert-No Nightcap",
          ready: () => !doneAdventuring(),
          completed: () => stooperDrunk(),
          do: (): void => {
            const targetAdvs = 100 - numericModifier("adventures");
            print("allday completed, but did not overdrink.", "red");
            if (targetAdvs < myAdventures() && targetAdvs > 0)
              print(
                `Rerun with fewer than ${targetAdvs} adventures for allday to handle your diet`,
                "red"
              );
            else print("Something went wrong.", "red");
          },
        },
      ],
    },
  ];
}
