export const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;

  if (browserLang.startsWith("ru")) return "ru";
  if (browserLang.startsWith("es")) return "es";
  return "en"; // По умолчанию английский
};

export const formatString = (str, variables = {}) => {
  return str.replace(/{(\w+)}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
};
