import { jsPDF } from 'jspdf'
import { type Claim, CODES, PROVIDER, money, short } from './data'

export function buildPra(c: Claim, date: string): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'landscape' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 30
  const m = c.member

  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(0, 38, 119)
  doc.text('UnitedHealthcare', M, 34)
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(60)
  doc.text(`PROVIDER REMITTANCE ADVICE   ·   Payment date ${date}   ·   ${c.paymentMethod ?? 'EFT'} # ${c.checkNumber ?? '--'}`, W - M, 34, { align: 'right' })
  doc.text(`Payee: ${PROVIDER.name.toUpperCase()}  ·  TIN ${PROVIDER.tin}  ·  NPI ${PROVIDER.npi}  ·  ${PROVIDER.address}`, M, 48)
  doc.setTextColor(0)

  let y = 62
  doc.setFillColor(225, 225, 225).rect(M, y, W - 2 * M, 18, 'F')
  doc.setFont('helvetica', 'bold').setFontSize(12)
  doc.text(`PATIENT: ${m.firstName} ${m.lastName} (${m.relationship})`, M + 4, y + 13)
  y += 30
  doc.setFontSize(8)
  const info: [string, string][][] = [
    [['SUBSCRIBER ID:', `A ${m.id}`], ['SUBSCRIBER NAME:', m.subscriberName], ['CLAIM NUMBER:', `${c.claimNumber} ${c.icn}`]],
    [['CLAIM DATE:', `${short(c.dosFrom)}-${short(c.dosTo)}`], ['DATE RECEIVED:', short(c.received)], ['PRODUCT:', m.product]],
    [['REND PROV ID:', PROVIDER.npi], ['REND PROV:', PROVIDER.rendering], ['', '']],
  ]
  info.forEach((row, ri) => {
    row.forEach(([k, v], ci) => {
      const x = M + 6 + ci * 245
      doc.setFont('helvetica', 'bold').text(k, x, y + ri * 13)
      doc.setFont('helvetica', 'normal').text(v, x + 95, y + ri * 13)
    })
  })
  y += 46

  // Claim summary table
  const ch = ['PATIENT CONTROL NUMBER', 'PATIENT ID', 'AUTH/REF NUMBER', 'DRG', 'DRG WEIGHT', 'CLAIM CHARGE AMOUNT', 'CLM ADJ AMT', 'GRP CD', 'CLM ADJ RSN CD', 'CLAIM PAYMENT AMOUNT', 'PATIENT RESPONSIBILITY']
  const cw = [90, 62, 72, 40, 52, 82, 66, 40, 58, 86, 86]
  const header = (heads: string[], widths: number[], yy: number) => {
    doc.setDrawColor(150).setLineWidth(0.5)
    let x = M
    doc.setFont('helvetica', 'bold').setFontSize(6.5)
    heads.forEach((h, i) => {
      doc.rect(x, yy, widths[i], 26)
      doc.text(doc.splitTextToSize(h, widths[i] - 4), x + widths[i] / 2, yy + 8, { align: 'center' })
      x += widths[i]
    })
  }
  header(ch, cw, y)
  y += 26
  doc.setFillColor(238, 238, 238).rect(M, y, cw.reduce((a, b) => a + b), 14, 'F')
  doc.setFont('helvetica', 'normal').setFontSize(7.5)
  const cv = [c.patientAccount, '', '', '', '', money(c.billed), '', '', '', money(c.paid), money(c.patientResp)]
  let x = M
  cv.forEach((v, i) => {
    doc.rect(x, y, cw[i], 14)
    doc.text(v, i >= 5 ? x + cw[i] - 4 : x + 3, y + 10, { align: i >= 5 ? 'right' : 'left' })
    x += cw[i]
  })
  y += 32

  doc.setFont('helvetica', 'bold').setFontSize(8).text('SERVICE LINE DETAIL(S)', W / 2, y, { align: 'center' })
  y += 6
  const lh = ['LINE CTRL#', 'DATES OF SERVICE', 'SUB PROD/ SVC/ MOD', 'ADJ PROD/ SVC', 'MOD', 'REV', 'UNITS', 'SUB UNITS', 'CHARGE', 'AMOUNT ALLOWED', 'ADJ AMOUNT', 'GRP CD', 'CLM ADJ RSN CD', 'PAYMENT AMOUNT', 'REMARK/ NOTES']
  const lw = [62, 62, 40, 40, 28, 28, 32, 32, 64, 64, 64, 30, 36, 64, 50]
  header(lh, lw, y)
  y += 26
  doc.setFont('helvetica', 'normal').setFontSize(7.5)
  c.lines.forEach((l) => {
    const adjs = l.adjustments.length ? l.adjustments : [{ amount: 0, grp: '', rsn: '' }]
    const rowH = 12 * adjs.length + 6
    doc.setFillColor(238, 238, 238).rect(M, y, lw.reduce((a, b) => a + b), rowH, 'F')
    const vals = [l.ctrl.replace(' ', '\n'), `${short(l.dosFrom)} -\n${short(l.dosTo)}`, '', l.code, l.modifier, '', String(l.units), String(l.units), money(l.billed), money(l.allowed)]
    x = M
    vals.forEach((v, i) => {
      doc.rect(x, y, lw[i], rowH)
      doc.text(v.split('\n'), i >= 8 ? x + lw[i] - 4 : x + 3, y + 10, { align: i >= 8 ? 'right' : 'left' })
      x += lw[i]
    })
    const ax = x
    adjs.forEach((a, ai) => {
      let xx = ax
      ;[a.amount ? money(a.amount) : '', a.grp, a.rsn].forEach((v, k) => {
        doc.text(v, k === 0 ? xx + lw[10] - 4 : xx + 3, y + 10 + ai * 12, { align: k === 0 ? 'right' : 'left' })
        xx += lw[10 + k]
      })
    })
    ;[10, 11, 12].forEach((i) => { doc.rect(x, y, lw[i], rowH); x += lw[i] })
    doc.rect(x, y, lw[13], rowH); doc.text(money(l.paid), x + lw[13] - 4, y + 10, { align: 'right' }); x += lw[13]
    doc.rect(x, y, lw[14], rowH); doc.text(l.remarks.join(' '), x + 3, y + 10)
    y += rowH
  })
  // subtotal
  doc.setFillColor(225, 225, 225).rect(M, y, lw.reduce((a, b) => a + b), 14, 'F')
  doc.text(`CLAIM# ${c.claimNumber} ${c.icn}`, M + 3, y + 10)
  doc.text('SUBTOTAL', M + 262, y + 10)
  const adjTot = c.lines.reduce((a, l) => a + l.adjustments.reduce((s, x) => s + x.amount, 0), 0)
  const off = lw.slice(0, 8).reduce((a, b) => a + b)
  doc.text(money(c.billed), M + off + lw[8] - 4, y + 10, { align: 'right' })
  doc.text(money(c.allowed), M + off + lw[8] + lw[9] - 4, y + 10, { align: 'right' })
  doc.text(money(adjTot), M + off + lw[8] + lw[9] + lw[10] - 4, y + 10, { align: 'right' })
  doc.text(money(c.paid), M + off + lw[8] + lw[9] + lw[10] + lw[11] + lw[12] + lw[13] - 4, y + 10, { align: 'right' })
  doc.text([...new Set(c.lines.flatMap((l) => l.remarks))].join(' '), M + off + lw.slice(8, 14).reduce((a, b) => a + b) + 3, y + 10)
  y += 26
  doc.setFont('helvetica', 'bold').setFontSize(8).text('PAYMENT OF BENEFITS HAS BEEN MADE IN ACCORDANCE WITH THE TERMS OF THE MANAGED CARE SYSTEM.', M, y)
  y += 8
  doc.rect(M, y, W - 2 * M, 14)
  doc.text('TOTAL PAYABLE TO PROVIDER', W - M - 150, y + 10, { align: 'right' })
  doc.text(money(c.paid), W - M - 6, y + 10, { align: 'right' })
  y += 30

  doc.setFontSize(11).text('NOTES', M, y)
  y += 16
  const codes = [...new Set([...c.lines.flatMap((l) => l.adjustments.map((a) => `${a.grp}${a.rsn}`)), ...c.lines.flatMap((l) => l.remarks)])]
  doc.setFontSize(9)
  codes.forEach((code) => {
    const t = doc.splitTextToSize(CODES[code] ?? '', W - 2 * M - 70)
    doc.setFont('helvetica', 'bold').text(code, M, y)
    doc.setFont('helvetica', 'normal').text(t, M + 60, y)
    y += t.length * 11 + 6
  })
  y += 6
  doc.setFont('helvetica', 'bold').setFontSize(9).text('If you disagree with a claim reimbursement decision', M, y)
  doc.setFont('helvetica', 'normal').setFontSize(8).text('The member, health care professional or an authorized representative may contest the claim payment decision by submitting comments, documents or other information that shows why they believe the decision should be changed.', M, y + 11, { maxWidth: W - 2 * M })
  doc.setFontSize(7).setTextColor(120).text('DEMO DATA - NOT A REAL REMITTANCE', W / 2, H - 16, { align: 'center' })
  return doc
}

export const praFile = (c: Claim, date: string) => `PRA_${c.claimNumber}_${date.replace(/\//g, '-')}.pdf`
export function openPra(c: Claim, date: string) {
  const doc = buildPra(c, date)
  const url = URL.createObjectURL(new File([doc.output('blob')], praFile(c, date), { type: 'application/pdf' }))
  if (!window.open(url, '_blank')) doc.save(praFile(c, date))
}
export const downloadPra = (c: Claim, date: string) => buildPra(c, date).save(praFile(c, date))
