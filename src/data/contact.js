export const WA_NUMBER = "6289510253435";
export const WA_DISPLAY = "0895-1025-3435";
export const WA_SCHEMA = "+62-895-1025-3435";
export const WA_GREETING = "Halo Kak";

const DEFAULT_WA_TEXT =
  `${WA_GREETING}, saya mau tanya-tanya soal pelatihan & sertifikasi K3. Boleh dibantu? 🙏`;

export function friendlyMessage(text) {
  if (!text || typeof text !== "string") return DEFAULT_WA_TEXT;

  let msg = text.trim();
  if (!msg) return DEFAULT_WA_TEXT;

  // Normalize stiff corporate greetings into warm, approachable "Halo Kak,"
  if (/^Halo\s+(?:Admin\s+)?Konsultan\s*K3\s*,?\s*/i.test(msg)) {
    msg = msg.replace(/^Halo\s+(?:Admin\s+)?Konsultan\s*K3\s*,?\s*/i, `${WA_GREETING}, `);
  } else if (/^Halo\s+Kak\s*,?\s*/i.test(msg)) {
    msg = msg.replace(/^Halo\s+Kak\s*,?\s*/i, `${WA_GREETING}, `);
  } else if (/^Halo\s*,\s*/i.test(msg)) {
    msg = msg.replace(/^Halo\s*,\s*/i, `${WA_GREETING}, `);
  } else if (!/^Halo\b/i.test(msg)) {
    msg = `${WA_GREETING}, ${msg.charAt(0).toLowerCase()}${msg.slice(1)}`;
  }

  // Soften formal opening phrases right after greeting
  msg = msg
    .replace(/^(Halo Kak,\s*)saya ingin\b/i, "$1saya mau")
    .replace(/^(Halo Kak,\s*)kami ingin\b/i, "$1kami mau")
    .replace(/^(Halo Kak,\s*)mohon\b/i, "$1boleh minta");

  // Append warm emoji if not already present at the end
  if (!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]$/u.test(msg)) {
    msg = `${msg} 🙏`;
  }

  return msg;
}

export const waLink = (text) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(friendlyMessage(text))}`;
