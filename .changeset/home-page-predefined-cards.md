---
'@openchoreo/backstage-plugin-common': patch
'@openchoreo/backstage-plugin-react': minor
'@openchoreo/backstage-plugin': minor
---

Home page predefined cards:

- Add `openchoreo.home.cardConfig` config key (frontend visibility) selecting
  the named predefined card layout rendered on the portal home page (default:
  `choreo-default`).
- Rename `MyProjectsWidget` to `OverviewWidget` (a deprecated `MyProjectsWidget`
  alias is kept) and extend it to six linked workspace metrics: Projects,
  Components, Active Deployments, Environments, APIs, Resources.
- `QuickActionsSection` is now an InfoCard; "Create Component" links to
  `/create?view=components` and the "Browse Templates" action is replaced by a
  permission-gated "Create Project" linking to `/create?view=projects`.
- `SummaryWidgetWrapper` accepts an optional `columns` prop to fix the column
  count of the `cards` variant grid.
