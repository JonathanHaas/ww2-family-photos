const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const footerPath = path.join(root, "templates", "partials", "footer.html");
const footer = fs.readFileSync(footerPath, "utf8").trim();
const pages = [
  path.join(root, "public", "index.html"),
  path.join(root, "public", "privacy.html")
];

const startMarker = "<!-- shared-footer:start -->";
const endMarker = "<!-- shared-footer:end -->";
const footerBlock = `${startMarker}\n${indent(footer, 4)}\n    ${endMarker}`;

for (const pagePath of pages) {
  const html = fs.readFileSync(pagePath, "utf8");
  const pattern = new RegExp(`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`);

  if (!pattern.test(html)) {
    throw new Error(`Missing shared footer markers in ${path.relative(root, pagePath)}`);
  }

  fs.writeFileSync(pagePath, html.replace(pattern, footerBlock));
}

function indent(value, spaces) {
  const prefix = " ".repeat(spaces);
  return value.split("\n").map((line) => line ? `${prefix}${line}` : "").join("\n");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
