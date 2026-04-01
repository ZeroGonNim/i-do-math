/**
 * 순수 Node.js(zlib)로 PNG 아이콘 생성
 * 실행: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../public/icons')
mkdirSync(OUT_DIR, { recursive: true })

// CRC32 구현
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcInput = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput), 0)
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf])
}

/**
 * 인디고 배경(#4F46E5) + 흰 "M" 글자 대신
 * 단순 단색 PNG 생성 (글자는 SVG에서 처리)
 */
function makePNG(size) {
  const R = 0x4f, G = 0x46, B = 0xe5 // indigo-600

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // Raw image data (filter byte 0 + RGB per pixel)
  const rowLen = 1 + size * 3
  const raw = Buffer.alloc(size * rowLen)
  for (let y = 0; y < size; y++) {
    const base = y * rowLen
    raw[base] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      const off = base + 1 + x * 3
      // 둥근 모서리 마스크 (corner radius ~18%)
      const cr = size * 0.18
      const dx = Math.min(x, size - 1 - x)
      const dy = Math.min(y, size - 1 - y)
      const inCorner = dx < cr && dy < cr
      const dist = Math.hypot(dx - cr, dy - cr)
      const outside = inCorner && dist > cr
      raw[off]   = outside ? 0xff : R
      raw[off+1] = outside ? 0xff : G
      raw[off+2] = outside ? 0xff : B
    }
  }

  const idat = deflateSync(raw)

  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]), // PNG signature
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  const out = join(OUT_DIR, `icon-${size}.png`)
  writeFileSync(out, makePNG(size))
  console.log(`✅ ${out} (${size}x${size})`)
}
