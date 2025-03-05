import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const thoughts = await prisma.thought.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(thoughts)
  } catch (error) {
    console.error('GET /api/thoughts error:', error)
    return NextResponse.json({ error: 'Failed to fetch thoughts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json()
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const thought = await prisma.thought.create({
      data: { content }
    })
    return NextResponse.json(thought)
  } catch (error) {
    console.error('POST /api/thoughts error:', error)
    return NextResponse.json({ error: 'Failed to create thought' }, { status: 500 })
  }
} 