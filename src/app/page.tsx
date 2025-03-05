'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Thought {
  id: number
  content: string
  imageUrl?: string | null
  createdAt: string
}

const PASSWORD = 'LOH' // You can change this to any password you want

export default function Home() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if already authenticated
    const storedAuth = localStorage.getItem('thoughts_auth')
    if (storedAuth === PASSWORD) {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchThoughts()
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PASSWORD) {
      localStorage.setItem('thoughts_auth', PASSWORD)
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password')
    }
    setPassword('')
  }

  const handleLogout = () => {
    localStorage.removeItem('thoughts_auth')
    setIsAuthenticated(false)
    setThoughts([])
  }

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      setIsLoading(true)
      setError('')

      let imageUrl = null
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        if (!uploadRes.ok) throw new Error('Failed to upload image')
        const { url } = await uploadRes.json()
        imageUrl = url
      }

      const res = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          imageUrl 
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create thought')
      }

      setContent('')
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      await fetchThoughts()
    } catch (err) {
      console.error('Error creating thought:', err)
      setError('Failed to save thought. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true)
      setError('')
      const res = await fetch('/api/delete-thought', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })
      
      if (!res.ok) throw new Error('Failed to delete thought')
      
      // Remove the thought from the UI
      setThoughts(thoughts.filter(thought => thought.id !== id))
      setDeleteId(null)
    } catch (err) {
      console.error('Error deleting thought:', err)
      setError('Failed to delete thought. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      {!isAuthenticated ? (
        <div className="max-w-sm mx-auto mt-20">
          <h1 className="text-4xl font-bold mb-8 text-center">Thoughts</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Thoughts</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {deleteId && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold mb-4">Delete Thought</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this thought? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (deleteId) handleDelete(deleteId)
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's on your mind?"
                rows={4}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-4 right-4 p-2 text-gray-500 hover:text-blue-500 transition-colors"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
              disabled={isLoading}
            />
            
            {imagePreview && (
              <div className="mt-4 relative w-40 h-40">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !content.trim()}
            >
              {isLoading ? 'Saving...' : 'Archive Thought'}
            </button>
          </form>

          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-6">Archived Thoughts</h2>
            <div className="space-y-6">
              {isLoading && thoughts.length === 0 ? (
                <p className="text-gray-500">Loading thoughts...</p>
              ) : thoughts.length === 0 ? (
                <p className="text-gray-500 italic">No thoughts archived yet. Write something!</p>
              ) : (
                thoughts.map((thought) => (
                  <div 
                    key={thought.id} 
                    className={`p-6 border rounded-lg bg-white shadow-sm transition-all duration-200 ${
                      expandedId === thought.id ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md cursor-pointer'
                    }`}
                    onClick={(e) => {
                      // Prevent toggling when clicking delete button
                      if (!(e.target as HTMLElement).closest('button')) {
                        setExpandedId(expandedId === thought.id ? null : thought.id)
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 overflow-hidden">
                        <p className={`${
                          expandedId === thought.id 
                            ? 'text-xl break-words whitespace-pre-wrap' 
                            : 'text-lg line-clamp-3 break-words'
                        }`}>
                          {thought.content}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expandedId === thought.id ? null : thought.id)
                          }}
                          className="mt-2 text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                        >
                          {expandedId === thought.id ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                              </svg>
                              Show less
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                              Show more
                            </>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(thought.id);
                        }}
                        className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors shrink-0 ml-4"
                        disabled={isLoading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                    {thought.imageUrl && (
                      <div className={`relative mb-4 transition-all duration-300 ${
                        expandedId === thought.id ? 'w-full h-[500px]' : 'w-full h-48'
                      }`}>
                        <Image
                          src={thought.imageUrl}
                          alt="Thought image"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      {new Date(thought.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
