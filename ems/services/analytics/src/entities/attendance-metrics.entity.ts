import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  schema: 'analytics',
  name: 'attendance_metrics',
  expression: `
    SELECT
      id,
      tenant_id,
      event_id,
      registrations_count,
      check_ins_count,
      tickets_redeemed_count,
      CASE
        WHEN registrations_count > 0
        THEN ROUND((check_ins_count::numeric / registrations_count) * 100, 2)
        ELSE 0::numeric
      END AS check_in_rate,
      updated_at
    FROM analytics.event_metrics
  `,
})
export class AttendanceMetrics {
  @ViewColumn() id: string;
  @ViewColumn() tenantId: string;
  @ViewColumn() eventId: string;
  @ViewColumn() registrationsCount: number;
  @ViewColumn() checkInsCount: number;
  @ViewColumn() ticketsRedeemedCount: number;
  @ViewColumn() checkInRate: number;
  @ViewColumn() updatedAt: Date;
}
