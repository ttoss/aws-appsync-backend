export const getRegionFromUrl = (url: string): string => {
  const matcher = /\.[a-z]+-[a-z]+-[0-9]\./;
  const regexResponse = url.match(matcher);
  let region = '';
  if (regexResponse) {
    region = regexResponse[0].replace(/\./g, '');
  }
  return region;
};
