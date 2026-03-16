export const supportedShippingCountries = [
  { code: "us", name: "United States" },
  { code: "dk", name: "Denmark" },
  { code: "fr", name: "France" },
  { code: "de", name: "Germany" },
  { code: "it", name: "Italy" },
  { code: "es", name: "Spain" },
  { code: "se", name: "Sweden" },
  { code: "gb", name: "United Kingdom" },
] as const;

export const defaultShippingCountry = "us";

const supportedCountryCodes: ReadonlySet<string> = new Set(
  supportedShippingCountries.map((country) => country.code),
);

export const supportedShippingCountriesText = supportedShippingCountries
  .map((country) => country.name)
  .join(", ");

export function isSupportedShippingCountry(code: string) {
  return supportedCountryCodes.has(code.trim().toLowerCase());
}
