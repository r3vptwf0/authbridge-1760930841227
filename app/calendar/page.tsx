"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { ChevronLeft, ChevronRight, Plus, Bell, CheckSquare, Trash2, Send } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  date: string
  is_reminder: boolean
}

interface Task {
  id: string
  title: string
  description: string | null
  date: string
  hour: string | null
  completed: boolean
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [isReminder, setIsReminder] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskHour, setTaskHour] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const sendTelegramReminder = async (event: CalendarEvent) => {
    try {
      const eventDate = new Date(event.date)
      const message = `🔔 Reminder: ${event.title}\n📅 Date: ${eventDate.toLocaleDateString()}\n${event.description ? `📝 ${event.description}` : ''}`
      
      // Open Telegram with pre-filled message
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('')}&text=${encodeURIComponent(message)}`
      window.open(telegramUrl, '_blank')
      
      toast({
        title: "Telegram Opened",
        description: "Send the reminder to yourself or your bot",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [currentDate])

  const loadData = async () => {
    try {
      const supabase = getSupabaseClient()
      const [eventsResult, tasksResult] = await Promise.all([
        supabase.from('calendar_events').select('*').order('date', { ascending: true }),
        supabase.from('tasks').select('*').order('date', { ascending: false })
      ])

      if (eventsResult.error) throw eventsResult.error
      if (tasksResult.error) throw tasksResult.error

      setEvents(eventsResult.data || [])
      setTasks(tasksResult.data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('calendar_events').insert({
        title: eventTitle,
        description: eventDescription || null,
        date: selectedDate.toISOString(),
        is_reminder: isReminder,
      })

      if (error) throw error

      toast({ title: "Success", description: "Event added successfully!" })
      resetEventForm()
      setIsEventDialogOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('tasks').insert({
        title: taskTitle,
        description: taskDescription || null,
        date: new Date().toISOString(),
        hour: taskHour || null,
      })

      if (error) throw error

      toast({ title: "Success", description: "Task added successfully!" })
      resetTaskForm()
      setIsTaskDialogOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('tasks').update({ completed: !completed }).eq('id', taskId)
      if (error) throw error
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('calendar_events').delete().eq('id', id)
      if (error) throw error
      toast({ title: "Success", description: "Event deleted successfully!" })
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      toast({ title: "Success", description: "Task deleted successfully!" })
      loadData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const resetEventForm = () => {
    setEventTitle("")
    setEventDescription("")
    setIsReminder(false)
  }

  const resetTaskForm = () => {
    setTaskTitle("")
    setTaskDescription("")
    setTaskHour("")
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const openEventDialog = (date: Date) => {
    setSelectedDate(date)
    setIsEventDialogOpen(true)
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const todayTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">Calendar & Tasks</h1>
            <p className="text-gray-500 mt-2 font-light">Manage your schedule and tasks</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="border-gray-300 hover:bg-gray-100">
            Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="icon" onClick={previousMonth} className="border-gray-300 hover:bg-gray-100">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-2xl font-light text-gray-900">{monthName}</CardTitle>
                  <Button variant="outline" size="icon" onClick={nextMonth} className="border-gray-300 hover:bg-gray-100">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-light text-sm text-gray-500 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const dayEvents = getEventsForDate(date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    
                    return (
                      <div
                        key={day}
                        onClick={() => openEventDialog(date)}
                        className={`aspect-square p-2 border rounded-lg cursor-pointer hover:border-gray-400 transition-all ${
                          isToday ? 'bg-gray-100 border-gray-900' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className={`text-sm font-light ${isToday ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div key={event.id} className="text-xs bg-gray-100 text-gray-700 px-1 rounded truncate flex items-center gap-1">
                              {event.is_reminder && <Bell className="h-2 w-2" />}
                              <span className="font-light">{event.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400 font-light">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center font-light text-gray-900">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    Daily Tasks
                  </CardTitle>
                  <Button size="sm" onClick={() => setIsTaskDialogOpen(true)} className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="font-light">Your to-do list</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {todayTasks.length === 0 && completedTasks.length === 0 ? (
                  <p className="text-center text-gray-400 py-4 font-light">No tasks yet</p>
                ) : (
                  <>
                    {todayTasks.map(task => (
                      <div key={task.id} className="flex items-start gap-2 p-2 border border-gray-100 rounded-lg hover:border-gray-200">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                        />
                         <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-light text-gray-900">{task.title}</p>
                            {task.hour && (
                              <Badge variant="outline" className="text-xs font-light border-gray-300">{task.hour}</Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-500 font-light">{task.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                          className="hover:bg-gray-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {completedTasks.length > 0 && (
                      <>
                        <div className="text-sm font-light text-gray-400 mt-4 uppercase tracking-wider">Completed</div>
                        {completedTasks.map(task => (
                          <div key={task.id} className="flex items-start gap-2 p-2 border border-gray-100 rounded-lg opacity-60">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                            />
                             <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-light text-gray-900 line-through">{task.title}</p>
                                {task.hour && (
                                  <Badge variant="outline" className="text-xs font-light border-gray-300">{task.hour}</Badge>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-sm text-gray-500 font-light line-through">{task.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTask(task.id)}
                              className="hover:bg-gray-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Event/Note</DialogTitle>
              <DialogDescription>
                {selectedDate && `For ${selectedDate.toLocaleDateString()}`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Title</Label>
                <Input
                  id="event-title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-description">Description (Optional)</Label>
                <Input
                  id="event-description"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminder"
                  checked={isReminder}
                  onCheckedChange={(checked) => setIsReminder(checked as boolean)}
                />
                <Label htmlFor="reminder" className="flex items-center gap-2 cursor-pointer">
                  <Bell className="h-4 w-4" />
                  Set as reminder
                </Label>
              </div>
              <Button type="submit" className="w-full">Add Event</Button>
            </form>

            {selectedDate && getEventsForDate(selectedDate).length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-light text-sm text-gray-700">Events on this day:</h4>
                {getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className="flex items-start justify-between p-2 border border-gray-100 rounded hover:border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {event.is_reminder && <Bell className="h-3 w-3 text-gray-700" />}
                        <p className="font-light text-sm text-gray-900">{event.title}</p>
                      </div>
                      {event.description && (
                        <p className="text-xs text-gray-500 font-light">{event.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {event.is_reminder && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => sendTelegramReminder(event)}
                          className="hover:bg-gray-100"
                          title="Send to Telegram"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
              <DialogDescription>Add a new item to your to-do list</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">Description (Optional)</Label>
                <Input
                  id="task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-hour">Hour (Optional)</Label>
                <Input
                  id="task-hour"
                  type="time"
                  value={taskHour}
                  onChange={(e) => setTaskHour(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">Add Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
