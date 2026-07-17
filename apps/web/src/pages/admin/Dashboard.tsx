import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, CreditCard, DollarSign, Users } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/OverviewChart"

const staticChartData = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 2100 },
  { name: "Mar", total: 3400 },
  { name: "Apr", total: 4100 },
  { name: "May", total: 3800 },
  { name: "Jun", total: 5200 },
  { name: "Jul", total: 4800 },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back to the admin panel. Here's an overview of your AI Micro-SaaS.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Tokens Used</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234,800</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Token Usage Overview</CardTitle>
            <CardDescription>Monthly token consumption across all models.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={staticChartData} />
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
            <CardDescription>
              Latest AI tasks executed by users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">john@example.com</TableCell>
                  <TableCell><Badge variant="default">Success</Badge></TableCell>
                  <TableCell className="text-right">450</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">alice@test.app</TableCell>
                  <TableCell><Badge variant="secondary">Processing</Badge></TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">bob@domain.com</TableCell>
                  <TableCell><Badge variant="destructive">Failed</Badge></TableCell>
                  <TableCell className="text-right">0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">sarah@corp.net</TableCell>
                  <TableCell><Badge variant="default">Success</Badge></TableCell>
                  <TableCell className="text-right">1,200</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
