# DevKit Studio — Free Developer Tools

> Fast, private, open-source browser-based developer utilities for everyday engineering, academic, and document workflows.

DevKit Studio is a high-performance web application providing an all-in-one suite of essential tools for software engineers, designers, students, and technical writers. Every single operation runs 100% locally in your browser memory — meaning your confidential PDFs, JSON payloads, private API credentials, and proprietary assets are never uploaded to remote servers.

---

## 🛠️ Featured Tool: PDF Studio

Prominently featured at the top of DevKit Studio:

- **Text to PDF**: Automatically wraps text, supports multiple typography sizes (10–16 pt), orientation (Portrait & Landscape), title headers, and automatic multi-page A4 pagination with page counters.
- **Images to PDF**: Compiles multiple JPEG, PNG, and WebP images into a single clean PDF document. Reorder pages and export with a single click.
- **Merge PDFs**: Combines two or more PDF files into a single consolidated document without quality loss or server round-trips.
- **Compress PDF**: Optimizes PDF structures and compresses internal object streams to reduce file weight.

---

## 🔧 Full Tool Suite

1. **PDF Studio**: Create, convert, merge, and optimize PDFs in-browser.
2. **JSON Formatter, Validator & Minifier**: RFC 8259 syntax parsing with exact line/column error detection and auto-repair.
3. **QR Code Generator**: High-contrast QR matrices for URLs, Wi-Fi networks, text, emails, and phone numbers with PNG/SVG downloads.
4. **Colour Palette Generator**: Harmonious palettes (Complementary, Analogous, Triadic) with WCAG 2.1 contrast ratios and CSS/Tailwind export.
5. **CSS Gradient Generator**: Linear, radial, and conic CSS gradients with 360° angle controls and fallback solid backgrounds.
6. **Text Case Converter**: 11 conversion modes (UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, kebab-case, snake_case, etc.).
7. **Word, Character & Readability Counter**: Lexical density metrics, silent reading time (@ 200 WPM), and speaking time (@ 130 WPM).
8. **Base64 Encoder & Decoder**: Safe UTF-8 encoding and file-to-Data URI conversion with live image preview.
9. **URL Encoder & Decoder**: Percent-encoding and interactive query parameter key-value table editor.
10. **UUID / GUID Generator**: RFC 4122 Version 4 cryptographically secure bulk identifier generation.
11. **Browser-Side Image Compressor**: Client-side canvas compression for JPEG, WebP, and PNG with before/after comparison.

---

## 👥 Age-Category Tool Discovery

DevKit Studio includes an optional, respectful "Find tools for your age group" selector:
- **Under 13**: Beginner-friendly typing, word counters, and scan codes.
- **13–17**: Schoolwork essays, study word counts, and homework PDF generation.
- **18–24**: College assignments, portfolio compression, and coding utilities.
- **25–40**: Professional developer normalization, payload validation, and document merging.
- **41+**: Streamlined, high-contrast document combining, Wi-Fi QR cards, and photo resizing.

*Note: Age selection is strictly optional. No date of birth or personal information is requested or collected.*

---

## 🔒 Privacy & Security Guarantee

- **Zero Server Uploads**: Payloads, images, and text inputs never leave your device.
- **Zero Telemetry**: No Google Analytics, no tracking cookies, no marketing pixels, and no fingerprinting.
- **No Account Required**: Immediate access to all features without sign-up or paywalls.
- **Local Storage Transparency**: Browser storage is used solely to store your light/dark mode preference, starred favorite bookmarks, recent tools, and optional remembered age preference.

---

## 💻 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Engines**: [pdf-lib](https://pdf-lib.js.org/) & [jsPDF](https://github.com/parallax/jsPDF)
- **QR Engine**: [qrcode](https://www.npmjs.com/package/qrcode)

---

## 🚀 Getting Started

### Prerequisites

- Node.js `18.0.0` or higher
- npm `9.0.0` or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/devkit-studio.git
   cd devkit-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your web browser.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
