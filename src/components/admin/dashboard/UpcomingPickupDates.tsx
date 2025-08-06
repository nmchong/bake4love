"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Package } from "lucide-react"
import { format } from "date-fns"

interface UpcomingDate {
  date: string
  orderCount: number
  totalItems: number
}

interface UpcomingDatesResponse {
  upcomingDates: UpcomingDate[]
}

export default function UpcomingPickupDates() {
  const [upcomingDates, setUpcomingDates] = useState<UpcomingDate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUpcomingDates = async () => {
      try {
        const response = await fetch('/api/admin/upcoming-dates')
        if (!response.ok) {
          throw new Error('Failed to fetch upcoming dates')
        }
        const data: UpcomingDatesResponse = await response.json()
        setUpcomingDates(data.upcomingDates)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingDates()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = format(date, 'EEE').toLowerCase()
    
    return `${month}/${day} ${dayOfWeek}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Pickup Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading upcoming dates...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Pickup Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (upcomingDates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Pickup Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No upcoming orders
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Pickup Dates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingDates.map((dateInfo) => (
            <div key={dateInfo.date} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(dateInfo.date)}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">
                  {dateInfo.orderCount} orders
                </span>
                <span className="text-muted-foreground">
                  ({dateInfo.totalItems} items)
                </span>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 