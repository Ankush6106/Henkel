console.log("Calculation Sheet JS loaded");

/* ================================================
<!--Section 1.1-->
pos_plant_derivatives
/* ================================================*/

function calculatePlantTotals() {
  const totals = {};

  // Initialize totals
  document.querySelectorAll(".plant-total").forEach((total) => {
    totals[total.dataset.pos] = 0;
  });

  // Sum derivatives
  document.querySelectorAll(".plant-input").forEach((input) => {
    const pos = input.dataset.pos;
    const checkbox = input.previousElementSibling;

    if (checkbox && checkbox.checked) {
      totals[pos] += Number(input.value || 0);
    }
  });

  // Update totals + Parts/Year
  Object.keys(totals).forEach((pos) => {
    const totalCarsInput = document.getElementById(`plant_total_${pos}`);
    if (totalCarsInput) {
      totalCarsInput.value = totals[pos];
    }

    calculatePartsPerYear(pos);
    calculateAnnualMachineTime(pos);
    calculateAnnualMachineTime_3_2_2(pos);
    calculateAnnualMachineTimePerPartNr_3_8_2_1(pos);
    calculateAnnualMachineTimePerPartNr_3_8_2_2(pos);
  });
}

function calculatePartsPerYear(pos) {
  const partsPerCarInput = document.querySelector(
    `.parts-per-car[data-pos="${pos}"]`,
  );

  const totalCarsInput = document.getElementById(`plant_total_${pos}`);

  const partsPerYearInput = document.querySelector(
    `.parts-per-year[data-pos="${pos}"]`,
  );

  if (!partsPerCarInput || !totalCarsInput || !partsPerYearInput) return;

  const partsPerCar = Number(partsPerCarInput.value || 0);
  const totalCars = Number(totalCarsInput.value || 0);

  partsPerYearInput.value = partsPerCar * totalCars;

  // 🔥 CRITICAL: trigger dependent calculation (Section 1.3)
  calculatePartsPerMonth(pos);
  calculateProductionRunsPerYear(pos);
}

// Recalculate when Parts / Car changes
document.addEventListener("input", function (e) {
  if (e.target.classList.contains("parts-per-car")) {
    calculatePartsPerYear(e.target.dataset.pos);
    calculateToolingCostPerPart_3_3(e.target.dataset.pos);
    calculateMaterial_A_Kg_3_8_1(e.target.dataset.pos);
    calculateMaterial_B_Kg_3_8_1(e.target.dataset.pos);
    calculateMaterial_C_Kg_3_8_1(e.target.dataset.pos);
    calculateMaterial_D_Kg_3_8_1(e.target.dataset.pos);
  }
});

// Initial calculation
document.addEventListener("DOMContentLoaded", calculatePlantTotals);

/*===============================================
Section 1.2
=================================================*/
// Material dropdown → density
document.addEventListener("change", function (e) {
  const select = e.target;
  if (!select.classList.contains("material-select")) return;

  const pos = select.dataset.pos;
  const type = select.dataset.type;
  const density = select.selectedOptions[0]?.dataset.density || 0;

  const densityInput = document.querySelector(
    `.density-input[data-type="${type}"][data-pos="${pos}"]`,
  );

  if (densityInput) {
    densityInput.value = Number(density).toFixed(5);
    recalcAll(pos); // IMPORTANT
  }
});

//Helpers
function num(el) {
  return el ? Number(el.value || 0) : 0;
}

function getValue(type, field, pos) {
  return num(
    document.querySelector(`.${field}[data-type="${type}"][data-pos="${pos}"]`),
  );
}

function setValue(type, field, pos, value) {
  const el = document.querySelector(
    `.${field}[data-type="${type}"][data-pos="${pos}"]`,
  );
  if (el) el.value = value.toFixed(3);
}

//Weight / PART
function recalcWeightPerPart(pos) {
  const wa =
    getValue("a", "density-input", pos) * getValue("a", "volume-input", pos);
  const wb =
    getValue("b", "density-input", pos) * getValue("b", "volume-input", pos);
  const wc =
    getValue("c", "density-input", pos) * getValue("c", "volume-input", pos);
  const wd =
    getValue("d", "density-input", pos) * getValue("d", "volume-input", pos);

  setValue("a", "weight-input", pos, wa);
  setValue("b", "weight-input", pos, wb);
  setValue("c", "weight-input", pos, wc);
  setValue("d", "weight-input", pos, wd);

  const total = wa + wb + wc + wd;
  //const total = Math.round( wa + wb + wc + wd);
  //const total = ROUNDUP( wa + wb + wc + wd);
  const totalEl = document.querySelector(
    `.total-weight-part[data-pos="${pos}"]`,
  );
  if (totalEl) totalEl.value = total.toFixed(3);
}

//Weight / CAR
function recalcWeightPerCar(pos) {
  const parts = num(
    document.querySelector(`.parts-per-car[data-pos="${pos}"]`),
  );

  const wa = num(
    document.querySelector(`.weight-input[data-type="a"][data-pos="${pos}"]`),
  );
  const wb = num(
    document.querySelector(`.weight-input[data-type="b"][data-pos="${pos}"]`),
  );
  const wc = num(
    document.querySelector(`.weight-input[data-type="c"][data-pos="${pos}"]`),
  );
  const wd = num(
    document.querySelector(`.weight-input[data-type="d"][data-pos="${pos}"]`),
  );

  const polyamide = wa * parts;
  const terophon = wb * parts;
  const steel = wc * parts;
  const others = wd * parts;

  const set = (cls, val) => {
    const el = document.querySelector(`.${cls}[data-pos="${pos}"]`);
    if (el) el.value = val.toFixed(3);
  };

  set("polyamide", polyamide);
  set("terophon", terophon);
  set("steel", steel);
  set("others", others);

  const total = polyamide + terophon + steel + others;
  const totalEl = document.querySelector(
    `.total-weight-car[data-pos="${pos}"]`,
  );
  if (totalEl) totalEl.value = total.toFixed(3);
}

//Master recalculation
function recalcAll(pos) {
  recalcWeightPerPart(pos);
  recalcWeightPerCar(pos);
  // 🔥 ADD THIS
  calculateMaterialBCost_3_2_1(pos);
  calculateMaterial_A_Kg_3_8_1(pos);
  calculateMaterial_B_Kg_3_8_1(pos);
  calculateMaterial_C_Kg_3_8_1(pos);
  calculateMaterial_D_Kg_3_8_1(pos);
}

//ONE global input handler
document.addEventListener("input", function (e) {
  const pos = e.target.dataset.pos;
  if (!pos) return;
  recalcAll(pos);
});

/*=======================================================
Section 1.3
=========================================================*/
// PARTS / BOX (CALCULATED)
function calculatePartsPerBox(pos) {
  const volA =
    parseFloat(
      document.querySelector(`.volume-input[data-type="a"][data-pos="${pos}"]`)
        ?.value,
    ) || 0;

  const volB =
    parseFloat(
      document.querySelector(`.volume-input[data-type="b"][data-pos="${pos}"]`)
        ?.value,
    ) || 0;

  const volC =
    parseFloat(
      document.querySelector(`.volume-input[data-type="c"][data-pos="${pos}"]`)
        ?.value,
    ) || 0;

  const boxVolume =
    parseFloat(
      document.querySelector(`.box-volume[data-pos="${pos}"]`)?.value,
    ) || 0;

  const bulkFactor =
    parseFloat(
      document.querySelector(`.bulk-factor[data-pos="${pos}"]`)?.value,
    ) || 0;

  const resultInput = document.querySelector(
    `.parts-per-box-calc[data-pos="${pos}"]`,
  );

  if (!resultInput) return;

  // Excel: IF(G60+G64=0,0,...)
  if (volA + volB === 0 || bulkFactor === 0) {
    resultInput.value = 0;
    return;
  }

  const partsPerBox = Math.round(
    (boxVolume * 1000) / ((volA + volB + volC) * bulkFactor),
  );

  resultInput.value = Math.floor(partsPerBox);
}

// WEIGHT / UNIT (red > limit) 15 * (KG)
// Excel: ((G90/1000)*G72)+G86
function calculateWeightPerUnit(pos) {
  const partsPerBox =
    parseFloat(
      document.querySelector(`.parts-per-box-defined[data-pos="${pos}"]`)
        ?.value,
    ) || 0;

  const totalWeightPartG =
    parseFloat(
      document.querySelector(`.total-weight-part[data-pos="${pos}"]`)?.value,
    ) || 0;

  const boxWeightKg =
    parseFloat(
      document.querySelector(`.box-weight[data-pos="${pos}"]`)?.value,
    ) || 0;

  const resultInput = document.querySelector(
    `.weight-per-unit-kg[data-pos="${pos}"]`,
  );

  if (!resultInput) return;

  const weightPerUnitKg = (partsPerBox * totalWeightPartG) / 1000 + boxWeightKg;

  resultInput.value = weightPerUnitKg.toFixed(4);

  // 🔴 Red warning > user limit
  const redLimit =
    parseFloat(
      document.querySelector(`.weight-unit-red-limit[data-pos="${pos}"]`)
        ?.value,
    ) || 0;

  if (redLimit > 0 && weightPerUnitKg > redLimit) {
    resultInput.classList.add("bg-danger", "text-white");
  } else {
    resultInput.classList.remove("bg-danger", "text-white");
  }

  // 🔴 Red warning > 15 kg
  /*if (weightPerUnitKg > 15) {
      resultInput.classList.add("bg-danger", "text-white");
    } else {
      resultInput.classList.remove("bg-danger", "text-white");
    }*/
}

// PARTS / PALLET
// Excel: =G90*IF(G95=0,1,G95)
function calculatePartsPerPallet(pos) {
  const partsPerBox =
    parseFloat(
      document.querySelector(`.parts-per-box-defined[data-pos="${pos}"]`)
        ?.value,
    ) || 0;

  let boxesPerPallet =
    parseFloat(
      document.querySelector(`.boxes-per-pallet[data-pos="${pos}"]`)?.value,
    ) || 0;

  const resultInput = document.querySelector(
    `.parts-per-pallet[data-pos="${pos}"]`,
  );

  if (!resultInput) return;

  // Excel IF(G95=0,1,G95)
  if (boxesPerPallet === 0) {
    boxesPerPallet = 1;
  }

  const partsPerPallet = partsPerBox * boxesPerPallet;

  resultInput.value = partsPerPallet;

  // 🔥 REQUIRED downstream trigger
  calculatePartsMinOrderQty(pos);
  calculatePalletWeightGross(pos);
}

// WEIGHT / PALLET (GROSS) [kg]
function calculatePalletWeightGross(pos) {
  const totalWeightPartG =
    parseFloat(
      document.querySelector(`.total-weight-part[data-pos="${pos}"]`)?.value,
    ) || 0; // G72

  const boxWeightKg =
    parseFloat(
      document.querySelector(`.box-weight[data-pos="${pos}"]`)?.value,
    ) || 0; // G86

  const boxesPerPallet =
    parseFloat(
      document.querySelector(`.boxes-per-pallet[data-pos="${pos}"]`)?.value,
    ) || 0; // G95

  const partsPerPallet =
    parseFloat(
      document.querySelector(`.parts-per-pallet[data-pos="${pos}"]`)?.value,
    ) || 0; // G96

  // Pallet description weight (VLOOKUP G93)
  const palletSelect = document.querySelector(
    `.pallet-description[data-pos="${pos}"]`,
  );
  const palletWeightKg =
    parseFloat(palletSelect?.selectedOptions[0]?.dataset.weight) || 0;

  // Top description weight (VLOOKUP G94)
  const topSelect = document.querySelector(
    `.top-description[data-pos="${pos}"]`,
  );
  const topWeightKg =
    parseFloat(topSelect?.selectedOptions[0]?.dataset.weight) || 0;

  const resultInput = document.querySelector(
    `.pallet-weight-gross-kg[data-pos="${pos}"]`,
  );
  if (!resultInput) return;

  // Excel IF(G95=0,1,G95)
  const boxMultiplier = boxesPerPallet === 0 ? 1 : boxesPerPallet;

  const palletWeightGross =
    (partsPerPallet * totalWeightPartG) / 1000 +
    boxWeightKg * boxMultiplier +
    palletWeightKg +
    topWeightKg;

  resultInput.value = palletWeightGross.toFixed(4);
}

// PARTS / MONTH ( Excel: =G52 / 12 )
// We have calculated this part from calculatePartsPerYear() and called this function from calculatePartsPerYear() function only.
function calculatePartsPerMonth(pos) {
  const partsPerYear =
    parseFloat(
      document.querySelector(`.parts-per-year[data-pos="${pos}"]`)?.value,
    ) || 0;

  const resultInput = document.querySelector(
    `.parts-per-month[data-pos="${pos}"]`,
  );

  if (!resultInput) return;

  if (partsPerYear === 0) {
    resultInput.value = 0;
    return;
  }

  resultInput.value = Math.round(partsPerYear / 12);
}

// BOXES / MONTH
// Excel: =IF(G90=0,0,G99/G90)
function calculateBoxesPerMonth(pos) {
  const partsPerBox =
    parseFloat(
      document.querySelector(`.parts-per-box-defined[data-pos="${pos}"]`)
        ?.value,
    ) || 0;

  const partsPerMonth =
    parseFloat(
      document.querySelector(`.parts-per-month[data-pos="${pos}"]`)?.value,
    ) || 0;

  const resultInput = document.querySelector(
    `.boxes-per-month[data-pos="${pos}"]`,
  );

  if (!resultInput) return;

  if (partsPerBox === 0) {
    resultInput.value = 0;
    return;
  }

  resultInput.value = Math.ceil(partsPerMonth / partsPerBox);
}

// PALLETS / MONTH
// Excel: =IF(G96=0,0,G99/G96)
function calculatePalletsPerMonth(pos) {
  const partsPerPallet =
    parseFloat(
      document.querySelector(`.parts-per-pallet[data-pos="${pos}"]`)?.value,
    ) || 0;

  const partsPerMonth =
    parseFloat(
      document.querySelector(`.parts-per-month[data-pos="${pos}"]`)?.value,
    ) || 0;

  const resultInput = document.querySelector(
    `.pallets-per-month[data-pos="${pos}"]`,
  );

  if (!resultInput) return;

  // Excel: IF(G96=0,0,G99/G96)
  if (partsPerPallet === 0) {
    resultInput.value = 0;
    return;
  }

  const pallets = partsPerMonth / partsPerPallet;
  resultInput.value = pallets.toFixed(4); // or 4 if needed
}

// PALLETS REQUESTED FOR LOT PRODUCTION
// Excel: =ROUND(G103/IF(G95=0,1,G95),2)
function calculatePalletsLot(pos) {
  const boxesLot =
    parseFloat(
      document.querySelector(`.boxes-lot[data-pos="${pos}"]`)?.value,
    ) || 0;

  const boxesPerPallet =
    parseFloat(
      document.querySelector(`.boxes-per-pallet[data-pos="${pos}"]`)?.value,
    ) || 0;

  const resultInput = document.querySelector(`.pallets-lot[data-pos="${pos}"]`);

  if (!resultInput) return;

  const divisor = boxesPerPallet === 0 ? 1 : boxesPerPallet;

  resultInput.value = (boxesLot / divisor).toFixed(4);
}

// PRODUCTION LOT (PARTS)
// Excel: =G103 * G90
function calculateProductionLot(pos) {
  const boxesLot =
    parseFloat(
      document.querySelector(`.boxes-lot[data-pos="${pos}"]`)?.value,
    ) || 0;

  const partsPerBox =
    parseFloat(
      document.querySelector(`.parts-per-box-defined[data-pos="${pos}"]`)
        ?.value,
    ) || 0;

  const resultInput = document.querySelector(
    `.production-lot-parts[data-pos="${pos}"]`,
  );

  if (!resultInput) return;

  resultInput.value = boxesLot * partsPerBox;

  // 🔥 REQUIRED
  calculateProductionRunsPerYear(pos);

  // 🔥 CHAINED like Excel
  calculateNumOfPartsPerProductionLot_3_1_1(pos);
  calculateNumOfPartsPerProductionLot_3_2_2(pos);
  //calculateNumOfPartsPerProductionLot(pos);
}

// NUMBER OF PRODUCTION RUNS / YEAR
// Excel: =IF(G90=0,0,ROUNDUP(G52/G105,0))
function calculateProductionRunsPerYear(pos) {
  const partsPerBox =
    parseFloat(
      document.querySelector(`.parts-per-box-defined[data-pos="${pos}"]`)
        ?.value,
    ) || 0;

  const partsPerYear =
    parseFloat(
      document.querySelector(`.parts-per-year[data-pos="${pos}"]`)?.value,
    ) || 0;

  const productionLot =
    parseFloat(
      document.querySelector(`.production-lot-parts[data-pos="${pos}"]`)?.value,
    ) || 0;

  const resultInput = document.querySelector(
    `.production-runs-per-year[data-pos="${pos}"]`,
  );

  if (!resultInput) return;

  // Excel IF(G90=0,0,...)
  if (partsPerBox === 0 || productionLot === 0) {
    resultInput.value = 0;
    return;
  }

  resultInput.value = Math.ceil(partsPerYear / productionLot);
  // 🔥 Force dependent recalculation
  calculateProductionRunsPerYear_3_1_1(pos);
  calculateProductionRunsPerYear_3_2_2(pos);
}

// PARTS MIN. ORDER QUANTITY
// Excel: =G96 * G108
function calculatePartsMinOrderQty(pos) {
  const partsPerPallet =
    parseFloat(
      document.querySelector(`.parts-per-pallet[data-pos="${pos}"]`)?.value,
    ) || 0;

  const palletsMinOrderQty =
    parseFloat(
      document.querySelector(`.pallets-min-order-qty[data-pos="${pos}"]`)
        ?.value,
    ) || 0;

  const resultInput = document.querySelector(
    `.parts-min-order-qty[data-pos="${pos}"]`,
  );

  if (!resultInput) return;

  if (partsPerPallet === 0 || palletsMinOrderQty === 0) {
    resultInput.value = 0;
    return;
  }

  resultInput.value = partsPerPallet * palletsMinOrderQty;
}

// CHANGE EVENTS (dropdowns, selects)
document.addEventListener("change", function (e) {
  const pos = e.target.dataset.pos;
  if (!pos) return;

  // -------------------------------
  // BOX SELECT → AUTO-FILL
  // -------------------------------
  if (e.target.classList.contains("box-select")) {
    const opt = e.target.selectedOptions[0];
    if (!opt) return;

    const l = opt.dataset.l || 0;
    const w = opt.dataset.w || 0;
    const h = opt.dataset.h || 0;
    const weight = opt.dataset.weight || 0;
    const volume = opt.dataset.volume || 0;

    document.querySelector(`.box-dim[data-pos="${pos}"]`).value =
      `${l} x ${w} x ${h}`;

    document.querySelector(`.box-weight[data-pos="${pos}"]`).value =
      Number(weight).toFixed(4);

    document.querySelector(`.box-volume[data-pos="${pos}"]`).value =
      Number(volume).toFixed(4);

    calculatePartsPerBox(pos);
    calculateWeightPerUnit(pos);
    calculatePalletWeightGross(pos);
  }

  // -------------------------------
  // PALLET / TOP DESCRIPTION
  // -------------------------------
  if (
    e.target.classList.contains("pallet-description") ||
    e.target.classList.contains("top-description")
  ) {
    calculatePalletWeightGross(pos);
  }

  // -------------------------------
  // BOXES / MONTH
  // -------------------------------
  if (
    e.target.classList.contains("parts-per-month") ||
    e.target.classList.contains("parts-per-box-defined")
  ) {
    calculateBoxesPerMonth(pos);
  }
});

// INPUT EVENTS (numbers, typing)
document.addEventListener("input", function (e) {
  const pos = e.target.dataset.pos;
  if (!pos) return;

  // -------------------------------
  // PARTS / BOX (calculated)
  // -------------------------------
  if (
    e.target.classList.contains("volume-input") ||
    e.target.classList.contains("bulk-factor")
  ) {
    calculatePartsPerBox(pos);
  }

  // -------------------------------
  // WEIGHT / UNIT
  // -------------------------------
  if (
    e.target.classList.contains("parts-per-box-defined") ||
    e.target.classList.contains("total-weight-part") ||
    e.target.classList.contains("box-weight") ||
    e.target.classList.contains("weight-unit-red-limit")
  ) {
    calculateWeightPerUnit(pos);
  }

  // -------------------------------
  // PARTS / PALLET
  // -------------------------------
  if (
    e.target.classList.contains("parts-per-box-defined") ||
    e.target.classList.contains("boxes-per-pallet")
  ) {
    calculatePartsPerPallet(pos);
    calculatePalletsPerMonth(pos);
    calculateTotalRentPerTurnaround_per_part_3_6_1_2(pos);
    calculateAdminCostPerPart_3_6_1_2(pos);
  }

  // -------------------------------
  // WEIGHT / PALLET (GROSS)
  // -------------------------------
  if (
    e.target.classList.contains("total-weight-part") ||
    e.target.classList.contains("box-weight") ||
    e.target.classList.contains("boxes-per-pallet") ||
    e.target.classList.contains("parts-per-pallet")
  ) {
    calculatePalletWeightGross(pos);
  }

  // -------------------------------
  // G90 → parts / box
  // -------------------------------
  if (e.target.classList.contains("parts-per-box-defined")) {
    calculateBoxesPerMonth(pos); // direct dependency
    calculatePartsPerPallet(pos); // 👈 IMPORTANT
    calculatePalletsPerMonth(pos); // indirect dependency
    calculateTotalRentPerTurnaround_per_part_3_6_1_2(pos);
    calculateAdminCostPerPart_3_6_1_2(pos);
  }
  // -------------------------------
  // G96 → parts / pallet (explicit user change)
  // -------------------------------
  if (e.target.classList.contains("parts-per-pallet")) {
    calculatePalletsPerMonth(pos);
  }
  // -------------------------------
  // G99 → parts / month
  // -------------------------------
  if (e.target.classList.contains("parts-per-month")) {
    calculateBoxesPerMonth(pos);
    calculatePalletsPerMonth(pos);
  }

  // -------------------------------
  // PALLETS REQUESTED FOR LOT PRODUCTION
  // -------------------------------

  if (
    e.target.classList.contains("boxes-lot") ||
    e.target.classList.contains("boxes-per-pallet")
  ) {
    calculatePalletsLot(pos);
  }

  // -------------------------------
  // PRODUCTION LOT (PARTS)
  // -------------------------------

  if (
    e.target.classList.contains("boxes-lot") ||
    e.target.classList.contains("parts-per-box-defined")
  ) {
    calculateProductionLot(pos);
  }

  // -------------------------------
  // PRODUCTION RUNS PER YEAR
  // -------------------------------
  if (e.target.classList.contains("parts-per-box-defined")) {
    calculateProductionRunsPerYear(pos);
  }

  // -------------------------------
  // PARTS MIN. ORDER QUANTITY
  // -------------------------------
  if (e.target.classList.contains("pallets-min-order-qty")) {
    calculatePartsMinOrderQty(pos);
  }
});

/*===============================================
Section 2
===================================================*/
function numberToLetters(num) {
  let letters = "";
  while (num >= 0) {
    letters = String.fromCharCode((num % 26) + 65) + letters;
    num = Math.floor(num / 26) - 1;
  }
  return letters;
}

function generateToolCodes() {
  document.querySelectorAll(".material-section").forEach((section) => {
    const material = section.dataset.material.toLowerCase();
    if (!material) return;

    const inputs = section.querySelectorAll(`.tool-code-mat-${material}`);

    inputs.forEach((input, index) => {
      const code = numberToLetters(index);

      // ✅ set value
      input.value = code;

      // ✅ VERY IMPORTANT: trigger dependent logic
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });
}

document.addEventListener("DOMContentLoaded", generateToolCodes);

function recalcTotalInvestment(posId) {
  const armCost =
    parseFloat(
      document.querySelector(
        `.end-of-arm-tooling-or-gripper-cost[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const mouldCost =
    parseFloat(
      document.querySelector(`.total-mould-investment[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const target = document.querySelector(
    `.total-investment[data-pos="${posId}"]`,
  );

  if (target) {
    target.value = (armCost + mouldCost).toFixed(4);
  }
}

document.addEventListener("input", function (e) {
  const el = e.target;
  const posId = el.dataset.pos;
  if (!posId) return;

  /* 🔥 0️⃣ End-of-arm tooling cost */
  if (el.classList.contains("end-of-arm-tooling-or-gripper-cost")) {
    recalcTotalInvestment(posId);
    return; // no material-section needed
  }

  /* Material section required below */
  const section = el.closest(".material-section");
  if (!section) return;

  const material = section.dataset.material; // A / B / C / ...

  /* 1️⃣ Min clamping force */
  if (el.classList.contains("projected-area")) {
    const projectedArea = parseFloat(el.value) || 0;

    const pressureMap = {
      A: 0.5,
      B: 0.4,
      C: 0.45,
      D: 0.5,
    };

    const pressure = pressureMap[material] || 0.5;

    const target = section.querySelector(
      `.min-clamping-per-part[data-pos="${posId}"]`,
    );

    if (target) {
      target.value = (projectedArea * pressure).toFixed(4);
    }
  }

  /* 2️⃣ Mould investment per material */
  const costFields = [
    `material-${material.toLowerCase()}-prorated`,
    `manufacturing-${material.toLowerCase()}-prorated`,
    `construction-${material.toLowerCase()}-prorated`,
    `service-overhead-${material.toLowerCase()}-prorated`,
  ];

  if (costFields.some((cls) => el.classList.contains(cls))) {
    const sum = costFields.reduce((total, cls) => {
      const field = section.querySelector(`.${cls}[data-pos="${posId}"]`);
      return total + (parseFloat(field?.value) || 0);
    }, 0);

    const target = section.querySelector(
      `.mould-investment-${material.toLowerCase()}-prorated[data-pos="${posId}"]`,
    );

    if (target) {
      target.value = sum.toFixed(4);
    }
  }

  /* 3️⃣ TOTAL mould investment */
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const totalMould =
    getVal("mould-investment-a-prorated") +
    getVal("mould-investment-b-prorated") +
    getVal("mould-investment-c-prorated");

  const totalMouldTarget = document.querySelector(
    `.total-mould-investment[data-pos="${posId}"]`,
  );

  if (totalMouldTarget) {
    totalMouldTarget.value = totalMould.toFixed(4);

    // 🔥 cascade update
    recalcTotalInvestment(posId);
    calculateToolingCostPerPart_3_3(posId);
  }
});

/*=======================================================
Section 3
=========================================================
3.2 Component A cost
=========================================================*/
document.addEventListener("change", function (e) {
  const el = e.target;

  // Only react to machine dropdown
  if (!el.classList.contains("machine-select")) return;

  const posId = el.dataset.pos;
  if (!posId) return;

  // Selected option text (e.g. "1K 180t")
  const selectedText = el.selectedOptions[0]?.text || "";

  // Target readonly Machine field
  const machineField = document.querySelector(
    `._3-1-2-machine[data-pos="${posId}"]`,
  );

  if (machineField) {
    machineField.value = selectedText.trim();
  }
});

function calculateProductionRunsPerYear_3_1_1(posId) {
  const machineRateEl = document.querySelector(
    `._3-1-2-machine-rate[data-pos="${posId}"]`,
  );

  const runsPerYearEl = document.querySelector(
    `.production-runs-per-year[data-pos="${posId}"]`,
  );

  const targetEl = document.querySelector(
    `._3-1-2-num-of-production-runs-per-year[data-pos="${posId}"]`,
  );

  if (!machineRateEl || !runsPerYearEl || !targetEl) {
    console.log(machineRateEl, runsPerYearEl, targetEl);
    return;
  }

  const machineRate = parseFloat(machineRateEl.value) || 0;
  const runsPerYear = parseFloat(runsPerYearEl.value) || 0;

  targetEl.value = machineRate === 0 ? 0 : runsPerYear;
}

function calculateNumOfPartsPerProductionLot_3_1_1(posId) {
  const machineRateEl = document.querySelector(
    `._3-1-2-machine-rate[data-pos="${posId}"]`,
  );

  const productionLotEl = document.querySelector(
    `.production-lot-parts[data-pos="${posId}"]`,
  );

  const targetEl = document.querySelector(
    `._3-1-2-num-of-parts-per-production-lot[data-pos="${posId}"]`,
  );

  if (!machineRateEl || !productionLotEl || !targetEl) return;

  const machineRate = parseFloat(machineRateEl.value) || 0;
  const productionLot = parseFloat(productionLotEl.value) || 0;

  // Excel: =IF(G236=0,0,G105)
  targetEl.value = machineRate === 0 ? 0 : productionLot;
}

function calculateMachineRate_3_1_1(posId) {
  const machineSelect = document.querySelector(
    `.machine-select[data-pos="${posId}"]`,
  );

  const targetEl = document.querySelector(
    `._3-1-2-machine-rate[data-pos="${posId}"]`,
  );

  if (!machineSelect || !targetEl) return;

  const selectedOption = machineSelect.selectedOptions[0];
  if (!selectedOption || !selectedOption.dataset.machineRate) {
    targetEl.value = 0;
    return;
  }

  const rate = parseFloat(selectedOption.dataset.machineRate) || 0;
  targetEl.value = rate;
}

function calculateProductionRunDuration(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const machineRate = getVal("_3-1-2-machine-rate"); // G236
  if (machineRate === 0) {
    setResult(0);
    return;
  }

  const partsPerRun = getVal("_3-1-2-num-of-parts-per-production-lot"); // G232
  const cycleTimeSec = getVal("_3-1-2-cycle-time"); // G229
  const startupTime = getVal("_3-1-2-startup-phaseout-time-per-production"); // G228
  const downtimePct = getVal("_3-1-2-downtime-breakdowns") / 100; // G230
  const wastePct = getVal("_3-1-2-total-waste-rate") / 100; // G231
  const finishedTool = getVal("_3-1-2-num-of-finished-parts-per-cycle-tool"); // G226
  const finishedPart = getVal("_3-1-2-num-of-finished-parts-per-cycle-part-nr"); // G227

  if (finishedTool === 0 || finishedPart === 0) {
    setResult(0);
    return;
  }

  // (G232*G229/3600)
  const baseTimeHours = (partsPerRun * cycleTimeSec) / 3600;

  // (1 + G231 + G230)
  const lossFactor = 1 + wastePct + downtimePct;

  // ((baseTime * lossFactor) + G228)
  const totalRunTime = baseTimeHours * lossFactor + startupTime;

  // / G227 / (G226/G227)
  const durationPerPart =
    totalRunTime / finishedPart / (finishedTool / finishedPart);

  setResult(durationPerPart);

  function setResult(val) {
    const target = document.querySelector(
      `._3-1-2-duration-production-run[data-pos="${posId}"]`,
    );
    if (target) target.value = val.toFixed(4);
  }
}

function calculateAnnualMachineTime(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const machineRate = getVal("_3-1-2-machine-rate"); // G236
  const partsPerYear = getVal("parts-per-year"); // G52
  const partsPerRun = getVal("_3-1-2-num-of-parts-per-production-lot"); // G232
  const durationRun = getVal("_3-1-2-duration-production-run"); // G233

  const target = document.querySelector(
    `._3-1-2-annual-machine-time[data-pos="${posId}"]`,
  );
  if (!target) return;

  // Excel: IF(G236=0,0,(G52/G232*G233))
  if (machineRate === 0 || partsPerRun === 0) {
    target.value = 0;
    return;
  }

  const annualTime = (partsPerYear / partsPerRun) * durationRun;
  target.value = annualTime.toFixed(4);
}

function calculateShotsPerHour(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const partsPerRun = getVal("_3-1-2-num-of-parts-per-production-lot"); // G232
  const cycleTimeSec = getVal("_3-1-2-cycle-time"); // G229
  const downtimePct = getVal("_3-1-2-downtime-breakdowns") / 100; // G230
  const wastePct = getVal("_3-1-2-total-waste-rate") / 100; // G231
  const startupTime = getVal("_3-1-2-startup-phaseout-time-per-production"); // G228

  const target = document.querySelector(
    `._3-1-2-shots-per-hour[data-pos="${posId}"]`,
  );
  if (!target) return;

  if (partsPerRun === 0 || cycleTimeSec === 0) {
    target.value = 0;
    return;
  }

  // (G232 * G229) / 3600
  const baseTimeHours = (partsPerRun * cycleTimeSec) / 3600;

  // (1 + G230 + G231)
  const lossFactor = 1 + downtimePct + wastePct;

  // denominator
  const totalTime = baseTimeHours * lossFactor + startupTime;

  if (totalTime === 0) {
    target.value = 0;
    return;
  }

  const shotsPerHour = partsPerRun / totalTime;
  target.value = shotsPerHour.toFixed(4);
}

function calculateProductionCostPerPart(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const machineRate = getVal("_3-1-2-machine-rate"); // G236
  const shotsPerHour = getVal("_3-1-2-shots-per-hour"); // G235
  const finishedPerCycle = getVal(
    "_3-1-2-num-of-finished-parts-per-cycle-tool",
  ); // G226
  const indirectPct = getVal("_3-1-2-production-mat-a-indirect-cost") / 100; // G237

  const target = document.querySelector(
    `._3-1-2-production-cost-per-part[data-pos="${posId}"]`,
  );
  if (!target) return;

  // Excel: IF(G236=0,0,…)
  if (machineRate === 0 || shotsPerHour === 0 || finishedPerCycle === 0) {
    target.value = 0;
    return;
  }

  // (G236 / G235 / G226) * (1 + G237)
  const costPerPart =
    (machineRate / shotsPerHour / finishedPerCycle) * (1 + indirectPct);

  target.value = costPerPart.toFixed(4);
}

function calculateLabourCost_3_1_3(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const machineRate = getVal("_3-1-2-machine-rate"); // G236
  const shotsPerHour = getVal("_3-1-2-shots-per-hour"); // G235
  const finishedPerCycle = getVal(
    "_3-1-2-num-of-finished-parts-per-cycle-tool",
  ); // G226
  const personnelPct =
    getVal("_3-1-3-personnel-employment-during-production") / 100; // G241

  const target = document.querySelector(
    `._3-1-3-labour-cost[data-pos="${posId}"]`,
  );

  if (!target) return;

  // Excel: IF(G236=0,0,...)
  if (
    machineRate === 0 ||
    shotsPerHour === 0 ||
    finishedPerCycle === 0 ||
    personnelPct === 0
  ) {
    target.value = 0;
    return;
  }

  // ('1. material cost'!E77 / G235 / G226 * G241)
  const labourCost =
    (LABOUR_COST_PER_HOUR / shotsPerHour / finishedPerCycle) * personnelPct;
  console.log("LABOUR_COST_PER_HOUR=>" + LABOUR_COST_PER_HOUR);
  target.value = labourCost.toFixed(4);
}

function calculateLabourSetupCost_3_1_3(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const machineRate = getVal("_3-1-2-machine-rate"); // G236
  const runsPerYear = getVal("_3-1-2-num-of-production-runs-per-year"); // G225
  const finishedPerCycleTool = getVal(
    "_3-1-2-num-of-finished-parts-per-cycle-tool",
  ); // G226
  const finishedPerCyclePartNr = getVal(
    "_3-1-2-num-of-finished-parts-per-cycle-part-nr",
  ); // G227
  const setupTime = getVal("_3-1-2-startup-phaseout-time-per-production"); // G228
  const partsPerYear = getVal("parts-per-year"); // G52

  const target = document.querySelector(
    `._3-1-3-Labour-setup-cost[data-pos="${posId}"]`,
  );

  if (!target) return;

  // Excel: IF(G236=0,0,...)
  if (
    machineRate === 0 ||
    runsPerYear === 0 ||
    setupTime === 0 ||
    partsPerYear === 0 ||
    finishedPerCycleTool === 0 ||
    finishedPerCyclePartNr === 0
  ) {
    target.value = 0;
    return;
  }

  // Excel formula
  const labourSetupCost =
    ((LABOUR_SETUP_COST_PER_HOUR * runsPerYear * setupTime) / partsPerYear) *
    (finishedPerCyclePartNr / finishedPerCycleTool);

  target.value = labourSetupCost.toFixed(4);
}

/* ------------------------------------------
     Labour cost per part
     Excel: =(G242*(1+G244+G231))+(G243*(1+G244))
  ------------------------------------------*/

function calculateLabourCostPerPart_3_1_3(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const labourCost = getVal("_3-1-3-labour-cost"); // G242
  const setupCost = getVal("_3-1-3-Labour-setup-cost"); // G243
  const indirectRate = getVal("_3-1-3-Labour-indirect-cost") / 100; // G244
  const wasteRate = getVal("_3-1-2-total-waste-rate") / 100; // G231

  const target = document.querySelector(
    `._3-1-3-Labour-cost-per-part[data-pos="${posId}"]`,
  );

  if (!target) return;

  const result =
    labourCost * (1 + indirectRate + wasteRate) +
    setupCost * (1 + indirectRate);

  console.log("result" + result);

  target.value = result.toFixed(4);
}

/* ------------------------------------------
       Tool Nr. Material A
    ------------------------------------------ */
document.addEventListener("input", function (e) {
  if (!e.target.classList.contains("tool-code-mat-a")) return;

  const posId = e.target.dataset.pos;
  if (!posId) return;

  const toolNrEl = document.querySelector(
    `._3-1-2-tool-nr[data-pos="${posId}"]`,
  );

  if (toolNrEl) {
    toolNrEl.value = e.target.value;
  }
});

document.addEventListener("input", function (e) {
  const el = e.target;
  const posId = el.dataset.pos;
  if (!posId) return;

  /* ------------------------------------------
         Material A Cost [EUR/Part]
      ------------------------------------------ */

  // Weight (g)
  const weightEl = document.querySelector(
    `.weight-input[data-type="a"][data-pos="${posId}"]`,
  );
  const weight = parseFloat(weightEl?.value) || 0;

  // Material select & price
  const materialSelect = document.querySelector(
    `.material-select[data-type="a"][data-pos="${posId}"]`,
  );
  const selectedOption = materialSelect?.selectedOptions[0];
  const pricePerKg = parseFloat(selectedOption?.dataset.price) || 0;

  // Waste rate (% → decimal)
  const wasteEl = document.querySelector(
    `._3-1-2-total-waste-rate[data-pos="${posId}"]`,
  );
  const wasteRate = (parseFloat(wasteEl?.value) || 0) / 100;

  // Target cost field
  const costEl = document.querySelector(
    `._3-1-1-material-a-cost[data-pos="${posId}"]`,
  );

  if (!costEl) return;

  // Prevent division by zero
  if (weight === 0 || pricePerKg === 0 || wasteRate >= 1) {
    costEl.value = "";
    return;
  }

  // Calculation
  const cost = (weight * pricePerKg) / 1000 / (1 - wasteRate);

  costEl.value = cost.toFixed(4);

  /* ------------------------------------------
       Material A total cost [EUR/Part]
       => G218 * (1 + G219)
    ------------------------------------------ */

  const _3_1_1_material_a_cost = document.querySelector(
    `._3-1-1-material-a-cost[data-pos="${posId}"]`,
  );

  const _3_1_1_material_a_indirect_cost = document.querySelector(
    `._3-1-1-material-a-indirect-cost[data-pos="${posId}"]`,
  );

  const _3_1_1_material_a_total_cost = document.querySelector(
    `._3-1-1-material-a-total-cost[data-pos="${posId}"]`,
  );

  if (
    !_3_1_1_material_a_cost ||
    !_3_1_1_material_a_indirect_cost ||
    !_3_1_1_material_a_total_cost
  )
    return;

  // Convert values safely
  const costValue = parseFloat(_3_1_1_material_a_cost.value) || 0;
  const indirectPercent =
    parseFloat(_3_1_1_material_a_indirect_cost.value) || 0;

  // % → decimal
  const indirectRate = indirectPercent / 100;

  // Calculation
  const totalCost = costValue * (1 + indirectRate);

  // Update field
  _3_1_1_material_a_total_cost.value = totalCost.toFixed(4);
  calculateMaterialA_3_7_1(posId);

  /* ------------------------------------------
       Number production runs per year
    ------------------------------------------ */
  calculateProductionRunsPerYear_3_1_1(posId);

  /* ------------------------------------------
       Number of finished parts per cycle and tool
    ------------------------------------------*/
  const machine_nr_value_a = document.querySelector(
    `.machine-nr-value-a[data-pos="${posId}"]`,
  );

  const targetEl = document.querySelector(
    `._3-1-2-num-of-finished-parts-per-cycle-tool[data-pos="${posId}"]`,
  );

  if (!machine_nr_value_a || !targetEl) return;

  const value = parseFloat(machine_nr_value_a.value) || 0;
  targetEl.value = value > 0 ? value : 0;

  /*------------------------------------------
      Number of finished parts per cycle and part-nr.
    ------------------------------------------*/

  const _3_1_2_num_of_finished_parts_per_cycle_part_nr = document.querySelector(
    `._3-1-2-num-of-finished-parts-per-cycle-part-nr[data-pos="${posId}"]`,
  );

  if (!machine_nr_value_a || !_3_1_2_num_of_finished_parts_per_cycle_part_nr)
    return;

  _3_1_2_num_of_finished_parts_per_cycle_part_nr.value = value > 0 ? value : 0;

  /* ------------------------------------------
    Machine rate
    ------------------------------------------*/
  calculateMachineRate_3_1_1(posId);
  calculateProductionCostPerPart(posId);

  /*------------------------------------------
    Number of parts per production run / Production lot
    ------------------------------------------*/
  calculateNumOfPartsPerProductionLot_3_1_1(posId);
  calculateShotsPerHour(posId);
});

document.addEventListener("input", function (e) {
  const posId = e.target.dataset.pos;
  if (!posId) return;

  /*------------------------------------------
    Duration of production run (per part-nr.)
    ------------------------------------------*/
  if (
    e.target.classList.contains("_3-1-2-cycle-time") ||
    e.target.classList.contains(
      "_3-1-2-startup-phaseout-time-per-production",
    ) ||
    e.target.classList.contains("_3-1-2-downtime-breakdowns") ||
    e.target.classList.contains("_3-1-2-total-waste-rate")
  ) {
    calculateProductionRunDuration(posId);
    calculateAnnualMachineTime(posId); // ✅ ADD
    calculateAnnualMachineTimePerPartNr_3_8_2_1(posId); // ✅ ADD
  }

  /*------------------------------------------
    Shots per hour (eff.)
    ------------------------------------------*/
  if (
    e.target.classList.contains("_3-1-2-cycle-time") ||
    e.target.classList.contains("_3-1-2-downtime-breakdowns") ||
    e.target.classList.contains("_3-1-2-total-waste-rate") ||
    e.target.classList.contains("_3-1-2-startup-phaseout-time-per-production")
  ) {
    calculateShotsPerHour(posId);
    calculateProductionCostPerPart(posId);
  }

  /*------------------------------------------
    Production cost per part
    ------------------------------------------*/
  if (e.target.classList.contains("_3-1-2-production-mat-a-indirect-cost")) {
    calculateProductionCostPerPart(posId);
    calculateMachineAB_3_7_1(posId);
  }
});

document.addEventListener("change", function (e) {
  if (!e.target.classList.contains("machine-select")) return;

  const posId = e.target.dataset.pos;
  if (!posId) return;

  calculateMachineRate_3_1_1(posId);
  calculateAnnualMachineTime(posId);
  calculateAnnualMachineTimePerPartNr_3_8_2_1(posId);
});

/*==========Labour Cost==============*/
document.addEventListener("input", function (e) {
  const posId = e.target.dataset.pos;
  if (!posId) return;
  /*------------------------------------------
    Personnel employment during production
    ------------------------------------------*/
  if (
    e.target.classList.contains("_3-1-2-machine-rate") ||
    e.target.classList.contains("_3-1-2-shots-per-hour") ||
    e.target.classList.contains(
      "_3-1-2-num-of-finished-parts-per-cycle-tool",
    ) ||
    e.target.classList.contains("_3-1-3-personnel-employment-during-production")
  ) {
    calculateLabourCost_3_1_3(posId);
    calculateLabourAB_3_7_1(posId);
  }

  if (
    e.target.classList.contains("_3-1-2-startup-phaseout-time-per-production")
  ) {
    const posId = e.target.dataset.pos;
    if (!posId) return;

    calculateLabourSetupCost_3_1_3(posId);
  }

  if (
    e.target.classList.contains("_3-1-3-labour-cost") ||
    e.target.classList.contains("_3-1-3-Labour-setup-cost") ||
    e.target.classList.contains("_3-1-3-Labour-indirect-cost") ||
    e.target.classList.contains("_3-1-2-total-waste-rate")
  ) {
    calculateLabourCostPerPart_3_1_3(posId);
  }
});

/*======================================================*/
/* 3.2 Component B cost*/
/* ======================================================*/
function calculateMaterialBCost_3_2_1(posId) {
  // Weight (g)
  const weightEl = document.querySelector(
    `.weight-input[data-type="b"][data-pos="${posId}"]`,
  );
  const weight = parseFloat(weightEl?.value) || 0;

  // Material select
  const materialSelect = document.querySelector(
    `.material-select[data-type="b"][data-pos="${posId}"]`,
  );
  const selectedOption = materialSelect?.selectedOptions[0];

  // Price per kg (VLOOKUP replacement)
  const pricePerKg = parseFloat(selectedOption?.dataset.price) || 0;

  // Waste rate (% → decimal)
  const wasteEl = document.querySelector(
    `._3-2-2-total-waste-rate[data-pos="${posId}"]`,
  );
  const wasteRate = (parseFloat(wasteEl?.value) || 0) / 100;

  // Target field
  const targetEl = document.querySelector(
    `._3-2-1-material-b-cost[data-pos="${posId}"]`,
  );

  if (!targetEl) return;

  // Prevent invalid math
  if (weight === 0 || pricePerKg === 0 || wasteRate >= 1) {
    targetEl.value = "";
    return;
  }

  // Calculation
  const cost = (weight * pricePerKg) / 1000 / (1 - wasteRate);

  targetEl.value = cost.toFixed(4);
}

function calculateMaterialBTotalCost_3_2_1(posId) {
  const materialBCostEl = document.querySelector(
    `._3-2-1-material-b-cost[data-pos="${posId}"]`,
  );

  const indirectEl = document.querySelector(
    `._3-2-1-material-b-indirect-cost[data-pos="${posId}"]`,
  );

  const totalEl = document.querySelector(
    `._3-2-1-material-b-total-cost[data-pos="${posId}"]`,
  );

  if (!materialBCostEl || !indirectEl || !totalEl) return;

  const materialBCost = parseFloat(materialBCostEl.value) || 0;

  // ⚠️ assuming user enters %
  const indirectRate = (parseFloat(indirectEl.value) || 0) / 100;

  const total = materialBCost * (1 + indirectRate);

  totalEl.value = total.toFixed(4);
}

function syncMachine_B(posId) {
  console.log("Entered into function syncMachine_B()");
  const machineSelect = document.querySelector(
    `select[name="tool_machine[B][${posId}]"]`,
  );
  console.log("machineSelect: " + machineSelect);

  const outputEl = document.querySelector(
    `._3-2-2-machine[data-pos="${posId}"]`,
  );

  console.log("outputEl: 0: " + outputEl);

  if (!machineSelect || !outputEl) return;

  const selectedOption = machineSelect.selectedOptions[0];

  // Show readable machine text (nr + title)
  outputEl.value = selectedOption ? selectedOption.text.trim() : "";
}

function syncToolNr_B(posId) {
  const toolCodeEl = document.querySelector(
    `.tool-code-mat-b[data-pos="${posId}"]`,
  );

  const outputEl = document.querySelector(
    `._3-2-2-tool-nr[data-pos="${posId}"]`,
  );

  if (!toolCodeEl || !outputEl) return;

  outputEl.value = toolCodeEl.value || "";
}

function calculateMachineRate_3_2_2(posId) {
  const machineSelect = document.querySelector(
    `.machine-select-b[data-pos="${posId}"]`,
  );

  const targetEl = document.querySelector(
    `._3-2-2-machine-rate[data-pos="${posId}"]`,
  );

  if (!machineSelect || !targetEl) return;

  const selectedOption = machineSelect.selectedOptions[0];

  if (!selectedOption) {
    targetEl.value = 0;
    return;
  }

  const rate = parseFloat(selectedOption.dataset.machineRate) || 0;
  targetEl.value = rate.toFixed(4);
}

function calculateProductionRunsPerYear_3_2_2(posId) {
  console.log("calculateProductionRunsPerYear_3_2_2()");

  const machineRateEl = document.querySelector(
    `._3-2-2-machine-rate[data-pos="${posId}"]`,
  );

  const runsPerYearEl = document.querySelector(
    `.production-runs-per-year[data-pos="${posId}"]`,
  );

  const targetEl = document.querySelector(
    `._3-2-2-num-of-production-runs-per-year[data-pos="${posId}"]`,
  );

  if (!machineRateEl || !runsPerYearEl || !targetEl) {
    console.log(machineRateEl, runsPerYearEl, targetEl);
    return;
  }

  const machineRate = parseFloat(machineRateEl.value) || 0;
  const runsPerYear = parseFloat(runsPerYearEl.value) || 0;

  targetEl.value = machineRate === 0 ? 0 : runsPerYear;
}

function calculateNumOfPartsPerProductionLot_3_2_2(posId) {
  const machineRateEl = document.querySelector(
    `._3-2-2-machine-rate[data-pos="${posId}"]`,
  );

  const productionLotEl = document.querySelector(
    `.production-lot-parts[data-pos="${posId}"]`,
  );

  const targetEl = document.querySelector(
    `._3-2-2-num-of-parts-per-production-lot[data-pos="${posId}"]`,
  );

  if (!machineRateEl || !productionLotEl || !targetEl) return;

  const machineRate = parseFloat(machineRateEl.value) || 0;
  const productionLot = parseFloat(productionLotEl.value) || 0;

  // Excel: =IF(G236=0,0,G105)
  targetEl.value = machineRate === 0 ? 0 : productionLot;
}

function calculateProductionRunDuration_3_2_2(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const machineRate = getVal("_3-1-2-machine-rate"); // G236
  if (machineRate === 0) {
    setResult(0);
    return;
  }

  const partsPerRun = getVal("_3-2-2-num-of-parts-per-production-lot"); // G232
  const cycleTimeSec = getVal("_3-2-2-cycle-time"); // G229
  const startupTime = getVal("_3-2-2-startup-phaseout-time-per-production"); // G228
  const downtimePct = getVal("_3-2-2-downtime-breakdowns") / 100; // G230
  const wastePct = getVal("_3-2-2-total-waste-rate") / 100; // G231
  const finishedTool = getVal("_3-2-2-num-of-finished-parts-per-cycle-tool"); // G226
  const finishedPart = getVal("_3-2-2-num-of-finished-parts-per-cycle-part-nr"); // G227

  if (finishedTool === 0 || finishedPart === 0) {
    setResult(0);
    return;
  }

  // (G232*G229/3600)
  const baseTimeHours = (partsPerRun * cycleTimeSec) / 3600;

  // (1 + G231 + G230)
  const lossFactor = 1 + wastePct + downtimePct;

  // ((baseTime * lossFactor) + G228)
  const totalRunTime = baseTimeHours * lossFactor + startupTime;

  // / G227 / (G226/G227)
  const durationPerPart =
    totalRunTime / finishedPart / (finishedTool / finishedPart);

  setResult(durationPerPart);

  function setResult(val) {
    const target = document.querySelector(
      `._3-2-2-duration-production-run[data-pos="${posId}"]`,
    );
    if (target) target.value = val.toFixed(4);
  }
}

function calculateAnnualMachineTime_3_2_2(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const machineRate = getVal("_3-2-2-machine-rate"); // G268
  const partsPerYear = getVal("parts-per-year"); // G52
  const partsPerRun = getVal("_3-2-2-num-of-parts-per-production-lot"); // G264
  const durationRun = getVal("_3-2-2-duration-production-run"); // G265

  const target = document.querySelector(
    `._3-2-2-annual-machine-time[data-pos="${posId}"]`,
  );
  if (!target) return;

  // Excel: =IF(G268=0,0,(G52/G264*G265))
  if (machineRate === 0 || partsPerRun === 0) {
    target.value = 0;
    return;
  }

  const annualTime = (partsPerYear / partsPerRun) * durationRun;
  target.value = annualTime.toFixed(4);
}

function calculateShotsPerHour_3_2_2(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const partsPerRun = getVal("_3-2-2-num-of-parts-per-production-lot"); // G264
  const cycleTimeSec = getVal("_3-2-2-cycle-time"); // G261
  const downtimePct = getVal("_3-2-2-downtime-breakdowns") / 100; // G262
  const wastePct = getVal("_3-2-2-total-waste-rate") / 100; // G263
  const startupTime = getVal("_3-2-2-startup-phaseout-time-per-production"); // G260

  const target = document.querySelector(
    `._3-2-2-shots-per-hour[data-pos="${posId}"]`,
  );
  if (!target) return;

  if (partsPerRun === 0 || cycleTimeSec === 0) {
    target.value = 0;
    return;
  }

  // (G232 * G229) / 3600
  const baseTimeHours = (partsPerRun * cycleTimeSec) / 3600;

  // (1 + G230 + G231)
  const lossFactor = 1 + downtimePct + wastePct;

  // denominator
  const totalTime = baseTimeHours * lossFactor + startupTime;

  if (totalTime === 0) {
    target.value = 0;
    return;
  }

  const shotsPerHour = partsPerRun / totalTime;
  target.value = shotsPerHour.toFixed(4);
}

function calculateProductionCostPerPart_3_2_2(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const machineRate = getVal("_3-2-2-machine-rate"); // G268
  const shotsPerHour = getVal("_3-2-2-shots-per-hour"); // G267
  const finishedPerCycle = getVal(
    "_3-2-2-num-of-finished-parts-per-cycle-tool",
  ); // G258
  const indirectPct = getVal("_3-2-2-production-mat-b-indirect-cost") / 100; // G269

  const target = document.querySelector(
    `._3-2-2-production-cost-per-part[data-pos="${posId}"]`,
  ); //270
  if (!target) return;

  // Excel: =IF(G268=0,0,(G268/G267/G258*(1+G269)))
  if (machineRate === 0 || shotsPerHour === 0 || finishedPerCycle === 0) {
    target.value = 0;
    return;
  }

  const costPerPart =
    (machineRate / shotsPerHour / finishedPerCycle) * (1 + indirectPct);

  target.value = costPerPart.toFixed(4);
}

function calculateLabourCost_3_2_3(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const machineRate = getVal("_3-2-2-machine-rate");
  const shotsPerHour = getVal("_3-2-2-shots-per-hour");
  const finishedPerCycle = getVal(
    "_3-2-2-num-of-finished-parts-per-cycle-tool",
  );
  const personnelPct =
    getVal("_3-2-3-personnel-employment-during-production") / 100;

  const target = document.querySelector(
    `._3-2-3-labour-cost[data-pos="${posId}"]`,
  );

  if (!target) return;

  // Excel: IF(G268=0,0,...)
  if (
    machineRate === 0 ||
    shotsPerHour === 0 ||
    finishedPerCycle === 0 ||
    personnelPct === 0
  ) {
    target.value = 0;
    return;
  }

  // ('1. material cost'!$E77/G267/G258*G273)
  const labourCost =
    (LABOUR_COST_PER_HOUR / shotsPerHour / finishedPerCycle) * personnelPct;
  console.log("LABOUR_COST_PER_HOUR=>" + LABOUR_COST_PER_HOUR);
  target.value = labourCost.toFixed(4);
}

function calculateLabourSetupCost_3_2_3(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const machineRate = getVal("_3-2-2-machine-rate");
  const runsPerYear = getVal("_3-2-2-num-of-production-runs-per-year");
  const finishedPerCycleTool = getVal(
    "_3-2-2-num-of-finished-parts-per-cycle-tool",
  );
  const finishedPerCyclePartNr = getVal(
    "_3-2-2-num-of-finished-parts-per-cycle-part-nr",
  );
  const setupTime = getVal("_3-2-2-startup-phaseout-time-per-production");
  const partsPerYear = getVal("parts-per-year");

  const target = document.querySelector(
    `._3-2-3-Labour-setup-cost[data-pos="${posId}"]`,
  );

  if (!target) return;

  // Excel: IF(G268=0,0,...)
  if (
    machineRate === 0 ||
    runsPerYear === 0 ||
    setupTime === 0 ||
    partsPerYear === 0 ||
    finishedPerCycleTool === 0 ||
    finishedPerCyclePartNr === 0
  ) {
    target.value = 0;
    return;
  }

  // Excel formula
  const labourSetupCost =
    ((LABOUR_SETUP_COST_PER_HOUR * runsPerYear * setupTime) / partsPerYear) *
    (finishedPerCyclePartNr / finishedPerCycleTool);

  target.value = labourSetupCost.toFixed(4);
}

function calculateLabourCostPerPart_3_2_3(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const labourCost = getVal("_3-2-3-labour-cost");
  const setupCost = getVal("_3-2-3-Labour-setup-cost");
  const indirectRate = getVal("_3-2-3-Labour-indirect-cost") / 100;
  const wasteRate = getVal("_3-2-2-total-waste-rate") / 100;

  const target = document.querySelector(
    `._3-2-3-Labour-cost-per-part[data-pos="${posId}"]`,
  );

  if (!target) return;

  const result =
    labourCost * (1 + indirectRate + wasteRate) +
    setupCost * (1 + indirectRate);

  console.log("result" + result);

  target.value = result.toFixed(4);
}

document.addEventListener("change", handleMaterialBEvents);
document.addEventListener("input", handleMaterialBEvents);

function handleMaterialBEvents(e) {
  const posId = e.target.dataset.pos;
  if (!posId) return;

  // ONLY Component B fields
  /*------------------------------------------
     Material cost
     Excel: =(G65 * pricePerKg) / 1000 / (1 - G263)
    ------------------------------------------*/
  if (
    (e.target.classList.contains("weight-input") &&
      e.target.dataset.type === "b") ||
    (e.target.classList.contains("material-select") &&
      e.target.dataset.type === "b") ||
    e.target.classList.contains("_3-2-2-total-waste-rate")
  ) {
    calculateMaterialBCost_3_2_1(posId);
    calculateMaterialBTotalCost_3_2_1(posId);
  }

  /*------------------------------------------
    Material B total cost
    Excel: =G250*(1+G251)
    ------------------------------------------*/
  if (
    //(e.target.classList.contains("_3-2-1-material-b-cost")) ||
    e.target.classList.contains("_3-2-1-material-b-indirect-cost")
  ) {
    calculateMaterialBTotalCost_3_2_1(posId);
    calculateMaterialB_3_7_1(posId);
  }

  // Tool code updated programmatically
  if (e.target.classList.contains("tool-code-mat-b")) {
    syncToolNr_B(posId);
    syncMachine_B(posId);
  }

  // Machine selection changed
  if (e.target.name?.startsWith("tool_machine[B]")) {
    syncMachine_B(posId);
    calculateMachineRate_3_2_2(posId);
  }

  // Machine rate
  if (e.target.classList.contains("machine-select-b")) {
    calculateMachineRate_3_2_2(posId);
  }

  //Number production runs per year
  calculateProductionRunsPerYear_3_2_2(posId);
  calculateAnnualMachineTime_3_2_2(posId);
  calculateAnnualMachineTimePerPartNr_3_8_2_2(posId);

  //Number of finished parts per cycle and tool
  const machine_nr_value_b = document.querySelector(
    `.machine-nr-value-b[data-pos="${posId}"]`,
  );

  const targetEl = document.querySelector(
    `._3-2-2-num-of-finished-parts-per-cycle-tool[data-pos="${posId}"]`,
  );

  if (!machine_nr_value_b || !targetEl) return;

  const value = parseFloat(machine_nr_value_b.value) || 0;
  targetEl.value = value > 0 ? value : 0;

  //  Number of finished parts per cycle and part-nr.
  const _3_2_2_num_of_finished_parts_per_cycle_part_nr = document.querySelector(
    `._3-2-2-num-of-finished-parts-per-cycle-part-nr[data-pos="${posId}"]`,
  );

  if (!machine_nr_value_b || !_3_2_2_num_of_finished_parts_per_cycle_part_nr)
    return;

  _3_2_2_num_of_finished_parts_per_cycle_part_nr.value = value > 0 ? value : 0;

  //Number of parts per production run / Production lot
  calculateNumOfPartsPerProductionLot_3_2_2(posId);

  //Duration of production run (per part-nr.)
  if (
    e.target.classList.contains("_3-2-2-cycle-time") ||
    e.target.classList.contains(
      "_3-2-2-startup-phaseout-time-per-production",
    ) ||
    e.target.classList.contains("_3-2-2-downtime-breakdowns") ||
    e.target.classList.contains("_3-2-2-total-waste-rate")
  ) {
    calculateProductionRunDuration_3_2_2(posId);
    calculateAnnualMachineTime_3_2_2(posId); // ✅ ADD
    calculateAnnualMachineTimePerPartNr_3_8_2_2(posId);
  }

  /*Shots per hour (eff.)*/
  if (
    e.target.classList.contains("_3-2-2-cycle-time") ||
    e.target.classList.contains("_3-2-2-downtime-breakdowns") ||
    e.target.classList.contains("_3-2-2-total-waste-rate") ||
    e.target.classList.contains("_3-2-2-startup-phaseout-time-per-production")
  ) {
    calculateShotsPerHour_3_2_2(posId);
    calculateProductionCostPerPart_3_2_2(posId);
  }

  // Production cost per part [EUR]
  if (
    (e, e.target.classList.contains("_3-2-2-production-mat-b-indirect-cost"))
  ) {
    calculateProductionCostPerPart_3_2_2(posId);
    calculateMachineAB_3_7_1(posId);
  }

  /* Personnel employment during production */
  if (
    e.target.classList.contains("_3-2-2-machine-rate") ||
    e.target.classList.contains("_3-2-2-shots-per-hour") ||
    e.target.classList.contains(
      "_3-2-2-num-of-finished-parts-per-cycle-tool",
    ) ||
    e.target.classList.contains("_3-2-3-personnel-employment-during-production")
  ) {
    calculateLabourCost_3_2_3(posId);
  }
  // Labour setup cost (100%)
  if (
    e.target.classList.contains("_3-2-2-startup-phaseout-time-per-production")
  ) {
    const posId = e.target.dataset.pos;
    if (!posId) return;
    calculateLabourSetupCost_3_2_3(posId);
  }
  //Labour cost per part
  if (
    e.target.classList.contains("_3-2-3-labour-cost") ||
    e.target.classList.contains("_3-2-3-Labour-setup-cost") ||
    e.target.classList.contains("_3-2-3-Labour-indirect-cost") ||
    e.target.classList.contains("_3-2-2-total-waste-rate")
  ) {
    calculateLabourCostPerPart_3_2_3(posId);
    calculateLabourAB_3_7_1(posId);
  }
}

/*===================================================
3.3 Tooling Cost maintenance / amortization 
=====================================================*/
function calculateToolingCostPerPart_3_3(posId) {
  const totalInvestment =
    parseFloat(
      document.querySelector(`.total-investment[data-pos="${posId}"]`)?.value,
    ) || 0;

  const amortizationType = document.querySelector(
    `._3-3-mould-amortization-over-part-cost[data-pos="${posId}"]`,
  )?.value;

  const annualInterestRate =
    (parseFloat(
      document.querySelector(`._3-3-annual-interest-rate[data-pos="${posId}"]`)
        ?.value,
    ) || 0) / 100;

  const amortizationPeriod =
    parseFloat(
      document.querySelector(`._3-3-amortization-period[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const maintenanceRate =
    (parseFloat(
      document.querySelector(
        `._3-3-mould-maintenance-cost[data-pos="${posId}"]`,
      )?.value,
    ) || 0) / 100;

  const partsPerYear =
    parseFloat(
      document.querySelector(`.parts-per-year[data-pos="${posId}"]`)?.value,
    ) || 0;

  const targetEl = document.querySelector(
    `._3-3-tooling-cost-per-part[data-pos="${posId}"]`,
  );

  if (!targetEl) return;

  // Excel: IF(G211=0,0,...)
  if (totalInvestment === 0 || partsPerYear === 0) {
    targetEl.value = "0.0000";
    return;
  }

  let toolingCost = 0;

  if (amortizationType === "amortization") {
    toolingCost =
      (totalInvestment * annualInterestRate + totalInvestment) /
        (partsPerYear * amortizationPeriod) +
      (totalInvestment * maintenanceRate) / partsPerYear;
  } else {
    toolingCost = (totalInvestment * maintenanceRate) / partsPerYear;
  }

  targetEl.value = toolingCost.toFixed(4);
}

/*===============================================
3.4 Purchased components (Pins, Clips, Metal)
================================================*/
function calculateMaterial_C_Cost_3_4(posId) {
  const _3_4_materialC =
    parseFloat(
      document.querySelector(`._3-4-material-c[data-pos="${posId}"]`)?.value,
    ) || 0;

  const _3_4_material_c_indirect_cost =
    (parseFloat(
      document.querySelector(
        `._3-4-material-c-indirect-cost[data-pos="${posId}"]`,
      )?.value,
    ) || 0) / 100;

  const _3_4_material_c_cost_target = document.querySelector(
    `._3-4-material-c-cost[data-pos="${posId}"]`,
  );

  if (!_3_4_material_c_cost_target) return;

  //=G290+(G290*G291)
  const _3_4_material_c_cost =
    _3_4_materialC + _3_4_materialC * _3_4_material_c_indirect_cost;

  _3_4_material_c_cost_target.value = _3_4_material_c_cost.toFixed(4);
}

function calculateMaterial_D_Cost_3_4(posId) {
  const _3_4_materialD =
    parseFloat(
      document.querySelector(`._3-4-material-d[data-pos="${posId}"]`)?.value,
    ) || 0;

  const _3_4_material_d_indirect_cost =
    (parseFloat(
      document.querySelector(
        `._3-4-material-d-indirect-cost[data-pos="${posId}"]`,
      )?.value,
    ) || 0) / 100;

  const _3_4_material_d_cost_target = document.querySelector(
    `._3-4-material-d-cost[data-pos="${posId}"]`,
  );

  if (!_3_4_material_d_cost_target) return;

  //=G294+(G294*G295)
  const _3_4_material_d_cost =
    _3_4_materialD + _3_4_materialD * _3_4_material_d_indirect_cost;

  _3_4_material_d_cost_target.value = _3_4_material_d_cost.toFixed(4);
}

function calculatePurchasedComponentsCost_3_4(posId) {
  const _3_4_material_c_cost =
    parseFloat(
      document.querySelector(`._3-4-material-c-cost[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_4_material_d_cost =
    parseFloat(
      document.querySelector(`._3-4-material-d-cost[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_4_purchased_components_cost_target = document.querySelector(
    `._3-4-purchased-components-cost[data-pos="${posId}"]`,
  );

  if (!_3_4_purchased_components_cost_target) return;

  //=G292+G296
  const _3_4_purchased_components_cost =
    _3_4_material_c_cost + _3_4_material_d_cost;

  _3_4_purchased_components_cost_target.value =
    _3_4_purchased_components_cost.toFixed(4);
}

/*=================================================
3.5 Additional costs
===================================================*/

function calculateAssemblyCostPerPart_3_5_1(posId) {
  const assemblyTimeEl = document.querySelector(
    `._3-5-1-assembly-time[data-pos="${posId}"]`,
  );

  const costEl = document.querySelector(
    `._3-5-1-assembly-cost-per-part[data-pos="${posId}"]`,
  );

  if (!assemblyTimeEl || !costEl) return;

  const assemblyTime = parseFloat(assemblyTimeEl.value) || 0;

  // Excel: IF(G303=0,0, E79/(3600/G303))
  if (assemblyTime === 0) {
    costEl.value = 0;
    return;
  }

  const costPerPart = ASSEMBLY_COST_PER_HOUR * (assemblyTime / 3600);

  costEl.value = costPerPart.toFixed(4);
}

/*===============================================
3.6 Logistic calculation
=================================================*/

function calculateTotalRentPerPackagingUnitPerDay_3_6_1_2(posId) {
  const boxes_per_pallet =
    parseFloat(
      document.querySelector(`.boxes-per-pallet[data-pos="${posId}"]`)?.value,
    ) || 0;

  const _3_6_1_2_rent_box_day =
    parseFloat(
      document.querySelector(`._3-6-1-2-rent-box-day[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_rent_pallet_day =
    parseFloat(
      document.querySelector(`._3-6-1-2-rent-pallet-day[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_rent_top_day =
    parseFloat(
      document.querySelector(`._3-6-1-2-rent-top-day[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_total_rent_packaging_unit_day_taget = document.querySelector(
    `._3-6-1-2-total-rent-packaging-unit-day[data-pos="${posId}"]`,
  );

  if (!_3_6_1_2_total_rent_packaging_unit_day_taget) return;

  //=G319+G318+(G317*G95)
  const _3_6_1_2_total_rent_packaging_unit_day =
    _3_6_1_2_rent_top_day +
    _3_6_1_2_rent_pallet_day +
    _3_6_1_2_rent_box_day * boxes_per_pallet;

  _3_6_1_2_total_rent_packaging_unit_day_taget.value =
    _3_6_1_2_total_rent_packaging_unit_day.toFixed(4);
}

function calculateTotalRentPerPackagingUnitPerTurnaround_3_6_1_2(posId) {
  const _3_6_1_2_turnaround_time =
    parseFloat(
      document.querySelector(`._3-6-1-2-turnaround-time[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_total_rent_packaging_unit_day =
    parseFloat(
      document.querySelector(
        `._3-6-1-2-total-rent-packaging-unit-day[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_6_1_2_total_rent_packaging_unit_turnaround_target =
    document.querySelector(
      `._3-6-1-2-total-rent-packaging-unit-turnaround[data-pos="${posId}"]`,
    );

  if (!_3_6_1_2_total_rent_packaging_unit_turnaround_target) return;

  //=G320*G316
  const _3_6_1_2_total_rent_packaging_unit_turnaround =
    _3_6_1_2_total_rent_packaging_unit_day * _3_6_1_2_turnaround_time;

  _3_6_1_2_total_rent_packaging_unit_turnaround_target.value =
    _3_6_1_2_total_rent_packaging_unit_turnaround.toFixed(4);
}

function calculateTotalRentPerTurnaround_per_part_3_6_1_2(posId) {
  const parts_per_pallet =
    parseFloat(
      document.querySelector(`.parts-per-pallet[data-pos="${posId}"]`)?.value,
    ) || 0;

  const _3_6_1_2_total_rent_packaging_unit_turnaround =
    parseFloat(
      document.querySelector(
        `._3-6-1-2-total-rent-packaging-unit-turnaround[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_6_1_2_total_rent_turnaround_part_target = document.querySelector(
    `._3-6-1-2-total-rent-turnaround-part[data-pos="${posId}"]`,
  );

  if (!_3_6_1_2_total_rent_turnaround_part_target) return;

  // =IF(G96=0,0,G321/G96)
  const _3_6_1_2_total_rent_turnaround_part =
    parts_per_pallet === 0
      ? 0
      : _3_6_1_2_total_rent_packaging_unit_turnaround / parts_per_pallet;

  _3_6_1_2_total_rent_turnaround_part_target.value =
    _3_6_1_2_total_rent_turnaround_part.toFixed(4);
}

function calculateCardboradInlaysPerPart_3_6_1_2(posId) {
  const parts_per_box_defined =
    parseFloat(
      document.querySelector(`.parts-per-box-defined[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_cardborad_inlays_box =
    parseFloat(
      document.querySelector(
        `._3-6-1-2-cardborad-inlays-box[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_6_1_2_cardborad_inlays_part_target = document.querySelector(
    `._3-6-1-2-cardborad-inlays-part[data-pos="${posId}"]`,
  );

  if (!_3_6_1_2_cardborad_inlays_part_target) return;

  //=IF(G90=0,0,G325/G90)
  const _3_6_1_2_cardborad_inlays_part =
    parts_per_box_defined === 0
      ? 0
      : _3_6_1_2_cardborad_inlays_box / parts_per_box_defined;

  _3_6_1_2_cardborad_inlays_part_target.value =
    _3_6_1_2_cardborad_inlays_part.toFixed(4);
}

function calculatePE_BagPart_3_6_1_2(posId) {
  const parts_per_box_defined =
    parseFloat(
      document.querySelector(`.parts-per-box-defined[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_pe_bag_box =
    parseFloat(
      document.querySelector(`._3-6-1-2-pe-bag-box[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_pe_bag_part_target = document.querySelector(
    `._3-6-1-2-pe-bag-part[data-pos="${posId}"]`,
  );

  if (!_3_6_1_2_pe_bag_part_target) return;

  //=IF(G90=0,0,G327/G90)
  const _3_6_1_2_pe_bag_part =
    parts_per_box_defined === 0
      ? 0
      : _3_6_1_2_pe_bag_box / parts_per_box_defined;

  _3_6_1_2_pe_bag_part_target.value = _3_6_1_2_pe_bag_part.toFixed(4);
}

function calculateSettingCostPerPart_3_6_1_2(posId) {
  const _3_6_1_2_setting_time_part =
    parseFloat(
      document.querySelector(`._3-6-1-2-setting-time-part[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_setting_cost_part_target = document.querySelector(
    `._3-6-1-2-setting-cost-part[data-pos="${posId}"]`,
  );

  if (!_3_6_1_2_setting_cost_part_target) return;

  //=IF(G331=0,0,'1. material cost'!$E79/(3600/G331))

  const _3_6_1_2_setting_cost_part =
    _3_6_1_2_setting_time_part === 0
      ? 0
      : ASSEMBLY_COST_PER_HOUR / (3600 / _3_6_1_2_setting_time_part);

  _3_6_1_2_setting_cost_part_target.value =
    _3_6_1_2_setting_cost_part.toFixed(4);
}

function calculateAdminCostPerPart_3_6_1_2(posId) {
  const parts_per_pallet =
    parseFloat(
      document.querySelector(`.parts-per-pallet[data-pos="${posId}"]`)?.value,
    ) || 0;

  const boxes_per_pallet =
    parseFloat(
      document.querySelector(`.boxes-per-pallet[data-pos="${posId}"]`)?.value,
    ) || 0;

  const pallets_min_order_qty =
    parseFloat(
      document.querySelector(`.pallets-min-order-qty[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_administration_cost_box_label =
    parseFloat(
      document.querySelector(
        `._3-6-1-2-administration-cost-box-label[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_6_1_2_administration_cost_pallet_commision =
    parseFloat(
      document.querySelector(
        `._3-6-1-2-administration-cost-pallet-commision[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_6_1_2_administration_cost_delivery_paper_work =
    parseFloat(
      document.querySelector(
        `._3-6-1-2-administration-cost-delivery-paper-work[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_6_1_2_admin_cost_part_target = document.querySelector(
    `._3-6-1-2-admin-cost-part[data-pos="${posId}"]`,
  );

  if (!_3_6_1_2_admin_cost_part_target) return;

  // =IF(G96=0,0,((G335*G95)+G336+(G337/G108))/G96)
  const _3_6_1_2_admin_cost_part =
    parts_per_pallet === 0
      ? 0
      : (_3_6_1_2_administration_cost_box_label * boxes_per_pallet +
          _3_6_1_2_administration_cost_pallet_commision +
          _3_6_1_2_administration_cost_delivery_paper_work /
            pallets_min_order_qty) /
        parts_per_pallet;

  _3_6_1_2_admin_cost_part_target.value = _3_6_1_2_admin_cost_part.toFixed(4);
}

function calculateTotalPackagingCost_A_Price_3_6_1_2(posId) {
  const _3_6_1_1_packaging_fix_cost_per_part =
    parseFloat(
      document.querySelector(
        `._3-6-1-1-packaging-fix-cost-per-part[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_6_1_2_total_rent_turnaround_part =
    parseFloat(
      document.querySelector(
        `._3-6-1-2-total-rent-turnaround-part[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_6_1_2_cardborad_inlays_part =
    parseFloat(
      document.querySelector(
        `._3-6-1-2-cardborad-inlays-part[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_6_1_2_pe_bag_part =
    parseFloat(
      document.querySelector(`._3-6-1-2-pe-bag-part[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_setting_cost_part =
    parseFloat(
      document.querySelector(`._3-6-1-2-setting-cost-part[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_admin_cost_part =
    parseFloat(
      document.querySelector(`._3-6-1-2-admin-cost-part[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_6_1_2_total_packaging_cost_a_price_target = document.querySelector(
    `._3-6-1-2-total-packaging-cost-a-price[data-pos="${posId}"]`,
  );

  if (!_3_6_1_2_total_packaging_cost_a_price_target) return;

  // =IF(G312=0,G338+G328+G332+G326+G322,G312)
  const _3_6_1_2_total_packaging_cost_a_price =
    _3_6_1_1_packaging_fix_cost_per_part === 0
      ? _3_6_1_2_admin_cost_part +
        _3_6_1_2_pe_bag_part +
        _3_6_1_2_setting_cost_part +
        _3_6_1_2_cardborad_inlays_part +
        _3_6_1_2_total_rent_turnaround_part
      : _3_6_1_1_packaging_fix_cost_per_part;

  _3_6_1_2_total_packaging_cost_a_price_target.value =
    _3_6_1_2_total_packaging_cost_a_price.toFixed(4);
}

function calculateTransportCostPerPart_B_Price_3_6_2(posId) {
  const parts_per_pallet =
    parseFloat(
      document.querySelector(`.parts-per-pallet[data-pos="${posId}"]`)?.value,
    ) || 0;

  const _3_6_2_transport_cost_pallet =
    parseFloat(
      document.querySelector(
        `._3-6-2-transport-cost-pallet[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_6_2_transport_cost_part_b_price_target = document.querySelector(
    `._3-6-2-transport-cost-part-b-price[data-pos="${posId}"]`,
  );

  if (!_3_6_2_transport_cost_part_b_price_target) return;

  // =IF(G96=0,0,G343/G96)
  const _3_6_2_transport_cost_part_b_price =
    parts_per_pallet === 0
      ? 0
      : _3_6_2_transport_cost_pallet / parts_per_pallet;

  _3_6_2_transport_cost_part_b_price_target.value =
    _3_6_2_transport_cost_part_b_price.toFixed(4);
}

/*====================================================
3.7 Cost Split
=====================================================*/
function calculateMaterialA_3_7_1(posId) {
  const materialATotalCost =
    parseFloat(
      document.querySelector(
        `._3-1-1-material-a-total-cost[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const materialATarget = document.querySelector(
    `._3-7-1-material-a[data-pos="${posId}"]`,
  );

  if (!materialATarget) return;

  // =G220
  materialATarget.value = materialATotalCost.toFixed(4);
}

function calculateMaterialB_3_7_1(posId) {
  const materialBTotalCost =
    parseFloat(
      document.querySelector(
        `._3-2-1-material-b-total-cost[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const materialBTarget = document.querySelector(
    `._3-7-1-material-b[data-pos="${posId}"]`,
  );

  if (!materialBTarget) return;

  // =G220
  materialBTarget.value = materialBTotalCost.toFixed(4);
}

function calculateMachineAB_3_7_1(posId) {
  const _3_1_2_production_cost_per_part =
    parseFloat(
      document.querySelector(
        `._3-1-2-production-cost-per-part[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_2_2_production_cost_per_part =
    parseFloat(
      document.querySelector(
        `._3-2-2-production-cost-per-part[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_7_1_machine_a_b_target = document.querySelector(
    `._3-7-1-machine-a-b[data-pos="${posId}"]`,
  );

  if (!_3_7_1_machine_a_b_target) return;

  // =G238+G270
  const _3_7_1_machine_a_b =
    _3_1_2_production_cost_per_part + _3_2_2_production_cost_per_part;

  _3_7_1_machine_a_b_target.value = _3_7_1_machine_a_b.toFixed(4);
}

function calculateLabourAB_3_7_1(posId) {
  const _3_1_3_Labour_cost_per_part =
    parseFloat(
      document.querySelector(
        `._3-1-3-Labour-cost-per-part[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_2_3_Labour_cost_per_part =
    parseFloat(
      document.querySelector(
        `._3-2-3-Labour-cost-per-part[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  //_3-7-1-Labour-a-b
  const _3_7_1_labour_a_b_target = document.querySelector(
    `._3-7-1-Labour-a-b[data-pos="${posId}"]`,
  );

  if (!_3_7_1_labour_a_b_target) return;

  //=G245+G278
  const _3_7_1_labour_a_b =
    _3_1_3_Labour_cost_per_part + _3_2_3_Labour_cost_per_part;

  _3_7_1_labour_a_b_target.value = _3_7_1_labour_a_b.toFixed(4);
}

function calculateToolingAB_3_7_1(posId) {
  const _3_3_tooling_cost_per_part =
    parseFloat(
      document.querySelector(`._3-3-tooling-cost-per-part[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const _3_7_1_tooling_a_b_target = document.querySelector(
    `._3-7-1-tooling-a-b[data-pos="${posId}"]`,
  );

  if (!_3_7_1_tooling_a_b_target) return;

  //=G245+G278
  const _3_7_1_tooling_a_b = _3_3_tooling_cost_per_part;

  _3_7_1_tooling_a_b_target.value = _3_7_1_tooling_a_b.toFixed(4);
}

function calculatePurchasedComponents_3_7_1(posId) {
  const _3_4_purchased_components_cost =
    parseFloat(
      document.querySelector(
        `._3-4-purchased-components-cost[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_7_1_purchased_components_target = document.querySelector(
    `._3-7-1-purchased-components[data-pos="${posId}"]`,
  );

  if (!_3_7_1_purchased_components_target) return;

  //=G298
  _3_7_1_purchased_components_target.value =
    _3_4_purchased_components_cost.toFixed(4);
}

function calculateAssembly_3_7_1(posId) {
  const _3_5_1_assembly_cost_per_part =
    parseFloat(
      document.querySelector(
        `._3-5-1-assembly-cost-per-part[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_7_1_assembly_target = document.querySelector(
    `._3-7-1-assembly[data-pos="${posId}"]`,
  );

  if (!_3_7_1_assembly_target) return;

  // =G304
  _3_7_1_assembly_target.value = _3_5_1_assembly_cost_per_part.toFixed(4);
}

function calculateQuality_3_7_1(posId) {
  const _3_5_2_quality_control_cost_per_part =
    parseFloat(
      document.querySelector(
        `._3-5-2-quality-control-cost-per-part[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_7_1_quality_target = document.querySelector(
    `._3-7-1-quality[data-pos="${posId}"]`,
  );

  if (!_3_7_1_quality_target) return;

  //=G307
  _3_7_1_quality_target.value = _3_5_2_quality_control_cost_per_part.toFixed(4);
}

function calculateLogisticPackaging_3_7_1(posId) {
  const _3_6_1_2_total_packaging_cost_a_price =
    parseFloat(
      document.querySelector(
        `._3-6-1-2-total-packaging-cost-a-price[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const _3_7_1_logistic_packaging_target = document.querySelector(
    `._3-7-1-logistic-packaging[data-pos="${posId}"]`,
  );

  if (!_3_7_1_logistic_packaging_target) return;

  //=G340
  _3_7_1_logistic_packaging_target.value =
    _3_6_1_2_total_packaging_cost_a_price.toFixed(4);
}

function calculateManufacturedCost_3_7_1(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const manufacturedCost =
    getVal("_3-7-1-material-a") +
    getVal("_3-7-1-material-b") +
    getVal("_3-7-1-machine-a-b") +
    getVal("_3-7-1-Labour-a-b") +
    getVal("_3-7-1-tooling-a-b") +
    getVal("_3-7-1-purchased-components") +
    getVal("_3-7-1-assembly") +
    getVal("_3-7-1-quality") +
    getVal("_3-7-1-logistic-packaging") +
    getVal("_3-7-1-handling-repacking");

  const target = document.querySelector(
    `._3-7-1-manufactured-cost[data-pos="${posId}"]`,
  );

  if (!target) return;

  // G359 = SUM(G349:G358)
  target.value = manufacturedCost.toFixed(4);
}

function calculateTotalProductionCostPerPart_3_7_1(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const parts_per_year = getVal("parts-per-year");

  const manufactured_cost = getVal("_3-7-1-manufactured-cost");
  const toller_markup_percent = getVal("_3-7-1-toller-markup-profit");

  const markup_base =
    getVal("_3-7-1-machine-a-b") +
    getVal("_3-7-1-Labour-a-b") +
    getVal("_3-7-1-tooling-a-b") +
    getVal("_3-7-1-assembly") +
    getVal("_3-7-1-quality") +
    getVal("_3-7-1-logistic-packaging") +
    getVal("_3-7-1-handling-repacking");

  const target = document.querySelector(
    `._3-7-1-total-production-cost-part[data-pos="${posId}"]`,
  );

  if (!target) return;

  // =IF(G52<>0, G359 + (G360 * SUM(...)), 0)
  const total_production_cost =
    parts_per_year !== 0
      ? manufactured_cost + (toller_markup_percent / 100) * markup_base
      : 0;

  target.value = total_production_cost.toFixed(4);
}

function calculateResponsibilityPricePerPart_3_7_1(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const parts_per_year = getVal("parts-per-year");
  const total_production_cost = getVal("_3-7-1-total-production-cost-part");

  // MU1 is entered like Excel (7 = 7%), so convert to decimal
  const one_gsc_markup = getVal("_3-7-1-one-gsc-mark-up-mu1") / 100;

  const target = document.querySelector(
    `._3-7-1-responsibility-price-part[data-pos="${posId}"]`,
  );

  if (!target) return;

  // =IF(G52<>0, G361*(1+G362), 0)
  const responsibility_price =
    parts_per_year !== 0 ? total_production_cost * (1 + one_gsc_markup) : 0;

  target.value = responsibility_price.toFixed(4);
}

function calculateResponsibilityPricePerCar_3_7_1(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const responsibility_price_part = getVal("_3-7-1-responsibility-price-part");

  const parts_per_car = getVal("parts-per-car");

  const target = document.querySelector(
    `._3-7-1-responsibility-price-car[data-pos="${posId}"]`,
  );

  if (!target) return;

  // =G363 * G51
  const responsibility_price_car = responsibility_price_part * parts_per_car;

  target.value = responsibility_price_car.toFixed(4);
}

function calculateMouldCostProratedPerPart_3_7_1(posId) {
  const getVal = (cls) =>
    parseFloat(document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value) ||
    0;

  const getStr = (cls) =>
    document.querySelector(`.${cls}[data-pos="${posId}"]`)?.value || "";

  const mould_amortization = getStr("_3-3-mould-amortization-over-part-cost");

  const total_investment = getVal("total-investment");

  const target = document.querySelector(
    `._3-7-1-mould-cost[data-pos="${posId}"]`,
  );

  if (!target) return;

  // =IF(G283="no amortization", G211, 0)
  const mould_cost =
    mould_amortization === "no amortization" ? total_investment : 0;

  target.value = mould_cost.toFixed(4);
}

/*========================================================
3.8 Machine capacity & Tonnage/year 
==========================================================*/
function calculateMaterial_A_Kg_3_8_1(posId) {
  const parts_per_year =
    parseFloat(
      document.querySelector(`.parts-per-year[data-pos="${posId}"]`)?.value,
    ) || 0;

  const weight_input_a =
    parseFloat(
      document.querySelector(
        `.weight-input[data-type="a"][data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const target = document.querySelector(
    `._3-8-1-material-a[data-pos="${posId}"]`,
  );

  if (!target) return;

  // =G61 * G52 / 1000
  const material_a_kg = (weight_input_a * parts_per_year) / 1000;

  target.value = material_a_kg.toFixed(4);
}

function calculateMaterial_B_Kg_3_8_1(posId) {
  const parts_per_year =
    parseFloat(
      document.querySelector(`.parts-per-year[data-pos="${posId}"]`)?.value,
    ) || 0;

  const weight_input_b =
    parseFloat(
      document.querySelector(
        `.weight-input[data-type="b"][data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const target = document.querySelector(
    `._3-8-1-material-b[data-pos="${posId}"]`,
  );

  if (!target) return;

  // =G65 * G52 / 1000
  const material_b_kg = (weight_input_b * parts_per_year) / 1000;

  target.value = material_b_kg.toFixed(4);
}

function calculateMaterial_C_Kg_3_8_1(posId) {
  const parts_per_year =
    parseFloat(
      document.querySelector(`.parts-per-year[data-pos="${posId}"]`)?.value,
    ) || 0;

  const weight_input_c =
    parseFloat(
      document.querySelector(
        `.weight-input[data-type="c"][data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const target = document.querySelector(
    `._3-8-1-material-c[data-pos="${posId}"]`,
  );

  if (!target) return;

  // =G68 * G52 / 1000
  const material_c_kg = (weight_input_c * parts_per_year) / 1000;

  target.value = material_c_kg.toFixed(4);
}

function calculateMaterial_D_Kg_3_8_1(posId) {
  const parts_per_year =
    parseFloat(
      document.querySelector(`.parts-per-year[data-pos="${posId}"]`)?.value,
    ) || 0;

  const weight_input_d =
    parseFloat(
      document.querySelector(
        `.weight-input[data-type="d"][data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const target = document.querySelector(
    `._3-8-1-material-d[data-pos="${posId}"]`,
  );

  if (!target) return;

  // =G70 * G52 / 1000
  const material_d_kg = (weight_input_d * parts_per_year) / 1000;

  target.value = material_d_kg.toFixed(4);
}

function calculateProductiveHoursPerYear_3_8_2_1(posId) {
  const production_days_per_year =
    parseFloat(
      document.querySelector(
        `._3-8-2-1-production-days-per-year[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const number_of_shifts_per_day =
    parseFloat(
      document.querySelector(
        `._3-8-2-1-number-of-shifts-per-day[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const number_of_hour_per_shift =
    parseFloat(
      document.querySelector(
        `._3-8-2-1-number-of-hour-per-shift[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const maximum_allowed_utilization_extent =
    parseFloat(
      document.querySelector(
        `._3-8-2-1-maximum-allowed-utilization-extent[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const productive_hours_target = document.querySelector(
    `._3-8-2-1-productive-hours-per-year[data-pos="${posId}"]`,
  );

  if (!productive_hours_target) return;

  const productive_hours =
    production_days_per_year *
    number_of_shifts_per_day *
    number_of_hour_per_shift *
    (maximum_allowed_utilization_extent / 100);

  productive_hours_target.value = productive_hours.toFixed(4);
}

function calculateAnnualMachineTimePerPartNr_3_8_2_1(posId) {
  const mat_a_annual_machine_time =
    parseFloat(
      document.querySelector(`._3-1-2-annual-machine-time[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const annual_machine_time = document.querySelector(
    `._3-8-2-1-annual-machine-time[data-pos="${posId}"]`,
  );

  if (!annual_machine_time) return;

  annual_machine_time.value = mat_a_annual_machine_time.toFixed(4);
}

function calculateMachineUtilization_3_8_2_1(posId) {
  const production_days_per_year =
    parseFloat(
      document.querySelector(
        `._3-8-2-1-production-days-per-year[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const productive_hours_per_year =
    parseFloat(
      document.querySelector(
        `._3-8-2-1-productive-hours-per-year[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const annual_machine_time =
    parseFloat(
      document.querySelector(
        `._3-8-2-1-annual-machine-time[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const machine_utilization_target = document.querySelector(
    `._3-8-2-1-machine-utilization[data-pos="${posId}"]`,
  );

  if (!machine_utilization_target) return;

  // Excel: =IF(G381=0,0,G386/G385)
  const machine_utilization =
    production_days_per_year === 0
      ? 0
      : annual_machine_time / productive_hours_per_year;

  machine_utilization_target.value = machine_utilization.toFixed(4);
  // machine_utilization_target.value = (machine_utilization * 100).toFixed(4);
}

function ROUNDUP(value, decimals) {
  const factor = Math.pow(10, decimals);
  return value >= 0
    ? Math.ceil(value * factor) / factor
    : Math.floor(value * factor) / factor;
}

function calculateNumberOfMachinesRequired_3_8_2_1(posId) {
  const machine_utilization =
    parseFloat(
      document.querySelector(
        `._3-8-2-1-machine-utilization[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const target = document.querySelector(
    `._3-8-2-1-no-of-machines-req[data-pos="${posId}"]`,
  );

  if (!target) return;
  // Excel: =ROUNDUP(G387, 2)
  const machines_required = ROUNDUP(machine_utilization, 2);

  // target.value = machine_utilization.toFixed(2);
  target.value = machines_required;
}

// --------------------------
function calculateProductiveHoursPerYear_3_8_2_2(posId) {
  const production_days_per_year =
    parseFloat(
      document.querySelector(
        `._3-8-2-2-production-days-per-year[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const number_of_shifts_per_day =
    parseFloat(
      document.querySelector(
        `._3-8-2-2-number-of-shifts-per-day[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const number_of_hour_per_shift =
    parseFloat(
      document.querySelector(
        `._3-8-2-2-number-of-hour-per-shift[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const maximum_allowed_utilization_extent =
    parseFloat(
      document.querySelector(
        `._3-8-2-2-maximum-allowed-utilization-extent[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const productive_hours_target = document.querySelector(
    `._3-8-2-2-productive-hours-per-year[data-pos="${posId}"]`,
  );

  if (!productive_hours_target) return;

  const productive_hours =
    production_days_per_year *
    number_of_shifts_per_day *
    number_of_hour_per_shift *
    (maximum_allowed_utilization_extent / 100);

  productive_hours_target.value = productive_hours.toFixed(4);
}

function calculateAnnualMachineTimePerPartNr_3_8_2_2(posId) {
  const mat_b_annual_machine_time =
    parseFloat(
      document.querySelector(`._3-2-2-annual-machine-time[data-pos="${posId}"]`)
        ?.value,
    ) || 0;

  const annual_machine_time = document.querySelector(
    `._3-8-2-2-annual-machine-time[data-pos="${posId}"]`,
  );

  if (!annual_machine_time) return;

  annual_machine_time.value = mat_b_annual_machine_time.toFixed(4);
}

function calculateMachineUtilization_3_8_2_2(posId) {
  const production_days_per_year =
    parseFloat(
      document.querySelector(
        `._3-8-2-2-production-days-per-year[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const productive_hours_per_year =
    parseFloat(
      document.querySelector(
        `._3-8-2-2-productive-hours-per-year[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const annual_machine_time =
    parseFloat(
      document.querySelector(
        `._3-8-2-2-annual-machine-time[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const target = document.querySelector(
    `._3-8-2-2-machine-utilization[data-pos="${posId}"]`,
  );

  if (!target) return;

  // Excel: =IF(G391=0,0,G396/G395)
  const machine_utilization =
    production_days_per_year === 0 || productive_hours_per_year === 0
      ? 0
      : annual_machine_time / productive_hours_per_year;

  target.value = machine_utilization.toFixed(4);
}

function calculateNumberOfMachinesRequired_3_8_2_2(posId) {
  const machine_utilization =
    parseFloat(
      document.querySelector(
        `._3-8-2-2-machine-utilization[data-pos="${posId}"]`,
      )?.value,
    ) || 0;

  const target = document.querySelector(
    `._3-8-2-2-no-of-machines-req[data-pos="${posId}"]`,
  );

  if (!target) return;

  // Excel: =ROUNDUP(G397, 2)
  // const machines_required = ROUNDUP(machine_utilization, 2);

  const factor = 100; // 10^2
  const machines_required =
    machine_utilization === 0
      ? 0
      : Math.ceil(machine_utilization * factor) / factor;

  target.value = machines_required.toFixed(2);
}

//========================================================================
document.addEventListener("input", function (e) {
  const posId = e.target.dataset.pos;
  if (!posId) return;

  if (
    e.target.classList.contains("_3-3-mould-maintenance-cost") ||
    e.target.classList.contains("_3-3-mould-amortization-over-part-cost") ||
    e.target.classList.contains("_3-3-annual-interest-rate") ||
    e.target.classList.contains("_3-3-amortization-period")
  ) {
    calculateToolingCostPerPart_3_3(posId);
    calculateToolingAB_3_7_1(posId);
  }

  if (
    e.target.classList.contains("_3-4-material-c") ||
    e.target.classList.contains("_3-4-material-c-indirect-cost")
  ) {
    calculateMaterial_C_Cost_3_4(posId);
    calculatePurchasedComponentsCost_3_4(posId);
    calculatePurchasedComponents_3_7_1(posId);
  }

  if (
    e.target.classList.contains("_3-4-material-d") ||
    e.target.classList.contains("_3-4-material-d-indirect-cost")
  ) {
    calculateMaterial_D_Cost_3_4(posId);
    calculatePurchasedComponentsCost_3_4(posId);
    calculatePurchasedComponents_3_7_1(posId);
  }

  if (
    e.target.classList.contains("_3-4-material-c-cost") ||
    e.target.classList.contains("_3-4-material-d-cost")
  ) {
    calculatePurchasedComponentsCost_3_4(posId);
    calculatePurchasedComponents_3_7_1(posId);
  }

  if (e.target.classList.contains("_3-5-1-assembly-time")) {
    calculateAssemblyCostPerPart_3_5_1(posId);
    calculateAssembly_3_7_1(posId);
  }

  if (
    e.target.classList.contains("boxes-per-pallet") ||
    e.target.classList.contains("_3-6-1-2-rent-box-day") ||
    e.target.classList.contains("_3-6-1-2-rent-pallet-day") ||
    e.target.classList.contains("_3-6-1-2-rent-top-day")
  ) {
    calculateTotalRentPerPackagingUnitPerDay_3_6_1_2(posId);
    calculateTotalRentPerPackagingUnitPerTurnaround_3_6_1_2(posId);
    calculateTotalRentPerTurnaround_per_part_3_6_1_2(posId);
  }

  if (
    e.target.classList.contains("_3-6-1-2-turnaround-time") ||
    e.target.classList.contains("_3-6-1-2-total-rent-packaging-unit-day")
  ) {
    calculateTotalRentPerPackagingUnitPerTurnaround_3_6_1_2(posId);
    calculateTotalRentPerTurnaround_per_part_3_6_1_2(posId);
  }
  if (
    e.target.classList.contains("parts-per-pallet") ||
    e.target.classList.contains("_3-6-1-2-total-rent-packaging-unit-turnaround")
  ) {
    calculateTotalRentPerTurnaround_per_part_3_6_1_2(posId);
  }

  if (
    e.target.classList.contains("parts-per-box-defined") ||
    e.target.classList.contains("_3-6-1-2-cardborad-inlays-box")
  ) {
    calculateCardboradInlaysPerPart_3_6_1_2(posId);
  }

  if (
    e.target.classList.contains("parts-per-box-defined") ||
    e.target.classList.contains("_3-6-1-2-pe-bag-box")
  ) {
    calculatePE_BagPart_3_6_1_2(posId);
  }

  if (e.target.classList.contains("_3-6-1-2-setting-time-part")) {
    calculateSettingCostPerPart_3_6_1_2(posId);
  }

  if (
    e.target.classList.contains("parts-per-pallet") ||
    e.target.classList.contains("boxes-per-pallet") ||
    e.target.classList.contains("pallets-min-order-qty") ||
    e.target.classList.contains("_3-6-1-2-administration-cost-box-label") ||
    e.target.classList.contains(
      "_3-6-1-2-administration-cost-pallet-commision",
    ) ||
    e.target.classList.contains(
      "_3-6-1-2-administration-cost-delivery-paper-work",
    )
  ) {
    calculateAdminCostPerPart_3_6_1_2(posId);
  }

  if (
    e.target.classList.contains("_3-6-1-1-packaging-fix-cost-per-part") ||
    e.target.classList.contains("_3-6-1-2-total-rent-turnaround-part") ||
    e.target.classList.contains("_3-6-1-2-cardborad-inlays-part") ||
    e.target.classList.contains("_3-6-1-2-pe-bag-part") ||
    e.target.classList.contains("_3-6-1-2-setting-cost-part") ||
    e.target.classList.contains("_3-6-1-2-admin-cost-part")
  ) {
    calculateTotalPackagingCost_A_Price_3_6_1_2(posId);
    calculateLogisticPackaging_3_7_1(posId);
  }

  if (
    e.target.classList.contains("parts-per-pallet") ||
    e.target.classList.contains("_3-6-2-transport-cost-pallet")
  ) {
    calculateTransportCostPerPart_B_Price_3_6_2(posId);
  }

  if (e.target.classList.contains("_3-1-1-material-a-total-cost")) {
    calculateMaterialA_3_7_1(posId);
  }

  if (e.target.classList.contains("_3-2-1-material-b-total-cost")) {
    calculateMaterialB_3_7_1(posId);
  }

  if (
    e.target.classList.contains("_3-1-2-production-cost-per-part") ||
    e.target.classList.contains("_3-2-2-production-cost-per-part")
  ) {
    calculateMachineAB_3_7_1(posId);
  }

  if (
    e.target.classList.contains("_3-1-3-Labour-cost-per-part") ||
    e.target.classList.contains("_3-2-3-Labour-cost-per-part")
  ) {
    calculateLabourAB_3_7_1(posId);
  }

  if (e.target.classList.contains("_3-3-tooling-cost-per-part")) {
    calculateToolingAB_3_7_1(posId);
  }

  if (e.target.classList.contains("_3-4-purchased-components-cost")) {
    calculatePurchasedComponents_3_7_1(posId);
  }

  if (e.target.classList.contains("_3-5-1-assembly-cost-per-part")) {
    calculateAssembly_3_7_1(posId);
  }

  if (e.target.classList.contains("_3-5-2-quality-control-cost-per-part")) {
    calculateQuality_3_7_1(posId);
  }

  if (e.target.classList.contains("_3-6-1-2-total-packaging-cost-a-price")) {
    calculateLogisticPackaging_3_7_1(posId);
  }

  if (
    e.target.classList.contains("_3-7-1-material-a") ||
    e.target.classList.contains("_3-7-1-material-b") ||
    e.target.classList.contains("_3-7-1-machine-a-b") ||
    e.target.classList.contains("_3-7-1-Labour-a-b") ||
    e.target.classList.contains("_3-7-1-tooling-a-b") ||
    e.target.classList.contains("_3-7-1-purchased-components") ||
    e.target.classList.contains("_3-7-1-assembly") ||
    e.target.classList.contains("_3-7-1-quality") ||
    e.target.classList.contains("_3-7-1-logistic-packaging") ||
    e.target.classList.contains("_3-7-1-handling-repacking")
  ) {
    calculateManufacturedCost_3_7_1(posId);
  }

  if (
    e.target.classList.contains("parts-per-year") ||
    e.target.classList.contains("_3-7-1-manufactured-cost") ||
    e.target.classList.contains("_3-7-1-toller-markup-profit") ||
    e.target.classList.contains("_3-7-1-machine-a-b") ||
    e.target.classList.contains("_3-7-1-Labour-a-b") ||
    e.target.classList.contains("_3-7-1-tooling-a-b") ||
    e.target.classList.contains("_3-7-1-assembly") ||
    e.target.classList.contains("_3-7-1-quality") ||
    e.target.classList.contains("_3-7-1-logistic-packaging") ||
    e.target.classList.contains("_3-7-1-handling-repacking")
  ) {
    calculateTotalProductionCostPerPart_3_7_1(posId);
  }

  if (
    e.target.classList.contains("parts-per-year") ||
    e.target.classList.contains("_3-7-1-total-production-cost-part") ||
    e.target.classList.contains("_3-7-1-one-gsc-mark-up-mu1")
  ) {
    calculateResponsibilityPricePerPart_3_7_1(posId);
    calculateResponsibilityPricePerCar_3_7_1(posId);
  }
  if (
    e.target.classList.contains("parts-per-car") ||
    e.target.classList.contains("_3-7-1-responsibility-price-part")
  ) {
    calculateResponsibilityPricePerCar_3_7_1(posId);
  }
  if (e.target.classList.contains("total-investment")) {
    calculateMouldCostProratedPerPart_3_7_1(posId);
  }

  if (
    e.target.classList.contains("weight-input") ||
    e.target.classList.contains("parts-per-year")
  ) {
    calculateMaterial_A_Kg_3_8_1(posId);
  }

  if (
    e.target.classList.contains("weight-input") ||
    e.target.classList.contains("parts-per-year")
  ) {
    calculateMaterial_B_Kg_3_8_1(posId);
  }

  if (
    e.target.classList.contains("parts-per-year") ||
    (e.target.classList.contains("weight-input") &&
      e.target.dataset.type === "c")
  ) {
    calculateMaterial_C_Kg_3_8_1(posId);
  }

  if (
    e.target.classList.contains("parts-per-year") ||
    (e.target.classList.contains("weight-input") &&
      e.target.dataset.type === "d")
  ) {
    calculateMaterial_D_Kg_3_8_1(posId);
  }

  if (
    e.target.classList.contains("_3-8-2-1-production-days-per-year") ||
    e.target.classList.contains("_3-8-2-1-number-of-shifts-per-day") ||
    e.target.classList.contains("_3-8-2-1-number-of-hour-per-shift") ||
    e.target.classList.contains("_3-8-2-1-maximum-allowed-utilization-extent")
  ) {
    calculateProductiveHoursPerYear_3_8_2_1(posId);
    calculateMachineUtilization_3_8_2_1(posId);
    calculateNumberOfMachinesRequired_3_8_2_1(posId);
  }

  if (e.target.classList.contains("_3-1-2-annual-machine-time")) {
    calculateAnnualMachineTimePerPartNr_3_8_2_1(posId);
    calculateMachineUtilization_3_8_2_1(posId);
    calculateNumberOfMachinesRequired_3_8_2_1(posId);
  }

  if (
    e.target.classList.contains("_3-8-2-1-production-days-per-year") ||
    e.target.classList.contains("_3-8-2-1-productive-hours-per-year") ||
    e.target.classList.contains("_3-8-2-1-annual-machine-time")
  ) {
    calculateMachineUtilization_3_8_2_1(posId);
    calculateNumberOfMachinesRequired_3_8_2_1(posId);
  }

  if (e.target.classList.contains("_3-8-2-1-machine-utilization")) {
    calculateNumberOfMachinesRequired_3_8_2_1(posId);
  }
  // --------------------------
  if (
    e.target.classList.contains("_3-8-2-2-production-days-per-year") ||
    e.target.classList.contains("_3-8-2-2-number-of-shifts-per-day") ||
    e.target.classList.contains("_3-8-2-2-number-of-hour-per-shift") ||
    e.target.classList.contains("_3-8-2-2-maximum-allowed-utilization-extent")
  ) {
    calculateProductiveHoursPerYear_3_8_2_2(posId);
    calculateMachineUtilization_3_8_2_2(posId);
    calculateNumberOfMachinesRequired_3_8_2_2(posId);
  }

  if (e.target.classList.contains("_3-2-2-annual-machine-time")) {
    calculateAnnualMachineTimePerPartNr_3_8_2_2(posId);
    calculateMachineUtilization_3_8_2_2(posId);
    calculateNumberOfMachinesRequired_3_8_2_2(posId);
  }

  if (
    e.target.classList.contains("_3-8-2-2-production-days-per-year") ||
    e.target.classList.contains("_3-8-2-2-productive-hours-per-year") ||
    e.target.classList.contains("_3-8-2-2-annual-machine-time")
  ) {
    calculateMachineUtilization_3_8_2_2(posId);
    calculateNumberOfMachinesRequired_3_8_2_2(posId);
  }

  if (e.target.classList.contains("_3-8-2-2-machine-utilization")) {
    calculateNumberOfMachinesRequired_3_8_2_2(posId);
  }
});

document.addEventListener("change", function (e) {
  const posId = e.target.dataset.pos;
  if (!posId) return;

  if (e.target.classList.contains("_3-3-mould-amortization-over-part-cost")) {
    calculateMouldCostProratedPerPart_3_7_1(posId);
  }

  if (e.target.classList.contains("_3-8-2-1-machine-utilization")) {
    calculateNumberOfMachinesRequired_3_8_2_1(posId);
  }

  if (e.target.classList.contains("_3-8-2-2-machine-utilization")) {
    calculateNumberOfMachinesRequired_3_8_2_2(posId);
  }
});
