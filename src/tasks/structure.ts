import { Quest as BaseQuest, Task as BaseTask, Limit } from "grimoire-kolmafia";
import { myDaycount } from "kolmafia";
import { get } from "libram";

export type Task = BaseTask & {
  tracking?: string;
  limit?: Limit;
  clear?: "all" | "outfit" | "macro" | ("outfit" | "macro")[];
};
export type Quest = BaseQuest<Task>;

export enum Leg {
  Aftercore = 0,
  CommunityService = 1,
  last = 1,
}

export function getCurrentLeg(): number {
  // TODO: Better tracking in case CS takes more than 1 day?
  if (myDaycount() === 1) return Leg.CommunityService;
  return Leg.Aftercore;
}
