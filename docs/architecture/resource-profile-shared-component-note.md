# Resource profile shared-component note

Temporary architecture note created during investigation. The current `resource-investment-profile.js` contains shared rendering logic but mounts itself as a second React root and is then repositioned by `resource-profile-placement.js`. This is not considered the target architecture. The target is one React component rendered directly by `site.jsx` for any project or deliverable whose normalised delivery steps contain resource asks.
