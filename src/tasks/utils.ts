import {
  fullnessLimit,
  getCampground,
  inebrietyLimit,
  Item,
  mallPrice,
  myAdventures,
  myFamiliar,
  myFullness,
  myInebriety,
  mySpleenUse,
  spleenLimit,
} from "kolmafia";
import { $familiar, $item, $items, get, have } from "libram";

import { garboValue } from "../engine/profits";

export function maxBase(): string {
  return `175 bonus June Cleaver, ${
    garboValue($item`FunFunds™`) / 20 + 5
  } bonus lucky gold ring, 250 bonus Mr. Cheeng's spectacles, ${
    0.4 * get("valueOfAdventure")
  } bonus mafia thumb ring, 10 bonus tiny stillsuit`;
}

export function canDiet(): boolean {
  return (
    myFullness() < fullnessLimit() ||
    mySpleenUse() < spleenLimit() ||
    myInebriety() < inebrietyLimit() ||
    (have($item`distention pill`) && !get("_distentionPillUsed")) ||
    (have($item`synthetic dog hair pill`) && !get("_syntheticDogHairPillUsed")) ||
    (have($item`designer sweatpants`) && get("_sweatOutSomeBoozeUsed") < 3 && get("sweat") >= 25) ||
    (have($item`mime army shotglass`) && !get("_mimeArmyShotglassUsed")) ||
    (get("currentMojoFilters") < 3 &&
      mallPrice($item`mojo filter`) + mallPrice($item`transdermal smoke patch`) <
        2.5 * get("valueOfAdventure"))
  );
}

export function stooperDrunk(): boolean {
  return (
    myInebriety() > inebrietyLimit() ||
    (myInebriety() === inebrietyLimit() && myFamiliar() === $familiar`Stooper`)
  );
}

export function totallyDrunk(): boolean {
  return have($familiar`Stooper`) && myFamiliar() !== $familiar`Stooper`
    ? myInebriety() > inebrietyLimit() + 1
    : myInebriety() > inebrietyLimit();
}

export function doneAdventuring(): boolean {
  return (!canDiet() && myAdventures() === 0) || stooperDrunk();
}

const gardens = $items`packet of pumpkin seeds, Peppermint Pip Packet, packet of dragon's teeth, packet of beer seeds, packet of winter seeds, packet of thanksgarden seeds, packet of tall grass seeds, packet of mushroom spores`;
export function getGarden(): Item {
  return gardens.find((it) => it.name in getCampground()) || $item`none`;
}
