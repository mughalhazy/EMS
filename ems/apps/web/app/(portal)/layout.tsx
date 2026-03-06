import { PortalLayout } from '@/layouts/PortalLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>
}
