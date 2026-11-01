// Run with: node tests/test_rules.js
const R = require("../js/rules.js");
let pass = 0, fail = 0;
function t(name, input, expectAction, expectRule) {
  const out = R.advise(input);
  const ok = out.ok && out.action === expectAction && (!expectRule || out.ruleId === expectRule);
  console.log((ok ? "PASS" : "FAIL") + "  " + name + "  -> " + (out.ok ? out.action + " (" + out.ruleId + ")" : out.errors.join("; ")));
  ok ? pass++ : fail++;
}
function bad(name, input) {
  const out = R.advise(input);
  const ok = !out.ok;
  console.log((ok ? "PASS" : "FAIL") + "  " + name + "  -> " + (out.ok ? "accepted" : "rejected"));
  ok ? pass++ : fail++;
}
t("TC01 new phone, works",            {device:"smartphone", age:1,   condition:"good"},  "resell",  "R03");
t("TC02 mid-age laptop, works",       {device:"laptop",     age:4,   condition:"good"},  "resell",  "R04");
t("TC03 old laptop, works",           {device:"laptop",     age:8,   condition:"good"},  "donate",  "R05");
t("TC04 young tablet, minor issue",   {device:"tablet",     age:1,   condition:"minor"}, "repair",  "R06");
t("TC05 old desktop, minor issue",    {device:"desktop",    age:10,  condition:"minor"}, "recycle", "R07");
t("TC06 young phone, faulty",         {device:"smartphone", age:1,   condition:"major"}, "repair",  "R08");
t("TC07 mid TV, faulty",              {device:"tv",         age:6,   condition:"major"}, "repair",  "R09");
t("TC08 old phone, dead",             {device:"smartphone", age:7,   condition:"major"}, "recycle", "R10");
t("TC09 printer, faulty",             {device:"printer",    age:2,   condition:"major"}, "recycle", "R11");
t("TC10 charger, works",              {device:"accessory",  age:1,   condition:"good"},  "donate",  "R12");
t("TC11 swollen battery overrides",   {device:"smartphone", age:1,   condition:"hazard", warranty:"yes"}, "recycle", "R01");
t("TC12 warranty, faulty laptop",     {device:"laptop",     age:2,   condition:"major",  warranty:"yes"}, "repair",  "R02");
t("TC13 power bank hazard",           {device:"powerbank",  age:2,   condition:"hazard"}, "recycle", "R01");
t("TC14 boundary: age = lifespan",    {device:"smartphone", age:4,   condition:"good"},  "resell",  "R04");
t("TC15 boundary: just over lifespan",{device:"smartphone", age:4.1, condition:"good"},  "donate",  "R05");
bad("TC16 negative age rejected",     {device:"laptop", age:-1, condition:"good"});
bad("TC17 missing device rejected",   {age:2, condition:"good"});
bad("TC18 non-numeric age rejected",  {device:"laptop", age:"abc", condition:"good"});

// Coverage: every device x age band x condition x warranty must match a real rule.
let gaps = 0, combos = 0;
Object.keys(R.DEVICES).forEach(function (d) {
  [0.5, 3, 20].forEach(function (a) {
    Object.keys(R.CONDITIONS).forEach(function (c) {
      ["no", "yes"].forEach(function (w) {
        combos++;
        const o = R.advise({device: d, age: a, condition: c, warranty: w});
        if (!o.ok || o.ruleId === "FALLBACK") { gaps++; console.log("GAP", d, a, c, w); }
      });
    });
  });
});
console.log((gaps === 0 ? "PASS" : "FAIL") + "  TC19 rule coverage: " + combos + " combinations, " + gaps + " gaps");
gaps === 0 ? pass++ : fail++;
console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
