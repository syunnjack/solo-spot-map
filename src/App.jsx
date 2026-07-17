import { useMemo, useState } from 'react'
import './App.css'

const postKey = 'solospot.ugc'
const saveKey = 'solospot.saved'

const spots = [
  { id: 'meieki-cafe-power', name: '名駅ソロワークカフェ', area: '名古屋', category: 'カフェ', walk: 4, price: 580, rating: 4.4, smoking: false, power: true, late: true, noCharge: true, tags: ['一人席多め', '電源', '短時間OK'], note: '高速バス到着後や打ち合わせ前の時間調整に向く、一人で入りやすいカフェ。' },
  { id: 'sakae-smoke-booth', name: '栄地下街スモークブース', area: '名古屋', category: '喫煙', walk: 2, price: 0, rating: 4.0, smoking: true, power: false, late: false, noCharge: true, tags: ['無料', '駅近', '短時間'], note: '短い待ち時間でも使える喫煙スポット。広告と地図導線に向く。' },
  { id: 'shizuoka-net-cafe', name: '静岡駅前ナイトラウンジ', area: '静岡', category: '漫画喫茶', walk: 5, price: 1200, rating: 4.1, smoking: true, power: true, late: true, noCharge: true, tags: ['シャワー', '仮眠', '喫煙席あり'], note: '夜行バス到着後の仮眠、シャワー、スマホ充電までまとめて済ませられる。' },
  { id: 'osaka-counter-diner', name: '梅田ひとりカウンター食堂', area: '大阪', category: '飲食', walk: 6, price: 980, rating: 4.2, smoking: false, power: false, late: true, noCharge: true, tags: ['カウンター', '深夜', '定食'], note: '一人客が多いカウンター中心の店。深夜到着後の食事に使いやすい。' },
  { id: 'tokyo-charge-bar', name: '新宿ミニバー スタンディング', area: '東京', category: '飲食', walk: 7, price: 1800, rating: 3.7, smoking: true, power: false, late: true, noCharge: false, tags: ['深夜', '喫煙可', 'チャージ注意'], note: '一人でも入れるがシングルチャージがあるため、透明性のある注意表示が必要。' },
  { id: 'nagoya-rest-space', name: '名駅リカバリーサウナ', area: '名古屋', category: '休憩', walk: 9, price: 1800, rating: 4.3, smoking: false, power: true, late: true, noCharge: true, tags: ['早朝向け', '充電', '休憩'], note: '夜行バス明け、出勤前、イベント前の回復に使える一人向け休憩スポット。' },
]

const revenue = [
  ['店舗送客広告', '一人歓迎、喫煙可、電源、深夜営業などの条件で近隣店へ送客。'],
  ['予約・クーポン', 'カフェ席、サウナ、漫画喫茶、カウンター飲食の予約やクーポンを掲載。'],
  ['確認済み掲載', '店舗側が一人席、チャージ、喫煙可否、混雑時間を更新できる有料枠。'],
  ['ランキング記事', '一人で入りやすい店、シングルチャージなし、夜行バス明け特集でSEO流入を作る。'],
]

const faqs = [
  ['SoloSpotとは？', '一人で入りやすいカフェ、喫煙所、飲食、漫画喫茶、休憩場所を条件で探すサービスです。'],
  ['UGCで集める情報は？', '一人席の有無、チャージ、混雑、喫煙可否、電源、入りやすさの口コミです。'],
  ['収益化しやすい理由は？', '検索意図が「今すぐ行く場所」なので、広告、予約、クーポン、確認済み掲載につなげやすいです。'],
]

function readArray(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? [] } catch { return [] }
}

function yen(value) {
  return value === 0 ? '無料' : new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(value)
}

function App() {
  const [query, setQuery] = useState('名古屋')
  const [area, setArea] = useState('すべて')
  const [filters, setFilters] = useState({ smoking: false, power: true, late: false, noCharge: true })
  const [posts, setPosts] = useState(() => readArray(postKey))
  const [saved, setSaved] = useState(() => readArray(saveKey))
  const [form, setForm] = useState({ name: '', area: '', memo: '' })

  const areas = ['すべて', ...new Set(spots.map((spot) => spot.area))]
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return spots
      .filter((spot) => area === 'すべて' || spot.area === area)
      .filter((spot) => !filters.smoking || spot.smoking)
      .filter((spot) => !filters.power || spot.power)
      .filter((spot) => !filters.late || spot.late)
      .filter((spot) => !filters.noCharge || spot.noCharge)
      .filter((spot) => !text || `${spot.name} ${spot.area} ${spot.category} ${spot.tags.join(' ')} ${spot.note}`.toLowerCase().includes(text))
      .sort((a, b) => Number(b.noCharge) - Number(a.noCharge) || b.rating - a.rating || a.walk - b.walk)
  }, [area, filters, query])
  const display = filtered.length ? filtered : spots
  const best = display[0]

  const submitPost = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.memo.trim()) return
    const next = [{ ...form, id: crypto.randomUUID(), status: '確認待ち', date: new Date().toLocaleDateString('ja-JP') }, ...posts].slice(0, 6)
    setPosts(next)
    localStorage.setItem(postKey, JSON.stringify(next))
    setForm({ name: '', area: '', memo: '' })
  }

  const toggleSaved = (id) => {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem(saveKey, JSON.stringify(next))
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div><span className="brand">SoloSpot</span><h1>一人で入りやすい場所だけ、迷わず探す。</h1><p>喫煙可、電源あり、深夜営業、シングルチャージなし。一人利用で本当に知りたい条件をまとめて比較します。</p></div>
        <aside className="answer-box"><span>いまのおすすめ</span><strong>{best.name}</strong><p>{best.area} / 徒歩{best.walk}分 / {yen(best.price)}。{best.note}</p></aside>
      </section>

      <section className="search-panel">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="地域・用途・条件で検索" />
        <select value={area} onChange={(event) => setArea(event.target.value)}>{areas.map((item) => <option key={item}>{item}</option>)}</select>
      </section>

      <section className="filter-row">
        {Object.entries({ smoking: '喫煙可', power: '電源あり', late: '深夜営業', noCharge: 'チャージなし' }).map(([key, label]) => <button key={key} type="button" className={filters[key] ? 'active' : ''} onClick={() => setFilters({ ...filters, [key]: !filters[key] })}>{label}</button>)}
      </section>

      <section className="summary-grid">
        <article><span>掲載候補</span><strong>{spots.length}</strong><p>一人利用向けスポット</p></article>
        <article><span>検索結果</span><strong>{display.length}</strong><p>条件一致候補</p></article>
        <article><span>保存済み</span><strong>{saved.length}</strong><p>あとで比較</p></article>
      </section>

      <section className="content-grid">
        {display.map((spot) => (
          <article className="card" key={spot.id}>
            <div className="card-topline"><span>{spot.area}</span><span>{spot.category}</span></div>
            <h2>{spot.name}</h2><p>{spot.note}</p>
            <div className="tag-row">{spot.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="metric-row"><span>徒歩{spot.walk}分</span><span>{yen(spot.price)}</span><strong>{spot.rating}</strong></div>
            {!spot.noCharge && <p className="caution">シングルチャージ注意。投稿で実態確認を促します。</p>}
            <button type="button" onClick={() => toggleSaved(spot.id)}>{saved.includes(spot.id) ? '保存済み' : '保存する'}</button>
          </article>
        ))}
      </section>

      <section className="ugc-section">
        <div><span className="brand">UGC</span><h2>一人で入りやすかったか投稿</h2><p>実体験を、一人席、混雑、チャージ、喫煙可否、電源の確認データに変えます。</p></div>
        <form className="ugc-form" onSubmit={submitPost}>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="スポット名" />
          <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} placeholder="地域" />
          <input value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} placeholder="入りやすさ・混雑・チャージ情報" />
          <button type="submit">投稿する</button>
        </form>
        <div className="post-grid">{posts.length === 0 && <p className="empty-text">まだ投稿はありません。最初の一人利用レビューを投稿できます。</p>}{posts.map((post) => <article key={post.id}><span>{post.status}</span><h3>{post.name}</h3><p>{post.memo}</p><small>{post.area} / {post.date}</small></article>)}</div>
      </section>

      <section className="growth-grid">
        <div className="revenue-panel"><h2>収益導線</h2>{revenue.map(([title, text]) => <article key={title}><strong>{title}</strong><p>{text}</p></article>)}</div>
        <div className="buzz-panel"><h2>バズ施策</h2><ul><li>一人で入りやすい店ランキング</li><li>シングルチャージなし店の投稿キャンペーン</li><li>夜行バス明けの回復スポット特集</li><li>喫煙可・電源あり・深夜営業の条件別まとめ</li></ul></div>
      </section>

      <section className="seo-section"><div className="answer-box"><h2>SoloSpotは、一人利用で不安になりやすい条件を先に見せるスポット検索です。</h2><p>チャージ、席、喫煙、電源、混雑をUGCで補完し、検索とAI回答に強い短文データとして蓄積します。</p></div><div className="faq-grid">{faqs.map(([q, a]) => <article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div></section>
    </main>
  )
}

export default App
