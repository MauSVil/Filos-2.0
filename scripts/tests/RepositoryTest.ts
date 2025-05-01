import { OrderRepository } from "@/repositories/v2/OrderRepository";
import { ObjectId } from "mongodb";

const init = async () => {
  try {
    const order = await OrderRepository.find({ _id: new ObjectId("67ed5b1b1ce5a509e6124754") })
    console.log('Order:', order);
  } catch (error) {
    console.error('Error initializing test:', error);
    process.exit(1);
  }
}

init();