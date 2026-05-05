'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SavedCollege {
  id: string
  college_id: string
  saved_at: string
  colleges: {
    id: string
    name: string
    location: string
    state: string
    acceptance_rate: number
    tuition: number
  }
}

export default function SavedPage() {
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      fetchSavedColleges(user.id)
    }

    checkAuth()
  }, [])

  const fetchSavedColleges = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_colleges')
        .select(
          `
          id,
          college_id,
          saved_at,
          colleges (id, name, location, state, acceptance_rate, tuition)
        `
        )
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })

      if (error) throw error

      setSavedColleges(data as SavedCollege[])
    } catch (error) {
      console.error('Error fetching saved colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (savedId: string) => {
    try {
      const { error } = await supabase.from('saved_colleges').delete().eq('id', savedId)

      if (error) throw error

      setSavedColleges(savedColleges.filter((sc) => sc.id !== savedId))
    } catch (error) {
      console.error('Error removing saved college:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Saved Colleges</h1>
            <p className="text-sm text-gray-600">{savedColleges.length} saved colleges</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Browse All</Button>
            </Link>
            <Link href="/compare">
              <Button variant="outline">Compare</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {savedColleges.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No saved colleges yet</p>
              <Link href="/dashboard">
                <Button>Explore Colleges</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedColleges.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{item.colleges.name}</CardTitle>
                  <CardDescription>
                    {item.colleges.location}, {item.colleges.state}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Acceptance Rate</p>
                      <p className="font-semibold">{item.colleges.acceptance_rate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tuition</p>
                      <p className="font-semibold">${(item.colleges.tuition / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Saved {new Date(item.saved_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/college/${item.colleges.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button variant="destructive" onClick={() => handleRemove(item.id)}>
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
