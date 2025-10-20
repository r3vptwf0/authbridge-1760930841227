"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Clock, LogIn, LogOut, Pencil, Trash2, Calendar, Download } from "lucide-react"

interface WorkHour {
  id: string
  clock_in: string
  clock_out: string | null
  notes: string | null
}

export default function WorkHoursPage() {
  const [workHours, setWorkHours] = useState<WorkHour[]>([])
  const [activeSession, setActiveSession] = useState<WorkHour | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingWork, setEditingWork] = useState<WorkHour | null>(null)
  const [clockInTime, setClockInTime] = useState("")
  const [clockOutTime, setClockOutTime] = useState("")
  const [notes, setNotes] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadWorkHours()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loadWorkHours = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('work_hours')
        .select('*')
        .order('clock_in', { ascending: false })

      if (error) throw error
      
      const active = (data || []).find(w => !w.clock_out)
      setActiveSession(active || null)
      setWorkHours(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleClockIn = async () => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('work_hours').insert({
        clock_in: new Date().toISOString(),
      })

      if (error) throw error

      toast({ title: "Success", description: "Clocked in successfully!" })
      loadWorkHours()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleClockOut = async () => {
    if (!activeSession) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('work_hours').update({
        clock_out: new Date().toISOString(),
      }).eq('id', activeSession.id)

      if (error) throw error

      toast({ title: "Success", description: "Clocked out successfully!" })
      loadWorkHours()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleEditWork = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingWork) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('work_hours').update({
        clock_in: new Date(clockInTime).toISOString(),
        clock_out: clockOutTime ? new Date(clockOutTime).toISOString() : null,
        notes: notes || null,
      }).eq('id', editingWork.id)

      if (error) throw error

      toast({ title: "Success", description: "Work hours updated successfully!" })
      resetForm()
      setEditingWork(null)
      setIsEditDialogOpen(false)
      loadWorkHours()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteWork = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('work_hours').delete().eq('id', id)
      if (error) throw error
      toast({ title: "Success", description: "Work hours deleted successfully!" })
      loadWorkHours()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const openEditDialog = (work: WorkHour) => {
    setEditingWork(work)
    setClockInTime(new Date(work.clock_in).toISOString().slice(0, 16))
    setClockOutTime(work.clock_out ? new Date(work.clock_out).toISOString().slice(0, 16) : "")
    setNotes(work.notes || "")
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setClockInTime("")
    setClockOutTime("")
    setNotes("")
  }

  const calculateDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return "In Progress"
    const start = new Date(clockIn)
    const end = new Date(clockOut)
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getActiveDuration = () => {
    if (!activeSession) return "0h 0m"
    const start = new Date(activeSession.clock_in)
    const diff = currentTime.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  const totalHoursToday = workHours
    .filter(w => {
      const workDate = new Date(w.clock_in).toDateString()
      const today = new Date().toDateString()
      return workDate === today && w.clock_out
    })
    .reduce((sum, w) => {
      const start = new Date(w.clock_in)
      const end = new Date(w.clock_out!)
      return sum + (end.getTime() - start.getTime())
    }, 0)

  const totalHoursWeek = workHours
    .filter(w => {
      const workDate = new Date(w.clock_in)
      const today = new Date()
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
      return workDate >= weekStart && w.clock_out
    })
    .reduce((sum, w) => {
      const start = new Date(w.clock_in)
      const end = new Date(w.clock_out!)
      return sum + (end.getTime() - start.getTime())
    }, 0)

  const formatTotalHours = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const exportToExcel = () => {
    const csvData = [
      ['Date', 'Clock In', 'Clock Out', 'Duration (Hours)', 'Duration (Minutes)', 'Notes'],
      ...workHours.map(work => {
        const clockInDate = new Date(work.clock_in)
        const clockOutDate = work.clock_out ? new Date(work.clock_out) : null
        
        let durationHours = 0
        let durationMinutes = 0
        if (clockOutDate) {
          const diff = clockOutDate.getTime() - clockInDate.getTime()
          durationHours = Math.floor(diff / (1000 * 60 * 60))
          durationMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        }
        
        return [
          clockInDate.toLocaleDateString(),
          clockInDate.toLocaleTimeString(),
          clockOutDate ? clockOutDate.toLocaleTimeString() : 'In Progress',
          durationHours.toString(),
          durationMinutes.toString(),
          work.notes || ''
        ]
      })
    ]

    const totalCompleted = workHours.filter(w => w.clock_out).reduce((sum, w) => {
      const start = new Date(w.clock_in)
      const end = new Date(w.clock_out!)
      return sum + (end.getTime() - start.getTime())
    }, 0)
    const totalHours = Math.floor(totalCompleted / (1000 * 60 * 60))
    const totalMinutes = Math.floor((totalCompleted % (1000 * 60 * 60)) / (1000 * 60))

    csvData.push([])
    csvData.push(['Total Hours:', '', '', totalHours.toString(), totalMinutes.toString(), ''])
    csvData.push(['Total Sessions:', workHours.length.toString(), '', '', '', ''])

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `work_hours_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Work hours exported to Excel/CSV successfully!",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">Work Hours</h1>
            <p className="text-gray-500 mt-2 font-light">Track your working time</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToExcel} variant="outline" className="border-gray-300 hover:bg-gray-100">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="border-gray-300 hover:bg-gray-100">
              Dashboard
            </Button>
          </div>
        </div>

        {activeSession && (
          <Card className="border-none shadow-md bg-white border-l-4 border-l-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 font-light">
                <Clock className="mr-2 h-5 w-5 animate-pulse" />
                Active Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 font-light uppercase tracking-wider">Started at</p>
                  <p className="text-2xl font-light text-gray-900">{new Date(activeSession.clock_in).toLocaleTimeString()}</p>
                  <p className="text-sm text-gray-400 font-light uppercase tracking-wider mt-2">Duration</p>
                  <p className="text-3xl font-light text-gray-900">{getActiveDuration()}</p>
                </div>
                <Button onClick={handleClockOut} size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                  <LogOut className="mr-2 h-5 w-5" />
                  Clock Out
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!activeSession && (
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-light text-gray-900">Ready to start work?</h3>
                  <p className="text-gray-500 mt-1 font-light">Clock in to track your hours</p>
                </div>
                <Button onClick={handleClockIn} size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                  <LogIn className="mr-2 h-5 w-5" />
                  Clock In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Today</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-light text-gray-900">{formatTotalHours(totalHoursToday)}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">This Week</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-light text-gray-900">{formatTotalHours(totalHoursWeek)}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-light text-gray-500 uppercase tracking-wider">Total Sessions</CardTitle>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-light text-gray-900">{workHours.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-2xl font-light text-gray-900">Work History</CardTitle>
            <CardDescription className="font-light">Your clocked hours</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workHours.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-8 font-light">
                      No work hours recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  workHours.map((work) => (
                    <TableRow key={work.id} className="hover:bg-gray-50">
                      <TableCell className="font-light text-gray-600">{new Date(work.clock_in).toLocaleDateString()}</TableCell>
                      <TableCell className="font-light text-gray-900">{new Date(work.clock_in).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        {work.clock_out ? (
                          <span className="font-light text-gray-900">{new Date(work.clock_out).toLocaleTimeString()}</span>
                        ) : (
                          <Badge variant="default" className="bg-gray-900 font-light">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-light text-gray-900">{calculateDuration(work.clock_in, work.clock_out)}</TableCell>
                      <TableCell className="font-light text-gray-600">{work.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(work)} title="Edit" className="hover:bg-gray-100">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteWork(work.id)} title="Delete" className="hover:bg-gray-100">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Work Hours</DialogTitle>
              <DialogDescription>Update your work session details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditWork} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-clock-in">Clock In</Label>
                <Input 
                  id="edit-clock-in" 
                  type="datetime-local" 
                  value={clockInTime} 
                  onChange={(e) => setClockInTime(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-clock-out">Clock Out (Optional)</Label>
                <Input 
                  id="edit-clock-out" 
                  type="datetime-local" 
                  value={clockOutTime} 
                  onChange={(e) => setClockOutTime(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Input 
                  id="edit-notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Add any notes..."
                />
              </div>
              <Button type="submit" className="w-full">Update Work Hours</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
