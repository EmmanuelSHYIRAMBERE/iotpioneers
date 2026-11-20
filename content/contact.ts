import type { ContactDetails, Verifiable } from "./types";

/**
 * Details as published on the iotdatahub.rw footer (fetched 2026.11.20). They are real
 * company details from an official IoT Pioneers source but still need the client's
 * confirmation that they are the right ones for the corporate site.
 */
export const contact: ContactDetails = {
  email: "iotpioneersltd@gmail.com",
  phone: "+250791377302",
  phoneDisplay: "+250 791 377 302",
  address: "KK 15 Rd, BRGD Plaza, 2nd Floor, Room R10, Kigali, Rwanda",
  locality: "Kigali, Rwanda",
  countryCode: "RW",
  hours: "Mon to Fri, 8 AM to 6 PM CAT",
  verified: false,
  source: "Published on https://www.iotdatahub.rw/ footer (fetched 2026.11.20); client to confirm",
};

export const contactSection = {
  eyebrow: "LET'S TALK",
  titleLead: "Have an Idea? Let's Build Something",
  titleEmphasis: "Intelligent.",
  lead: "Businesses, institutions and partners: tell us what you want to connect, measure or automate, and we will help you plan the build.",
  emailLabel: "Email Us",
  callLabel: "Call Us",
  emailSubject: "Project enquiry from website",
  verified: false,
  source: "Provisional copy from specification section 9.09",
} as const satisfies Verifiable & Record<string, unknown>;
