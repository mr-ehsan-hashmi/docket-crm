import { describe, expect, it } from "vitest";
import { contactFormSchema, type ContactFormInput } from "./schema";

const validInput: ContactFormInput = {
  fullName: "Nadia Rahman",
  email: "nadia@example.com",
  phone: "",
  practiceArea: "property",
  referralSource: "phone",
  status: "lead",
  assignedTo: "",
  matterSummary: "",
};

function errorPaths(input: ContactFormInput): string[] {
  const result = contactFormSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

describe("contactFormSchema", () => {
  it("accepts a contact with only an email, and trims whitespace", () => {
    const result = contactFormSchema.parse({ ...validInput, fullName: "  Nadia Rahman " });
    expect(result.fullName).toBe("Nadia Rahman");
  });

  it("accepts a contact with only a phone number", () => {
    expect(errorPaths({ ...validInput, email: "", phone: "+1 (415) 555-0132" })).toEqual([]);
  });

  it("requires at least one way to reach the person", () => {
    expect(errorPaths({ ...validInput, email: "", phone: "" })).toEqual(["phone"]);
  });

  it("reports the missing contact method alongside other errors, not after them", () => {
    const paths = errorPaths({ ...validInput, fullName: "", practiceArea: "", email: "", phone: "" });
    expect(new Set(paths)).toEqual(new Set(["fullName", "phone", "practiceArea"]));
  });

  it("rejects malformed emails and phone numbers", () => {
    expect(errorPaths({ ...validInput, email: "nadia@example" })).toEqual(["email"]);
    expect(errorPaths({ ...validInput, phone: "call me" })).toEqual(["phone"]);
    expect(errorPaths({ ...validInput, phone: "12345" })).toEqual(["phone"]);
  });

  it("refuses the empty practice area placeholder", () => {
    expect(errorPaths({ ...validInput, practiceArea: "" })).toEqual(["practiceArea"]);
  });
});
