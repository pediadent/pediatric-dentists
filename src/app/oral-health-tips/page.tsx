import Image from 'next/image'
import Link from 'next/link'
import { CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { DirectorySidebar } from '@/components/directory/DirectorySidebar'

const CATEGORY_SLUG = 'oral-health-tips'

export const dynamic = 'force-dynamic'

async function getOralHealthTipsData() {
  const [category, articles, siblingCategories] = await Promise.all([
    prisma.category.findUnique({
      where: { slug: CATEGORY_SLUG },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        seoTitle: true,
        seoDescription: true
      }
    }),
    prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        category: {
          slug: CATEGORY_SLUG
        }
      },
      include: {
        author: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    }),
    prisma.category.findMany({
      where: {
        slug: { not: CATEGORY_SLUG },
        articles: {
          some: {
            status: 'PUBLISHED'
          }
        }
      },
      select: {
        name: true,
        slug: true,
        articles: {
          where: { status: 'PUBLISHED' },
          select: { id: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  ])

  if (!category) {
    return null
  }

  return {
    category,
    articles,
    siblingCategories: siblingCategories.map((item) => ({
      name: item.name,
      slug: item.slug,
      count: item.articles.length
    }))
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getOralHealthTipsData()

  if (!data) {
    return {
      title: 'Oral Health Tips for Kids',
      description: 'Expert oral health tips to help families protect kids’ smiles with preventive care at home.'
    }
  }

  const { category } = data

  return {
    title: category.seoTitle ?? `${category.name} | Pediatric Dentist Directory`,
    description:
      category.seoDescription ??
      category.description ??
      'Practical pediatric oral health advice covering brushing routines, diet tips, and preventative care.',
    openGraph: {
      title: category.seoTitle ?? `${category.name} | Pediatric Dentist Directory`,
      description:
        category.seoDescription ??
        category.description ??
        'Practical pediatric oral health advice covering brushing routines, diet tips, and preventative care.'
    }
  }
}

export default async function OralHealthTipsPage() {
  const data = await getOralHealthTipsData()

  if (!data) {
    notFound()
  }

  const { category, articles, siblingCategories } = data

  return (
    <div className="bg-neutral-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />
          <div className="absolute -right-20 bottom-8 h-96 w-96 rounded-full bg-sky-100 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-emerald-600 shadow-sm">
            Family Oral Care Guides
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-neutral-900 sm:text-5xl lg:text-6xl">
            {category.name}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 sm:text-xl">
            {category.description ??
              'Actionable oral health guidance from pediatric dental specialists to keep smiles bright at every age.'}
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            {articles.length === 0 && (
              <div className="rounded-3xl border border-neutral-200 bg-white px-8 py-16 text-center shadow-sm">
                <h2 className="text-2xl font-semibold text-neutral-900">More oral health tips coming soon</h2>
                <p className="mt-4 text-neutral-600">
                  We&apos;re preparing new family-friendly guides. Check back shortly or browse other categories in the sidebar.
                </p>
              </div>
            )}

            {articles.map((article) => (
              <article
                key={article.id}
                className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="grid gap-0 md:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="relative h-64 overflow-hidden md:h-full">
                    {article.featuredImage ? (
                      <Image
                        src={article.featuredImage}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-sky-100">
                        <span className="text-lg font-semibold text-emerald-600">Oral Health Tips</span>
                      </div>
                    )}
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-600 shadow">
                      {article.category.name}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between p-8">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
                        <Link href={`/blog/${article.slug}/`} className="hover:text-emerald-600">
                          {article.title}
                        </Link>
                      </h2>
                      {article.excerpt && (
                        <p className="text-neutral-600">{article.excerpt}</p>
                      )}
                    </div>
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-500">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <UserIcon className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium text-neutral-800">{article.author.name}</span>
                      </div>
                      {article.publishedAt && (
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="h-4 w-4 text-neutral-400" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      )}
                      <Link
                        href={`/blog/{article.slug}/`}
                        className="ml-auto inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Read tip
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <DirectorySidebar
            categoryName={category.name}
            siblingCategories={siblingCategories}
            relatedArticles={articles.slice(0, 3)}
            categoryLinkBuilder={(slug) => `/${slug}/`}
            activeCategorySlug={CATEGORY_SLUG}
          />
        </div>
      </section>
    </div>
  )
}
