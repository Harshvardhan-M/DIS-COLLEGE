'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface College {
  id: string
  name: string
  location: string
  state: string
  acceptance_rate: number
  tuition: number
  enrollment: number
  website: string
}

export default function DashboardPage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [filteredColleges, setFilteredColleges] = useState<College[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
      fetchColleges()
    }

    checkAuth()
  }, [])

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase.from('colleges').select('*')

      if (error) throw error

      setColleges(data as College[])
      setFilteredColleges(data as College[])
    } catch (error) {
      console.error('Error fetching colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    filterColleges(term, stateFilter)
  }

  const handleStateFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value
    setStateFilter(state)
    filterColleges(searchTerm, state)
  }

  const filterColleges = (search: string, state: string) => {
    let filtered = colleges

    if (search) {
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(search))
    }

    if (state) {
      filtered = filtered.filter((c) => c.state === state)
    }

    setFilteredColleges(filtered)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const states = Array.from(new Set(colleges.map((c) => c.state))).sort()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">College Discovery</h1>
            <p className="text-sm text-gray-600">Find and compare colleges</p>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/saved">
              <Button variant="outline">Saved Colleges</Button>
            </Link>
            <Link href="/compare">
              <Button variant="outline">Compare</Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-3">
            <Input
              placeholder="Search colleges..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          <select
            value={stateFilter}
            onChange={handleStateFilter}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college) => (
            <Card key={college.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{college.name}</CardTitle>
                <CardDescription>
                  {college.location}, {college.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Acceptance Rate</p>
                    <p className="font-semibold">{college.acceptance_rate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tuition</p>
                    <p className="font-semibold">${(college.tuition / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Enrollment</p>
                    <p className="font-semibold">{college.enrollment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Website</p>
                    <a
                      href={`https://${college.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Visit
                    </a>
                  </div>
                </div>
                <Link href={`/college/${college.id}`}>
                  <Button className="w-full mt-4">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
