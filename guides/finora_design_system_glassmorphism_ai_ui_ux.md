# Finora — Design Help & UI/UX System

## 1. Design Philosophy (From Repo + Your Theme)
Finora should feel:
- **Premium but accessible** (yellow = energy, finance clarity)
- **Calm + intelligent** (AI-assisted decisions)
- **Layered depth** (glassmorphism + subtle motion)

We combine:
- Clean fintech UI
- AI-assisted UX patterns
- Glassmorphism for depth and hierarchy

---

## 2. Core Visual Identity

### Primary Feel
- Bright yellow accents on dark/neutral base
- Frosted glass layers
- Soft shadows + blur

### Key Rule
> Yellow = action
> Glass = structure
> Dark = stability

---

## 3. Glassmorphism System (IMPORTANT)

### Base Glass Component
Use this everywhere (cards, modals, panels):

```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
```

### Variants

**Dark Glass (dashboard cards)**
```css
.glass-dark {
  background: rgba(32, 32, 32, 0.6);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

**Light Glass (forms/modals)**
```css
.glass-light {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}
```

---

## 4. Color System Usage (NOT JUST VARIABLES)

### DO THIS
- Primary (#FFD100) → Buttons, highlights, key actions
- Dark (#202020) → Backgrounds, navbars
- Whites → Content areas

### DO NOT
- Use yellow for large backgrounds
- Mix too many gray levels randomly

---

## 5. Component System (From Repo Patterns)

### 5.1 Buttons

Primary:
```css
.btn-primary {
  background: var(--color-primary);
  color: #000;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}
```

Glass Button:
```css
.btn-glass {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
}
```

---

### 5.2 Cards (VERY IMPORTANT FOR DASHBOARD)

```css
.card {
  padding: 20px;
  border-radius: 18px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(14px);
}
```

Use cards for:
- Balance
- Transactions
- AI insights

---

### 5.3 Inputs (AI-friendly UX)

```css
.input {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 12px;
  border-radius: 10px;
  outline: none;
}
```

Focus state:
```css
.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 209, 0, 0.2);
}
```

---

## 6. AI-Driven UX Patterns (FROM REPO)

### 6.1 Smart Suggestions
Instead of static UI:
- "Send money" → Suggest recent contacts
- "Budget" → Auto-categorize spending

### 6.2 Progressive Disclosure
Do NOT show everything at once.
- Start simple
- Expand when needed

Example:
- Show total balance
- Tap → show breakdown

---

### 6.3 Context Awareness
UI reacts to user:
- Low balance → show warning card
- High spending → show insight

---

## 7. Layout System

### Dashboard Layout

Structure:

- Header (glass)
- Balance Card (highlight)
- Quick Actions (row)
- AI Insights (card)
- Transactions list

---

### Spacing Rules
- 8px grid system
- Cards padding: 16–24px
- Section gaps: 24–32px

---

## 8. Motion & Interaction (CRITICAL)

### Micro-interactions

Use subtle animations:

```css
transition: all 0.2s ease;
```

Examples:
- Button hover lift
- Card glow on hover
- Input focus highlight

---

### Advanced Motion
- Fade + slide for page transitions
- Scale-in for modals

---

## 9. Finora-Specific UI Ideas

### AI Finance Assistant Panel
Glass floating panel:
- "You spent 30% more this week"
- "Save GHS 200 by reducing food delivery"

---

### Smart Send Money Flow
Instead of raw form:
1. Input number
2. Auto-detect name
3. Suggest frequent recipients
4. Show confirmation glass modal

---

### Insights Cards
- Weekly spending
- Category breakdown
- AI recommendations

---

## 10. Implementation Strategy (IMPORTANT FOR YOU)

Since you use React / Next / React Native:

### Step 1
Create a **design system folder**:

```
/components/ui/
  Button.tsx
  Card.tsx
  Input.tsx
  Glass.tsx
```

---

### Step 2
Create reusable Glass component:

```tsx
export const Glass = ({ children }) => (
  <div className="glass">{children}</div>
);
```

---

### Step 3
Use Tailwind (recommended)

Example:

```tsx
<div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-5">
```

---

## 11. What Makes This Different (IMPORTANT INSIGHT)

Most apps:
- Static UI
- Basic forms

Finora:
- Adaptive UI
- AI-assisted flows
- Emotion-aware design

---

## 12. Common Mistakes (AVOID THESE)

- Too much blur → hurts readability
- Overusing yellow → looks cheap
- No hierarchy → confusing UX
- Ignoring spacing → breaks premium feel

---

## 13. Prompt You Can Use (For AI UI Generation)

Use this when generating UI with AI tools:

"Design a modern fintech mobile app called Finora using a yellow (#FFD100) and dark (#202020) theme. Use glassmorphism with soft blur backgrounds, rounded corners, and subtle shadows. Include AI-powered UI elements such as smart suggestions, financial insights cards, and contextual recommendations. The design should feel premium, minimal, and highly interactive, with smooth micro-interactions and a strong visual hierarchy."

---

## 14. Final Advice

Focus on:
1. Reusable components
2. Consistent spacing
3. Subtle effects (not loud design)
4. AI-enhanced UX (this is your edge)



