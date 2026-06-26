"use strict";

const assert = require("node:assert/strict");
const { aguinaldo, dismissal, resignation, fortnight } = require("../calculations.js");

function near(actual, expected, tolerance = 0.011) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${expected}, received ${actual}`);
}

// Aguinaldo: cinco ejemplos del documento.
near(aguinaldo({ dailySalary: 600 / 30, scaleDays: 15 }), 300);
near(aguinaldo({ dailySalary: 750 / 30, scaleDays: 19 }), 475);
near(aguinaldo({ dailySalary: 900 / 30, scaleDays: 21 }), 630);
near(aguinaldo({ dailySalary: 450 / 30, scaleDays: 15, periodDays: 225 }), 138.70);
near(aguinaldo({ dailySalary: 4800 / 156, scaleDays: 19 }), 584.62);
// Regresión: captura reportada, $1,500 y más de un año al 31/12/2026.
near(aguinaldo({ dailySalary: 1500 / 30, scaleDays: 15, periodDays: 365 }), 750);

// Indemnización: cinco ejemplos del documento.
near(dismissal({ salary: 500, serviceYears: 3 }).total, 1500);
near(dismissal({ salary: 450, serviceYears: 2 + 8 / 12 }).total, 1200);
near(dismissal({ salary: 3000, serviceYears: 5 }).total, 8064);
near(dismissal({ salary: 400, serviceYears: 210 / 360 }).total, 233.33);
near(dismissal({ salary: 600, serviceYears: 4 }).total, 2400);

// Renuncia voluntaria: cinco ejemplos. El tercero conserva precisión completa
// ($1,635.20); los $1,635.00 del documento provienen de redondear antes de tiempo.
near(resignation({ salary: 500, serviceYears: 3 }).total, 750);
near(resignation({ salary: 600, serviceYears: 10 }).total, 3000);
near(resignation({ salary: 1500, serviceYears: 4 }).total, 1635.20);
near(resignation({ salary: 450, serviceYears: 5.5 }).total, 1237.50);
near(resignation({ salary: 450, serviceYears: 1 + 8 / 12 }).total, 0);

// Quincena: cinco ejemplos del documento.
near(fortnight({ salary: 700, isssRate: 0, afpRate: 0 }).gross, 350);
near(fortnight({ salary: 600, paidDays: 10, isssRate: 0, afpRate: 0 }).gross, 200);
near(fortnight({ salary: 800, contributionShare: 100 }).net, 318);
near(fortnight({ salary: 0, paidDays: 0, otherIncome: 280, isssRate: 0, afpRate: 0 }).gross, 280);
near(fortnight({ salary: 540, overtimeHours: 6, isssRate: 0, afpRate: 0 }).gross, 297);

console.log("20 ejemplos del documento y el caso reportado validados correctamente.");
