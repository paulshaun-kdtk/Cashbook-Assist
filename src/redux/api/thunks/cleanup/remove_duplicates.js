import { databases } from "@/redux/appwrite/config";
import delay from "delay";

const COLLECTION_IDS = {
  sales: "6772a1df0014923d0b63",
  stock_items: "672b93f4003ddfddb19f",
  income: "677bea990027b89debbc",
  expenses: "677bf45a003343d557a0",
  debts: "67e26fe60028b4eccbac",
  credits: "67efe9c0003105f351b1",
  wishlist: "672b93660012e69d9743",
  customers: "67a322fe002e51696e74",
};

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export const cleanDuplicatesFromAppwrite = async (duplicates) => {
  const grouped = {};
  const recordCountByModule = {};
  let deleteQueue = [];

  // Group duplicates by hash & count total records per module
  duplicates.forEach((item) => {
    const hash = `${item.id_on_device}-${item.createdAt}-${item.income_source}`;

    if (!grouped[hash]) {
      grouped[hash] = [];
    }
    grouped[hash].push(item);

    if (!recordCountByModule[item.which_module]) {
      recordCountByModule[item.which_module] = 0;
    }
    recordCountByModule[item.which_module]++;
  });

  // Build delete queue from groups
  Object.values(grouped).forEach((items) => {
    const [keep, ...toDelete] = items;
    console.log(
      `Keeping ${keep.$id} from ${keep.which_module} and deleting ${toDelete.length} duplicates`
    );

    toDelete.forEach((item) => {
      const collectionId = COLLECTION_IDS[item.which_module];
      if (!collectionId) {
        console.warn(`No collection ID found for module: ${item.which_module}`);
        return;
      }

      deleteQueue.push({ collectionId, item });
    });
  });

  // Count planned deletes per module
  const deleteCountByModule = {};
  deleteQueue.forEach(({ item }) => {
    if (!deleteCountByModule[item.which_module]) {
      deleteCountByModule[item.which_module] = 0;
    }
    deleteCountByModule[item.which_module]++;
  });

  // Safety check: prevent deleting all records from any module
  Object.entries(deleteCountByModule).forEach(([module, deleteCount]) => {
    const totalCount = recordCountByModule[module] || 0;
    if (deleteCount >= totalCount) {
      console.warn(
        `Aborting delete for ${module} — would delete all (${deleteCount} of ${totalCount})`
      );

      // Remove those items from deleteQueue
      deleteQueue = deleteQueue.filter(
        ({ item }) => item.which_module !== module
      );
    }
  });

  // 🔄 Sequentially delete each document with a delay
  for (const { collectionId, item } of deleteQueue) {
    try {
      await databases.deleteDocument(databaseId, collectionId, item.$id);
      console.log(`Deleted ${item.$id} from ${item.which_module}`);
    } catch (error) {
      console.error(
        `Error deleting ${item.$id} from ${item.which_module}:`,
        error
      );
    }

    await delay(50);
  }

  console.log("Finished cleaning duplicates.");
};
