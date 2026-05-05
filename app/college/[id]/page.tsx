'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
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
  website: string
}

export default function CollegeDetailPage() {
  const [college, setCollege] = useState<College | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const collegeId = params.id as string

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
      fetchCollege()
      checkIfSaved(user.id)
    }

    checkAuth()
  }, [])

  const fetchCollege = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', collegeId)
        .single()

      if (error) throw error

      setCollege(data as College)
    } catch (error) {
      console.error('Error fetching college:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const checkIfSaved = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('saved_colleges')
        .select('id')
        .eq('user_id', userId)
        .eq('college_id', collegeId)
        .single()

      setIsSaved(!!data)
    } catch {
      setIsSaved(false)
    }
  }

  const toggleSave = async () => {
    if (!user) return

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_colleges')
          .delete()
          .eq('user_id', user.id)
          .eq('college_id', collegeId)

        if (error) throw error
        setIsSaved(false)
      } else {
        const { error } = await supabase.from('saved_colleges').insert({
          user_id: user.id,
          college_id: collegeId,
        })

        if (error) throw error
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!college) {
    return <div className="min-h-screen flex items-center justify-center">College not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="ghost">← Back</Button>
          </Link>
          <h1 className="text-2xl font-bold text-blue-600">College Discovery</h1>
          <div></div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-4xl mb-2">{college.name}</CardTitle>
                <CardDescription className="text-lg">
                  {college.location}, {college.state}
                </CardDescription>
              </div>
              <Button onClick={toggleSave} variant={isSaved ? 'default' : 'outline'}>
                {isSaved ? '★ Saved' : '☆ Save'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">{college.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Acceptance Rate</p>
                <p className="text-2xl font-bold text-blue-600">{college.acceptance_rate.toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Tuition</p>
                <p className="text-2xl font-bold text-green-600">${(college.tuition / 1000).toFixed(0)}k</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Enrollment</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(college.enrollment / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Founded</p>
                <p className="text-2xl font-bold text-orange-600">{college.founding_year}</p>
              </div>
            </div>

            <a
              href={`https://${college.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="bg-blue-600 hover:bg-blue-700">Visit Website</Button>
            </a>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Colleges
            </Button>
          </Link>
          <Link href="/compare" className="flex-1">
            <Button className="w-full">Compare Colleges</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
