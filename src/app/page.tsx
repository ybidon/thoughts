'use client'

import { useState, useEffect } from 'react'

interface Thought {
  id: number
  content: string
  createdAt: string
}

export default function Home() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchThoughts()
  }, [])

  const fetchThoughts = async () => {
    try {
      setIsLoading(true)
      setError('')
      const res = await fetch('/api/thoughts')
      if (!res.ok) throw new Error('Failed to fetch thoughts')
      const data = await res.json()
      setThoughts(data)
    } catch (err) {
      console.error('Error fetching thoughts:', err)
      setError('Failed to load thoughts. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      setIsLoading(true)
      setError('')
      const res = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create thought')
      }

      setContent('')
      await fetchThoughts()
    } catch (err) {
      console.error('Error creating thought:', err)
      setError('Failed to save thought. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Thoughts</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mb-12">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="What's on your mind?"
          rows={4}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !content.trim()}
        >
          {isLoading ? 'Saving...' : 'Archive Thought'}
        </button>
      </form>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Archived Thoughts</h2>
        <div className="space-y-4">
          {isLoading && thoughts.length === 0 ? (
            <p className="text-gray-500">Loading thoughts...</p>
          ) : thoughts.length === 0 ? (
            <p className="text-gray-500 italic">No thoughts archived yet. Write something!</p>
          ) : (
            thoughts.map((thought) => (
              <div key={thought.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-lg">{thought.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(thought.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
