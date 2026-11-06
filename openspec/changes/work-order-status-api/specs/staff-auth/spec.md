# Spec Delta

## Purpose

Restringe las rutas internas del taller a empleados autenticados, para proteger la información de los clientes. Es una autenticación de demostración propia de la PoC.

## ADDED Requirements

### Requirement: Employee login
The system SHALL expose `POST /api/auth/login` with body `{ "username": string, "password": string }` and, when the credentials match a known employee, respond `200` with `{ token, user: { id, name, role: "employee" } }`.

#### Scenario: Valid credentials
- **WHEN** a known employee sends the right username and password
- **THEN** the response is `200` with a token and the user data, and the response never includes the password

#### Scenario: Wrong credentials
- **WHEN** the username does not exist or the password is wrong
- **THEN** the response is `401` with `{ error: "INVALID_CREDENTIALS", message }` and the message does not reveal which of the two failed

#### Scenario: Missing fields
- **WHEN** the body lacks `username` or `password`, or either is not a non-empty string
- **THEN** the response is `400` with `{ error: "VALIDATION_ERROR", message }`

### Requirement: Protected internal routes
The system SHALL require the header `Authorization: Bearer <token>` with a valid, unexpired token on every route under `/api/orders`, and SHALL respond `401` with `{ error: "UNAUTHORIZED", message }` otherwise.

#### Scenario: No token
- **WHEN** a request to any `/api/orders` route has no `Authorization` header
- **THEN** the response is `401` with error `UNAUTHORIZED`

#### Scenario: Invalid or expired token
- **WHEN** the token is malformed, tampered with or expired
- **THEN** the response is `401` with error `UNAUTHORIZED`

#### Scenario: Public routes stay open
- **WHEN** a request without token goes to `GET /api/tracking/:code` or `POST /api/auth/login`
- **THEN** the system does not demand a token

### Requirement: Generic error output
The system SHALL NOT expose stack traces, internal paths or token contents in any error response, and SHALL NOT log passwords or tokens.

#### Scenario: Unexpected failure
- **WHEN** an unexpected error occurs while handling a request
- **THEN** the response is `500` with `{ error: "INTERNAL_ERROR", message }` with a generic message
