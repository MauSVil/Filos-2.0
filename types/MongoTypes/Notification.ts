import { ObjectId } from "mongodb";

export interface NotificationType {
  _id?: ObjectId;
  title: string;
  description: string;
  read: boolean;
  timestamp: Date;
  metadata: {
    conversationId?: string;
    type?: string;
  };
}