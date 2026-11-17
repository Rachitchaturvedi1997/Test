import { jsPDF } from 'jspdf'
import { type AvClaim, CARC, ORGANIZATION, money, payerById } from './data'

export function buildRemitPdf(c: AvClaim): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 40
  const payer = payerById(c.payerId)
  const foot = (p: number, t: number) => {
    doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(110)
    doc.text('Remittance Advice (835) - DEMO DATA, NOT A REAL REMITTANCE', M, H - 22)
    doc.text(`Page ${p} of ${t}`, W - M, H - 22, { align: 'right' })
    doc.setTextColor(0)
  }
  // Header
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(payer.color)
  doc.text(payer.display, M, 46)
  doc.setTextColor(0).setFontSize(12).text('PROVIDER REMITTANCE ADVICE', W - M, 40, { align: 'right' })
  doc.setFont('helvetica', 'normal').setFontSize(8)
  doc.text(`${payer.name}  ·  Payer ID ${payer.id}`, W - M, 52, { align: 'right' })
  doc.text([...payer.address, `Provider Services ${payer.phone}`], M, 60)
  doc.setDrawColor(160).line(M, 90, W - M, 90)

  let y = 108
  doc.setFont('helvetica', 'bold').setFontSize(9).text('PAYEE', M, y)
  doc.text('PAYMENT', W / 2 + 10, y)
  doc.setFont('helvetica', 'normal')
  ;[c.provider.name, ...c.provider.address, `NPI: ${c.provider.npi}    TIN: ${c.provider.tin}`].forEach((l, i) => doc.text(l, M, y + 13 + i * 11))
  const pay: [string, string][] = [
    ['Payment Method', c.paymentMethod ?? '--'],
    ['Check/EFT Number', c.checkNumber ?? '--'],
    ['Payment Date', c.paymentDate ?? '--'],
    ['Payment Amount', money(c.paid)],
  ]
  pay.forEach(([k, v], i) => {
    doc.text(k, W / 2 + 10, y + 13 + i * 11)
    doc.text(v, W - M, y + 13 + i * 11, { align: 'right' })
  })

  y = 180
  doc.setFillColor(240, 240, 240).rect(M, y, W - 2 * M, 54, 'F')
  doc.setFont('helvetica', 'bold').setFontSize(9)
  doc.text(`PATIENT: ${c.member.lastName}, ${c.member.firstName} ${c.member.middle}`.trim(), M + 6, y + 14)
  doc.setFont('helvetica', 'normal').setFontSize(8)
  const kv: [string, string][] = [
    ['MEMBER ID', c.member.memberId],
    ['CLAIM #', c.claimNumber],
    ['PATIENT ACCT #', c.patientAccount],
    ['SUBSCRIBER', `${c.member.subLast}, ${c.member.subFirst}`],
    ['GROUP #', c.member.group],
    ['RECEIVED', c.received],
  ]
  kv.forEach(([k, v], i) => {
    const cx = M + 6 + (i % 3) * 180
    const cy = y + 30 + Math.floor(i / 3) * 12
    doc.setFont('helvetica', 'bold').text(`${k}:`, cx, cy)
    doc.setFont('helvetica', 'normal').text(v, cx + 72, cy)
  })

  y = 252
  const cols = [
    ['LN', 20], ['DOS', 56], ['CPT/MOD', 52], ['UNITS', 30], ['BILLED', 52], ['ALLOWED', 52], ['DEDUCT', 46], ['COPAY', 44], ['COINS', 44], ['PAID', 52], ['CARC', 84],
  ] as const
  doc.setFillColor(26, 95, 180).rect(M, y, W - 2 * M, 16, 'F')
  doc.setTextColor(255).setFont('helvetica', 'bold').setFontSize(7)
  let x = M + 3
  cols.forEach(([h, w]) => { doc.text(h, x, y + 11); x += w })
  doc.setTextColor(0).setFont('courier', 'normal').setFontSize(7.5)
  y += 16
  c.lines.forEach((l) => {
    const row = [String(l.line), l.dosFrom, `${l.code}${l.modifier ? ' ' + l.modifier : ''}`, String(l.units), money(l.billed), money(l.allowed), money(l.deductible), money(l.copay), money(l.coinsurance), money(l.paid), l.carc.join(' ')]
    x = M + 3
    row.forEach((v, i) => { doc.text(v, x, y + 12); x += cols[i][1] })
    y += 16
    doc.setDrawColor(220).line(M, y, W - M, y)
  })
  const tot = (k: 'billed' | 'allowed' | 'deductible' | 'copay' | 'coinsurance' | 'paid') => money(c.lines.reduce((a, l) => a + l[k], 0))
  doc.setFont('courier', 'bold')
  x = M + 3
  ;['', 'CLAIM TOTAL', '', '', tot('billed'), tot('allowed'), tot('deductible'), tot('copay'), tot('coinsurance'), tot('paid'), ''].forEach((v, i) => { doc.text(v, x, y + 12); x += cols[i][1] })
  y += 30
  doc.setFont('helvetica', 'bold').setFontSize(9)
  doc.text(`PATIENT RESPONSIBILITY: ${money(c.patientResp)}`, M, y)
  doc.text(`TOTAL PAYABLE TO PROVIDER: ${money(c.paid)}`, W - M, y, { align: 'right' })

  y += 30
  doc.setFontSize(10).text('ADJUSTMENT REASON CODES', M, y)
  doc.setFont('helvetica', 'normal').setFontSize(8)
  y += 14
  ;[...new Set(c.lines.flatMap((l) => l.carc))].forEach((code) => {
    const lines = doc.splitTextToSize(`${code}   ${CARC[code] ?? ''}`, W - 2 * M)
    doc.text(lines, M, y)
    y += lines.length * 10 + 4
  })
  y += 14
  doc.setFont('helvetica', 'bold').setFontSize(9).text('If you disagree with a claim reimbursement decision', M, y)
  doc.setFont('helvetica', 'normal').setFontSize(8)
  doc.text(
    doc.splitTextToSize('You may request a reconsideration or file an appeal through Dispute Claim within 180 days of the payment date. Include the claim number, member ID and supporting medical records.', W - 2 * M),
    M,
    y + 12,
  )
  doc.text(`Customer ID ${ORGANIZATION.customerId}`, M, H - 40)
  foot(1, 1)
  return doc
}

export const remitFile = (c: AvClaim) => `RemittanceAdvice_${c.claimNumber}_${(c.paymentDate ?? '').replace(/\//g, '-')}.pdf`
export function openRemit(c: AvClaim) {
  const doc = buildRemitPdf(c)
  const url = URL.createObjectURL(new File([doc.output('blob')], remitFile(c), { type: 'application/pdf' }))
  if (!window.open(url, '_blank')) doc.save(remitFile(c))
}
export const downloadRemit = (c: AvClaim) => buildRemitPdf(c).save(remitFile(c))
