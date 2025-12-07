// lib/validation.js
export function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(pw) {
  // example: min 8 chars, at least one letter and number
  return typeof pw === "string" && /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pw);
}

export function isValidCourseCode(code) {
  return /^[A-Z]{3}\d{3,4}$/.test(code);
}
