import React from 'react'
import { AttendeeLayout } from '@/layouts/AttendeeLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AttendeeLayout>{children}</AttendeeLayout>
}
