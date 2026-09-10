# Component model provenance

Units: millimeters. Geometry triangulated and recentered using occt-import-js/OpenCascade; coordinates/normals rounded to 4 decimal places. Model appearance and bounds are illustrative CAD, not proof of manufactured part tolerances or markings.

- esp32-h2-mini-1.json: Espressif, ESP32-H2-MINI-1.STEP from https://github.com/espressif/kicad-libraries/blob/dd76561812ab300351234ba6e0ec1295641796f0/3dmodels/espressif.3dshapes/ESP32-H2-MINI-1.STEP . CC BY-SA 4.0 with KiCad exception, see ESPRESSIF-LICENSE.md. Converted geometry licensed on the same terms. Some internal assembly names mention C3; the published source asset is named H2-MINI-1 and is used as supplied.
- resistor-0603.json, capacitor-0603.json, sot23.json, sod523.json, rgb-led.json: extracted from original AirCube kicad/AirCube.step at https://github.com/hyperchi/AirCube/blob/bd857275c1f02efbec6942a96e433bde9d4d417e/kicad/AirCube.step . Original project by StuckAtPrototype, Apache-2.0; generic KiCad package models use the KiCad CC BY-SA 4.0 library license with design-output exception (https://www.kicad.org/libraries/license/). Generic package geometry represents package shape, not a specific resistor/capacitor vendor or value.

Rebuild with scripts/prepare-component-models.mjs and the two source STEP files. No CAD parsing occurs in the browser.

- esp32-c3-mini-1.json: official Espressif ESP32-C3-MINI-1.STEP from https://github.com/espressif/kicad-libraries/blob/dd76561812ab300351234ba6e0ec1295641796f0/3dmodels/espressif.3dshapes/ESP32-C3-MINI-1.STEP . Same CC BY-SA 4.0 terms with KiCad exception; converted by the same process. Optional third argument to the conversion script supplies this STEP.
- BG95 library preview: procedural simplified envelope, not CAD or a pinout. Manufacturer dimensions from https://www.quectel.com/product/lpwa-bg95-cat-m1-cat-nb2-egprs-series/ (23.6 × 19.9 × 2.2 mm).
