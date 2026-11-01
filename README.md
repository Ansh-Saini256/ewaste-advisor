# E-Waste Advisor
Green-Computing & E-Waste Advisory Tool - 2026CSAE102 Technology and Sustainability (Bennett University), Milestone 2.
SDG 12 (Responsible Consumption and Production). Problem Bank: Section 5, #28.

Enter a device type, its age and its condition. The tool suggests **repair, resell, donate or recycle** and explains why in plain words.
No account, no server, nothing stored: all logic runs in the browser.

## Run
Open `index.html` in any browser. No install needed.

## Test
`node tests/test_rules.js` (Node 18+). Latest output is saved in `tests/test_output.txt`.

## Structure
- `js/rules.js` - device catalogue + rule table (R01-R12) + matching engine. Advice lives in data, not code.
- `js/app.js` - form handling and result display.
- `css/style.css` - responsive, light/dark theme.
- `tests/` - 19 test cases including a full rule-coverage check.
- `docs/` - screenshots from the running prototype.

## Team
Ansh Saini (S26CSEU3522), Aryan Bhati (S26CSEU3529), Shashank Sharma (S26CSEU3520), Gurpreet Singh (S26CSEU3495)

## Sources
E-Waste (Management) Rules, 2022 (India); waste hierarchy (reduce, reuse, repair, recycle). Rule wording must be checked against the official text before the final report.
