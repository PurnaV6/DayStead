# Daystead agent team: automation cycle

A scheduled task wakes the Daystead team session twice a day. Each run is one **cycle**. The five agents live in `.claude/agents/`: `ceo`, `cfo`, `designer`, `developer` and `tester`.

## One cycle
1. **Check what's waiting.** Look at open pull requests on PurnaV6/DayStead.
   - Fix any red CI or merge conflict on the team's own PRs first.
   - If 3 or more team PRs are waiting for the owner to merge, do not start new work. Report what's waiting and stop.
2. **CEO picks the task.** Take the top unblocked item in `BACKLOG.md`. The CEO may reorder the backlog, with a one-line reason.
3. **CFO check.** Only needed if the task touches price, cost, billing or anything paid. The CFO confirms it fits the numbers in `.claude/agents/cfo.md`.
4. **Designer specs.** For any screen change, the designer writes the spec, which goes in the PR description.
5. **Developer builds.** Work on a branch named `claude/<topic>` from the latest `main` and run every check in `README.md`. For UI work, render the change and look at it. Then open a PR.
6. **Tester reviews.** Independent check of the PR. The developer fixes every "blocks release" and "should fix" finding, then the tester re-checks.
7. **Close the cycle.**
   - Tick the item in `BACKLOG.md`, in the same PR.
   - Post a short report in the session: the PR link, what changed, what was tested, what still needs a phone or the owner, and any Supabase step needed.

## Hard rules
- **Mobile first.** Work on `mobile/` unless the backlog item says otherwise. The website changes only when the owner asks.
- **Never merge, and never push to `main`.** The owner reviews and merges every PR.
- **Never change the live Supabase project, store accounts, RevenueCat or Vercel settings.** If a task needs SQL, add a file under `supabase/` and tell the owner exactly what to run.
- **Never spend money**, sign up for services, or contact anyone outside the repo.
- **One backlog item per cycle**, kept small enough to review in a few minutes.
- If a task is blocked on the owner, mark it `[blocked: owner]` in `BACKLOG.md` and move on to the next item.
- Follow the rules in `HANDOFF.md`: no em dashes, money in pence, local calendar dates, no secrets in the repo.

## Stopping or changing it
The owner can say "pause the automation", "run a cycle now" or "change it to once a day" in the team session or in any chat. All of these change the scheduled task named "Daystead agent team cycle".
