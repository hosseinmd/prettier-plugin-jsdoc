export default function createLanguage<T>(
  linguistData: T,
  override: (linguistData: T) => any,
): any {
  const { languageId, ...rest } = linguistData as any;
  return {
    linguistLanguageId: languageId,
    ...rest,
    ...override(linguistData),
  };
}
