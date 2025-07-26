import { Platform } from 'react-native';
import { Account, Client, Databases, ID, Messaging, Query } from 'react-native-appwrite';
import { appwriteCreds } from './credentials';

const client = new Client()
    .setProject(appwriteCreds.projectId)
    .setPlatform(Platform.OS === 'ios' ? 'cashbookassist' : 'com.shuan_s.cashbookassist');

export const account = new Account(client);
export const database = new Databases(client);
export const dbID = new ID(client);
export const query = Query;
export const messaging  = new Messaging(client);
