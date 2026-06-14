# Detail Pals V2 — Precision Automotive Showroom Experience

Detail Pals V2 is a premium, cinematic web showroom designed for a high-end automotive detailing and paint correction business. Instead of a standard portfolio website, this project offers a highly interactive, motion-driven experience that mimics the premium atmosphere of a physical luxury vehicle showroom.

---

## 🌌 The Showroom Vibe
* **Luxury Dark Aesthetic:** Sleek dark backgrounds (`#050503`, `#0A0907`) highlighted by warm studio lighting and gold-thread accents.
* **Seamless Motion:** Powered by Framer Motion and Lenis inertia-scrolling for fluid page transitions.
* **Ambient Sound:** Includes a subtle, togglable ambient synthesizer drone loop that plays in the background as users explore.

---

## 🏎️ Core Interactive Features

### 1. Before / After Paint Restoration Slider
* Slide the vertical divider bar left-to-right to wipe away dust, paint scratches, and mud, revealing a pristine, high-gloss clearcoat underneath.

### 2. Paint Restoration Blueprint
* An interactive 2D wireframe blueprint of a luxury car chassis.
* Tap or hover over hotspots (Bonnet, Glass, Paint, Wheels, Cabin) to diagnose clearcoat parameters, changing the outline glow of the vehicle dynamically.

### 3. Live Price Configurator
* Calculate custom detailing packages on the fly.
* Adjusts pricing dynamically depending on:
  * **Vehicle Type:** Sedan/Coupe, SUV, Truck, Van, or Luxury/Exotic.
  * **Soil Level:** Lightly soiled, moderate wear, or heavy mud/pet-hair neglect.
* Preloads selections instantly into the booking wizard.

### 4. Interactive Booking Wizard
* A client scheduler that checks available days and time slots directly from the database, preventing double bookings.

---

## 🛠️ The Tech Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, and Lenis Smooth Scroll.
* **State & Form Validation:** TanStack React Query, React Hook Form, and Zod.
* **Backend:** Supabase (Database API, authentication, and security policies) and PostgreSQL (Enums, triggers, and availability tables).

---

# Or build for production
npm run build
```
