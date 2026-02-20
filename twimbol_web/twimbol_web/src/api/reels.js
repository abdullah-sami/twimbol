export const getReels = (page = 1) =>
  api.get(`/api/reels/?page=${page}`)

// Usage in Home.jsx
const [reels, setReels] = useState([])
const [page, setPage] = useState(1)

useEffect(() => {
  getReels(page).then(({ data }) => {
    setReels(prev => [...prev, ...data.results])
  })
}, [page])