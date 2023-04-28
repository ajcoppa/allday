import { Args } from "grimoire-kolmafia";

export const args = Args.create(
  "allday",
  "Written by zincaito (#2125208), heavily inspired by work SketchySolid (#422389) did on goorbo. This is a full-day script for half-CS looping.",
  {
    //alternate-run flags
    version: Args.flag({
      help: "Output script version number and exit.",
      default: false,
      setting: "",
    }),
    //partial run args
    actions: Args.number({
      help: "Maximum number of actions to perform, if given. Can be used to execute just a few steps at a time.",
    }),
    abort: Args.string({
      help: "If given, abort during the prepare() step for the task with matching name.",
    }),
    clan: Args.string({
      help: "If given, ensure we're a member of this clan before starting quest.",
    }),
    pvp: Args.flag({
      help: "If true, break hippy stone and do pvp.",
      default: false,
    }),
    csscript: Args.string({
      help: "The command that will perform the Community Service run. Include arguments you'd like to pass to that script too.",
      default: "instantsccs",
    }),
    garboaftercore: Args.string({
      help: "The farming command that allday will run in aftercore, including all arguments",
      default: "garbo ascend workshed=train",
    }),
    garbocs: Args.string({
      help: "The farming command that allday will run immediately after completing the CS run, including all arguments",
      default: "garbo workshed=cmc",
    }),
  }
);
