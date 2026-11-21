---
title: "5052 or 5083? Choosing marine-grade aluminium sheet without over-specifying"
description: "Both alloys survive salt water. The real decision is welded structure versus formed sheet — and that decision sets your plate thickness, temper and inspection cost."
metaTitle: "5052 vs 5083 marine aluminium: which sheet to specify"
category: "guide"
date: "2026-10-28"
updated: "2026-11-10"
author: "Zorlang Technical Desk"
products: ["5052", "5083", "6061"]
sources: ["ASTM B209-14, Standard Specification for Aluminum and Aluminum-Alloy Sheet and Plate", "ASTM G67, Intergranular Corrosion Test", "EN 485-2:2016, Mechanical properties"]
---

If the part is welded and class-approved, specify 5083 in H116 or H321. If it is formed, bolted or bent from sheet-metal, 5052 in H32 will do the job for roughly 20% less and is easier to work. The expensive mistake is ordering 5083 plate for a bracket, or 5052 sheet for a hull.

Both alloys are aluminium-magnesium grades and both resist seawater. The difference is how much magnesium, how the temper is controlled after welding, and what that does to your fabrication route.

::chart {"type":"bar","title":"Typical tensile and yield strength","labels":["5052 H32","5083 H116","6061 T6"],"values":[245,310,300],"unit":"MPa tensile (yield 160 / 215 / 250)","source":"ASTM B209 typical values"}

## What the magnesium level actually changes

5052 carries 2.2–2.8% magnesium. 5083 carries 4.0–4.9%, plus manganese and a little chromium. That extra magnesium buys strength and, more importantly for marine work, toughness after welding.

It also changes the metallurgy. Above roughly 3% magnesium, the alloy becomes susceptible to sensitisation: carbides precipitate at grain boundaries during slow cooling through a critical range, and the metal loses corrosion resistance exactly where the weld heat affected it. H116 and H321 tempers exist to control that precipitation, which is why they cost more and why they are tested to ASTM G67 rather than merely checked for composition.

5052 does not have that problem at its magnesium level. That is the whole reason it is the default for sheet-metal parts that are welded lightly or not at all.

## Decision rules that hold up

**Take 5083 when:** the structure is welded and carries load, a classification society is involved, the plate is thicker than 6 mm, or the service is immersion rather than splash. Hulls, decks, tanks, superstructures, fish holds.

**Take 5052 when:** the part is formed, bent or drawn, the joint is mechanical or a short seam weld, thickness is 0.5–6 mm, and the surface is visible. Cabinets, lockers, panels, ducting, small tanks, interior fit-out.

**Take neither when:** the part is machined to tight tolerance and does not see salt water. That is 6061 territory — cheaper, stronger in T6, and far easier to machine.

## The temper question buyers skip

H32 on 5052 means strain-hardened and stabilised: a predictable, formable sheet. H116 on 5083 is not a strain-hardened temper in the ordinary sense; it is a controlled condition that keeps the alloy resistant to intergranular attack after welding, and the mechanical property minimums are tied to that.

Ordering "5083 H32" because it appears in a drawing is a common and expensive mistake. The correct specification for welded marine plate is H116 (or H321 for thicker plate), and the mill certificate should state it explicitly along with the G67 result.

## Thickness: where the money hides

Tolerance is not a detail. EN 485-2 allows a thickness tolerance band that widens with width and thickness, so a 6 mm nominal plate can legitimately arrive at 5.7 mm. On a hull that is a strength calculation input; on a bracket it is wasted money.

Two practical moves:

- For structural plate, specify the minimum thickness you need and check what the standard actually permits at your width.
- For sheet-metal parts, buy to the standard band and stop paying for special tolerances you cannot use.

## Surface and edge condition

5083 plate for marine use is normally supplied mill finish, sometimes with a temporary primer. Marine primer is not a substitute for a coating system, and it must be removed at weld seams — specify "weldable primer" or "uncoated" if the yard is going to weld through it.

5052 sheet for visible parts is often PVC-coated to protect the surface during fabrication. Say so on the order; uncoated sheet that arrives scratched is a handling claim, not a mill defect.

## What to put on the RFQ

The shortest specification that gets you the right metal:

- Alloy and temper: 5083 H116, or 5052 H32
- Thickness and tolerance class from EN 485-2 or ASTM B209
- Width and length, with cut-to-length allowance
- Surface: mill, PVC-coated, primer
- Testing: mill certificate, G67 for 5083, ultrasonic for plate over 40 mm
- Destination port and packing requirement

If you send those seven lines, a mill can quote without guessing, and you can compare two offers line by line. Start from the [5052 page](/products/5052/) or the [5083 page](/products/5083/) for the size range and the downloadable spec sheet, and use the [6061 page](/products/6061/) when the part turns out to be machined rather than welded.
