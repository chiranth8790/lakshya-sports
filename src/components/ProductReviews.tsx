import { useState } from 'react';
import { Star, CheckCircle2, User, MessageSquarePlus, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Rohit Sharma',
    rating: 5,
    date: '2 days ago',
    title: 'Outstanding balance and stringing tension!',
    comment: 'Got it strung at 26 lbs with Yonex BG-65 at Lakshya Sports. The smash power and control are unmatched. 100% original product!',
    verified: true,
  },
  {
    id: '2',
    name: 'Ananya Rao',
    rating: 5,
    date: '1 week ago',
    title: 'Super fast delivery in Bangalore',
    comment: 'Ordered in the morning and arrived by next day. Packaging was solid with bubble wrap protection. Will definitely order all my tournament gear from here.',
    verified: true,
  },
  {
    id: '3',
    name: 'Karthik V',
    rating: 4,
    date: '2 weeks ago',
    title: 'Great grip and lightweight feel',
    comment: 'The frame feels solid on rapid defense returns. Excellent customer support from the Chikkalasandra shop team.',
    verified: true,
  },
];

export default function ProductReviews({ productName }: { productName: string }) {
  const { success: toastSuccess } = useToast();
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    rating: 5,
    title: '',
    comment: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.comment) return;

    const newRev: Review = {
      id: Date.now().toString(),
      name: form.name,
      rating: form.rating,
      date: 'Just now',
      title: form.title || 'Great gear!',
      comment: form.comment,
      verified: true,
    };

    setReviews([newRev, ...reviews]);
    setModalOpen(false);
    setForm({ name: '', rating: 5, title: '', comment: '' });
    toastSuccess('Review submitted! Thank you for your feedback.');
  };

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mt-12 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-gray-100 gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-1 rounded-full inline-block mb-2">
            Verified Customer Reviews
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase text-gray-900 tracking-tight">
            Ratings & Feedback for {productName}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-base font-black text-gray-900">{avgRating} out of 5</span>
            <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" /> Write a Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-100 pt-6 space-y-6">
        {reviews.map((r) => (
          <div key={r.id} className="pt-6 first:pt-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-gray-900">{r.name}</span>
                {r.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{r.date}</span>
            </div>

            <div className="flex items-center text-amber-400 mb-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-gray-200 fill-transparent'}`}
                />
              ))}
            </div>

            <h4 className="text-xs font-bold text-gray-900 mb-1">{r.title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>

      {/* Write a review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-black text-gray-900 uppercase text-sm">Write Customer Review</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Overall Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star className={`w-6 h-6 ${star <= form.rating ? 'fill-current' : 'text-gray-200 fill-transparent'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-500 ml-2">{form.rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Srikant N"
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Headline</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="What's most important to know?"
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Your Review</label>
                <textarea
                  required
                  rows={3}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Tell other athletes about your experience with this equipment..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-black font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black hover:bg-neutral-800 text-white font-bold h-12 rounded-xl text-xs uppercase tracking-wider transition"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
