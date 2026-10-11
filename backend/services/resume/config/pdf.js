import fs from "fs"
import { PDFParse } from "pdf-parse"

const extractText = async (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at path: ${filePath}`)
        }

        const buffer = fs.readFileSync(filePath)
        if (!buffer || buffer.length === 0) {
            throw new Error("Uploaded PDF file is empty.")
        }

        const pdf = new PDFParse({
            data: buffer
        })

        const result = await pdf.getText()

        if (typeof pdf.destroy === "function") {
            await pdf.destroy()
        }

        const text = result?.text || ""
        if (!text.trim()) {
            throw new Error("No readable text found in PDF. Make sure the PDF contains selectable text.")
        }

        return text
    } catch (error) {
        console.error("PDF Extraction Error:", error)
        throw error
    }
}

export default extractText




