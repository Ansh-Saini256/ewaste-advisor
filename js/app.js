/* E-Waste Advisor - user interface (talks to EwasteRules in rules.js) */
(function () {
  "use strict";
  var R = window.EwasteRules;
  var $ = function (id) { return document.getElementById(id); };

  function fill(select, map, labelOf) {
    Object.keys(map).forEach(function (key) {
      var o = document.createElement("option");
      o.value = key;
      o.textContent = labelOf(map[key]);
      select.appendChild(o);
    });
  }
  fill($("device"), R.DEVICES, function (d) { return d.label; });
  fill($("condition"), R.CONDITIONS, function (c) { return c; });

  function show(out) {
    var err = $("errors");
    if (!out.ok) {
      err.textContent = out.errors.join(" ");
      err.hidden = false;
      $("result").hidden = true;
      return;
    }
    err.hidden = true;
    $("r-action").textContent = R.ACTIONS[out.action].label;
    $("r-why").textContent = out.why;

    var warn = $("r-warn");
    warn.hidden = out.warnings.length === 0;
    warn.textContent = out.warnings.join(" ");

    $("r-alts").textContent = out.alts.length
      ? "Other option: " + out.alts.map(function (a) { return R.ACTIONS[a].label.toLowerCase(); }).join(", ") + "."
      : "";

    var ol = $("r-steps");
    ol.innerHTML = "";
    out.steps.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s;
      ol.appendChild(li);
    });
    $("r-rule").textContent = out.ruleId;
    $("r-basis").textContent = out.basis;
    $("result").className = "card result " + out.action;
    $("result").hidden = false;
    $("result").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  $("go").addEventListener("click", function () {
    show(R.advise({
      device: $("device").value,
      age: $("age").value,
      condition: $("condition").value,
      warranty: $("warranty").value
    }));
  });
})();
