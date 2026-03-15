import styles from './engagement.module.css'

const CAMPAIGNS = [
  {
    name: 'Last Chance Registration Push',
    segment: 'Unregistered waitlist',
    channel: 'Email',
    schedule: '2026-03-20 09:30',
    status: 'Scheduled',
  },
  {
    name: 'On-site App Download Reminder',
    segment: 'Checked-in attendees without app',
    channel: 'Push',
    schedule: '2026-03-22 08:15',
    status: 'Running',
  },
  {
    name: 'VIP Lounge Invitation',
    segment: 'Sponsors + VIP ticket holders',
    channel: 'SMS',
    schedule: '2026-03-22 16:00',
    status: 'Draft',
  },
]

const AUDIENCE_SEGMENTS = [
  {
    name: 'Unregistered waitlist',
    rule: 'Intent captured, registration not completed',
    size: '1,284',
  },
  {
    name: 'Checked-in attendees without app',
    rule: 'Badge scanned, app session inactive',
    size: '742',
  },
  {
    name: 'Sponsors + VIP ticket holders',
    rule: 'Sponsor org members OR ticket tier = VIP',
    size: '219',
  },
]

export default function EngagementPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Engagement</h1>
          <p>Design and operate audience-first campaigns with scheduling and targeting controls.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryBtn}>Create Segment</button>
          <button className={styles.primaryBtn}>Create Campaign</button>
        </div>
      </header>

      <section className={styles.kpis}>
        <article className={styles.kpiCard}>
          <p>Active Campaigns</p>
          <h3>7</h3>
          <span>2 launching today</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Audience Segments</p>
          <h3>14</h3>
          <span>3 updated in last 24h</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Average Open Rate</p>
          <h3>41%</h3>
          <span>+6% from last event</span>
        </article>
      </section>

      <main className={styles.contentGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Campaign Scheduling</h2>
            <button>Calendar View</button>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Audience Segment</th>
                  <th>Channel</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {CAMPAIGNS.map((campaign) => (
                  <tr key={campaign.name}>
                    <td>{campaign.name}</td>
                    <td>{campaign.segment}</td>
                    <td>{campaign.channel}</td>
                    <td>{campaign.schedule}</td>
                    <td><span className={styles.status}>{campaign.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Audience Targeting</h2>
            <button>New Rule Set</button>
          </div>
          <div className={styles.segmentList}>
            {AUDIENCE_SEGMENTS.map((segment) => (
              <article className={styles.segmentCard} key={segment.name}>
                <h3>{segment.name}</h3>
                <p>{segment.rule}</p>
                <div>
                  <span>Estimated Reach</span>
                  <strong>{segment.size}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
