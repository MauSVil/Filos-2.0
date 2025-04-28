import { FileService } from "@/services/file.service";

const init = async () => {
  try {
    const files = await FileService.getFiles("products");
    console.log("Files:", files);
    process.exit(0);
  } catch (error) {
    console.error('Error initializing:', error);
    process.exit(1);
  }
}

init()