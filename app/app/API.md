# White Day — REST API Reference

All endpoints are prefixed with `/api/rest`.

---

## Response envelope

Every endpoint returns one of these two shapes:

```json
// Success
{ "data": <payload> }

// Error
{ "error": "<message>" }
```

---

## Authentication

Protected endpoints require a JSON Web Token sent as a Bearer token:

```
Authorization: Bearer <token>
```

Tokens are issued by `/auth/login` and `/auth/register`.

---

## Auth endpoints

### `POST /auth/login`
Authenticate an existing user.

**Body**
| Field | Type | Required |
|-------|------|----------|
| email | string | ✓ |
| password | string | ✓ |

**Response `200`**
```json
{
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "name": "Ahmed Ali", "email": "...", "role": "customer" }
  }
}
```

---

### `POST /auth/register`
Register a new user.

**Body**
| Field | Type | Required |
|-------|------|----------|
| name | string | ✓ |
| email | string | ✓ |
| phone | string | ✓ |
| password | string | ✓ |
| role | `"customer"` \| `"provider"` | — (default: `customer`) |

**Response `201`** — same shape as login.

---

### `GET /auth/me` 🔒
Return the profile of the authenticated user.

**Response `200`**
```json
{ "data": { "user_id": 1, "first_name": "Ahmed", "last_name": "Ali", "email": "...", "phone": "...", "role": "customer" } }
```

---

## Service endpoints

### `GET /services`
List services. Optionally filter by category.

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| typeId | number | Filter by `service_type.t_id` |

**Response `200`** — `{ "data": [ ...services ] }`

---

### `GET /services/:id`
Get a single service with its detail attributes.

**Response `200`**
```json
{ "data": { ...service, "first_name": "...", "last_name": "..." }, "details": [ { "detail_key": "...", "detail_val": "..." } ] }
```

---

### `GET /service-types`
List all service categories.

**Response `200`** — `{ "data": [ { "t_id": 1, "service_name": "Wedding Hall" } ] }`

---

## Booking endpoints 🔒

All booking endpoints require authentication.

### `POST /bookings`
Create a new booking.

**Body**
| Field | Type | Required |
|-------|------|----------|
| service_id | number | ✓ |
| event_date | string (YYYY-MM-DD) | ✓ |
| notes | string | — |

**Response `201`** — `{ "data": { ...booking } }`

---

### `GET /bookings`
List the authenticated user's bookings.

**Response `200`** — `{ "data": [ ...bookings ] }`

---

### `GET /bookings/:id`
Get a single booking with its line items. Only the booking owner (or admin) may access.

**Response `200`**
```json
{ "data": { ...booking, "items": [ { "service_id": 1, "s_name": "...", "quantity": 1, "unit_price": 20000 } ] } }
```

---

### `PATCH /bookings/:id/cancel`
Cancel a **pending** booking. Only the booking owner may cancel.

**Response `200`** — `{ "data": { "booking_id": 101, "status": "cancelled" } }`

---

### `PATCH /bookings/:id/confirm` *(provider / admin only)*
Confirm a booking.

**Response `200`** — `{ "data": { "booking_id": 101, "status": "confirmed" } }`

---

### `PATCH /bookings/:id/complete` *(provider / admin only)*
Mark a booking as completed.

**Response `200`** — `{ "data": { "booking_id": 101, "status": "completed" } }`

---

## Wallet / Payment endpoints 🔒

All wallet endpoints require authentication.

### `GET /wallet/balance`
Get the authenticated user's wallet balance (credits minus debits).

**Response `200`** — `{ "data": { "balance": 5000 } }`

---

### `POST /wallet/topup`
Add funds to the wallet.

**Body**
| Field | Type | Required |
|-------|------|----------|
| amount | number | ✓ |

**Response `201`** — `{ "data": { "transaction_id": 510, "amount": 1000, "balance_after": 6000 } }`

---

### `POST /wallet/pay`
Pay for a booking using wallet balance. Applies a 5% commission. Updates booking status to `confirmed`.

**Body**
| Field | Type | Required |
|-------|------|----------|
| booking_id | number | ✓ |

**Response `200`**
```json
{ "data": { "transaction_id": 511, "amount": 20000, "commission": 1000, "balance_after": 3500, "booking_status": "confirmed" } }
```

---

### `GET /wallet/history`
List the authenticated user's wallet transactions ordered by date descending.

**Response `200`** — `{ "data": [ ...transactions ] }`

---

## Review endpoints

### `GET /reviews?serviceId=X`
List reviews for a service (public).

**Query params**
| Param | Type | Required |
|-------|------|----------|
| serviceId | number | ✓ |

**Response `200`** — `{ "data": [ ...reviews ] }`

---

### `POST /reviews` 🔒
Submit a review. Updates `avg_rating` and `review_count` on the `service` table.

**Body**
| Field | Type | Required |
|-------|------|----------|
| service_id | number | ✓ |
| booking_id | number | ✓ |
| rating | number (1–5) | ✓ |
| comment | string | — |

**Response `201`** — `{ "data": { "review_id": 24 } }`

---

## Dispute endpoints 🔒

### `POST /disputes`
Open a dispute.

**Body**
| Field | Type | Required |
|-------|------|----------|
| booking_id | number | ✓ |
| description | string | ✓ |

**Response `201`** — `{ "data": { "dispute_id": 6 } }`

---

### `GET /disputes`
List disputes. Regular users see only their own; admins/managers see all.

**Response `200`** — `{ "data": [ ...disputes ] }`

---

### `PATCH /disputes/:id/resolve` *(admin / manager only)*
Resolve a dispute.

**Body**
| Field | Type | Required |
|-------|------|----------|
| decision | string | ✓ |
| resolution | string | — (appended to description) |

**Response `200`** — `{ "data": { "dispute_id": 1, "manager_decision": "refunded" } }`

---

## Error codes

| HTTP | Meaning |
|------|---------|
| 400 | Missing or invalid request body |
| 401 | No / invalid JWT |
| 403 | Insufficient role |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already registered) |
| 422 | Business rule violation (e.g. insufficient balance) |
| 500 | Internal server error |
