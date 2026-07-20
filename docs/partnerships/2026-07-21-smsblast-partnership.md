# SMSblast × QuestHQ — Partnership Questions & Business Model

**Date:** 2026-07-21
**Purpose:** What to communicate to Ethan (SMSblast owner) and his dev team, plus a
first-draft pricing/reseller model for QuestHQ. This is the "figure that stuff out"
document before we build.

---

## 1. The idea in one paragraph

Instead of QuestHQ owning one shared texting number, **each client business gets its
own SMSblast account** (its own numbers, its own balance, its own compliance). QuestHQ
(Job Center / Command Center) becomes the front end: it creates those accounts, lets
each business text from inside the app, and **bills the business at a markup** over what
SMSblast charges us. QuestHQ makes money on the **spread** (e.g. SMSblast charges us 1¢
per text, we charge the client 2¢, we keep 1¢) plus optional monthly fees.

For that to work automatically (a business signs up in QuestHQ → an SMSblast account is
created for them → texting just works → they get billed), **we need a partnership with
SMSblast**: an API to create sub-accounts, provision numbers, route replies back to us,
and see usage so we can bill. That's what the questions below are for.

---

## 2. Questions for Ethan & the SMSblast dev team

Grouped so you can send whole sections to the right people. **Commercial** questions are
for Ethan; **technical** ones are for his devs.

### A. Partnership / commercial (for Ethan)
1. Do you have a **reseller, agency, or white-label program**? If yes, how does it work —
   revenue share, or wholesale price we mark up ourselves?
2. Can we resell **under the QuestHQ brand** (white-label), or does it have to be
   co-branded / "powered by SMSblast"?
3. What is your **wholesale price per message** to us — outbound SMS, inbound SMS, and MMS?
   Are there **volume discounts** (tiers) as our combined usage grows?
4. **Do you charge for inbound** (received) messages, or only outbound?
5. What does a **phone number cost per month** (local vs toll-free)? Any setup/porting fees?
6. Are there **monthly minimums, platform fees, or per-sub-account fees** we should know about?
7. Are **carrier fees (A2P/10DLC, toll-free verification, per-message carrier surcharges)**
   included in your wholesale price, or passed through on top? (This is the big one for our margin.)
8. What are the **contract terms** — minimum commitment, exclusivity, notice period,
   what happens to the numbers/data if we or a client leaves (number portability)?

### B. Multi-tenant / sub-account API (for the dev team)
9. Is there an **API to create a sub-account** for each of our client businesses
   automatically (no manual setup)?
10. Can each sub-account have its **own numbers, own API key, own balance/settings**, fully isolated?
11. Can we **buy/provision phone numbers via API** per sub-account?
12. Can we set a **per-sub-account inbound webhook** so replies route back to the correct
    business inside QuestHQ? What's the payload format, and is it **signed/verifiable** (HMAC/secret)?
13. Can we pull **usage per sub-account via API** (message logs / CDRs) so we can bill accurately
    and reconcile?
14. Are there **API rate limits** or throughput caps (messages per second) per number/sub-account?
15. Is there a **sandbox/test environment** and full **API docs** we can start against?

### C. Billing & money flow (Ethan + devs)
16. How do **you bill us** — prepaid balance top-ups, or monthly postpaid on usage?
17. Can billing be **consolidated to us (the parent)**, with per-sub-account usage broken out,
    rather than each business paying SMSblast directly?
18. Can we **auto-recharge / top up balances via API**, and get **low-balance / usage webhooks**?
19. Who is on the hook if an end client doesn't pay — us or them?

### D. Compliance (US texting rules — critical, ask explicitly)
20. How is **A2P 10DLC brand + campaign registration** handled for each business? Per sub-account?
    **Who pays** the registration and monthly campaign fees, and can it be done **via API** or is it manual?
21. Same question for **toll-free verification** — process, timeline, cost, who does it.
22. Do you **auto-handle STOP/HELP/opt-out** compliance, or is that on us?
23. Who carries **liability** if an end client sends spam / violates carrier rules?

### E. Features, reliability, support (devs + Ethan)
24. Do you provide **delivery receipts / status callbacks** (sent, delivered, failed) via webhook?
25. **MMS**, message **scheduling**, link shortening/tracking — supported?
26. What's your **uptime / SLA**, and what **support** do partners get (channel, hours, response time)?
27. Who **owns the message data**, and how is customer data privacy handled?

> **The single most important answer:** whether their wholesale price is **all-in** or
> **plus carrier + A2P fees**. Those extra fees (often fractions of a cent per message plus
> monthly campaign fees) can quietly eat the 1¢ spread. Get this in writing before we set our prices.

---

## 3. QuestHQ business model — the spread

### 3.1 How we make money (four levers)
1. **Per-message markup** — the penny spread (SMSblast charges us X, we charge more).
2. **Number rental markup** — a number that costs us ~$1–2/mo, we include/charge ~$5/mo.
3. **Monthly SMS add-on fee per business** — a small recurring fee that turns thin per-text
   pennies into predictable revenue and covers the number + compliance overhead.
4. **Compliance handling fee** — a one-time/annual fee to register each business for A2P 10DLC
   (passthrough of the real cost + a handling markup).

### 3.2 The penny-spread example (your boss's numbers)
> **Assumption only — real numbers come from Ethan.** Wholesale = 1¢ out + 1¢ in.
> QuestHQ retail = 2¢ out + 2¢ in. That's a **100% markup = 50% gross margin** on usage.

Margin per business per month, by texting volume (counting messages either direction):

| Texts / month | SMSblast cost (1¢) | QuestHQ charges (2¢) | **QuestHQ keeps** |
| ---: | ---: | ---: | ---: |
| 1,000 | $10 | $20 | **$10** |
| 5,000 | $50 | $100 | **$50** |
| 10,000 | $100 | $200 | **$100** |
| 50,000 | $500 | $1,000 | **$500** |

Now multiply across clients. Example: **50 businesses averaging 5,000 texts/mo**
= 250,000 texts → **~$2,500/mo margin from usage alone**, before number rental and monthly fees.

### 3.3 The catch (why usage-only pricing is risky)
At low volume the spread is literally pennies — a business texting 300 times a month only
nets us $3. That barely covers the number, and A2P fees could wipe it out. **Fix: don't sell
usage alone. Bundle it.**

### 3.4 Recommended pricing shape — hybrid (base fee + included texts + overage)
Predictable monthly revenue that carries the thin per-text margin. Illustrative:

| QuestHQ SMS plan | Monthly | Included texts | Overage | Roughly covers |
| --- | ---: | ---: | ---: | --- |
| **Texting Starter** | $19/mo | 750 | $0.02 each | number + light use |
| **Texting Growth** | $49/mo | 2,500 | $0.02 each | active sales team |
| **Texting Pro** | $99/mo | 6,000 | $0.02 each | high-volume outreach |

Why this beats pure 2¢/text:
- The **base fee guarantees margin** even in a slow month.
- It **covers the number rental and A2P registration** overhead automatically.
- Overage still earns the spread when they text a lot.
- It's simple for a business owner to understand and budget.

(Numbers above are placeholders — set the real ones once Ethan gives wholesale pricing and we
know the A2P fees.)

### 3.5 Money-flow rules to protect QuestHQ
- **Bill clients prepaid or auto-recharge**, so QuestHQ never fronts cash to SMSblast and
  then chases a client for payment.
- **Never price below our true cost** (wholesale message + carrier fee + A2P share). Confirm
  those before setting retail.
- **Pass A2P registration cost through** with a small handling fee — don't absorb it silently.

---

## 4. What this changes about the app (heads-up)

Our first build plan assumed **one shared number**. This reseller model means QuestHQ needs,
underneath the same "Messages tab" product surface:
- **Per-business SMSblast sub-accounts** (created via SMSblast's API — pending their answer).
- **A billing/wallet + usage-metering layer** per business (prepaid balance, markup, invoices).
- **Per-business number provisioning and inbound webhook routing.**

That's a meaningfully bigger build than the Phase 1 plan. **Recommendation:** keep the Phase 1
"text from the contact card" work as the product surface, but **pause implementation of the
account/billing plumbing until SMSblast answers Section 2** — their API and pricing decide the
architecture. We can still build/demo texting on one number in the meantime.

---

## 5. Suggested next steps
1. Send **Section 2** to Ethan (commercial parts) and his devs (technical parts).
2. Get wholesale pricing + the **all-in vs. plus-fees** answer, and whether a **sub-account API** exists.
3. Plug their real numbers into **Section 3** and lock QuestHQ's plans.
4. Update the technical spec/plan to the sub-account + billing architecture.
