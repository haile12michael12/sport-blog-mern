# Advanced Sports Blog - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based Design drawing from premium sports media platforms

**Primary References:**
- **The Athletic** - Editorial depth, premium content presentation, clean typography
- **Medium** - Reading experience, author focus, minimal distraction
- **ESPN** - Dynamic sports content, live updates, match coverage
- **Bleacher Report** - Modern cards, visual storytelling, community engagement

**Design Principles:**
1. Content-First: Prioritize readability and immersive storytelling
2. Editorial Excellence: Professional publishing aesthetic with clear hierarchy
3. Dynamic Energy: Capture the excitement of sports through bold layouts
4. Multi-Author Platform: Celebrate writers while maintaining cohesive brand

---

## Typography System

**Font Families (via Google Fonts):**
- **Headlines:** Inter (700-900 weight) - Bold, modern, athletic energy
- **Body/UI:** Inter (400-600 weight) - Excellent readability, professional
- **Accent/Numbers:** JetBrains Mono (500-700 weight) - Stats, scores, technical data

**Type Scale:**
- Hero Headlines: text-6xl to text-7xl (desktop), text-4xl (mobile)
- Post Titles: text-4xl to text-5xl (desktop), text-3xl (mobile)
- Section Headers: text-3xl (desktop), text-2xl (mobile)
- Body Text: text-lg (optimal reading), text-base (compact areas)
- Metadata/Captions: text-sm
- Labels/Tags: text-xs uppercase tracking-wide

**Reading Experience:**
- Post content: max-w-prose (optimal 65-75 characters per line)
- Line height: leading-relaxed (1.625) for body text
- Paragraph spacing: space-y-6 for comfortable reading

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

**Common Patterns:**
- Tight spacing: p-2, gap-2 (tags, metadata clusters)
- Standard spacing: p-4, gap-4, my-6 (cards, form fields)
- Section padding: py-12 to py-20 (desktop), py-8 to py-12 (mobile)
- Generous spacing: p-8, gap-8, my-12 (feature sections, dashboards)
- Extra breathing room: py-24 to py-32 (marketing sections between major content blocks)

**Grid Systems:**
- Featured content: grid-cols-1 lg:grid-cols-2 (large cards)
- Blog grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 (standard posts)
- Dashboard: grid-cols-1 lg:grid-cols-4 (sidebar + main content split as 1+3)
- Stats/Metrics: grid-cols-2 md:grid-cols-4 (compact data display)

**Container Strategy:**
- Full-width hero: w-full with inner max-w-7xl px-6
- Content sections: max-w-6xl mx-auto px-6
- Reading content: max-w-4xl mx-auto px-6
- Dashboard/App: max-w-screen-2xl mx-auto

---

## Component Library

### Navigation
**Header:**
- Fixed/sticky top navigation with logo, main menu, search icon, dark mode toggle, user avatar/login
- Desktop: Horizontal menu with dropdowns for categories
- Mobile: Hamburger menu with slide-in drawer
- Height: h-16 to h-20
- Include: "Trending" badge indicator for hot posts

**Footer:**
- Multi-column layout (4 columns desktop, stack mobile)
- Sections: Categories, Top Authors, About/Contact, Newsletter signup
- Social links with icon set
- Copyright and editorial standards link

### Home Page Layout

**Hero Section:**
- Large featured post with overlay gradient for text readability
- Height: min-h-[600px] to min-h-[700px] on desktop
- Include: Category badge, headline, author info, read time, blurred-background CTA button
- Background: High-quality sports action image (stadium, player, celebration)

**Content Sections:**
1. **Trending Posts:** Horizontal scroll cards (4-6 posts) with thumbnails
2. **Latest Posts:** 3-column grid with image, title, excerpt, author, date
3. **Featured Categories:** 2-column split with category highlights
4. **Top Authors:** 4-column grid with avatar, name, bio snippet, follower count
5. **Live Commentary Feed:** Sidebar widget showing recent match updates (if active)

### Blog Post Cards
**Standard Card (Grid View):**
- Aspect ratio image: aspect-video or aspect-[4/3]
- Category tag overlaid on image (top-left)
- Below image: Title (text-xl font-bold), excerpt (text-sm), author row (avatar + name + date)
- Hover: Subtle lift effect (translate-y-1 shadow-lg)

**Featured Card (Large):**
- Horizontal layout on desktop (image left, content right)
- Image: w-1/2 to w-2/5
- Larger title: text-3xl to text-4xl
- Include stats: view count, comment count, like count

**List View Card:**
- Compact horizontal: Small thumbnail (w-24 h-24) + title + metadata
- Used in sidebars and "Related Posts"

### Post Detail Page

**Layout:**
- Centered single column: max-w-4xl
- Hero: Full-width featured image with overlay title + author info
- Sticky sidebar (desktop): Table of contents, author bio, related posts
- Content: Generous margins, large text (text-lg), clear paragraph spacing

**Article Elements:**
- Blockquotes: Bordered left, italic, indented
- Inline code: Rounded background, monospace
- Images: Full-width or centered with captions
- Embedded media: Responsive video embeds (16:9 aspect ratio)

### Comments Section
**Thread Structure:**
- Parent comment with author avatar, name, timestamp
- Nested replies indented with connecting lines (border-l-2)
- Max nesting depth: 3 levels
- Actions: Like button (count), Reply button, Report (if moderated)
- Input: Textarea with formatting toolbar (bold, italic, link)

### Dashboard Components

**Author Dashboard:**
- Top stats bar: 4-column grid (Total Posts, Views, Likes, Comments)
- Post management table: Image thumbnail, title, status badge, actions
- Status badges: Draft (gray), In Review (yellow), Published (green)
- Quick actions: Edit, Preview, Delete with icon buttons

**Admin Dashboard:**
- Navigation sidebar: h-screen sticky with role-based menu items
- Main area: User table, post moderation queue, analytics widgets
- Moderation cards: Post preview, author info, approve/reject buttons

### Real-time Features

**Live Commentary Widget:**
- Fixed position (bottom-right) or sidebar placement
- Scrollable feed: max-h-96 overflow-y-auto
- Each update: Timestamp, match context, commentary text
- New updates: Slide-in animation with highlight
- Collapsible header with match score

**Match Widget:**
- Compact scoreboard: Team logos, scores, match time
- Positioned in post sidebar or sticky top banner
- Auto-updates via Socket.io

### Forms & Inputs
- Text inputs: h-12, rounded-lg, focus ring
- Textareas: min-h-32 for comments, min-h-64 for post editing
- Buttons: h-12, px-6, rounded-lg, font-semibold
- Primary buttons: Shadow on hover
- Rich text editor: Toolbar above, live preview toggle

### Profile Pages

**Author Profile:**
- Cover image (optional): h-48 to h-64
- Avatar: Large circular -mt-16 overlapping cover
- Bio section: max-w-2xl centered
- Stats row: Posts count, followers, total views
- Post grid: Author's published posts (3-column)

**Team/Player Profile:**
- Header: Team logo/player photo, name, current team
- Stats table: 2-column layout (label + value)
- Recent mentions: List of posts featuring this team/player

---

## Images

**Required Images:**

1. **Hero Section (Home):** 
   - High-energy sports action shot (stadium atmosphere, celebrating players, or dramatic game moment)
   - Dimensions: 1920x1080 minimum
   - Overlay: Dark gradient (bottom to top) for text readability

2. **Post Featured Images:**
   - Contextual sports imagery for each post
   - Aspect ratio: 16:9 or 4:3 depending on card type
   - Variety: Mix of action shots, player portraits, stadium views

3. **Author Avatars:**
   - Circular headshots
   - 200x200px minimum
   - Professional sports journalism aesthetic

4. **Team/Player Profiles:**
   - Team logos: SVG preferred, PNG fallback
   - Player photos: Portrait style, 800x1000px
   - Action shots optional

5. **Category Headers:**
   - Sport-specific imagery (basketball court, soccer field, baseball diamond)
   - Used as backgrounds in category landing pages

**Image Placement Strategy:**
- Hero: Full-width background
- Post cards: Prominent top placement
- Sidebar widgets: Small thumbnails
- Profile pages: Large hero treatment
- Never use placeholder gray boxes - always real sports imagery

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (single column, stacked)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (3-4 column grids, sidebars)

**Mobile Optimizations:**
- Navigation: Hamburger menu
- Hero: Reduced height (min-h-[400px])
- Cards: Full width, smaller images
- Dashboards: Stacked sidebar
- Comments: Reduced nesting depth (max 2 levels)