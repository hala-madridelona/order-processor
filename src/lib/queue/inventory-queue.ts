import { DeleteMessageCommand, ReceiveMessageCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const isLocal = process.env.NODE_ENV === 'local';

export class InventoryQueue {
    static queue: SQSClient;
  
    static initQueue() {
      if (!InventoryQueue.queue) {
        InventoryQueue.queue = new SQSClient({
          region: process.env.AWS_DEFAULT_REGION || "ap-south-1",
          ...(process.env.NODE_ENV === "local" && {
            endpoint: process.env.AWS_ENDPOINT_URL || "",
            credentials: {
              accessKeyId: "test",
              secretAccessKey: "test",
            },
          }),
        });
      }
    }
  
    static get client() {
      if (!InventoryQueue.queue) InventoryQueue.initQueue();
      return InventoryQueue.queue;
    }
  
    static enqueue(payload: unknown) {
      return this.client.send(
        new SendMessageCommand({
          QueueUrl: process.env.AWS_SQS_INVENTORY_QUEUE_URL!,
          MessageBody: JSON.stringify(payload),
        })
      );
    }
  
    static async receiveOne() {
      const res = await this.client.send(
        new ReceiveMessageCommand({
          QueueUrl: process.env.AWS_SQS_INVENTORY_QUEUE_URL!,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 20,
          VisibilityTimeout: 30,
        })
      );
  
      return res.Messages?.[0] ?? null;
    }
  
    static delete(receiptHandle: string) {
      return this.client.send(
        new DeleteMessageCommand({
          QueueUrl: process.env.AWS_SQS_INVENTORY_QUEUE_URL!,
          ReceiptHandle: receiptHandle,
        })
      );
    }
  }
  