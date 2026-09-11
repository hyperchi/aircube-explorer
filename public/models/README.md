# Component model provenance

Units: millimeters. Geometry triangulated and recentered using occt-import-js/OpenCascade; coordinates/normals rounded to 4 decimal places. Model appearance and bounds are illustrative CAD, not proof of manufactured part tolerances or markings.

- esp32-h2-mini-1.json: Espressif, ESP32-H2-MINI-1.STEP from https://github.com/espressif/kicad-libraries/blob/dd76561812ab300351234ba6e0ec1295641796f0/3dmodels/espressif.3dshapes/ESP32-H2-MINI-1.STEP . CC BY-SA 4.0 with KiCad exception, see ESPRESSIF-LICENSE.md. Converted geometry licensed on the same terms. Some internal assembly names mention C3; the published source asset is named H2-MINI-1 and is used as supplied.
- resistor-0603.json, capacitor-0603.json, sot23.json, sod523.json, rgb-led.json: extracted from original AirCube kicad/AirCube.step at https://github.com/hyperchi/AirCube/blob/bd857275c1f02efbec6942a96e433bde9d4d417e/kicad/AirCube.step . Original project by StuckAtPrototype, Apache-2.0; generic KiCad package models use the KiCad CC BY-SA 4.0 library license with design-output exception (https://www.kicad.org/libraries/license/). Generic package geometry represents package shape, not a specific resistor/capacitor vendor or value.

Rebuild with scripts/prepare-component-models.mjs and the two source STEP files. No CAD parsing occurs in the browser.

- esp32-c3-mini-1.json: official Espressif ESP32-C3-MINI-1.STEP from https://github.com/espressif/kicad-libraries/blob/dd76561812ab300351234ba6e0ec1295641796f0/3dmodels/espressif.3dshapes/ESP32-C3-MINI-1.STEP . Same CC BY-SA 4.0 terms with KiCad exception; converted by the same process. Optional third argument to the conversion script supplies this STEP.
- bg95.json: triangulated from BG95.step in Bruno's public kicad-open-3d collection at https://github.com/brunoeagle/kicad-open-3d/blob/426b1d1223f621a05e9c411ded52347c1f5b2d03/BG95.step . STEP header identifies QUECTEL_BG95_3D_DIMENSIONS_ASM_cp, exported through FreeCAD / KiCad StepUp in February 2020. Community-hosted CAD, not a verified current manufacturer release. The source repository declares no license; this asset is not covered by this application's Apache-2.0 license. Original authors retain their rights. Optional fourth conversion argument supplies this STEP. Module only: no SIM holder, antenna or power circuitry. Manufacturer reference dimensions: 23.6 × 19.9 × 2.2 mm, https://www.quectel.com/product/lpwa-bg95-cat-m1-cat-nb2-egprs-series/ .

## Library-wide upgrade (September 2026)

The following entries supersede the extracted monochrome package meshes above:

- resistor-0603.json: KiCad `Resistor_SMD.3dshapes/R_0603_1608Metric.step`.
- capacitor-0603.json: KiCad `Capacitor_SMD.3dshapes/C_0603_1608Metric.step`.
- sot23.json: KiCad `Package_TO_SOT_SMD.3dshapes/SOT-23.step`.
- sod523.json: KiCad `Diode_SMD.3dshapes/D_SOD-523.step`.
- sot23-5.json: KiCad `Package_TO_SOT_SMD.3dshapes/SOT-23-5.step`, generic SOT25-style package used for U6. Body height is generic, not a vendor guarantee.

All five are from https://github.com/KiCad/kicad-packages3D/tree/b8b3cfdfad88ba66f21002b3de51dc6f7d55ba5a , retaining CAD body and lead colors. KiCad CC BY-SA 4.0 with library exception: https://www.kicad.org/libraries/license/ . Converted assets retain those terms. They do not represent exact resistor/capacitor vendor variants or production markings.

- usb4105.json: KiCad USB4105 series socket geometry, https://gitlab.com/kicad/libraries/kicad-packages3D/-/blob/43578c8e7219955321f06043dec41f6355848969/Connector_USB.3dshapes/USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal.step . Same KiCad library terms. 36 meshes, 8.94 × 7.78 × 4.26 mm including stakes; height is not the above-PCB profile. Check exact ordered stake length. Manufacturer reference: https://gct.co/connector/usb4105 .
- tl1016.json: official E-Switch TL1016AAF family CAD, https://configured-product-images.s3.amazonaws.com/stp3dmodels/TL1016AAFxxxQG.stp , linked from https://www.e-switch.com/product/tl1016-series-subminiature-smt-right-angle-tactile-switch/?part-number=TL1016AAF220QG . 4.7003 × 3.55 × 1.35 mm. Manufacturer retains rights; supplied as product-reference geometry, not relicensed under the application’s Apache license. The supplied STEP is monochrome and covers multiple force variants.
- rgb-led.json: original AirCube geometry unchanged, with illustrative material colors assigned to the pin-one dot, package body and four contacts. This restores visual separation lost in the assembly export, not measured optical properties. No internal dies or encapsulant optics are claimed.

### Original reconstructions

Generated with `node scripts/prepare-datasheet-models.mjs`. These are original meshes derived from nominal dimensions and visual package drawings, **not manufacturer CAD**. Undocumented seam, finish, internal and actuator details remain illustrative.

- ens161.json: ScioSense ENS161 datasheet v1.1, pp.41–42, https://www.sciosense.com/wp-content/uploads/2024/12/ENS161-Datasheet.pdf . 3 × 3 × 0.83 mm, 0.3 mm gas inlet at 0.8 mm offsets from package edges; nine 0.7 mm contacts at 1.05 mm pitch. Rounded cover/seam and materials are illustrative.
- ens210.json: ScioSense ENS210 datasheet v5, p.37, https://www.sciosense.com/wp-content/uploads/2023/12/ENS210-Datasheet.pdf . Nominal 2 × 2 × 0.75 mm QFN; 1.125/0.630 mm cavity diameters, 0.224 mm cavity depth, four 0.35 mm contacts on 0.95 mm pitch and 1.6 × 0.7 mm exposed pad. Small illustrative pin marker adds 0.006 mm to mesh bounds. The cavity floor/finish is illustrative.
- rkb2.json: C&K / Littelfuse RK series datasheet p.2, https://www.littelfuse.com/assetdocs/littelfuse-c-k-tactile-rk-series-datasheet?assetguid=ba27fd10-c379-497f-a7d8-b8be543ce75e . BOM identifies RKB2SJK250SMTR LFS: body 4.2 × 3.2 mm, height 2.5 mm, lead span 4.6 mm. Actuator profile, lead bends, cover fasteners and finishes are illustrative. Source footprint tag says PTS830; this mismatch is disclosed, not silently treated as verified fit.
- testpoint-pad.json: TP2’s actual 1.5 × 1.5 mm square copper opening and silkscreen from original board data; illustrative 3.2 mm board coupon, 0.5 mm board thickness and 0.035 mm copper. It is not a physical test-pin component.

Convert any additional source STEP with `node scripts/convert-step.mjs <model-name> <source.step>`. To reproduce the final package assets, run the standalone KiCad conversions after the original assembly extraction, then the reconstruction/material script. Every library entry links to its CAD or drawing source.
