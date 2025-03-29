export type Contact = {
  _id: string;
  phone_id: string;
  fullName: string;
  email: string;
  aiEnabled: boolean;
  address: string;
  newMessage: boolean;
  lastMessageSent: Date;
  type: "wholesale" | "retail";
};

export type Message = {
  _id: string;
  type: string;
  timestamp: string;
  role: string;
  phone_id: string;
  message: string;
  metadata: {
    url: string;
  };
};

export type SerializedError = {
  status: number;
  message: string;
  details?: any;
};
