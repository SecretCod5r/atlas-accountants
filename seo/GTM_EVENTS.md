# Atlas Accountants - GTM DataLayer Events

This document outlines the custom dataLayer events implemented on the site for Google Tag Manager configuration.

## 1. Form Submissions (Lead Generation)
Fired when a user successfully submits a form.

**Event Name:** `generate_lead`
**Fields:**
- `lead_type` (String): Indicates which form was submitted. Values are `'margin_line'` or `'contact'`.
- `event_id` (String): A unique UUID for the submission, useful for deduplication (generated via `crypto.randomUUID()`).

*Note: Personal Identifiable Information (PII) such as name, email, phone, company, answers, or revenue is explicitly excluded from the dataLayer.*

## 2. Margin Line Quiz Tracking
Fired at specific points during the Margin Line quiz experience.

**Event Name:** `quiz_start`
- Fired when the user sees Question 1 of the quiz.
- **Fields:** None.

**Event Name:** `quiz_complete`
- Fired when the quiz results (score and breakdown) are shown to the user.
- **Fields:**
  - `score_band` (String): The bracket of the user's score. Values are `'0_39'`, `'40_59'`, `'60_79'`, or `'80_100'`.

## 3. Global Interactions
Fired on specific interactions globally across the site.

**Event Name:** `phone_click`
- Fired when any `tel:` link is clicked.
- **Fields:** None.

**Event Name:** `email_click`
- Fired when any `mailto:` link is clicked.
- **Fields:** None.

**Event Name:** `booking_click`
- Fired when a user clicks a booking link (e.g., links to `/financial-health-review` or Calendly links).
- **Fields:** None.

## UTM & Attribution Persistence
While not explicitly pushed as events, the following UTMs and attribution parameters are captured on the first page load and persisted in `sessionStorage`. They are appended to form submissions behind the scenes:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `fbclid`
- `gclid`
- `landing_page`
- `referrer`
