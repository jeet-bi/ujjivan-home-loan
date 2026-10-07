# Ujjivan SFB · Home Loan journey prototype

A clickable, buyer-side home-loan journey for the persona **Arjun Mehta** (salaried, Nagpur, buying a ₹25 lakh resale house with a ₹20 lakh loan), based on the *Home Loan STP Journey — BRE & Rule Book*.

It runs inside an Android phone frame, with a side console showing the scenario, the journey stages and every rule as it fires.

## Run it

```bash
node build.mjs        # inlines src/ into index.html
open index.html       # works straight from the file system (needs internet for React/Babel/fonts CDN)
```

Deep links let you start anywhere: `index.html#<screen>&<scenario>`, for example `#final&sellerLoan` or `#prop&sellerQR`.
- Screens: web, lead1, lead2, lead3, elig, kyc, uw, ips, prop, propEngine, cleared, final, sign, dcheck, reg, done.
- The console's stage list also jumps, filling in sensible defaults for the earlier stages.

## Journey

| Stage | What Arjun sees |
|---|---|
| 1 · Lead & eligibility | ujjivansfb.in landing page → 3-screen lead form (mobile OTP, work and income, the home) → eligibility estimate with a down-payment slider |
| 2 · KYC & financial data | Task hub: PAN, Aadhaar via DigiLocker, liveness selfie, then bureau + Account Aggregator + EPF with separate consents |
| 3 · In-principle sanction | The four-layer decision engine, then the sanction letter with "how we decided" |
| 4 · Property & seller | Property papers (OCR), seller invite (link, with the valuer's QR as fallback), valuer visit tracker, legal workstreams → property engine |
| 5 · Final offer | Key Facts Statement (EN/HI/MR), read-to-end, accepted by OTP |
| 6 · Sign & auto-pay | Aadhaar e-sign of the document pack (registered on NeSL), and an e-NACH mandate |
| 7 · Disbursement | The 18 pre-disbursement checks, registration day at the sub-registrar, RTGS to the payee(s), welcome details |

## Scenarios (console dropdown)

| Scenario | What changes |
|---|---|
| Happy path | Straight-through; the only human touches are the valuer visit and registration day |
| Face match 68 | Selfie lands in the 65–79 grey zone → assisted call → re-KYC link → retake scores 89 |
| Salary bank not on AA | Upload a statement PDF instead; tamper checks run on it |
| EMI from a different account | Reverse penny drop proves the same holder; the mandate is tagged NON_SALARY |
| Valuation 88% of price | Counter-offer at ₹19.8 lakh, accepted in the app |
| Seller's house mortgaged | SBI foreclosure letter; the payout is split, the seller's lender first |
| Seller misses the link | The valuer shows a geo-fenced QR on site; the seller completes verification there |

## BRE rule book console

`rulebook/index.html` is a companion desktop console. It walks the seven BRE-gated stages and evaluates every rule against the Arjun persona: indicative eligibility, the scorecard, the eligibility engine and the 18-point disbursement check. It is plain HTML and JS, with no build step, and is linked from the journey's side console.

## Source layout

```
src/data.jsx      persona, deal, terms, scenarios, stages, maths (EMI, APR, LTV/FOIR, split payout)
src/kit.jsx       shared UI: icons, logo mark, Android frame, loaders, engine, OTP, task cards, sheets
src/web.jsx       stage 1 — website + lead form + eligibility
src/kyc.jsx       stage 2 — KYC hub and sub-flows
src/sanction.jsx  stage 3 — decision engine + in-principle sanction
src/property.jsx  stage 4 — property hub, seller invite, valuer, property engine, counter-offer
src/close.jsx     stages 5–7 — KFS, e-sign, e-NACH, pre-disbursement, registration, done
src/app.jsx       router, journey state, side console
src/styles.css    theme
```

All figures (rates, fees, amounts, dates, names) live in `src/data.jsx`, so they can be updated in one place when the final rule book arrives. Rebuild after editing.

## Notes

- **The logo is a placeholder.** `UMark` in `src/kit.jsx` is an abstract mark in brand colours; replace it with the official Ujjivan SFB logo asset before showing this outside the team.
- The colour hex codes (teal `#00727A`, orange `#F58220`) approximate the brand palette; swap them for the official values in `:root` in `src/styles.css`.
- This is a prototype. Every number is illustrative, and no real KYC, bureau, AA or payment system is called.
