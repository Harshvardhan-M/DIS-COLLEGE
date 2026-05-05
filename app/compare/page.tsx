'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface College {
  id: string
  name: string
  location: string
  state: string
  acceptance_rate: number
  tuition: number
  enrollment: number
  founding_year: number
  description: string
}

export default function ComparePage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [allColleges, setAllColleges] = useState<College[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
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
      const { data, error } = await supabase.from('colleges').select('*').order('name')

      if (error) throw error

      setAllColleges(data as College[])
    } catch (error) {
      console.error('Error fetching colleges:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCollege = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((cid) => cid !== id))
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id])
    }
  }

  const selectedColleges = allColleges.filter((c) => selectedIds.includes(c.id))

  const filteredColleges = allColleges.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Compare Colleges</h1>
            <p className="text-sm text-gray-600">Select up to 4 colleges to compare</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* College Selector */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Select Colleges</CardTitle>
                <CardDescription>
                  {selectedIds.length} of 4 selected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  placeholder="Search colleges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                />

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredColleges.map((college) => (
                    <label
                      key={college.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(college.id)}
                        onChange={() => toggleCollege(college.id)}
                        disabled={
                          !selectedIds.includes(college.id) && selectedIds.length >= 4
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm flex-1">
                        {college.name}
                        <span className="text-xs text-gray-500 block">{college.state}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <div className="lg:col-span-2">
            {selectedColleges.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600">Select colleges to compare</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">
                        Metric
                      </th>
                      {selectedColleges.map((college) => (
                        <th
                          key={college.id}
                          className="px-4 py-3 text-left font-semibold text-gray-900 min-w-40"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm">{college.name}</span>
                            <span className="text-xs text-gray-500 font-normal">
                              {college.location}, {college.state}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        Acceptance Rate
                      </td>
                      {selectedColleges.map((college) => (
                        <td key={college.id} className="px-4 py-3">
                          {college.acceptance_rate.toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">Tuition</td>
                      {selectedColleges.map((college) => (
                        <td key={college.id} className="px-4 py-3">
                          ${(college.tuition / 1000).toFixed(0)}k
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">Enrollment</td>
                      {selectedColleges.map((college) => (
                        <td key={college.id} className="px-4 py-3">
                          {college.enrollment.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">Founded</td>
                      {selectedColleges.map((college) => (
                        <td key={college.id} className="px-4 py-3">
                          {college.founding_year}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {selectedColleges.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {selectedColleges.map((college) => (
                  <Link key={college.id} href={`/college/${college.id}`}>
                    <Button variant="outline" className="w-full">
                      View {college.name} Details
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
