"use client"

import { BookOpen, Users, MessageSquare, HardDrive } from "lucide-react"
import { DataCard } from "@/components/dashboard/data-card"

const storiesData = [
  { value: 400 }, { value: 300 }, { value: 200 }, { value: 278 }, { value: 189 }, { value: 239 }, { value: 349 },
]
const familyData = [
  { value: 10 }, { value: 12 }, { value: 12 }, { value: 15 }, { value: 15 }, { value: 18 }, { value: 20 },
]
const interactionData = [
  { value: 240 }, { value: 139 }, { value: 980 }, { value: 390 }, { value: 480 }, { value: 380 }, { value: 430 },
]
const storageDataPoints = [
  { value: 2.1 }, { value: 2.5 }, { value: 3.2 }, { value: 3.8 }, { value: 4.5 }, { value: 5.1 }, { value: 5.8 },
]

interface KpiGridProps {
  storiesCount: number
  membersCount: number
  totalComments: number
  storageUsedGb: string
  storiesTitle: string
  storiesDesc: string
  familyTitle: string
  familyDesc: string
  interactionsTitle: string
  interactionsDesc: string
  storageTitle: string
  storageDesc: string
}

export function KpiGrid({
  storiesCount,
  membersCount,
  totalComments,
  storageUsedGb,
  storiesTitle,
  storiesDesc,
  familyTitle,
  familyDesc,
  interactionsTitle,
  interactionsDesc,
  storageTitle,
  storageDesc,
}: KpiGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DataCard
        title={storiesTitle}
        value={storiesCount}
        description={storiesDesc}
        icon={BookOpen}
        data={storiesData}
        color="var(--accent)"
      />
      <DataCard
        title={familyTitle}
        value={membersCount}
        description={familyDesc}
        icon={Users}
        data={familyData}
        color="#10b981"
      />
      <DataCard
        title={interactionsTitle}
        value={totalComments}
        description={interactionsDesc}
        icon={MessageSquare}
        trend={{ value: "12%", isUp: true }}
        data={interactionData}
        color="#6366f1"
      />
      <DataCard
        title={storageTitle}
        value={`${storageUsedGb}GB`}
        description={storageDesc}
        icon={HardDrive}
        data={storageDataPoints}
        color="#f59e0b"
      />
    </div>
  )
}
