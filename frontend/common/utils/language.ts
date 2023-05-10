export function getLanguage(nav: Navigator) {
  if (nav.languages && nav.languages[0]) {
    return nav.languages[0];
  }
  return nav.language;
}

export function getLanguageWithoutRegionCode(nav: Navigator) {
  return getLanguage(nav).toLowerCase().split(/[_-]+/)[0];
}
