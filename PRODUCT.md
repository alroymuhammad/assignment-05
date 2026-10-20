# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Maju-Telco customers who need clear, authoritative information about available mobile data packages.

## Product Purpose

Maju-Telco is a customer-support AI that helps end users understand Maju-Telco data packages, including package names, data quotas, validity periods, prices, and applicable terms. Success means customers can quickly identify and compare an appropriate package without receiving invented or unsupported information.

## Positioning

The assistant answers from a maintained Maju-Telco package catalog as its sole source of truth and limits recommendations to the customer’s stated budget, quota requirement, and desired validity period.

## Operating Context

Customers use a responsive chat interface in Bahasa Indonesia or their own language to ask about Maju-Telco mobile data packages and pricing.

## Capabilities and Constraints

- Answers questions about Maju-Telco data packages and prices from the supplied catalog.
- May compare listed packages and make catalog-grounded recommendations.
- Does not invent packages, promotions, purchase methods, or terms.
- Does not perform purchases or account actions and does not request personal or account data.
- Account support, transactions, billing disputes, refunds, network troubleshooting, SIM/eSIM, calls, SMS, home internet, complaints, and escalation remain out of scope.
- The existing responsive chat behavior, streaming, sidebar, recent conversation, composer, loading, and error states must be preserved.

## Brand Commitments

The product and assistant name is Maju-Telco. It must not use Claude branding, icons, or Claude’s warm brown/orange visual palette. The interface voice is concise, clear, respectful, and authoritative.

## Evidence on Hand

The package catalog is maintained in `packages/agents/src/context/document.ts`. No external claims, testimonials, customer data, promotions, or additional service channels are available and none should be fabricated.

## Product Principles

- Catalog truth over plausible invention.
- Fast, concise answers for routine package decisions.
- Minimal collection of customer information.
- Clear scope boundaries and honest recovery when information is unavailable.
- Responsive, accessible operation across desktop and mobile.
