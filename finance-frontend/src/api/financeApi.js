import axios from 'axios'

const BASE = 'http://localhost:8080/finance'

export const getAll = (sort) =>
  axios.get(BASE, { params: sort ? { sort } : {} }).then(r => r.data)

export const getById = (id) =>
  axios.get(`${BASE}/${id}`).then(r => r.data)

export const create = (data) =>
  axios.post(BASE, data).then(r => r.data)

export const update = (id, data) =>
  axios.put(`${BASE}/${id}`, data).then(r => r.data)

export const remove = (id) =>
  axios.delete(`${BASE}/${id}`)

// ── Currency Converter ──────────────────────────────────────────
// Free tier: https://api.exchangerate-api.com/v4/latest/{base}
// Supports: USD, EUR, GBP, INR, JPY, AED, SGD, CAD, AUD, CHF
const EXCHANGE_BASE = 'https://api.exchangerate-api.com/v4/latest'

export const getRates = (baseCurrency = 'INR') =>
  axios.get(`${EXCHANGE_BASE}/${baseCurrency}`)
    .then(r => r.data.rates)