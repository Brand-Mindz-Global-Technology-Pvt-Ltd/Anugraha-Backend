import {
  applicationDefault,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { ENV } from "./env.js";

const existingDefaultApp = getApps().find((app) => app.name === "[DEFAULT]");

const firebaseAdminApp =
  existingDefaultApp ??
  initializeApp({
    credential: applicationDefault(),
    projectId: ENV.FIREBASE_PROJECT_ID,
  });

export default firebaseAdminApp;
