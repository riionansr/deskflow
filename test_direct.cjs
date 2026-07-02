// test_direct.ts
var import_archiver = require("archiver");
console.log("ZipArchive type:", typeof import_archiver.ZipArchive);
try {
  const archive = new import_archiver.ZipArchive({ zlib: { level: 9 } });
  console.log("Created successfully!");
} catch (e) {
  console.error("Error creating ZipArchive:", e.message, e.stack);
}
