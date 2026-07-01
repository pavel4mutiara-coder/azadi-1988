import { VersionConfig } from '../types';

declare const __APP_VERSION__: string;
declare const __BUILD_NUMBER__: number;
declare const __RELEASE_DATE__: string;

export const CURRENT_VERSION: VersionConfig = {
  latestVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : "v1.0.0",
  buildNumber: typeof __BUILD_NUMBER__ !== 'undefined' ? __BUILD_NUMBER__ : 1,
  releaseDate: typeof __RELEASE_DATE__ !== 'undefined' ? __RELEASE_DATE__ : "2026-07-01",
  releaseNotes: "Initial stable release.",
  forceUpdate: false,
  apkDownloadUrl: "https://ais-dev-fsjvyrfo7l6x6ohwf7vumy-835986560131.asia-southeast1.run.app/app-release.apk",
  updateSize: "8.5 MB",
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.azadi.society"
};
