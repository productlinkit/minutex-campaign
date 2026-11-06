export const digits = (v) => v.replace(/\D/g, '')

export function cardBrand(num) {
  const n = digits(num)
  if (/^4/.test(n)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  if (/^(6011|65|64[4-9])/.test(n)) return 'discover'
  return null
}

export function formatCardNumber(value) {
  const n = digits(value)
  if (cardBrand(n) === 'amex') {
    const v = n.slice(0, 15)
    return [v.slice(0, 4), v.slice(4, 10), v.slice(10)].filter(Boolean).join(' ')
  }
  return n.slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value) {
  const n = digits(value).slice(0, 4)
  return n.length > 2 ? `${n.slice(0, 2)} / ${n.slice(2)}` : n
}

export function luhn(num) {
  const n = digits(num)
  let sum = 0
  for (let i = 0; i < n.length; i++) {
    let d = Number(n[n.length - 1 - i])
    if (i % 2) { d *= 2; if (d > 9) d -= 9 }
    sum += d
  }
  return n.length >= 13 && sum % 10 === 0
}

export function validateCard({ number, expiry, cvc }) {
  const errors = {}
  const n = digits(number)
  const brand = cardBrand(n)
  if (!luhn(n) || (brand === 'amex' ? n.length !== 15 : n.length < 16)) errors.number = 'Your card number is invalid.'

  const [mm, yy] = digits(expiry).match(/^(\d{2})(\d{2})$/)?.slice(1) ?? []
  if (!mm || +mm < 1 || +mm > 12) errors.expiry = "Your card's expiration date is incomplete."
  else {
    const now = new Date()
    const exp = new Date(2000 + +yy, +mm) // first day of the month after expiry
    if (exp <= now) errors.expiry = "Your card's expiration year is in the past."
  }

  if (digits(cvc).length < (brand === 'amex' ? 4 : 3)) errors.cvc = "Your card's security code is incomplete."
  return errors
}
