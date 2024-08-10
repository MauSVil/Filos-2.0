"use client";

import React, { ReactNode } from "react";

import {cn} from "@/utils/cn";
import { NotificationType } from "@/types/MongoTypes/Notification";
import moment from "moment";

export type NotificationItem = {
  id: string;
  isRead?: boolean;
  avatar: string;
  description: string;
  name: string;
  time: string;
  type?: NotificationType;
};

export type NotificationItemProps = React.HTMLAttributes<HTMLDivElement> & NotificationType;

const NotificationItem = React.forwardRef<HTMLDivElement, NotificationItemProps>(
  ({children, title, description, read, timestamp, metadata, className, ...props}, ref) => {
    const contentByType: { [key: string]: ReactNode | null } = {
      "simple notification": null,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 border-b border-divider px-6 py-4",
          {
            "bg-primary-50/50": !read,
          },
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-1">
          <p className="text-small text-foreground">
            <strong className="font-medium">{title}</strong>
          </p>
          <p className="text-tiny text-default-400">{description}</p>
          <time className="text-tiny text-default-300">{moment(timestamp).format('DD-MM-YYYY HH:mm')}</time>
          {metadata?.type && contentByType[metadata.type]}
        </div>
      </div>
    );
  },
);

NotificationItem.displayName = "NotificationItem";

export default NotificationItem;
