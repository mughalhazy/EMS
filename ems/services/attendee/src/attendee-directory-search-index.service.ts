import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

import { AttendeeProfileEntity } from './entities/attendee-profile.entity';
import { AttendeeEntity } from './entities/attendee.entity';

export type IndexedAttendeeDocument = {
  tenantId: string;
  eventId: string;
  attendeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  badgeName: string;
  bio: string;
  interests: string[];
};

@Injectable()
export class AttendeeDirectorySearchIndexService {
  private readonly logger = new Logger(AttendeeDirectorySearchIndexService.name);
  private readonly indexName = process.env.ATTENDEE_DIRECTORY_SEARCH_INDEX_NAME ?? 'attendee-directory';
  private readonly client: Client | null;
  private indexReady = false;

  constructor() {
    const node = process.env.OPENSEARCH_NODE;
    if (!node) {
      this.client = null;
      this.logger.warn('OPENSEARCH_NODE is not set. Attendee directory search indexing is disabled.');
      return;
    }

    this.client = new Client({
      node,
      auth:
        process.env.OPENSEARCH_USERNAME && process.env.OPENSEARCH_PASSWORD
          ? {
              username: process.env.OPENSEARCH_USERNAME,
              password: process.env.OPENSEARCH_PASSWORD,
            }
          : undefined,
      ssl:
        process.env.OPENSEARCH_TLS_REJECT_UNAUTHORIZED === 'false'
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  async upsertAttendee(attendee: AttendeeEntity, attendeeProfile: AttendeeProfileEntity | null): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.ensureIndex();

    const document: IndexedAttendeeDocument = {
      tenantId: attendee.tenantId,
      eventId: attendee.eventId,
      attendeeId: attendee.id,
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      email: attendee.email,
      phone: attendee.phone ?? '',
      badgeName: attendee.badgeName ?? '',
      bio: attendeeProfile?.bio ?? '',
      interests: attendeeProfile?.interests ?? [],
    };

    try {
      await this.client.index({
        index: this.indexName,
        id: attendee.id,
        body: document,
        refresh: true,
      });
    } catch (error) {
      this.logger.warn(`Failed to index attendee '${attendee.id}'. ${(error as Error).message}`);
    }
  }

  async deleteAttendee(attendeeId: string): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.ensureIndex();

    try {
      await this.client.delete({
        index: this.indexName,
        id: attendeeId,
        refresh: true,
      });
    } catch (error) {
      this.logger.warn(`Failed to delete indexed attendee '${attendeeId}'. ${(error as Error).message}`);
    }
  }

  async searchAttendeeIds(tenantId: string, eventId: string, query: string, limit: number): Promise<string[] | null> {
    if (!this.client) {
      return null;
    }

    await this.ensureIndex();

    try {
      const response = await this.client.search<{ attendeeId: string }>({
        index: this.indexName,
        body: {
          size: limit,
          query: {
            bool: {
              filter: [{ term: { tenantId } }, { term: { eventId } }],
              must: [
                {
                  multi_match: {
                    query,
                    fields: ['firstName^3', 'lastName^3', 'badgeName^2', 'email^2', 'phone', 'bio', 'interests'],
                    fuzziness: 'AUTO',
                  },
                },
              ],
            },
          },
        },
      });

      return response.body.hits.hits
        .map((hit) => hit._source?.attendeeId)
        .filter((attendeeId): attendeeId is string => Boolean(attendeeId));
    } catch (error) {
      this.logger.warn(`Failed to search attendees in OpenSearch. ${(error as Error).message}`);
      return null;
    }
  }

  private async ensureIndex(): Promise<void> {
    if (!this.client || this.indexReady) {
      return;
    }

    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      if (!exists.body) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                tenantId: { type: 'keyword' },
                eventId: { type: 'keyword' },
                attendeeId: { type: 'keyword' },
                firstName: { type: 'text' },
                lastName: { type: 'text' },
                email: { type: 'text' },
                phone: { type: 'text' },
                badgeName: { type: 'text' },
                bio: { type: 'text' },
                interests: { type: 'text' },
              },
            },
          },
        });
      }

      this.indexReady = true;
    } catch (error) {
      this.logger.warn(
        `Failed to ensure OpenSearch index '${this.indexName}'. ${(error as Error).message}`,
      );
    }
  }
}
