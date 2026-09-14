# Related Portfolio Projects

King's Edge should not try to build every mechanism it needs. Some of its core requirements are carried through other Education and Student Success projects.

This document captures the three related projects currently represented in the site.

Important distinction:

- These are not dependencies in themselves.
- They are related projects with their own delivery steps.
- Dependencies are the step-to-step relationships between King's Edge and these related projects.

## Future Jobs and the AI boundary

[Universities UK’s Future Jobs Roadmap](https://www.universitiesuk.ac.uk/latest/news/work-based-learning-every-undergraduate) adds an important institutional expectation around AI: AI tools should be accessible to every undergraduate and every course should have an AI trailblazer. The roadmap and the discipline-specific models it highlights reinforce that this is principally an educational and curriculum question, rather than a new King’s Edge deliverable.

Within the Education Delivery Framework, **Curriculum Framework and Review should be the principal route through which discipline-contextualised AI capability is made a normal part of courses**. Education Cultures can support the educator practice, experimentation and shared learning needed to make that work well. King’s Edge should remain focused on graduate futures and provide supporting infrastructure where it adds value: a skills language capable of making relevant capability visible, access to wider developmental opportunities, and trusted evidence and recognition of what students have developed. The Digital Student Experience Hub can help students discover and navigate relevant provision, but should not become the owner of universal AI-tool access or the curriculum entitlement itself.

This boundary allows King’s to respond coherently to the national agenda without creating a parallel AI programme inside King’s Edge.

## Related project 1: Education Cultures and Innovation

### How this fulfils core Edge needs

Education Cultures and Innovation provides the shared practice infrastructure that King's Edge needs in order to grow experiential learning with quality, confidence and coherence.

The key Edge requirement is the Experiential Learning Strategic Community of Practice. This will bring together existing strong practice, develop a common typology of experiential learning, and define the learning design, operational and assurance principles that should underpin different models of provision.

This matters because King's already has excellent experiential learning, but too much of it is buried, isolated or locally dependent. Edge needs the Community of Practice to create the shared language and design principles that allow experiential learning to be surfaced, supported, assured and grown.

The same Education Cultures infrastructure can support wider Education Delivery Framework priorities where collective educator practice is needed, including AI in education. That wider AI work should remain institutionally owned outside King’s Edge; Edge benefits from and can connect to the resulting practice without absorbing responsibility for it.

### Core Edge needs serviced

- Experiential learning typology across curriculum and co-curriculum
- Learning design principles for high-quality experiential provision
- Operational and assurance principles for different models
- Future entitlement ambition for students
- Inputs into curriculum growth, co-curricular growth and opportunity commissioning

### What changes

Experiential learning moves from a set of strong but uneven practices to a shared institutional model that can support growth, quality, assurance and student access.

## Related project 2: Curriculum Framework and Review

### How this fulfils core Edge needs

Curriculum Framework and Review provides the main route through which King's Edge requirements are embedded in the academic curriculum.

Edge should not run separate micro-audits of skills, experiential learning or graduate premium contribution. Instead, it should define the questions and lenses that need to be built into the institutional Curriculum Framework audit and review process.

This matters because the curriculum is one of the principal places where students develop the graduate premium, but much of that value is currently implicit. The Curriculum Framework audit is the mechanism for surfacing where skills and experiential learning are already present, where provision is hidden or uneven, and where programmes need support to grow opportunity.

For the living skills work, the Curriculum Framework is also the mainstream institutional route through which a proven skills architecture can eventually be embedded. Year 1 discovery and later trailblazer work should determine what curriculum evidence, mapping practice and assurance are actually useful before a common requirement is institutionalised.

The Curriculum Framework is also the natural home for the wider institutional requirement to develop AI capability in disciplinary context. The Future Jobs Roadmap strengthens this case by locating AI capability at course level rather than treating it simply as a generic digital skill. King’s Edge does not currently own a universal AI entitlement. Its role is to ensure that, where relevant, discipline-specific AI capability can connect to the same wider architecture for skills, opportunity, evidence and recognition as other aspects of graduate development.

### Core Edge needs serviced

- Audit of curriculum-embedded skills development
- Audit of curriculum-embedded experiential learning
- Identification of programme-level graduate premium contribution
- Baseline for curriculum opportunity growth and assurance
- Evidence to support programme graduate premium profiles and evidence packs
- Enduring route for a tested and portable skills architecture after trailblazer development
- Principal curriculum route for discipline-contextualised AI capability under the wider Education Delivery Framework, with Edge infrastructure supporting connection and evidence where useful

### What changes

Edge requirements become part of mainstream curriculum review, avoiding duplication and ensuring skills, experiential learning and graduate value are embedded in the core academic framework only where the underlying models have been sufficiently tested.

## Related project 3: Digital Student Experience Hub

### How this fulfils core Edge needs

The Digital Student Experience Hub provides the digital environment through which the King's Edge offer becomes navigable, personal and usable for students.

Edge should define the educational, service and information requirements, but not build a separate platform. The Hub needs to carry the digital functionality through which students can reflect on purpose, navigate opportunities, connect experiences to a proven skills architecture and ultimately evidence and articulate what they have gained.

For purpose, digital functionality should extend a human developmental model that has first been tested with students and trailblazer partners. For skills, the Hub should eventually carry the student-facing profile, evidence and navigation experience once 2.1.3 has established a sufficiently useful shared architecture. For recognition, it should implement the trusted educational-record model selected through discovery and trailblazer evidence rather than presuming that the final product must be an enhanced transcript.

This includes building out the existing opportunity platform so that it becomes part of a richer route for opportunity navigation, connected to King's Canvas, skills profiles, evidence capture, microcredentials, digital badges and the fuller trusted account of student learning.

Where wider institutional work creates discipline-specific AI learning, guidance or developmental opportunities, the Hub can help students discover and navigate that provision and Edge infrastructure can help connect it to skills and evidence. The Hub should not be treated as the owner of universal AI-tool access or of the academic curriculum through which AI capability is developed.

### Core Edge needs serviced

- King's Canvas functionality for purpose, aspiration and planning, derived from proven developmental practice
- Digital opportunity catalogue and navigation
- Search, filtering and recommendation of opportunities
- Links between opportunities, a tested skills architecture and student aspirations
- Student-facing skills profile and evidence functionality once the 2.1.3 model is sufficiently mature
- Technical support for microcredentials and digital badges
- Fuller trusted educational-record functionality, with transcript, portfolio or hybrid architecture determined through 2.4.3 discovery and trailblazers
- Evidence capture and articulation support

### What changes

Students move from a fragmented opportunity landscape to a coherent digital route through which they can plan, find, access, evidence and articulate the value of their King's experience. Digital implementation follows evidence-led educational and recognition requirements rather than becoming a separate King's Edge product strategy.

## Site treatment

Each related project appears as:

- a card on the overview page
- a full card on the related projects page
- a row in the timeline / Gantt view
- a source of steps that can be linked to Edge delivery steps

## Data source

Related projects are held in:

```text
src/data/enabling-projects.json
```

Step-level dependency relationships are normally authored through each deliverable's `steps.json` using `dependsOn`; `src/data/step-dependencies.json` remains available only for exceptional external dependency records.
