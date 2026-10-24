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

- Murdoku stores reusable artwork in `murdoku_elements`, board geometry in `murdoku_boards`, and cell instances in `murdoku_board_elements`; case-specific clues/solutions stay in `murdoku_cases.content` and cast membership references `murdoku_characters` through `murdoku_case_characters`, so boards and artwork can be shared without duplicating them in cases.
- Read Murdoku cases through the security-invoker `murdoku_playable_cases` view, which reconstructs the existing game contract under RLS and preserves legacy embedded cases without a board reference.
- Reusable board/artwork catalogs are publicly readable and writable only through trusted database operations; cases expose only approved or caller-owned records, and player submissions cannot self-approve.
