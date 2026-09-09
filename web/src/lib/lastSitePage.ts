// Where the logo/back link (AppLogoLink, CalendarSidebar) should send
// someone when clicked. This template has no separate marketing site to
// remember a "last page" on, so it always resolves to the calendar
// itself — kept as a function (rather than a bare constant) so callers
// don't need to change if this app ever grows a page to return to.
export function getLastSitePage(): string {
  return '/calendario'
}
