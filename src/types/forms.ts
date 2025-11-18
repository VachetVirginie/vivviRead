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
}
