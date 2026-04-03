import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface RatingReviewProps {
  serviceId: string
  onSubmit: (rating: number, comment: string) => Promise<void>
  isSubmitting?: boolean
}

export function RatingReview({ serviceId, onSubmit, isSubmitting = false }: RatingReviewProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      await onSubmit(rating, comment)
      setSubmitted(true)
      setRating(0)
      setComment('')

      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      console.error('Error submitting rating:', err)
    }
  }

  if (submitted) {
    return (
      <Card className="p-6 bg-green-50 border border-green-200">
        <p className="text-green-700">✓ Thank you for your review!</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className={`text-3xl transition-colors ${
                  (hoveredRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-2">Your Review (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this service..."
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">{comment.length}/500</p>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting || rating === 0} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Card>
  )
}
