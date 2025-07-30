import { Client, Account, Databases, Query, Messaging, Teams } from 'appwrite';
import {appwriteCreds} from "./appwriteCreds"

const client = new Client()
 .setEndpoint("https://cloud.appwrite.io/v1")
.setProject(appwriteCreds.projectId)

export const account = new Account(client);
export const teams = new Teams(client);
export const databases = new Databases(client);
export const query = Query;
export const messaging  = new Messaging(client);
