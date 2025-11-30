export const CATEGORIES = [
  "Programming",
  "Design",
  "Marketing",
  "3D",
  "Unity",
  "Project Management",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Business",
  "Other",
] as const;

export const VERIFICATION_STATUS = [
  { value: "", label: "All Status" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
] as const;

export type Category = typeof CATEGORIES[number];
export type VerificationStatusValue = typeof VERIFICATION_STATUS[number]["value"];