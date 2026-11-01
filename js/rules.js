/* E-Waste Advisor - rules engine
 * Project: Green-Computing & E-Waste Advisory Tool (2026CSAE102, Milestone 2)
 * Team: Ansh Saini (S26CSEU3522), Aryan Bhati (S26CSEU3529),
 *       Shashank Sharma (S26CSEU3520), Gurpreet Singh (S26CSEU3495)
 *
 * Design idea: the advice lives in DATA (DEVICES, RULES), not in code.
 * The engine only matches the user's answers against the rule table.
 * To change advice, edit the table - no logic changes needed.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.EwasteRules = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Device catalogue. usefulLife = typical years of use (planning assumption,
  // used only to turn "age in years" into young / mid / old).
  // repairable: is repair usually worth considering for this device class?
  // hasData: does it store personal data (adds a wipe step)?
  const DEVICES = {
    smartphone: { label: "Smartphone",                  usefulLife: 4, repairable: true,  hasData: true  },
    laptop:     { label: "Laptop",                      usefulLife: 5, repairable: true,  hasData: true  },
    desktop:    { label: "Desktop computer",            usefulLife: 7, repairable: true,  hasData: true  },
    tablet:     { label: "Tablet",                      usefulLife: 4, repairable: true,  hasData: true  },
    tv:         { label: "TV / monitor",                usefulLife: 8, repairable: true,  hasData: false },
    printer:    { label: "Printer",                     usefulLife: 6, repairable: false, hasData: false },
    appliance:  { label: "Small appliance",             usefulLife: 6, repairable: true,  hasData: false },
    accessory:  { label: "Charger / cable / earphones", usefulLife: 3, repairable: false, hasData: false },
    powerbank:  { label: "Power bank / battery pack",   usefulLife: 3, repairable: false, hasData: false }
  };

  const CONDITIONS = {
    good:   "Works well",
    minor:  "Works, but has a small problem (slow, weak battery, cracked screen)",
    major:  "Faulty (does not work properly or will not turn on)",
    hazard: "Safety problem (swollen battery, burning smell, overheating, leaking)"
  };

  const ACTIONS = {
    repair:  { label: "Repair it" },
    resell:  { label: "Resell it" },
    donate:  { label: "Donate it" },
    recycle: { label: "Recycle it properly" }
  };

  // Age band = age / usefulLife.  young < 0.5, mid 0.5-1.0, old > 1.0
  function ageBand(device, ageYears) {
    const ratio = ageYears / DEVICES[device].usefulLife;
    if (ratio < 0.5) return "young";
    if (ratio <= 1.0) return "mid";
    return "old";
  }

  // Rule table. Lowest priority number that matches gives the main advice.
  // device: "any" | "repairable" | "notRepairable"
  // age / cond: "any" | [list]       warranty: "any" | "yes"
  // basis = the guidance idea the rule comes from (shown to the user).
  const RULES = [
    { id: "R01", priority: 1, device: "any", age: "any", cond: ["hazard"], warranty: "any",
      action: "recycle", alts: [],
      why: "A damaged or swollen battery can overheat or catch fire. It is not safe to repair, sell or give away. Only an authorised e-waste recycler should handle it.",
      basis: "Safe handling of hazardous components (E-Waste Rules 2022: authorised collection / recycler)" },

    { id: "R02", priority: 2, device: "any", age: "any", cond: ["minor", "major"], warranty: "yes",
      action: "repair", alts: ["recycle"],
      why: "It is still under warranty, so the maker may fix it for free or at low cost. That keeps the device in use and costs you nothing.",
      basis: "Repair-first (waste hierarchy); producer responsibility (EPR)" },

    { id: "R03", priority: 3, device: "repairable", age: ["young"], cond: ["good"], warranty: "any",
      action: "resell", alts: ["donate"],
      why: "It is fairly new and works well, so it still has good resale value. Selling it gives it a second life and some money back.",
      basis: "Reuse before recycling (waste hierarchy)" },

    { id: "R04", priority: 4, device: "repairable", age: ["mid"], cond: ["good"], warranty: "any",
      action: "resell", alts: ["donate"],
      why: "It works well and has some life left. Someone else can still use it, so selling or passing it on is better than storing it or throwing it away.",
      basis: "Reuse before recycling (waste hierarchy)" },

    { id: "R05", priority: 5, device: "repairable", age: ["old"], cond: ["good"], warranty: "any",
      action: "donate", alts: ["recycle"],
      why: "It is old but still works. Resale value is low, but a school, NGO or neighbour may still use it. If nobody wants it, recycle it.",
      basis: "Reuse before recycling (waste hierarchy)" },

    { id: "R06", priority: 6, device: "repairable", age: ["young", "mid"], cond: ["minor"], warranty: "any",
      action: "repair", alts: ["resell"],
      why: "The problem is small and the device is not old, so a repair is usually cheaper than buying new and avoids creating waste.",
      basis: "Repair-first (waste hierarchy)" },

    { id: "R07", priority: 7, device: "repairable", age: ["old"], cond: ["minor"], warranty: "any",
      action: "recycle", alts: ["repair"],
      why: "The device is past its usual lifespan. Repair only makes sense if the quote is small (rule of thumb: under about one third of a replacement). Otherwise recycle it.",
      basis: "Repair-first, with a cost check (team rule of thumb)" },

    { id: "R08", priority: 8, device: "repairable", age: ["young"], cond: ["major"], warranty: "any",
      action: "repair", alts: ["recycle"],
      why: "It is fairly new, so a repair is likely to be worth it. Get a quote first; if it is too high, recycle it.",
      basis: "Repair-first (waste hierarchy)" },

    { id: "R09", priority: 9, device: "repairable", age: ["mid"], cond: ["major"], warranty: "any",
      action: "repair", alts: ["recycle"],
      why: "Get a repair quote. If the cost is more than about half of a replacement, recycling is the better choice.",
      basis: "Repair-first, with a cost check (team rule of thumb)" },

    { id: "R10", priority: 10, device: "any", age: ["old"], cond: ["major"], warranty: "any",
      action: "recycle", alts: [],
      why: "It is old and not working. Repair is rarely worth it, and its metals and plastics are better recovered by a proper recycler than lost in a landfill.",
      basis: "Environmentally sound recycling (E-Waste Rules 2022)" },

    { id: "R11", priority: 11, device: "notRepairable", age: "any", cond: ["minor", "major"], warranty: "any",
      action: "recycle", alts: [],
      why: "This kind of item is rarely worth repairing. Please do not put it in the household bin: it holds metals and plastics that a recycler can recover.",
      basis: "Environmentally sound recycling (E-Waste Rules 2022)" },

    { id: "R12", priority: 12, device: "notRepairable", age: "any", cond: ["good"], warranty: "any",
      action: "donate", alts: ["recycle"],
      why: "It works, but has little resale value. Giving it to someone who needs it keeps it in use.",
      basis: "Reuse before recycling (waste hierarchy)" }
  ];

  const STEPS = {
    repair:  ["Get a written quote from a repair shop or the maker's service centre.",
              "Ask about the repair warranty before you agree.",
              "If the quote is too high, switch to the recycle option."],
    resell:  ["Check the device works and note any marks or faults honestly.",
              "List it on a resale platform or ask a local refurbisher for an offer.",
              "Include the charger and box if you still have them."],
    donate:  ["Find a school, NGO or community group that accepts used electronics.",
              "Confirm they want this type of device before you drop it off.",
              "Include the charger so it can be used straight away."],
    recycle: ["Use a producer take-back or an authorised e-waste collection point or recycler.",
              "Do not put it in the household bin or hand it to an unregistered scrap dealer.",
              "Keep any receipt or acknowledgement the recycler gives you."]
  };

  const DATA_STEP = "Before it leaves your hands: back up what you need, sign out of your accounts and do a factory reset.";
  const HAZARD_DATA_STEP = "If it holds personal data, do not power it on to wipe it. Tell the recycler and ask how they destroy data securely.";
  const HAZARD_WARNING = "Safety: do not charge or use it. Keep it away from heat and from other items. Do not puncture or press it.";

  function deviceMatches(rule, device) {
    if (rule.device === "any") return true;
    const rep = DEVICES[device].repairable;
    if (rule.device === "repairable") return rep;
    if (rule.device === "notRepairable") return !rep;
    return false;
  }
  function listMatches(spec, value) { return spec === "any" || spec.indexOf(value) !== -1; }

  function validate(input) {
    const errors = [];
    if (!input || !DEVICES[input.device]) errors.push("Please choose a device type.");
    if (!input || !CONDITIONS[input.condition]) errors.push("Please choose the condition.");
    const age = input ? Number(input.age) : NaN;
    const blank = !input || input.age === "" || input.age === null || input.age === undefined;
    if (blank || isNaN(age) || age < 0 || age > 30) errors.push("Age must be a number from 0 to 30 years.");
    return errors;
  }

  function advise(input) {
    const errors = validate(input);
    if (errors.length) return { ok: false, errors: errors };

    const age = Number(input.age);
    const band = ageBand(input.device, age);
    const warranty = input.warranty === "yes" ? "yes" : "no";

    const rule = RULES.slice().sort(function (a, b) { return a.priority - b.priority; })
      .find(function (r) {
        return deviceMatches(r, input.device) &&
               listMatches(r.age, band) &&
               listMatches(r.cond, input.condition) &&
               (r.warranty === "any" || r.warranty === warranty);
      });

    // Safety net: the table covers every combination (see tests), but never return nothing.
    if (!rule) {
      return { ok: true, ruleId: "FALLBACK", band: band, action: "recycle", alts: [],
               why: "No specific rule matched, so the safest choice is proper recycling.",
               basis: "Default safe option", steps: STEPS.recycle.slice(), warnings: [],
               deviceLabel: DEVICES[input.device].label };
    }

    const steps = STEPS[rule.action].slice();
    const warnings = [];
    if (DEVICES[input.device].hasData && rule.action !== "repair") {
      steps.unshift(input.condition === "hazard" ? HAZARD_DATA_STEP : DATA_STEP);
    }
    if (input.condition === "hazard") warnings.push(HAZARD_WARNING);

    return { ok: true, ruleId: rule.id, band: band, action: rule.action, alts: rule.alts.slice(),
             why: rule.why, basis: rule.basis, steps: steps, warnings: warnings,
             deviceLabel: DEVICES[input.device].label };
  }

  return { DEVICES: DEVICES, CONDITIONS: CONDITIONS, ACTIONS: ACTIONS, RULES: RULES,
           ageBand: ageBand, validate: validate, advise: advise };
});
