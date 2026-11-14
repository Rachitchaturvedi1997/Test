import { jsPDF } from 'jspdf'
import { type Claim, type Remittance, REMARK_CODES, money, parseDate } from './data'

const longDate = (s: string) =>
  parseDate(s).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

const APPEAL_TEXT = [
  'If you have questions or disagree with the payment identified on the Explanation of Direct Deposit Activity Report, you may ask to have it reviewed.',
  'If you have a contractual agreement with the health plan, please refer to the procedural guidelines associated with your contract, or call our office for assistance.',
  'Call Provider Services at the toll free number on this Explanation of Payment or the patient ID card if you have questions regarding this EOP.',
  'If you are not satisfied with this coverage decision, you can start the Appeal process by submitting a written request to the address listed in your plan materials within 180 days of receipt of this EOP (unless a longer time is permitted by state law or your plan).',
  'Send a copy of this EOP along with any relevant additional information (e.g. benefit documents, clinical records) which helps to demonstrate that your claim is covered under the plan.',
  'Be sure to include your 1) Name, 2) Operation Location/Group Number, 3) Employee/Patient ID number, 4) Name of the patient and relationship, and 5) "Attention: Appeals Unit" on all supporting documents.',
  'You are entitled to receive free upon request access to, and copies of, all documents, records and other information relevant to your claim for benefits.',
  'You will be notified of the final decision in a timely manner, as described in your plan materials. If your plan is governed by ERISA, you also have the right to bring legal action under section 502(a) of ERISA following our review.',
]

export function buildRemittancePdf(remit: Remittance, claims: Claim[]): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const provider = claims[0].provider
  const total = remit.pages
  const M = 40

  const footer = (page: number) => {
    doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(90)
    doc.text('DEMO-RA 07-31-2017', M, H - 24)
    doc.text('Provider EFT Summary  (DEMO DATA – NOT A REAL REMITTANCE)', W / 2, H - 24, { align: 'center' })
    doc.text(`Page ${page} of ${total}`, W - M, H - 24, { align: 'right' })
    doc.setTextColor(0)
  }
  const header = (title: string) => {
    doc.setFillColor(0, 51, 255).rect(0, 0, W, 6, 'F')
    doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(0, 12, 118)
    doc.text('cigna healthcare', M, 40)
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(70)
    doc.text('Demo payer · PO Box 188061 · Chattanooga, TN 37422-8061', M, 52)
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(0)
    doc.text(title, W - M, 40, { align: 'right' })
    doc.setFont('helvetica', 'normal').setFontSize(8)
    doc.text(`Remittance Tracking Number: ${remit.trackingNumber}`, W - M, 52, { align: 'right' })
    doc.setDrawColor(180).line(M, 62, W - M, 62)
  }

  // ---- Page 1: summary ----
  header('Explanation of Payment')
  let y = 86
  doc.setFont('helvetica', 'bold').setFontSize(9).text('Payee', M, y)
  doc.setFont('helvetica', 'normal')
  ;[provider.payeeName.replace(/^\//, ''), ...provider.address, `TIN: ${remit.tin}`, `NPI: ${provider.npi}`].forEach((l, i) =>
    doc.text(l, M, y + 13 + i * 11),
  )
  doc.setFont('helvetica', 'bold').text('Payment Summary', W / 2 + 20, y)
  doc.setFont('helvetica', 'normal')
  const sumRows: [string, string][] = [
    ['Payment Date', remit.paymentDate],
    ['Payment Method', 'EFT (Direct Deposit)'],
    ['Product Type', remit.productType],
    ['Number of Claims', String(claims.length)],
    ['Total Paid', money(remit.depositAmount)],
  ]
  sumRows.forEach(([k, v], i) => {
    doc.text(k, W / 2 + 20, y + 13 + i * 11)
    doc.text(v, W - M, y + 13 + i * 11, { align: 'right' })
  })

  y = 180
  doc.setFont('helvetica', 'bold').setFontSize(10).text('Claim Detail', M, y)
  y += 8
  const cols = [
    { h: 'Patient / ID', w: 104 },
    { h: 'Claim #', w: 74 },
    { h: 'DOS', w: 50 },
    { h: 'CPT', w: 34 },
    { h: 'Charged', w: 46 },
    { h: 'Allowed', w: 46 },
    { h: 'Not Cov', w: 44 },
    { h: 'Ded/Copay', w: 54 },
    { h: 'Coins', w: 34 },
    { h: 'Paid', w: 46 },
  ]
  doc.setFillColor(235, 240, 255).rect(M, y, W - 2 * M, 16, 'F')
  doc.setFontSize(7)
  let x = M + 3
  cols.forEach((c) => {
    doc.text(c.h, x, y + 11)
    x += c.w
  })
  y += 16
  doc.setFont('courier', 'normal').setFontSize(7)
  claims.forEach((c) => {
    c.procedures.forEach((p, pi) => {
      const row = [
        pi === 0 ? `${c.patient.lastName.toUpperCase()}, ${c.patient.firstName.toUpperCase()}` : '',
        pi === 0 ? c.claimNumber : '',
        p.dosFrom,
        p.code,
        money(p.charged),
        money(p.allowed),
        money(p.notCovered),
        `${money(p.deductible)}/${money(p.copay)}`,
        money(p.patientCoins),
        money(p.planPaid),
      ]
      x = M + 3
      row.forEach((v, i) => {
        doc.text(v, x, y + 11)
        x += cols[i].w
      })
      y += 13
      if (pi === 0) {
        doc.text(c.patient.id, M + 3, y + 9)
        doc.text(`Acct ${c.providerAccountNumber}`, M + 3 + cols[0].w, y + 9)
        y += 11
      }
      doc.text(`Remark: ${p.remarkCodes.join(', ')}`, M + 3 + cols[0].w + cols[1].w, y + 9)
      y += 13
    })
    doc.setDrawColor(220).line(M, y, W - M, y)
  })
  doc.setFont('helvetica', 'bold').setFontSize(9)
  doc.text(`Total Paid: ${money(remit.depositAmount)}`, W - M, y + 18, { align: 'right' })
  footer(1)

  // ---- Middle pages: remark codes + appeal rights ----
  for (let page = 2; page < total; page++) {
    doc.addPage()
    header('Explanation of Payment')
    y = 90
    if (page === 2) {
      doc.setFont('helvetica', 'bold').setFontSize(10).text('Explanation of Remark Codes', M, y)
      y += 16
      doc.setFont('helvetica', 'normal').setFontSize(8.5)
      const codes = [...new Set(claims.flatMap((c) => c.procedures.flatMap((p) => p.remarkCodes)))]
      codes.forEach((code) => {
        const lines = doc.splitTextToSize(`${code}  ${REMARK_CODES[code] ?? ''}`, W - 2 * M)
        doc.text(lines, M, y)
        y += lines.length * 11 + 6
      })
    } else {
      doc.setFont('helvetica', 'bold').setFontSize(10).text('Patient Service Detail (continued)', M, y)
      y += 16
      doc.setFont('helvetica', 'normal').setFontSize(8.5)
      claims.forEach((c) => {
        const lines = [
          `Patient: ${c.patient.firstName} ${c.patient.lastName}   ID: ${c.patient.id}   DOB: ${c.patient.dob}`,
          `Group: ${c.patient.group}   Plan: ${c.patient.plan}   Claim #: ${c.claimNumber}`,
          `Received: ${c.received}   Processed: ${c.processed ?? '--'}   Rendering provider: ${c.provider.renderingName}`,
        ]
        doc.text(lines, M, y)
        y += lines.length * 11 + 10
      })
      doc.text('This information reflects our data when the claim was processed. It may not reflect the final patient', M, y + 10)
      doc.text('coinsurance due to other pending claims processing activities.', M, y + 21)
    }
    footer(page)
  }

  // ---- Last page: appeal rights + deposit box (like the reference screenshot) ----
  if (total > 1) {
    doc.addPage()
    footer(total)
  }
  y = total > 1 ? 70 : 520
  doc.setFont('helvetica', 'normal').setFontSize(7.5)
  APPEAL_TEXT.forEach((t) => {
    const lines = doc.splitTextToSize(`• ${t}`, W - 2 * M - 40)
    doc.text(lines, M + 20, y)
    y += lines.length * 9.5 + 3
  })
  doc.setDrawColor(0).line(M + 20, y + 2, W - M - 20, y + 2)

  const by = Math.max(y + 60, 430)
  const bx = W / 2 - 10
  doc.setLineWidth(0.6)
  doc.rect(bx, by, 150, 32)
  doc.rect(bx + 150, by, 90, 32)
  doc.setFontSize(7.5)
  doc.text('Remittance Tracking Number', bx + 4, by + 11)
  doc.text(remit.trackingNumber, bx + 4, by + 25)
  doc.text('Direct Deposit Date', bx + 154, by + 11)
  doc.text(longDate(remit.paymentDate), bx + 154, by + 25)
  doc.text('Direct Deposit', bx + 40, by + 52)
  doc.text('Amount', bx + 40, by + 63)
  doc.text('$', bx + 112, by + 63)
  doc.rect(bx + 122, by + 53, 90, 14)
  doc.setFont('helvetica', 'bold').text(money(remit.depositAmount).replace('$', ''), bx + 126, by + 63)
  doc.setFont('helvetica', 'normal').setFontSize(8)
  doc.text('Deposited for', M + 30, by + 52)
  doc.text(provider.payeeName.replace(/^\//, ''), M + 100, by + 52)
  if (total === 1) footer(1)
  return doc
}

export function remittanceFileName(remit: Remittance) {
  return `Remittance_${remit.trackingNumber}_${remit.paymentDate.replace(/\//g, '-')}.pdf`
}

export function openRemittancePdf(remit: Remittance, claims: Claim[]) {
  const doc = buildRemittancePdf(remit, claims)
  const blob = doc.output('blob')
  const file = new File([blob], remittanceFileName(remit), { type: 'application/pdf' })
  const url = URL.createObjectURL(file)
  const w = window.open(url, '_blank')
  if (!w) downloadRemittancePdf(remit, claims)
}

export function downloadRemittancePdf(remit: Remittance, claims: Claim[]) {
  buildRemittancePdf(remit, claims).save(remittanceFileName(remit))
}
