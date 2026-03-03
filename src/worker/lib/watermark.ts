import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'

export async function applyWatermark(
  pdfBytes: ArrayBuffer,
  label: string,
  viewerEmail: string,
  date: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const text = `${label}  •  ${viewerEmail}  •  ${date}`
  const fontSize = 48
  const textWidth = font.widthOfTextAtSize(text, fontSize)
  // cos(45°) = sin(45°) = 1/√2
  const c = Math.SQRT1_2

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize()
    // Solve for origin so the rotated text's visual center lands at the page center
    const x = width / 2 - c * (textWidth / 2 - fontSize / 2)
    const y = height / 2 - c * (textWidth / 2 + fontSize / 2)
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
      opacity: 0.35,
      rotate: degrees(45),
    })
  }

  return pdfDoc.save()
}
