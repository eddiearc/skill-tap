export const VALID_SKILL_MD = `---
name: test-skill
description: A test skill for unit testing
author: testauthor
version: 1.0.0
license: MIT
argument-hint: "<query>"
---

# Test Skill

This is the body content.
`

export const MINIMAL_SKILL_MD = `---
name: minimal
description: Minimal skill
---
`

export const MISSING_NAME_SKILL_MD = `---
description: No name field here
author: someone
---
`

export const NO_FRONTMATTER = `# Just a README

No frontmatter here at all.
`

export const EMPTY_FRONTMATTER = `---
---
Body only.
`

export const QUOTED_VALUES_SKILL_MD = `---
name: "quoted-skill"
description: 'single quoted description'
author: "Test Author"
---
`

export const COLON_IN_VALUE_SKILL_MD = `---
name: colon-skill
description: Note: this has a colon in the value
---
`
