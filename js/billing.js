export class Billing {
  constructor() {
    this.items = [];
  }

  addItem(name, qty, price) {
    this.items.push({ name, qty, price, total: qty * price });
  }

  subtotal() {
    return this.items.reduce((s, i) => s + i.total, 0);
  }

  static calcDiscount(amount, rate, type = "percentage") {
    if (type === "percentage") return amount * (rate / 100);
    if (type === "flat") return Math.min(rate, amount);
    return 0;
  }

  static calcGST(amount, rate = 18) {
    return amount * (rate / 100);
  }

  static calcCGST(amount, rate = 9) {
    return amount * (rate / 100);
  }

  static calcSGST(amount, rate = 9) {
    return amount * (rate / 100);
  }

  static splitCGSTSGST(totalGst) {
    return { cgst: totalGst / 2, sgst: totalGst / 2 };
  }

  static simpleInterest(principal, rate, time) {
    return (principal * rate * time) / 100;
  }

  static compoundInterest(principal, rate, time, n = 12) {
    const r = rate / 100;
    return principal * Math.pow(1 + r / n, n * time) - principal;
  }

  static calcProfitPercent(cost, selling) {
    if (cost === 0) return 0;
    return ((selling - cost) / cost) * 100;
  }

  static calcSellingPrice(cost, profitPercent) {
    return cost * (1 + profitPercent / 100);
  }

  static calcMargin(selling, cost) {
    if (selling === 0) return 0;
    return ((selling - cost) / selling) * 100;
  }

  static calcTax(total, taxPercent) {
    return total * (taxPercent / 100);
  }

  static calcGrandTotal({ items, discountPercent = 0, gstPercent = 18, cessPercent = 0 }) {
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const discount = this.calcDiscount(subtotal, discountPercent);
    const afterDiscount = subtotal - discount;
    const gst = this.calcGST(afterDiscount, gstPercent);
    const cess = afterDiscount * (cessPercent / 100);
    const grandTotal = afterDiscount + gst + cess;
    const cgst = gst / 2;
    const sgst = gst / 2;

    return { subtotal, discount, afterDiscount, gst, cgst, sgst, cess, grandTotal };
  }

  static formatINR(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  generateInvoice(items, { discountPercent = 0, gstPercent = 18, cessPercent = 0 } = {}) {
    const calc = Billing.calcGrandTotal({ items, discountPercent, gstPercent, cessPercent });
    const lines = items.map(
      (i) =>
        `${i.name.padEnd(16)} ${String(i.qty).padStart(3)} x ${Billing.formatINR(i.price).padStart(8)} = ${Billing.formatINR(i.qty * i.price).padStart(10)}`
    );

    return [
      "=".repeat(50),
      "             TAX INVOICE",
      "=".repeat(50),
      ...lines,
      "-".repeat(50),
      `Subtotal:              ${Billing.formatINR(calc.subtotal).padStart(10)}`,
      discountPercent > 0
        ? `Discount (${discountPercent}%):       -${Billing.formatINR(calc.discount).padStart(10)}`
        : null,
      `After Discount:        ${Billing.formatINR(calc.afterDiscount).padStart(10)}`,
      `CGST (${gstPercent / 2}%):               ${Billing.formatINR(calc.cgst).padStart(10)}`,
      `SGST (${gstPercent / 2}%):               ${Billing.formatINR(calc.sgst).padStart(10)}`,
      cessPercent > 0
        ? `Cess (${cessPercent}%):               ${Billing.formatINR(calc.cess).padStart(10)}`
        : null,
      "=".repeat(50),
      `GRAND TOTAL:           ${Billing.formatINR(calc.grandTotal).padStart(10)}`,
      "=".repeat(50),
    ]
      .filter(Boolean)
      .join("\n");
  }
}
