import { ProductRepository } from "@/repositories/v2/ProductRepository";
import { FileService } from "@/services/file.service";
import ky from "ky";
import pLimit from "p-limit";

const limit = pLimit(20);

const init = async () => {
  try {
    const products = (await ProductRepository.find({}));
    const productsById = products.reduce((acc, product) => {
      acc[product._id.toString()] = product.image;
      return acc;
    }, {} as Record<string, string>);

    const ids = Object.keys(productsById);

    const promises = ids.map((id) => {
      const image = productsById[id];

      if (!image) {
        console.log(`No image found for product ID: ${id}`);
        return Promise.resolve(null);
      }

      return limit(async () => {
        const resp = await ky.get(image).arrayBuffer();
        const buffer = Buffer.from(resp);
        const url = await FileService.uploadFile("products", id, buffer, "image/png");
        await ProductRepository.updateOne({ _id: id }, { image: url });
      });
    });

    await Promise.all(promises);
    process.exit(0);
  } catch (error) {
    console.error('Error initializing:', error);
    process.exit(1);
  }
}

init()