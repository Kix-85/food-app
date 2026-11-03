import { File, Paths } from "expo-file-system";
import { ID, Query } from "react-native-appwrite";
import { appwriteConfig, database, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[]; // list of customization names
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    const list = await database.listDocuments({
        databaseId: appwriteConfig.databaseId,
        collectionId,
        queries: [Query.limit(100)],
    });

    await Promise.all(
        list.documents.map((doc) =>
            database.deleteDocument({
                databaseId: appwriteConfig.databaseId,
                collectionId,
                documentId: doc.$id,
            })
        )
    );
}

async function clearStorage(): Promise<void> {
    const list = await storage.listFiles({
        bucketId: appwriteConfig.bucketId,
        queries: [Query.limit(100)],
    });

    await Promise.all(
        list.files.map((file) =>
            storage.deleteFile({
                bucketId: appwriteConfig.bucketId,
                fileId: file.$id,
            })
        )
    );
}

async function uploadImageToStorage(imageUrl: string): Promise<string> {
    // react-native-appwrite reads the file from a local URI, so download it to the cache first.
    const name = imageUrl.split("/").pop() || `file-${Date.now()}.png`;
    const localFile = await File.downloadFileAsync(imageUrl, new File(Paths.cache, name), {
        idempotent: true,
    });

    try {
        const file = await storage.createFile({
            bucketId: appwriteConfig.bucketId,
            fileId: ID.unique(),
            file: {
                name,
                type: localFile.type || "image/png",
                size: localFile.size,
                uri: localFile.uri,
            },
        });

        return storage.getFileViewURL(appwriteConfig.bucketId, file.$id).toString();
    } finally {
        if (localFile.exists) localFile.delete();
    }
}

function assertConfig(): void {
    const required = [
        "databaseId",
        "bucketId",
        "categoryCollectionId",
        "customizationCollectionId",
        "menuCollectionId",
        "menuCustomizationCollectionId",
    ];
    const missing = required.filter((key) => !appwriteConfig[key]);
    if (missing.length > 0) {
        throw new Error(
            `Missing appwriteConfig values: ${missing.join(", ")}. ` +
            "Check .env and restart the dev server with `npx expo start --clear`."
        );
    }
}

async function seed(): Promise<void> {
    assertConfig();

    // 1. Clear all
    await clearAll(appwriteConfig.categoryCollectionId);
    await clearAll(appwriteConfig.customizationCollectionId);
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.menuCustomizationCollectionId);
    await clearStorage();

    // 2. Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        const doc = await database.createDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.categoryCollectionId,
            documentId: ID.unique(),
            data: cat,
        });
        categoryMap[cat.name] = doc.$id;
    }

    // 3. Create Customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
        const doc = await database.createDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.customizationCollectionId,
            documentId: ID.unique(),
            data: {
                name: cus.name,
                price: cus.price,
                type: cus.type,
            },
        });
        customizationMap[cus.name] = doc.$id;
    }

    // 4. Create Menu Items
    const menuMap: Record<string, string> = {};
    for (const item of data.menu) {
        const uploadedImage = await uploadImageToStorage(item.image_url);

        const doc = await database.createDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.menuCollectionId,
            documentId: ID.unique(),
            data: {
                name: item.name,
                description: item.description,
                image_url: uploadedImage,
                price: item.price,
                rating: item.rating,
                calories: item.calories,
                protein: item.protein,
                categories: categoryMap[item.category_name],
            },
        });

        menuMap[item.name] = doc.$id;

        // 5. Create menu_customizations
        for (const cusName of item.customizations) {
            await database.createDocument({
                databaseId: appwriteConfig.databaseId,
                collectionId: appwriteConfig.menuCustomizationCollectionId,
                documentId: ID.unique(),
                data: {
                    menu: doc.$id,
                    customizations: customizationMap[cusName],
                },
            });
        }
    }

    console.log("✅ Seeding complete.");
}

export default seed;
