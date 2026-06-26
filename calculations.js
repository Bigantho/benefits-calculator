(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LaborMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function aguinaldo({ dailySalary, scaleDays, periodDays = 365 }) {
    return dailySalary * scaleDays * Math.min(1, Math.max(0, periodDays) / 365);
  }

  function dismissal({ salary, serviceYears, minimumDaily = 13.44, capMultiplier = 4, minimumDays = 15, applyCap = true }) {
    const actualDaily = salary / 30;
    const capDaily = minimumDaily * capMultiplier;
    const usedDaily = applyCap ? Math.min(actualDaily, capDaily) : actualDaily;
    const proportional = usedDaily * 30 * serviceYears;
    const legalMinimum = usedDaily * minimumDays;
    return { total: Math.max(proportional, legalMinimum), actualDaily, capDaily, usedDaily, proportional, legalMinimum };
  }

  function resignation({ salary, serviceYears, minimumMonthly = 408.80, capMultiplier = 2, daysPerYear = 15, minimumYears = 2, applyCap = true }) {
    const baseMonthly = applyCap ? Math.min(salary, minimumMonthly * capMultiplier) : salary;
    const daily = baseMonthly / 30;
    const eligible = serviceYears >= minimumYears;
    return { total: eligible ? daily * daysPerYear * serviceYears : 0, baseMonthly, daily, eligible };
  }

  function fortnight({ salary, paidDays = 15, hoursPerDay = 8, overtimeHours = 0, overtimeMultiplier = 2, otherIncome = 0, isssRate = 3, isssCap = 1000, afpRate = 7.25, contributionShare = 100, isr = 0, otherDeductions = 0 }) {
    const daily = salary / 30;
    const base = daily * paidDays;
    const hourly = daily / Math.max(1, hoursPerDay);
    const overtime = hourly * overtimeMultiplier * overtimeHours;
    const gross = base + overtime + otherIncome;
    const share = contributionShare / 100;
    const isss = Math.min(salary, isssCap) * (isssRate / 100) * share;
    const afp = salary * (afpRate / 100) * share;
    const deductions = isss + afp + isr + otherDeductions;
    return { net: Math.max(0, gross - deductions), gross, base, hourly, overtime, isss, afp, deductions };
  }

  return { aguinaldo, dismissal, resignation, fortnight };
});
