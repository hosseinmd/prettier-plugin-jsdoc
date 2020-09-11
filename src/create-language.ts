export default function createLanguage(linguistData: any, override: any) {
  const { languageId, ...rest } = linguistData;
  return {
    linguistLanguageId: languageId,
    ...rest,
    ...override(linguistData),
  };
}
