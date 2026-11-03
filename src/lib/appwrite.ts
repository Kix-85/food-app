import { CreateUserParams, GetMenuParams, SignInParams } from "@/type"
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite"

export const appwriteConfig: any = {
    endpoint: "https://fra.cloud.appwrite.io/v1",
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    projectName: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME,
    platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
    categoryCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID,
    menuCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID,
    customizationCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CUSTOMIZATION_COLLECTION_ID,
    menuCustomizationCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATION_COLLECTION_ID,
}

export const client = new Client()

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client)
export const database = new Databases(client)
export const storage = new Storage(client)

const avatars = new Avatars(client)

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create({ userId: ID.unique(), email, password, name });
        if (!newAccount) throw Error;

        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(name).toString();

        return await database.createDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.userCollectionId,
            documentId: ID.unique(),
            data: {
                accountId: newAccount.$id,
                email,
                name,
                avatar: avatarUrl
            }
        });
    } catch (error) {
        throw new Error("Failed to create user: " + (error as Error).message);
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        return await account.createEmailPasswordSession({ email, password });
    } catch (error) {
        throw new Error("Failed to sign in: " + (error as Error).message);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount){ 
            console.log('No current account found');
            throw Error
        };

        const currentUser = await database.listDocuments({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.userCollectionId,
            queries: [
                Query.equal('accountId', currentAccount.$id)
            ]
        });
    if (!currentUser || currentUser.total === 0) {
        console.log('No current user document found');
        throw Error;
    }
        
        return currentUser.documents[0];
        
    } catch (error) {
        console.log(error);
        throw new Error("Failed to get current user: " + (error as Error).message);
    }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
    try{
        const queries: string[] = [];
        if (category) queries.push(Query.equal('categories', category));
        if (query) queries.push(Query.search('name', query));

        return await database.listDocuments({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.menuCollectionId,
            queries: queries
        })
    } catch (error){
        throw new Error("Failed to get menu: " + (error as Error).message);
    }
}

export const getCategories = async () => {
    try {
        const categories = await database.listDocuments({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.categoryCollectionId
        })
    } catch (error) {
        throw new Error("Failed to get categories: " + (error as Error).message);
    }
}