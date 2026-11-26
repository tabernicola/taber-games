<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Code Style Preferences

- **Keep functions small**: Aim for functions under 30-40 lines that can be viewed at a glance on screen. Extract large functions into smaller, focused helper functions.
- **Keep files small**: Prefer splitting large files into smaller, focused modules rather than having massive files that are hard to navigate.
- **Modular design**: Extract reusable logic into separate functions/modules to improve maintainability and readability.
- **Add JSDoc comments**: Every function should have a JSDoc comment describing what it does, its purpose, and key details about its behavior.

## Project-Specific Rules

- Murdoku stores reusable artwork in `murdoku_elements`, board geometry in `murdoku_boards`, and cell instances in `murdoku_board_elements`; case-specific clues/solutions stay in `murdoku_cases.content` and cast membership references `murdoku_characters` through `murdoku_case_characters`, so boards and artwork can be shared without duplicating them in cases.
- Read Murdoku cases through the security-invoker `murdoku_playable_cases` view, which reconstructs the existing game contract under RLS and preserves legacy embedded cases without a board reference.
- Reusable board/artwork catalogs are publicly readable and writable only through trusted database operations; cases expose only approved or caller-owned records, and player submissions cannot self-approve.
- Tabernicle Cubicle stores admin-edited level overrides in `public.tabernicle_levels` (publicly readable, admin-writable via `has_role`) and merges them over the built-in `LEVELS` array at runtime so levels can be edited and reset to defaults safely.
- Tabernicle Cubicle synthesizes action effects through a lazily created Web Audio context unlocked by player gestures and controlled by the existing sound toggle, avoiding extra media downloads and autoplay errors.
