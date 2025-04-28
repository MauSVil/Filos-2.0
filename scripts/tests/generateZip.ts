import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { FileService } from "@/services/file.service";
import ky from "ky";
import fs from "fs";

const init = async () => {
  try {
    const orders = await OrderRepository.find({});

    let ordersWithBuffers = [];

    for await (const order of orders) {
      const orderId = order._id.toString();
      if (order?.documents?.order) {
        const resp = await ky.get(order.documents.order).arrayBuffer();
        const buffer = Buffer.from(resp);
        ordersWithBuffers.push({
          name: orderId,
          buffer: buffer,
        })
        console.log(`Buffer for order ${orderId} retrieved successfully.`);
      }
    }

    console.log("All buffers retrieved successfully.");

    const buffer = await FileService.createZipFromDocuments(ordersWithBuffers);

    fs.writeFileSync("orders.zip", buffer);

    process.exit(0);
  } catch (error) {
    console.error("Error during initialization:", error);
    process.exit(1);
  }
}

init();