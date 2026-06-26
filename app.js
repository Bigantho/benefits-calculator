"use strict";

const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const number = new Intl.NumberFormat("es-SV", { maximumFractionDigits: 2 });
const DAY = 86_400_000;
const MINIMUM_MONTHLY = 408.80;
const MINIMUM_DAILY = 13.44;

const legalReferences = {
  aguinaldo: {
    title: "Aguinaldo",
    intro: "El Código de Trabajo establece el derecho, la escala por antigüedad y la forma de determinar el salario base.",
    items: [
      ["Arts. 196–197", "Derecho y proporción", "Reconocen el aguinaldo y el pago proporcional cuando no se completa un año de servicio."],
      ["Art. 198", "Días por antigüedad", "Fija la escala mínima de 15, 19 o 21 días de salario según el tiempo trabajado."],
      ["Art. 199", "Salario base", "Define la base aplicable para salarios fijos y variables."],
      ["Arts. 201–202", "Conservación y terminación", "Regulan la conservación del derecho y el aguinaldo proporcional al finalizar el contrato."],
      ["Art. 120", "Forma de pago", "Exige que el pago se realice en moneda de curso legal."]
    ]
  },
  despido: {
    title: "Indemnización por despido",
    intro: "La Constitución y el Código de Trabajo respaldan la indemnización cuando existe despido sin causa justificada.",
    items: [
      ["Const. art. 38.11", "Garantía constitucional", "Reconoce el derecho a indemnización por despido sin causa justificada."],
      ["CT art. 58", "Cálculo principal", "Establece treinta días de salario por año, proporción por fracciones, mínimo y tope de la base."],
      ["CT art. 59", "Casos especiales", "Contiene reglas para salario no fijo y contratos a plazo."],
      ["CT art. 50", "Causas justificadas", "Enumera las causas que pueden justificar la terminación por parte del empleador."],
      ["CT arts. 53 y 55", "Despido indirecto o de hecho", "Respaldan la indemnización en los supuestos regulados por esos artículos."]
    ]
  },
  renuncia: {
    title: "Renuncia voluntaria",
    intro: "La prestación económica nace de la Ley Reguladora de la Prestación Económica por Renuncia Voluntaria, Decreto Legislativo 592.",
    items: [
      ["Art. 2", "Preaviso", "Establece el preaviso escrito de 15 o 30 días, según el cargo."],
      ["Art. 3", "Formalidad", "Exige que la renuncia conste por escrito y cumpla las formalidades legales."],
      ["Arts. 5–6", "Antigüedad", "Requieren al menos dos años de servicio continuo y regulan la continuidad del tiempo trabajado."],
      ["Art. 8", "Monto de la prestación", "Establece quince días de salario básico por año y el límite de la base salarial."],
      ["Art. 16 y CT art. 54", "Norma supletoria", "Remiten al Código de Trabajo y respaldan la terminación escrita por renuncia."]
    ]
  },
  quincena: {
    title: "Salario quincenal",
    intro: "La llamada “quincena 25” es un pago ordinario de salario, respaldado por las reglas constitucionales y laborales sobre salario y periodicidad.",
    items: [
      ["Const. art. 38.1–2", "Derecho al salario", "Protege el salario y su pago en la forma y tiempo correspondientes."],
      ["CT arts. 119–120", "Definición y moneda", "Definen el salario y exigen su pago en moneda de curso legal."],
      ["CT arts. 122 y 126", "Monto y modalidad", "Regulan el salario mínimo y las formas de estipulación, incluida la quincenal."],
      ["CT arts. 129–130", "Plazo de pago", "Regulan cuándo y dónde debe realizarse el pago del salario."],
      ["CT arts. 138 y 169", "Descuentos y horas extra", "Limitan ciertas deducciones y respaldan el recargo aplicado a las horas extraordinarias."]
    ]
  }
};

function value(id) {
  const parsed = Number.parseFloat($(id).value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateValue(id) {
  const raw = $(id).value;
  if (!raw) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

function daysBetween(start, end) {
  if (!start || !end || end < start) return 0;
  return Math.floor((end - start) / DAY) + 1;
}

function yearsBetween(start, end) {
  return daysBetween(start, end) / 365;
}

function dateInputValue(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateInput(input) {
  const digits = input.value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  input.value = parts.join("/");
}

function displayDateToIso(raw) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function isoDateToDisplay(raw) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

function row(label, result) {
  return `<div class="breakdown-row"><span>${label}</span><strong>${result}</strong></div>`;
}

function showResult(prefix, amount, caption, rows, formula, error = false) {
  $(`${prefix}-result`).textContent = money.format(Math.max(0, amount || 0));
  const captionEl = $(`${prefix}-caption`);
  captionEl.textContent = caption;
  captionEl.classList.toggle("error", error);
  $(`${prefix}-breakdown`).innerHTML = rows.join("") + (formula ? `<div class="formula">${formula}</div>` : "");
}

function validateDates(start, end, prefix) {
  if (!start || !end) {
    showResult(prefix, 0, "Completa ambas fechas para calcular.", [], "", true);
    return false;
  }
  if (end < start) {
    showResult(prefix, 0, "La fecha final debe ser posterior a la fecha de ingreso.", [], "", true);
    return false;
  }
  return true;
}

function aguinaldoDaysBySeniority(years) {
  if (years >= 10) return 21;
  if (years >= 3) return 19;
  return 15;
}

function calculateAguinaldo() {
  const salary = value("ag-salary");
  const start = dateValue("ag-start");
  const end = dateValue("ag-end");
  if (!validateDates(start, end, "ag")) return;
  const years = yearsBetween(start, end);
  const scaleDays = aguinaldoDaysBySeniority(years);
  const daily = $("ag-variable").checked ? value("ag-daily") : salary / 30;
  const auto = $("ag-prorate-auto").checked;
  const periodDays = auto
    ? (years < 1 ? Math.min(365, daysBetween(start, end)) : 365)
    : Math.min(365, value("ag-days"));
  const factor = Math.min(1, periodDays / 365);
  const total = LaborMath.aguinaldo({ dailySalary: daily, scaleDays, periodDays });
  const caption = factor === 1
    ? "Aguinaldo completo según la antigüedad acumulada."
    : `${number.format(periodDays)} días computables de 365.`;
  showResult("ag", total, caption, [
    row("Antigüedad acumulada", `${number.format(years)} años`),
    row("Salario diario utilizado", money.format(daily)),
    row("Días según antigüedad", `${scaleDays} días`),
    row("Proporción aplicada", `${number.format(factor * 100)}%`)
  ], `${money.format(daily)} × ${scaleDays} × (${periodDays} ÷ 365)`);
}

function calculateDismissal() {
  const salary = value("de-salary");
  const start = dateValue("de-start");
  const end = dateValue("de-end");
  if (!validateDates(start, end, "de")) return;
  const years = yearsBetween(start, end);
  const capMult = value("de-cap-mult");
  const minimumDays = value("de-min-days");
  const calculation = LaborMath.dismissal({ salary, serviceYears: years, minimumDaily: MINIMUM_DAILY, capMultiplier: capMult, minimumDays, applyCap: $("de-apply-cap").checked });
  const { total, actualDaily, usedDaily } = calculation;
  const capped = usedDaily < actualDaily;
  showResult("de", total, capped ? "Se aplicó el tope configurado a la base salarial." : "Calculado con el salario ingresado.", [
    row("Tiempo de servicio", `${number.format(years)} años`),
    row("Salario diario real", money.format(actualDaily)),
    row("Salario diario aplicado", money.format(usedDaily)),
    row("Mínimo configurado", `${number.format(minimumDays)} días`)
  ], `máximo de [${money.format(usedDaily)} × 30 × ${number.format(years)}] y [${money.format(usedDaily)} × ${minimumDays}]`);
}

function calculateResignation() {
  const salary = value("re-salary");
  const start = dateValue("re-start");
  const end = dateValue("re-end");
  if (!validateDates(start, end, "re")) return;
  const years = yearsBetween(start, end);
  const minimumYears = value("re-min-years");
  const capMult = value("re-cap-mult");
  const daysYear = value("re-days-year");
  const calculation = LaborMath.resignation({ salary, serviceYears: years, minimumMonthly: MINIMUM_MONTHLY, capMultiplier: capMult, daysPerYear: daysYear, minimumYears, applyCap: $("re-apply-cap").checked });
  const { total, baseMonthly, daily, eligible } = calculation;
  showResult("re", total, eligible ? (baseMonthly < salary ? "Se aplicó el tope salarial configurado." : "Cumple la antigüedad mínima configurada.") : `No alcanza la antigüedad mínima de ${number.format(minimumYears)} años.`, [
    row("Tiempo de servicio", `${number.format(years)} años`),
    row("Base mensual aplicada", money.format(baseMonthly)),
    row("Salario diario aplicado", money.format(daily)),
    row("Días por año", `${number.format(daysYear)} días`)
  ], eligible ? `${money.format(daily)} × ${daysYear} × ${number.format(years)}` : "Sin prestación por no cumplir la antigüedad mínima", !eligible);
}

function calculateFortnight() {
  const salary = value("qu-salary");
  const days = value("qu-days");
  const hoursDay = Math.max(1, value("qu-hours-day"));
  const extraHours = value("qu-extra-hours");
  const extraMultiplier = value("qu-extra-mult");
  const otherIncome = value("qu-other-income");
  const isr = value("qu-isr");
  const otherDed = value("qu-other-ded");
  const calculation = LaborMath.fortnight({ salary, paidDays: days, hoursPerDay: hoursDay, overtimeHours: extraHours, overtimeMultiplier: extraMultiplier, otherIncome, isssRate: value("qu-isss-rate"), isssCap: value("qu-isss-cap"), afpRate: value("qu-afp-rate"), contributionShare: value("qu-contribution-share"), isr, otherDeductions: otherDed });
  const { net, gross, base, overtime, isss, afp, deductions } = calculation;
  showResult("qu", net, `Bruto ${money.format(gross)} · Deducciones ${money.format(deductions)}.`, [
    row("Salario por días", money.format(base)),
    row("Horas extra", money.format(overtime)),
    row("Otros ingresos", money.format(otherIncome)),
    row("ISSS estimado", `− ${money.format(isss)}`),
    row("AFP estimada", `− ${money.format(afp)}`),
    row("ISR y otros descuentos", `− ${money.format(isr + otherDed)}`)
  ], `${money.format(gross)} − ${money.format(deductions)}`);
}

function setActiveTab(name) {
  document.querySelectorAll(".tab").forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    const active = panel.id === `panel-${name}`;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
}

function openLegalModal(type) {
  const reference = legalReferences[type];
  if (!reference) return;
  $("legal-modal-title").textContent = reference.title;
  $("legal-modal-intro").textContent = reference.intro;
  $("legal-modal-content").innerHTML = reference.items.map(([article, title, description]) => `
    <div class="legal-item">
      <span class="legal-article">${article}</span>
      <p><b>${title}</b>${description}</p>
    </div>`).join("");
  $("legal-modal").showModal();
}

const today = new Date();
["ag-end", "de-end", "re-end"].forEach((id) => { $(id).value = dateInputValue(today); });
$("year").textContent = today.getFullYear();

document.querySelectorAll(".tab").forEach((tab, index, tabs) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
    tabs[next].focus();
    setActiveTab(tabs[next].dataset.tab);
  });
});

document.querySelectorAll(".legal-button").forEach((button) => {
  button.addEventListener("click", () => openLegalModal(button.dataset.legal));
});

document.querySelectorAll("input[data-date]").forEach((input) => {
  input.addEventListener("input", () => formatDateInput(input));
});

document.querySelectorAll(".date-picker-native").forEach((picker) => {
  const target = $(picker.dataset.dateTarget);
  picker.value = displayDateToIso(target.value);
  target.addEventListener("input", () => {
    picker.value = displayDateToIso(target.value);
  });
  picker.addEventListener("change", () => {
    if (!picker.value) return;
    target.value = isoDateToDisplay(picker.value);
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.focus();
  });
});

$("legal-modal-close").addEventListener("click", () => $("legal-modal").close());
$("legal-modal").addEventListener("click", (event) => {
  if (event.target === $("legal-modal")) $("legal-modal").close();
});

document.querySelectorAll(".calc-form input").forEach((input) => input.addEventListener("input", () => {
  calculateAguinaldo();
  calculateDismissal();
  calculateResignation();
  calculateFortnight();
}));

$("ag-variable").addEventListener("change", () => $("ag-variable-wrap").classList.toggle("visible", $("ag-variable").checked));
$("ag-prorate-auto").addEventListener("change", () => $("ag-days-wrap").classList.toggle("visible", !$("ag-prorate-auto").checked));

calculateAguinaldo();
calculateDismissal();
calculateResignation();
calculateFortnight();
