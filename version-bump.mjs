import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

if (!targetVersion) {
	console.error("npm_package_version environment variable is missing.");
	process.exit(1);
}

// Update manifest.json
const manifestPath = "./manifest.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.version = targetVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t") + "\n");
console.log(`Updated ${manifestPath} to version ${targetVersion}`);

// Update versions.json
const versionsPath = "./versions.json";
let versions = {};
try {
	versions = JSON.parse(readFileSync(versionsPath, "utf8"));
} catch {
	versions = {};
}
versions[targetVersion] = manifest.minAppVersion;
writeFileSync(versionsPath, JSON.stringify(versions, null, "\t") + "\n");
console.log(`Updated ${versionsPath} with version ${targetVersion} -> ${manifest.minAppVersion}`);
