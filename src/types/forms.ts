export interface AddBookForm {
  title: string
  author: string
  totalPages: number | null
}

export interface GoalForm {
  title: string
  targetValue: number
  unit: 'livres' | 'pages' | 'heures'
  deadline: string
  trackingMode: 'manual' | 'auto_completed_books' | 'auto_pages_read'
}
