import { QdrantClient } from '@qdrant/js-client-rest';
import { Memory, VectorStoreBase } from '../../../../../types/llm';

export class QdrantStore implements VectorStoreBase<Memory> {
  private client: QdrantClient;
  private collection: string;

  constructor(collection: string) {
    this.client = new QdrantClient({
      host: process.env.QDRANT_ENDPOINT,
      port: Number(process.env.QDRANT_PORT),
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collection = collection;
  }

  async setup(vectorSize: number): Promise<void> {
    let result;
    try {
      result = await this.client.getCollection(this.collection);
    } catch (e) {
      // Collection not found or network error
    }

    if (!result) {
      try {
        console.log('\x1b[32m', 'Creating Qdrant memories collection');
        // Create collection for memories
        await this.client.createCollection(this.collection, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
          optimizers_config: {
            default_segment_number: 0,
          },
          replication_factor: 1,
        });

        // Create payload index for userId in collection memories
        await this.client.createPayloadIndex(this.collection, {
          field_name: 'userId',
          field_schema: 'keyword',
          wait: true,
        });
      } catch (e) {
        console.log('\x1b[31m', 'Error creating Qdrant memories collection');
        console.log(e);
      }
    }
  }

  async store(input: Memory, vector: number[]): Promise<void> {
    await this.client.upsert(this.collection, {
      wait: true,
      points: [
        {
          id: input.id,
          vector: vector,
          payload: input,
        },
      ],
    });
  }

  async search(searchThreshold: number, vector: number[], userId: string): Promise<Memory[]> {
    const results = await this.client.search(this.collection, {
      vector: vector,
      score_threshold: searchThreshold,
      filter: {
        must: [
          {
            key: 'userId',
            match: {
              value: userId,
            },
          },
        ],
      },
    });
    console.log(results);
    return results.map(result => result.payload as Memory);
  }
}
