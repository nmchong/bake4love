"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar } from "lucide-react"

interface EarningsData {
  grossRevenue: number
  stripeFees: number
  netRevenue: number
  numberOfOrders: number
}

interface EarningsResponse {
  past7Days: EarningsData
  past30Days: EarningsData
  allTime: EarningsData
}

export default function EarningsOverview() {
  const [earnings, setEarnings] = useState<EarningsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch('/api/admin/earnings')
        if (!response.ok) {
          throw new Error('Failed to fetch earnings')
        }
        const data = await response.json()
        setEarnings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [])

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading earnings...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!earnings) return null

  const periods = [
    {
      title: "Past 7 Days",
      data: earnings.past7Days,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      title: "Past 30 Days", 
      data: earnings.past30Days,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: "All Time",
      data: earnings.allTime,
      icon: <DollarSign className="h-4 w-4" />
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Earnings Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {periods.map((period) => (
            <div key={period.title} className="space-y-2">
              <div className="flex items-center gap-2 text-md font-medium text-muted-foreground">
                {period.icon}
                {period.title}
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(period.data.grossRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Gross (before tax & fees)
                </div>
                <div className="text-xs text-red-600 mt-6">
                  Approx. Stripe fees: -{formatCurrency(period.data.stripeFees)}
                </div>
                <div className="text-sm font-semibold">
                  Expected payout: {formatCurrency(period.data.netRevenue)}
                </div>
                <div className="text-xs text-muted-foreground mt-4">
                  {period.data.numberOfOrders} orders
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 