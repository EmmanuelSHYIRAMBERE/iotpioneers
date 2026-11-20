/**
 * Every content module, so the verification gate can walk all exports.
 * Add new content files here when they are created.
 */
import * as about from "@/content/about";
import * as contact from "@/content/contact";
import * as dataHub from "@/content/dataHub";
import * as hero from "@/content/hero";
import * as images from "@/content/images";
import * as marquee from "@/content/marquee";
import * as navigation from "@/content/navigation";
import * as pathTable from "@/content/pathTable";
import * as principles from "@/content/principles";
import * as shopHighlights from "@/content/shopHighlights";
import * as site from "@/content/site";
import * as social from "@/content/social";
import * as solutions from "@/content/solutions";

export const contentModules: Record<string, Record<string, unknown>> = {
  site,
  navigation,
  hero,
  images,
  marquee,
  about,
  solutions,
  dataHub,
  shopHighlights,
  principles,
  pathTable,
  contact,
  social,
};
