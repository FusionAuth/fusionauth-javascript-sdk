export const getExpTime = (): number | null => {
  const expCookie = document.cookie
    .split('; ')
    .map(c => c.split('='))
    .find(([name]) => name === 'app.at_exp');
  return expCookie ? parseInt(expCookie?.[1] ?? '0') * 1000 : null;
};
