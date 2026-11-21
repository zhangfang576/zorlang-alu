---
title: "EV battery housings: where aluminium wins, and where it quietly does not"
description: "Extrusion, stamped sheet and die-castings are competing for the same enclosure. The decision is driven by volume, sealing strategy and repair philosophy — not by alloy strength alone."
metaTitle: "Aluminium in EV battery housings: extrusion vs stamping vs casting"
category: "industry"
date: "2026-10-02"
updated: "2026-11-05"
author: "Zorlang Technical Desk"
products: ["6061", "6063", "5052"]
sources: ["IAI aluminium content in transport, 2025", "Zorlang customer demand mix, 2024–2026", "EN 755-2 / ASTM B221 property data"]
---

Aluminium won the battery enclosure because it is light and it conducts heat. What is still being decided is the process: extruded frame plus stamped lid, a fully stamped welded box, or a single large die-casting. Each route points to a different alloy, a different tolerance and a different supplier.

For a buyer sourcing metal rather than assemblies, the practical question is simpler: which form do I need to stock, and which alloy gives me the strength, weldability and flatness that route requires.

::chart {"type":"bar","title":"Typical aluminium content per BEV, by part","labels":["Enclosure","Crash structure","Cooling plate","Busbar"],"values":[45,30,12,8],"unit":"kg per vehicle, indicative","source":"IAI transport content data, Zorlang estimate 2026"}

## Route one: extruded frame and stamped lid

The dominant route in Europe. Longitudinal extrusions form the side rails and cross members, with a stamped or roll-formed lid and tray. It suits multi-model platforms because the extrusion dies can be reused with different lengths.

6063 T5 or T6 is the usual extrusion alloy: good surface, adequate strength, easy to anodise. Where the crash load path runs through the frame, 6061 T6 appears instead, at a cost in extrusion speed and die life. Lids are typically 5052 or 5754 sheet in H32, chosen for formability and corrosion resistance rather than strength.

What this route demands from the mill: profile tolerance to EN 755-9, straightness over 2–3 m lengths, and consistent wall thickness on hollow sections. A frame that is 1 mm out of straight stacks badly on an automated line.

## Route two: fully stamped and welded box

Stamping wins when volumes are high and the geometry is shallow. Two or three large stampings replace dozens of extrusions, and the part count falls.

The metal is 5052 or 5754 in H32, sometimes 6061 in T4 for subsequent forming and artificial ageing. The constraint is flatness after welding: a large thin panel distorts, and a battery enclosure has a sealing requirement measured in tenths of a millimetre. Laser welding with a low heat input helps; so does specifying sheet with controlled residual stress.

## Route three: large die-casting

A single casting replaces the whole tray in one shot. It is the cheapest route at very high volume and the most expensive at low volume, because the tool is large and the process window is narrow.

Castings are not rolled product, so this route does not consume our plate or sheet — but it changes the mix. Where a program moves to casting, demand shifts from 5052 sheet to secondary ingot, and the extrusion content drops with it.

## Where aluminium loses

Two honest caveats, because buyers are increasingly asked to justify the choice:

**Thermal runaway containment.** Aluminium melts around 600 °C, well below the temperatures of a severe cell fire. Enclosures rely on intumescent barriers and module-level isolation rather than the metal itself. That is a system design answer, not an alloy one, and it is why enclosure weight has been rising rather than falling.

**Repair and insurance.** A stamped-and-welded aluminium box is difficult to repair after a minor impact; insurers in some markets price that in. Steel alternatives are heavier but simpler to section and replace. This is a commercial argument that no datasheet settles.

## What to specify, route by route

| Route | Typical alloy | Form | The tolerance that bites |
| --- | --- | --- | --- |
| Extruded frame | 6063 T5/T6, 6061 T6 | Profile | Straightness, wall thickness |
| Stamped box | 5052 H32, 5754 H32 | Sheet | Flatness after welding, gauge |
| Cooling plate | 3003, 6061 | Sheet/plate | Flatness, channel geometry |
| Busbar | 1050, 6101 | Strip/bar | Conductivity, width tolerance |

For each route the mill certificate is not enough on its own: you want the dimensional report for the batch, because the failure mode is geometric, not chemical.

## What we see in the order book

Through 2025 and 2026 the mix has moved toward wider sheet and longer extrusion, both driven by larger enclosures and fewer part numbers. Orders for 2,000 mm and wider 5052 in H32 have grown faster than any other specification we roll, and customers are increasingly asking for flatness measured after simulated welding rather than as-supplied.

If you are specifying an enclosure, the [5052 page](/products/5052/) covers the stamped route, the [6063 page](/products/6063/) covers extruded frames and heat sinks, and the [6061 page](/products/6061/) covers machined structural parts. Each carries the standard reference and a downloadable spec sheet to attach to an RFQ.
