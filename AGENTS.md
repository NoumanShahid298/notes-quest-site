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

## StudyNotes application
- Keep sample subjects and notes in a shared browser-safe data module so homepage cards, library filters, and reading pages use the same content.
- Use the root route for shared navigation and footer, with independent content routes and a notes layout rendering its child outlet for consistent navigation and metadata.
- Keep contact submission frontend-only and explicitly identify its demo status, because this project does not deliver or persist messages.
- Define visual roles and reusable feature styles in the global design system; use the shared Button for interactive controls.
- Keep a single shared account provider mounted inside the root query provider; it owns session updates and sign-out cache cleanup so navigation always reflects account state.
- Keep study materials publicly accessible; account and recovery pages are independent public routes so email links can complete without a login gate.
