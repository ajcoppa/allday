import { Class, getPermedSkills, Skill } from "kolmafia";
import { $class, have } from "libram";

function spanWrap(text: string, color: string): string {
  return `<font color="${color}">${text}</font>`;
}

export function coloredSkill(sk: Skill, nPerms: Skill[], nClass: Class): string {
  return sk.name in getPermedSkills()
    ? spanWrap(sk.name, "#888")
    : nPerms.includes(sk) && have(sk)
    ? spanWrap(sk.name, "fuchsia")
    : nPerms.includes(sk)
    ? spanWrap(sk.name, "blue")
    : have(sk)
    ? spanWrap(sk.name, "purple")
    : nClass && nClass === sk.class && nClass !== $class`none`
    ? spanWrap(sk.name, "navy")
    : spanWrap(sk.name, "black");
}
