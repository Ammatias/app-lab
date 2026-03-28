'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'

interface Build {
  id: string
  status: string
  logs: string | null
  triggeredBy: string | null
  startedAt: Date
  endedAt: Date | null
  project: {
    name: string
    slug: string
  }
}

interface BuildsTableProps {
  builds: Build[]
}

export function BuildsTable({ builds }: BuildsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'building':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (builds.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No builds yet</p>
        <p className="text-sm text-muted-foreground">Trigger a build to see it here</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Triggered By</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {builds.map((build) => (
            <TableRow key={build.id}>
              <TableCell className="font-medium">{build.project.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(build.status)}
                  <span className="capitalize">{build.status}</span>
                </div>
              </TableCell>
              <TableCell>{build.triggeredBy || 'System'}</TableCell>
              <TableCell>
                {new Date(build.startedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {build.endedAt
                  ? `${Math.round((build.endedAt.getTime() - build.startedAt.getTime()) / 1000)}s`
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/builds/${build.id}`}>View Logs</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
