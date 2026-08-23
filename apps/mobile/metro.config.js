const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// The grammar course is one source of truth shared with the web app. Metro's
// project boundary is normally apps/mobile, so explicitly allow it to read the
// data-only grammar modules from the sibling web workspace.
config.watchFolders = [path.resolve(__dirname, "../web")];

module.exports = config;
