function extractOtp(text) {
  if (!text) return null;

  const patterns = [
    /\b(\d{6})\b/,
    /\b(\d{4})\b/,
    /code[:\s]+(\d{4,8})/i,
    /otp[:\s]+(\d{4,8})/i,
    /verification[:\s]+(\d{4,8})/i,
    /pin[:\s]+(\d{4,8})/i,
    /token[:\s]+(\d{4,8})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
}

module.exports = { extractOtp };
