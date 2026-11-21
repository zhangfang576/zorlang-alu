---
title: "EN 485-2 thickness tolerance: how much metal you are actually buying"
description: "A 3 mm sheet is allowed to arrive thinner than 3 mm. Understanding the tolerance table changes what you should order, what you should inspect, and what you should refuse."
metaTitle: "EN 485-2 thickness tolerance explained for aluminium sheet buyers"
category: "standard"
date: "2026-10-15"
updated: "2026-11-08"
author: "Zorlang Technical Desk"
products: ["3003", "5052", "6061"]
sources: ["EN 485-2:2016, Aluminium and aluminium alloys — Sheet, strip and plate — Mechanical properties", "EN 485-3, Tolerances on dimensions and form for hot-rolled products", "ASTM B209-14, thickness tolerances"]
---

Nominal thickness is a target, not a guarantee. EN 485-2 and ASTM B209 both allow the mill to deliver sheet and plate within a tolerance band, and that band widens as the product gets wider and thicker. If your design assumes the nominal number, you are designing against metal you may not receive.

The practical rule: for load-bearing parts, specify the minimum thickness you need and let the mill work to the top of the allowed band; for formed parts, buy to the standard band and stop paying for tolerance you cannot use.

::chart {"type":"bar","title":"Indicative thickness tolerance band by width","labels":["≤1200 mm","≤1500 mm","≤2000 mm","≤2500 mm"],"values":[0.13,0.16,0.20,0.25],"unit":"± mm at 3.0 mm nominal, indicative","source":"EN 485-3 / ASTM B209 practice, verify against the standard text"}

## Why the band exists

Rolling is a mechanical process with thermal variation. A cold mill controls gauge with a feedback loop, but the loop has a lag, and the edges of a wide strip run slightly thinner than the centre because the roll crown is not perfectly flat at every width. The tolerance table is a negotiated compromise between what a mill can hold economically and what fabricators can accept.

Two consequences follow, and both matter commercially:

- A wide coil is harder to hold than a narrow one, which is why tolerance widens with width.
- Thin gauge is harder to hold than thick gauge, because the same absolute error is a larger percentage of the section.

## What "minus tolerance" costs you

If you order 100 tonnes of 3.0 mm sheet and the mill delivers at the bottom of the band, you receive roughly 4% less metal than the nominal calculation suggests. On parts priced per piece rather than per kilo, that 4% comes straight out of your yield.

This is not a mill trick; it is arithmetic inside the standard. But it does mean three things for your purchasing:

1. Price the offer on the delivered thickness, not the nominal one, if the quote is per tonne.
2. Ask the mill which part of the band they target — a mill that runs to nominal-plus is worth a small premium on weight-critical work.
3. Check thickness at receiving with a calibrated micrometer at fixed points, and record it. A tolerance dispute without measurement data is a conversation, not a claim.

## How to specify properly

**For structural plate:** state the minimum thickness required by calculation, then reference the standard tolerance for the upper limit. This is the only way to be sure the plate you receive satisfies the design.

**For sheet-metal parts:** reference the standard band and the width you actually need. If your blank is 1,240 mm wide, do not buy 2,000 mm coil and pay for trim.

**For machined plate:** thickness tolerance matters less than flatness and internal stress. See the [6061 page](/products/6061/) for the stress-relieved options; a plate that moves after machining costs more than a plate that arrived 0.2 mm thin.

## The other tolerances in the same table

Thickness is the one buyers watch, but three others cause most fabrication problems:

- **Flatness.** Measured over a defined length, and easy to lose on thin, wide sheet. If you are laser-cutting and then welding, flatness matters more than thickness.
- **Squareness and edge straightness.** On cut-to-length sheet, a few millimetres of diagonal error becomes a visible gap on a welded assembly.
- **Width tolerance on slit coil.** Slitting holds a tighter band than shearing, which is why coil-fed lines specify slit width rather than a cut sheet.

## Inspection that actually protects you

At receiving, three checks catch almost everything:

1. Micrometer at five points per sheet — four corners and centre.
2. Flatness on a surface table for the first sheet of each bundle.
3. Visual for roll marks, inclusions and edge damage, under raking light.

Record the results against the heat number on the mill certificate. If the numbers sit inside the standard band, you have no claim — which is exactly why the specification has to be right before the order, not after.

For the tolerance class that applies to your width and alloy, start from the [3003 page](/products/3003/) for general sheet, the [5052 page](/products/5052/) for marine and transport, or the [6061 page](/products/6061/) for plate that will be machined. Each page carries the standard reference and a downloadable spec sheet with the dimension ranges we roll.
