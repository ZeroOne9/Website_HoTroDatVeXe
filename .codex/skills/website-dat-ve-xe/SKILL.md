---
name: website-dat-ve-xe
description: Project-specific guidance for a Vietnamese bus ticket booking website. Use when Codex works in this repository to implement, review, debug, test, document, or generate code related to trip search, seat selection, bookings, tickets, passenger accounts, admin workflows, Prisma schemas, APIs, and thesis documentation.
---

# Website Dat Ve Xe

## First steps

* Inspect the repository before assuming the technology stack: run `rg --files`, then review files such as `package.json`, `prisma/schema.prisma`, route handlers, server actions, middleware, and UI components.
* Follow existing project conventions for folder structure, naming, validation, database access, API responses, and UI components.
* Keep changes scoped to the requested feature or bug.
* Avoid broad architectural rewrites unless explicitly requested.
* Use Vietnamese user-facing text unless the surrounding UI already uses another language.

## Technology stack

Assume the following technologies unless the repository clearly indicates otherwise:

* Next.js 14.2.30 (App Router)
* React 18.3.1
* TypeScript
* Prisma ORM 5.22.0
* MySQL 8.4
* Tailwind CSS 3.4
* shadcn/ui
* React Hook Form
* Zod
* bcrypt
* jsonwebtoken (JWT)
* Nodemailer
* QRCode

Development rules:

* Use TypeScript for all new code.
* Use Prisma for database access.
* Prefer Prisma queries over raw SQL.
* Use App Router conventions.
* Reuse existing components whenever possible.
* Keep implementation simple and suitable for a university graduation project.

## Database design

The database design is fixed and approved for the thesis.

Do not create additional tables without explicit approval.

Approved tables:

* User
* BusCompany
* Vehicle
* Seat
* Location
* Route
* Trip
* Booking
* Ticket

All generated code, APIs, Prisma schemas, ERD diagrams, Use Case diagrams, Sequence diagrams, and thesis documentation must remain consistent with these 9 tables.

## Domain model

Treat these as domain concepts. Confirm actual schema before editing code.

* `user`: passenger or administrator account.
* `busCompany`: bus operator information.
* `vehicle`: vehicle information, license plate, capacity, and status.
* `seat`: seat information belonging to a vehicle.
* `location`: departure, destination, pickup, and drop-off locations.
* `route`: travel route between locations.
* `trip`: scheduled route with departure time, vehicle, and ticket price.
* `booking`: passenger reservation containing selected seats and booking information.
* `ticket`: confirmed ticket generated from a booking.

## Booking behavior

* Never trust seat availability from the client.
* Recalculate prices on the server.
* Verify booking ownership before allowing updates or cancellations.
* Protect seat reservations using transactions, constraints, or concurrency control.
* Prevent duplicate seat bookings.
* Expire unpaid bookings deterministically.
* Release seats associated with expired bookings.
* Ticket codes must be unique.
* Prevent duplicate ticket generation.

Suggested booking statuses:

* pending
* confirmed
* cancelled
* expired

## Authentication and authorization

* Use JWT-based authentication.
* Protect all administrative routes.
* Validate user permissions before modifying data.
* Keep authorization checks close to the route handler or server action.
* Never expose password hashes, JWT secrets, or environment variables.

## UI and UX

* Prioritize the booking workflow over marketing pages.
* Design mobile-first.
* Show prices in VND.
* Use Vietnam timezone (UTC+7).
* Clearly display departure and destination information.
* Keep seat maps stable in size.
* Seat status changes must not shift the layout.

Passenger workflow:

1. Search trips
2. View trip details
3. Select seats
4. Enter passenger information
5. Confirm booking
6. View ticket
7. View booking history

Admin workflow:

* Manage bus companies
* Manage vehicles
* Manage routes
* Manage trips
* Manage bookings
* Manage users
* View statistics

## Security and validation

* Validate all input on the server.
* Validate route IDs, trip IDs, seat IDs, booking IDs, emails, phone numbers, and dates.
* Sanitize user input where appropriate.
* Avoid exposing sensitive customer information in logs or API responses.

## Prisma rules

* Use MySQL as the datasource provider.
* Follow existing schema naming conventions.
* Use proper relations between models.
* Do not introduce additional models without approval.
* Keep Prisma schema synchronized with thesis documentation and ERD diagrams.

## Documentation rules

When generating:

* ERD
* Use Case Diagram
* Activity Diagram
* Sequence Diagram
* Database Description
* Business Rules
* API Documentation
* Thesis Chapters

Always keep documentation consistent with:

* Prisma schema
* Approved database design
* Existing business rules

Never introduce entities or tables that do not exist in the approved database.

## Testing and verification

* Run the narrowest relevant tests first.
* Run lint/build checks when available.
* If no automated tests exist, perform focused manual verification.

For booking logic, verify:

* Duplicate seat selection
* Concurrent booking attempts
* Expired bookings
* Invalid trip IDs
* Invalid seat IDs
* Unauthorized access
* Booking cancellation
* Ticket generation

For UI changes:

* Verify mobile layouts
* Verify desktop layouts
* Verify responsive behavior
* Verify Vietnamese labels fit correctly
* Verify seat map responsiveness

## Development principles

* Simplicity over complexity.
* Maintainability over cleverness.
* Reuse existing code whenever possible.
* Keep business logic centralized.
* Minimize unnecessary dependencies.
* Keep database, Prisma schema, diagrams, APIs, and documentation synchronized at all times.
* Prefer practical solutions suitable for a graduation project over enterprise-level complexity.
