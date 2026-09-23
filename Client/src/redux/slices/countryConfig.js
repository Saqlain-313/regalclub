export const SUPPORTED_COUNTRIES = [
  "india",
  "uae",
  "nepal",
  "pakistan",
  "australia",
  "canada",
];

export const normalizeCountry = (country) => {
  const value = String(country || "").trim().toLowerCase();
  return SUPPORTED_COUNTRIES.includes(value) ? value : "india";
};

export const COUNTRY_CURRENCY = {
  india: "INR",
  uae: "AED",
  nepal: "NPR",
  pakistan: "PKR",
  australia: "AUD",
  canada: "CAD",
};
